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

data "aws_iam_policy_document" "lambda_dynamodb" {
  # This statement allows dynamodb access to the created tables only through the VPC endpoint
  statement {
    effect = "Allow"
    sid    = "ddb"

    actions = [
      "dynamodb:BatchGetItem",
      "dynamodb:BatchWriteItem",
      "dynamodb:ConditionCheckItem",
      "dynamodb:DeleteItem",
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:Query",
      "dynamodb:Scan",
      "dynamodb:UpdateItem",
    ]

    resources = concat(
      module.global_dynamodb_table.iam_policy_arns,
      module.us_east_1_dynamodb_table.iam_policy_arns,
      module.us_east_2_dynamodb_table.iam_policy_arns,
      module.us_west_1_dynamodb_table.iam_policy_arns,
      module.us_west_2_dynamodb_table.iam_policy_arns,
    )

    condition {
      test     = "StringEquals"
      variable = "aws:SourceVpce"

      values = [
        data.terraform_remote_state.aws_base.outputs.aws_vpc_us_east_1_dynamodb_vpc_endpoint_id,
        data.terraform_remote_state.aws_base.outputs.aws_vpc_us_east_2_dynamodb_vpc_endpoint_id,
        data.terraform_remote_state.aws_base.outputs.aws_vpc_us_west_1_dynamodb_vpc_endpoint_id,
        data.terraform_remote_state.aws_base.outputs.aws_vpc_us_west_2_dynamodb_vpc_endpoint_id,
      ]
    }
  }
}

data "aws_iam_policy_document" "lambda_execute_api" {
  # This statement allows execute API for any API gateway but only through the VPC endpoints for it
  statement {
    effect = "Allow"
    sid    = "exapi"

    actions = [
      "execute-api:*",
    ]

    resources = [
      "*"
    ]

    condition {
      test     = "StringEquals"
      variable = "aws:SourceVpce"

      values = [
        data.terraform_remote_state.aws_base.outputs.aws_vpc_us_east_1_execute_api_vpc_endpoint_id,
        data.terraform_remote_state.aws_base.outputs.aws_vpc_us_east_2_execute_api_vpc_endpoint_id,
        data.terraform_remote_state.aws_base.outputs.aws_vpc_us_west_1_execute_api_vpc_endpoint_id,
        data.terraform_remote_state.aws_base.outputs.aws_vpc_us_west_2_execute_api_vpc_endpoint_id,
      ]
    }
  }
}
data "aws_iam_policy_document" "lambda_kms" {
  statement {
    effect = "Allow"
    sid    = "kms"

    actions = [
      "kms:DescribeKey",
      "kms:Encrypt",
      "kms:Decrypt",
      "kms:ReEncrypt*",
      "kms:GenerateDataKey",
      "kms:GenerateDataKeyWithoutPlaintext",
    ]

    resources = [
      aws_kms_key.dynamodb_us_east_1.arn,
      aws_kms_key.dynamodb_us_east_2.arn,
      aws_kms_key.dynamodb_us_west_1.arn,
      aws_kms_key.dynamodb_us_west_2.arn,
    ]
  }
}

resource "aws_iam_policy" "lambda_dynamodb" {
  description = "The policy for the Lambda DynamoDB"
  name_prefix = "APILambdaDynamoDB"
  policy      = data.aws_iam_policy_document.lambda_dynamodb.json
}

resource "aws_iam_role_policy_attachment" "lambda_dynamodb_policy" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_dynamodb.arn
}

resource "aws_iam_policy" "lambda_execute_api" {
  description = "The policy for the Lambda Execute API"
  name_prefix = "APILambdaExecuteAPI"
  policy      = data.aws_iam_policy_document.lambda_execute_api.json
}

resource "aws_iam_role_policy_attachment" "lambda_execute_api_policy" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_execute_api.arn
}

resource "aws_iam_policy" "lambda_kms" {
  description = "The policy for the Lambda DynamoDB"
  name_prefix = "APILambdaDynamoDB"
  policy      = data.aws_iam_policy_document.lambda_kms.json
}

resource "aws_iam_role_policy_attachment" "lambda_kms_policy" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_kms.arn
}
