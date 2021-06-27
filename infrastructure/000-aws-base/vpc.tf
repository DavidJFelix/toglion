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

module "aws_vpc_us_east_1" {
  source = "./modules/vpc"
  providers = {
    aws = aws.us_east_1
  }

  cidr_block = module.vpc_cidrs.network_cidr_blocks.us_east_1
  tags       = merge(local.common_tags)
}

module "aws_vpc_us_east_2" {
  source = "./modules/vpc"
  providers = {
    aws = aws.us_east_2
  }

  cidr_block = module.vpc_cidrs.network_cidr_blocks.us_east_2
  tags       = merge(local.common_tags)
}

module "aws_vpc_us_west_1" {
  source = "./modules/vpc"
  providers = {
    aws = aws.us_west_1
  }

  cidr_block = module.vpc_cidrs.network_cidr_blocks.us_west_1
  tags       = merge(local.common_tags)
}

module "aws_vpc_us_west_2" {
  source = "./modules/vpc"

  providers = {
    aws = aws.us_west_2
  }

  cidr_block = module.vpc_cidrs.network_cidr_blocks.us_west_2
  tags       = merge(local.common_tags)
}
