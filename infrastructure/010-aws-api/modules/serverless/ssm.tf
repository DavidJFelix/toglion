resource "aws_ssm_parameter" "serverless_deployment_bucket" {
  name  = "/services/api/SERVERLESS_DEPLOYMENT_BUCKET"
  type  = "String"
  value = aws_s3_bucket.this.id

  tags = merge(var.tags)
}

resource "aws_ssm_parameter" "lambda_role_arn" {
  name  = "/services/api/LAMBDA_ROLE_ARN"
  type  = "String"
  value = var.role_arn

  tags = merge(var.tags)
}

resource "aws_ssm_parameter" "lambda_subnets" {
  name  = "/services/api/LAMBDA_SUBNETS"
  type  = "StringList"
  value = join(",", var.subnets)

  tags = merge(var.tags)
}

resource "aws_ssm_parameter" "lambda_security_group" {
  name  = "/services/api/LAMBDA_SECURITY_GROUPS"
  type  = "StringList"
  value = join(",", var.security_groups)

  tags = merge(var.tags)
}

resource "aws_ssm_parameter" "global_dynamodb_table" {
  name  = "/services/api/GLOBAL_DYNAMODB_TABLE"
  type  = "String"
  value = var.global_dynamodb_table

  tags = merge(var.tags)
}

resource "aws_ssm_parameter" "regional_dynamodb_table" {
  name  = "/services/api/REGIONAL_DYNAMODB_TABLE"
  type  = "String"
  value = var.regional_dynamodb_table

  tags = merge(var.tags)
}