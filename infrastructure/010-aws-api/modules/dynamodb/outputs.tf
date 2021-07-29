
output "dynamodb_table_arn" {
  description = "ARN of the DynamoDB table"
  value       = module.this.dynamodb_table_arn
}

output "dynamodb_table_id" {
  description = "ID of the DynamoDB table"
  value       = module.this.dynamodb_table_id
}

output "dynamodb_table_stream_arn" {
  description = "The ARN of the Table Stream. Only available when var.is_global is true"
  value       = var.is_global ? module.this.dynamodb_table_stream_arn : null
}

output "dynamodb_table_stream_label" {
  description = "A timestamp, in ISO 8601 format of the Table Stream. Only available when var.is_global is true"
  value       = var.is_global ? module.this.dynamodb_table_stream_label : null
}

data "aws_caller_identity" "current" {}

output "iam_policy_arns" {
  description = "A list of ARNs for accessing the db and indexes"
  value = [
    "${var.is_global ? "arn:aws:dynamodb:*:${data.aws_caller_identity.current.account_id}:table/${module.this.dynamodb_table_id}" : module.this.dynamodb_table_arn}",
    "${var.is_global ? "arn:aws:dynamodb:*:${data.aws_caller_identity.current.account_id}:table/${module.this.dynamodb_table_id}" : module.this.dynamodb_table_arn}/index/*"
  ]
}
