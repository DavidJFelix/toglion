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
      "${module.this.dynamodb_table_arn}",
      "${module.this.dynamodb_table_arn}/index/*"
    ]
  }
}

resource "aws_iam_policy" "read_write" {
  description = "Permits read, write, query and scan items on the ${module.this.dynamodb_table_id} table and its indexes"
  name_prefix = "ClientPolicy"
  path        = "/databases/dynamodb/${var.name_prefix}-${var.is_global ? "global" : "regional"}/${random_id.this.hex}/"
  policy      = data.aws_iam_policy_document.read_write.json
}
