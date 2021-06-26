// Divide the network space for each AWS region.
// VPCs can only support a /16 sized IPv4 network or a /56 sized IPv6 network
// We pick different addresses higher than the /16 space to ensure we can easily link the VPCs
module "vpc_cidrs" {
  source = "hashicorp/subnets/cidr"

  base_cidr_block = "10.0.0.0/8"
  networks = [
    {
      name     = "us_east_1"
      new_bits = 8
    },
    {
      name     = "us_east_2"
      new_bits = 8
    },
    {
      name     = "us_west_1"
      new_bits = 8
    },
    {
      name     = "us_west_2"
      new_bits = 8
    },
  ]
}

// Get a list of AZs supported by this region so we can put a subnet in each one
data "aws_availability_zones" "us_east_1" {
  provider = aws.us_east_1
  filter {
    name   = "opt-in-status"
    values = ["opt-in-not-required"]
  }
}

// Divide the subnets into groups and provide each group with a /18 space CIDR
module "us_east_1_subnet_group_cidrs" {
  source = "hashicorp/subnets/cidr"

  base_cidr_block = module.vpc_cidrs.network_cidr_blocks.us_east_1
  networks = [
    {
      name     = "private"
      new_bits = 2
    },
    {
      name     = "public"
      new_bits = 2
    },
  ]
}

// Divide the private groups by AZ and provide each with a /22 CIDR
module "us_east_1_private_subnet_cidrs" {
  source = "hashicorp/subnets/cidr"

  base_cidr_block = module.us_east_1_subnet_group_cidrs.base_cidr_block
  networks = [for az_name in sort(data.aws_availability_zones.us_east_1.names) : {name = az_name, new_bits = 4}]
}

// Divide the public groups by AZ and provide each with a /22 CIDR
module "us_east_1_public_subnet_cidrs" {
  source = "hashicorp/subnets/cidr"

  base_cidr_block = module.us_east_1_subnet_group_cidrs.base_cidr_block
  networks = [for az_name in sort(data.aws_availability_zones.us_east_1.names) : {name = az_name, new_bits = 4}]
}

locals {
  subnet_count = length(data.aws_availability_zones.us_east_1.names)
}

module "vpc_us_east_1" {
  source = "terraform-aws-modules/vpc/aws"
  providers = {
    aws = aws.us_east_1
  }

  name = "base"
  cidr = module.vpc_cidrs.network_cidr_blocks.us_east_1

  enable_ipv6                     = true
  assign_ipv6_address_on_creation = true


  azs             = sort(data.aws_availability_zones.us_east_1.names)
  private_subnets = values(module.us_east_1_private_subnet_cidrs.network_cidr_blocks)
  public_subnets  = values(module.us_east_1_public_subnet_cidrs.network_cidr_blocks)

  private_subnet_ipv6_prefixes = range(local.subnet_count)
  public_subnet_ipv6_prefixes	= range(local.subnet_count, local.subnet_count * 2)

  enable_nat_gateway = true

  tags = merge(local.common_tags)
}
