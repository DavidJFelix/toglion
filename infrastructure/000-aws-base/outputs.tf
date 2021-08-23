output "aws_s3_access_logs_us_east_1_s3_bucket_id" {
  value = module.aws_s3_access_logs_us_east_1.s3_bucket_id
}

output "aws_s3_access_logs_us_east_2_s3_bucket_id" {
  value = module.aws_s3_access_logs_us_east_2.s3_bucket_id
}

output "aws_s3_access_logs_us_west_1_s3_bucket_id" {
  value = module.aws_s3_access_logs_us_west_1.s3_bucket_id
}

output "aws_s3_access_logs_us_west_2_s3_bucket_id" {
  value = module.aws_s3_access_logs_us_west_2.s3_bucket_id
}

output "aws_vpc_us_east_1_vpc_id" {
  value = module.aws_vpc_us_east_1.vpc_id
}

output "aws_vpc_us_east_2_vpc_id" {
  value = module.aws_vpc_us_east_2.vpc_id
}

output "aws_vpc_us_west_1_vpc_id" {
  value = module.aws_vpc_us_west_1.vpc_id
}

output "aws_vpc_us_west_2_vpc_id" {
  value = module.aws_vpc_us_west_2.vpc_id
}

output "aws_vpc_us_east_1_private_subnets" {
  value = module.aws_vpc_us_east_1.private_subnets
}

output "aws_vpc_us_east_2_private_subnets" {
  value = module.aws_vpc_us_east_2.private_subnets
}

output "aws_vpc_us_west_1_private_subnets" {
  value = module.aws_vpc_us_west_1.private_subnets
}

output "aws_vpc_us_west_2_private_subnets" {
  value = module.aws_vpc_us_west_2.private_subnets
}

output "aws_vpc_us_east_1_public_subnets" {
  value = module.aws_vpc_us_east_1.public_subnets
}

output "aws_vpc_us_east_2_public_subnets" {
  value = module.aws_vpc_us_east_2.public_subnets
}

output "aws_vpc_us_west_1_public_subnets" {
  value = module.aws_vpc_us_west_1.public_subnets
}

output "aws_vpc_us_west_2_public_subnets" {
  value = module.aws_vpc_us_west_2.public_subnets
}

output "aws_vpc_us_east_1_intra_subnets" {
  value = module.aws_vpc_us_east_1.intra_subnets
}

output "aws_vpc_us_east_2_intra_subnets" {
  value = module.aws_vpc_us_east_2.intra_subnets
}

output "aws_vpc_us_west_1_intra_subnets" {
  value = module.aws_vpc_us_west_1.intra_subnets
}

output "aws_vpc_us_west_2_intra_subnets" {
  value = module.aws_vpc_us_west_2.intra_subnets
}

output "aws_vpc_us_east_1_default_security_group_id" {
  value = module.aws_vpc_us_east_1.default_security_group_id
}

output "aws_vpc_us_east_2_default_security_group_id" {
  value = module.aws_vpc_us_east_2.default_security_group_id
}

output "aws_vpc_us_west_1_default_security_group_id" {
  value = module.aws_vpc_us_west_1.default_security_group_id
}

output "aws_vpc_us_west_2_default_security_group_id" {
  value = module.aws_vpc_us_west_2.default_security_group_id
}

# output "aws_vpc_us_east_1_dynamodb_vpc_endpoint_id" {
#   value = module.aws_vpc_us_east_1.dynamodb_vpc_endpoint_id
# }

# output "aws_vpc_us_east_2_dynamodb_vpc_endpoint_id" {
#   value = module.aws_vpc_us_east_2.dynamodb_vpc_endpoint_id
# }

# output "aws_vpc_us_west_1_dynamodb_vpc_endpoint_id" {
#   value = module.aws_vpc_us_west_1.dynamodb_vpc_endpoint_id
# }

# output "aws_vpc_us_west_2_dynamodb_vpc_endpoint_id" {
#   value = module.aws_vpc_us_west_2.dynamodb_vpc_endpoint_id
# }

output "terraform_cloud_iam_access_key_id" {
  value = aws_iam_access_key.terraform_cloud.id
}

output "terraform_cloud_encrypted_iam_secret_access_key" {
  value = aws_iam_access_key.terraform_cloud.encrypted_secret
}

output "github_serverless_iam_access_key_id" {
  value = aws_iam_access_key.github_serverless.id
}

output "github_serverless_encrypted_iam_secret_access_key" {
  value = aws_iam_access_key.github_serverless.encrypted_secret
}
