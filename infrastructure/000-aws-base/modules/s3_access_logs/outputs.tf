output "kms_alias_name" {
  value = aws_kms_alias.this.name
}

output "kms_key_id" {
  value = aws_kms_key.this.key_id
}

output "s3_bucket_id" {
  value = aws_s3_bucket.this.id
}
