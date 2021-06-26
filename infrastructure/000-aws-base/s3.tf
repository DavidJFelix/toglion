// A bucket to use as a log destination bucket for all other buckets
resource "aws_s3_bucket" "s3_access_logs" {
  acl           = "log-delivery-write"
  bucket_prefix = "logs-s3-access"
  tags          = merge(local.common_tags)

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm     = "aws:kms"
        kms_master_key_id = aws_kms_key.base.key_id
      }
    }
  }
}
