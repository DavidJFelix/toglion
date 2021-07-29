data "aws_iam_policy" "lambda_vpc_managed_policy" {
  arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

// The assume role policy for the application execution role
data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    actions = [
      "sts:AssumeRole",
    ]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

// The permission boundary to be used by the execution role
data "aws_iam_policy_document" "lambda_execution_permission_boundary" {
  statement {
    effect = "Allow"
    sid    = "ServiceBoundaries"

    actions = [
      "execute-api:*",
      "ec2:*",
      "dynamodb:*",
      "kms:*",
      "lambda:*",
      "s3:*",
    ]

    resources = [
      "*"
    ]
  }
}

resource "aws_iam_policy" "lambda_execution_permission_boundary" {
  description = "The policy boundary for the Lambda API role"
  name_prefix = "APILambda"
  path        = "/boundaries/services/api/"
  policy      = data.aws_iam_policy_document.lambda_execution_permission_boundary.json
}

resource "aws_iam_role" "lambda_role" {
  assume_role_policy   = data.aws_iam_policy_document.lambda_assume_role.json
  description          = "The role used by Lambda for API during execution"
  name_prefix          = "APILambda"
  path                 = "/services/api/"
  permissions_boundary = aws_iam_policy.lambda_execution_permission_boundary.arn

  tags = merge(local.common_tags)
}

resource "aws_iam_role_policy_attachment" "lambda_vpc_managed_policy" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = data.aws_iam_policy.lambda_vpc_managed_policy.arn
}

resource "aws_iam_role_policy_attachment" "global_dynamodb" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = module.global_dynamodb_table.iam_policy_dynamodb_read_write_arn
}

resource "aws_iam_role_policy_attachment" "us_east_1_dynamodb" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = module.us_east_1_dynamodb_table.iam_policy_dynamodb_read_write_arn
}

resource "aws_iam_role_policy_attachment" "us_east_2_dynamodb" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = module.us_east_2_dynamodb_table.iam_policy_dynamodb_read_write_arn
}

resource "aws_iam_role_policy_attachment" "us_west_1_dynamodb" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = module.us_west_1_dynamodb_table.iam_policy_dynamodb_read_write_arn
}

resource "aws_iam_role_policy_attachment" "us_west_2_dynamodb" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = module.us_west_2_dynamodb_table.iam_policy_dynamodb_read_write_arn
}


data "aws_vpc_endpoint" "us_east_1_dynamodb" {
  provider     = aws.us_east_1
  vpc_id       = data.terraform_remote_state.aws_base.outputs.aws_vpc_us_east_1_vpc_id
  service_name = "com.amazonaws.us-east-1.dynamodb"
}

data "aws_vpc_endpoint" "us_east_2_dynamodb" {
  provider     = aws.us_east_2
  vpc_id       = data.terraform_remote_state.aws_base.outputs.aws_vpc_us_east_2_vpc_id
  service_name = "com.amazonaws.us-east-2.dynamodb"
}

data "aws_vpc_endpoint" "us_west_1_dynamodb" {
  provider     = aws.us_west_1
  vpc_id       = data.terraform_remote_state.aws_base.outputs.aws_vpc_us_west_1_vpc_id
  service_name = "com.amazonaws.us-west-1.dynamodb"
}

data "aws_vpc_endpoint" "us_west_2_dynamodb" {
  provider     = aws.us_west_2
  vpc_id       = data.terraform_remote_state.aws_base.outputs.aws_vpc_us_west_2_vpc_id
  service_name = "com.amazonaws.us-west-2.dynamodb"
}

data "aws_vpc_endpoint" "us_east_1_execute_api" {
  provider     = aws.us_east_1
  vpc_id       = data.terraform_remote_state.aws_base.outputs.aws_vpc_us_east_1_vpc_id
  service_name = "com.amazonaws.us-east-1.execute-api"
}

data "aws_vpc_endpoint" "us_east_2_execute_api" {
  provider     = aws.us_east_2
  vpc_id       = data.terraform_remote_state.aws_base.outputs.aws_vpc_us_east_2_vpc_id
  service_name = "com.amazonaws.us-east-2.execute-api"
}

data "aws_vpc_endpoint" "us_west_1_execute_api" {
  provider     = aws.us_west_1
  vpc_id       = data.terraform_remote_state.aws_base.outputs.aws_vpc_us_west_1_vpc_id
  service_name = "com.amazonaws.us-west-1.execute-api"
}

data "aws_vpc_endpoint" "us_west_2_execute_api" {
  provider     = aws.us_west_2
  vpc_id       = data.terraform_remote_state.aws_base.outputs.aws_vpc_us_west_2_vpc_id
  service_name = "com.amazonaws.us-west-2.execute-api"
}

data "aws_iam_policy_document" "lambda_policy" {
  # This policy is explicitly denied from accessing dynamodb outside of the defined VPC endpoints
  statement {
    effect  = "Deny"
    actions = ["dynamodb:*"]
    resources = [
      module.global_dynamodb_table.dynamodb_table_arn,
      module.us_east_1_dynamodb_table.dynamodb_table_arn,
      module.us_east_2_dynamodb_table.dynamodb_table_arn,
      module.us_west_1_dynamodb_table.dynamodb_table_arn,
      module.us_west_2_dynamodb_table.dynamodb_table_arn,
    ]

    condition {
      test     = "ForAllValues:StringNotEquals"
      variable = "aws:sourceVpce"

      values = [
        data.aws_vpc_endpoint.us_east_1_dynamodb.id,
        data.aws_vpc_endpoint.us_east_2_dynamodb.id,
        data.aws_vpc_endpoint.us_west_1_dynamodb.id,
        data.aws_vpc_endpoint.us_west_2_dynamodb.id,
      ]
    }
  }

  # This policy is allowed to reach the execute API for any API gateway but only through the VPC endpoints for it
  statement {
    effect = "Allow"
    sid    = "LambdaPolicy"

    actions = [
      "execute-api:*",
    ]

    resources = [
      "*"
    ]

    condition {
      test     = "ForAnyValues:StringNotEquals"
      variable = "aws:sourceVpce"

      values = [
        data.aws_vpc_endpoint.us_east_1_dynamodb.id,
        data.aws_vpc_endpoint.us_east_2_dynamodb.id,
        data.aws_vpc_endpoint.us_west_1_dynamodb.id,
        data.aws_vpc_endpoint.us_west_2_dynamodb.id,
      ]
    }
  }
}

resource "aws_iam_role_policy_attachment" "lambda_policy" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = data.aws_iam_policy_document.lambda_policy.json
}
