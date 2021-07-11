resource "aws_s3_bucket" "this" {
  acl           = "private"
  bucket_prefix = "serverless-code"
  tags          = merge(var.tags)

  logging {
    target_bucket = var.access_log_bucket
    target_prefix = "aws/s3/010-aws-api/serverless-code/"
  }

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}
