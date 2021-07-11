resource "aws_kms_key" "this" {
  description         = "A kms key for AWS Access Logs"
  enable_key_rotation = true
  tags                = merge(var.tags)
}

resource "aws_kms_alias" "this" {
  name_prefix   = "alias/base"
  target_key_id = aws_kms_key.this.key_id
}
