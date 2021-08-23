module "us_east_1_serverless" {
  source = "./modules/serverless"
  providers = {
    aws = aws.us_east_1
  }

  role_arn                = aws_iam_role.lambda_role.arn
  subnets                 = data.terraform_remote_state.aws_base.outputs.aws_vpc_us_east_1_public_subnets
  security_groups         = [data.terraform_remote_state.aws_base.outputs.aws_vpc_us_east_1_default_security_group_id]
  access_log_bucket       = data.terraform_remote_state.aws_base.outputs.aws_s3_access_logs_us_east_1_s3_bucket_id
  global_dynamodb_table   = module.global_dynamodb_table.dynamodb_table_id
  regional_dynamodb_table = module.us_east_1_dynamodb_table.dynamodb_table_id
  tags                    = merge(local.common_tags)
}

module "us_east_2_serverless" {
  source = "./modules/serverless"
  providers = {
    aws = aws.us_east_2
  }

  role_arn                = aws_iam_role.lambda_role.arn
  subnets                 = data.terraform_remote_state.aws_base.outputs.aws_vpc_us_east_2_public_subnets
  security_groups         = [data.terraform_remote_state.aws_base.outputs.aws_vpc_us_east_2_default_security_group_id]
  access_log_bucket       = data.terraform_remote_state.aws_base.outputs.aws_s3_access_logs_us_east_2_s3_bucket_id
  global_dynamodb_table   = module.global_dynamodb_table.dynamodb_table_id
  regional_dynamodb_table = module.us_east_2_dynamodb_table.dynamodb_table_id
  tags                    = merge(local.common_tags)
}

module "us_west_1_serverless" {
  source = "./modules/serverless"
  providers = {
    aws = aws.us_west_1
  }

  role_arn                = aws_iam_role.lambda_role.arn
  subnets                 = data.terraform_remote_state.aws_base.outputs.aws_vpc_us_west_1_public_subnets
  security_groups         = [data.terraform_remote_state.aws_base.outputs.aws_vpc_us_west_1_default_security_group_id]
  access_log_bucket       = data.terraform_remote_state.aws_base.outputs.aws_s3_access_logs_us_west_1_s3_bucket_id
  global_dynamodb_table   = module.global_dynamodb_table.dynamodb_table_id
  regional_dynamodb_table = module.us_west_1_dynamodb_table.dynamodb_table_id
  tags                    = merge(local.common_tags)
}

module "us_west_2_serverless" {
  source = "./modules/serverless"
  providers = {
    aws = aws.us_west_2
  }

  role_arn                = aws_iam_role.lambda_role.arn
  subnets                 = data.terraform_remote_state.aws_base.outputs.aws_vpc_us_west_2_public_subnets
  security_groups         = [data.terraform_remote_state.aws_base.outputs.aws_vpc_us_west_2_default_security_group_id]
  access_log_bucket       = data.terraform_remote_state.aws_base.outputs.aws_s3_access_logs_us_west_2_s3_bucket_id
  global_dynamodb_table   = module.global_dynamodb_table.dynamodb_table_id
  regional_dynamodb_table = module.us_west_2_dynamodb_table.dynamodb_table_id
  tags                    = merge(local.common_tags)
}
