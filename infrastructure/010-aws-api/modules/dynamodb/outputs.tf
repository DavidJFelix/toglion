
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

output "iam_policy_dynamodb_read_write_arn" {
  description = "The ARN for a policy which allows read/write to the dynamodb table created by this module"
  value       = aws_iam_policy.read_write.arn
}
