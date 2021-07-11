resource "aws_s3_bucket" "serverless_code" {
  acl           = "private"
  bucket_prefix = "serverless-code"
  tags          = merge(local.common_tags)

  logging {
    target_bucket = data.terraform_remote_state.aws_base.outputs.s3_access_logs_s3_bucket_id
    target_prefix = "aws/s3/${local.common_tags.Stack}/serverless-code/"
  }

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}
