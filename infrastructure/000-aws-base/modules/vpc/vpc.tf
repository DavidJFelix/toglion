# Get a list of AZs supported by this region so we can put a subnet in each one
data "aws_availability_zones" "this" {
  filter {
    name = "opt-in-status"

    # This prevents local regions and outposts from being selected
    values = ["opt-in-not-required"]
  }
}

# Divide the subnets into groups and provide each group with a /18 space CIDR
module "subnet_group_cidrs" {
  source = "hashicorp/subnets/cidr"

  base_cidr_block = var.cidr_block
  networks = [
    {
      name     = "private"
      new_bits = 2
    },
    {
      name     = "public"
      new_bits = 2
    },
    {
      name     = "intra"
      new_bits = 2
    }
  ]
}

# Divide the private groups by AZ and provide each with a /22 CIDR
module "private_subnet_cidrs" {
  source = "hashicorp/subnets/cidr"

  base_cidr_block = module.subnet_group_cidrs.network_cidr_blocks.private
  networks        = [for az_name in sort(data.aws_availability_zones.this.names) : { name = az_name, new_bits = 4 }]
}

# Divide the public groups by AZ and provide each with a /22 CIDR
module "public_subnet_cidrs" {
  source = "hashicorp/subnets/cidr"

  base_cidr_block = module.subnet_group_cidrs.network_cidr_blocks.public
  networks        = [for az_name in sort(data.aws_availability_zones.this.names) : { name = az_name, new_bits = 4 }]
}

# Divide the intra groups by AZ and provide each with a /22 CIDR
module "intra_subnet_cidrs" {
  source = "hashicorp/subnets/cidr"

  base_cidr_block = module.subnet_group_cidrs.network_cidr_blocks.intra
  networks        = [for az_name in sort(data.aws_availability_zones.this.names) : { name = az_name, new_bits = 4 }]
}

locals {
  subnet_count = length(data.aws_availability_zones.this.names)
}

module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "base"
  cidr = var.cidr_block

  enable_ipv6                     = true
  assign_ipv6_address_on_creation = true


  azs             = sort(data.aws_availability_zones.this.names)
  private_subnets = values(module.private_subnet_cidrs.network_cidr_blocks)
  public_subnets  = values(module.public_subnet_cidrs.network_cidr_blocks)
  intra_subnets   = values(module.intra_subnet_cidrs.network_cidr_blocks)

  private_subnet_ipv6_prefixes = range(local.subnet_count)
  public_subnet_ipv6_prefixes  = range(local.subnet_count, local.subnet_count * 2)
  intra_subnet_ipv6_prefixes   = range(local.subnet_count * 2, local.subnet_count * 3)

  # FIXME: turn on later if/when we use private subnets.
  # Until then, this is a latent cost per hour
  enable_nat_gateway = false

  tags = merge(var.tags)
}

module "dynamodb_vpc_endpoint" {
  source = "terraform-aws-modules/vpc/aws//modules/vpc-endpoints"

  vpc_id             = module.vpc.vpc_id
  security_group_ids = [module.vpc.default_security_group_id]

  endpoints = {
    dynamodb = {
      service         = "dynamodb"
      service_type    = "Gateway"
      route_table_ids = flatten([module.vpc.intra_route_table_ids, module.vpc.private_route_table_ids, module.vpc.public_route_table_ids])
      policy          = data.aws_iam_policy_document.dynamodb_endpoint_policy.json
    }
  }

  tags = merge(var.tags)
}

# Data source used to avoid race condition
data "aws_vpc_endpoint_service" "dynamodb" {
  service = "dynamodb"

  filter {
    name   = "service-type"
    values = ["Gateway"]
  }
}

data "aws_iam_policy_document" "dynamodb_endpoint_policy" {
  statement {
    effect    = "Deny"
    actions   = ["dynamodb:*"]
    resources = ["*"]

    principals {
      type        = "*"
      identifiers = ["*"]
    }

    condition {
      test     = "StringNotEquals"
      variable = "aws:sourceVpce"

      values = [data.aws_vpc_endpoint_service.dynamodb.id]
    }
  }
}