output "kms_alias_name" {
  value = aws_kms_alias.base.name
}

output "kms_key_id" {
  value = aws_kms_key.base.key_id
}

output "s3_access_logs_s3_bucket_id" {
  value = aws_s3_bucket.s3_access_logs.id
}
