# 000-aws-base

AWS base is a `terraform` package that creates a baseline AWS account for this project. It sets up centralized logging and access resources as well as a baseline VPC and network.

## Resources

- VPC per region
  - Private subnet per AZ
  - Public subnet per AZ
  - Security groups
  - Route tables
  - Internet Gateway
  - NAT Gateway
- VPC endpoint per region for dynamodb
- S3 Logging bucket, for logging access **to** s3 in one location.
- KMS customer master key & alias
- IAM automation users
  - Terraform Cloud User
  - Github Serverless User
  - Automation CICD Group

## Outputs

- S3 Logging bucket name, so additional buckets can use this to log access
- VPC ids for each regional VPC
  - Private subnet ids for each region
  - Public subnet ids for each region
  - Security group ids for each region
- IAM automation user credentials
  - these are encrypted using keybase pgp
- KMS customer master key alias

## Disaster Recovery

This package is marked `000` and has no dependencies.
It should be run first or with other `000` packages.

- Create an admin AWS user with CLI access and a key pair
- Run this package providing those credentials to the `aws provider` in `terraform`
