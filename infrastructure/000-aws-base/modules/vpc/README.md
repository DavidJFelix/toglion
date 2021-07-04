# VPC module

This module wraps the `terraform-aws-modules/vpc/aws` module with settings so that it can be quickly duplicated per region.
It creates a VPC endpoint for DynamoDB and a uniform set of subnets and CIDR pattern for them.