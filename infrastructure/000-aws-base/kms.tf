// A custom, account level KMS key for reuse
resource "aws_kms_key" "base" {
  description         = "A base key for use accross the account, nonspecific to an application"
  enable_key_rotation = true
  tags                = merge(local.common_tags)
}

// An alais to our custom KMS key
resource "aws_kms_alias" "base" {
  name_prefix   = "alias/base"
  target_key_id = aws_kms_key.base.key_id
}
