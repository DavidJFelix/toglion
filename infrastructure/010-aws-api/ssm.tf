module "us_east_1_serverless_ssm" {
  source = "./modules/serverless-ssm"
  providers = {
    aws = aws.us_east_1
  }

  role_arn          = aws_iam_role.lambda_role.arn
  subnets           = data.terraform_remote_state.aws_base.outputs.aws_vpc_us_east_1_intra_subnets
  security_groups   = [data.terraform_remote_state.aws_base.outputs.aws_vpc_us_east_1_default_security_group_id]
  deployment_bucket = aws_s3_bucket.serverless_code.id
}

module "us_east_2_serverless_ssm" {
  source = "./modules/serverless-ssm"
  providers = {
    aws = aws.us_east_2
  }

  role_arn          = aws_iam_role.lambda_role.arn
  subnets           = data.terraform_remote_state.aws_base.outputs.aws_vpc_us_east_2_intra_subnets
  security_groups   = [data.terraform_remote_state.aws_base.outputs.aws_vpc_us_east_2_default_security_group_id]
  deployment_bucket = aws_s3_bucket.serverless_code.id
}

module "us_west_1_serverless_ssm" {
  source = "./modules/serverless-ssm"
  providers = {
    aws = aws.us_west_1
  }

  role_arn          = aws_iam_role.lambda_role.arn
  subnets           = data.terraform_remote_state.aws_base.outputs.aws_vpc_us_west_1_intra_subnets
  security_groups   = [data.terraform_remote_state.aws_base.outputs.aws_vpc_us_west_1_default_security_group_id]
  deployment_bucket = aws_s3_bucket.serverless_code.id
}

module "us_west_2_serverless_ssm" {
  source = "./modules/serverless-ssm"
  providers = {
    aws = aws.us_west_2
  }

  role_arn          = aws_iam_role.lambda_role.arn
  subnets           = data.terraform_remote_state.aws_base.outputs.aws_vpc_us_west_2_intra_subnets
  security_groups   = [data.terraform_remote_state.aws_base.outputs.aws_vpc_us_west_2_default_security_group_id]
  deployment_bucket = aws_s3_bucket.serverless_code.id
}
