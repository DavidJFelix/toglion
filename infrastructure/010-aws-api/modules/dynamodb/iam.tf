data "aws_caller_identity" "current" {}

data "aws_iam_policy_document" "read_write" {
  statement {
    effect = "Allow"
    sid    = "AllowClientDynamoDB"

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

    resources = [
      "${var.is_global ? "arn:aws:dynamodb:*:${data.aws_caller_identity.current.account_id}:table/${module.this.dynamodb_table_id}" : module.this.dynamodb_table_arn}",
      "${var.is_global ? "arn:aws:dynamodb:*:${data.aws_caller_identity.current.account_id}:table/${module.this.dynamodb_table_id}" : module.this.dynamodb_table_arn}/index/*"
    ]
  }

  statement {
    effect = "Allow"
    sid    = "AllowKMSDecryptEncrypt"

    actions = [
      "kms:DescribeKey",
      "kms:Encrypt",
      "kms:Decrypt",
      "kms:ReEncrypt*",
      "kms:GenerateDataKey",
      "kms:GenerateDataKeyWithoutPlaintext",
    ]

    resources = concat(
      [var.server_side_encryption_kms_key_arn],
      [for replica_region in var.replica_regions : replica_region.kms_key_arn],
    )
  }
}

resource "aws_iam_policy" "read_write" {
  description = "Permits read, write, query and scan items on the ${module.this.dynamodb_table_id} table and its indexes"
  name_prefix = "ClientPolicy"
  path        = "/databases/dynamodb/${var.name_prefix}-${var.is_global ? "global" : "regional"}/${random_id.this.hex}/"
  policy      = data.aws_iam_policy_document.read_write.json
}
