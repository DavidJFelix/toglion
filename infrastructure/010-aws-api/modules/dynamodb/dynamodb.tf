module "this" {
  source = "terraform-aws-modules/dynamodb-table/aws"

  name      = "${var.name_prefix}-${random_id.this.hex}"
  hash_key  = "PartitionKey"
  range_key = "SortKey"

  # Enable streaming to allow for global replication
  stream_enabled   = var.is_global
  stream_view_type = var.is_global ? "NEW_AND_OLD_IMAGES" : null

  server_side_encryption_enabled     = true
  server_side_encryption_kms_key_arn = var.server_side_encryption_kms_key_arn

  attributes = [
    {
      name = "PartitionKey"
      type = "S"
    },
    {
      name = "SortKey"
      type = "S"
    },
    {
      name = "Value"
      type = "S"
    }
  ]

  global_secondary_indexes = [
    {
      hash_key        = "SortKey"
      name            = "InverseIndex"
      projection_type = "KEYS_ONLY"
      range_key       = "PartitionKey"
    },
    {
      hash_key        = "Value"
      name            = "ValueIndex"
      projection_type = "ALL"
      range_key       = "PartitionKey"
    }
  ]

  point_in_time_recovery_enabled = true

  replica_regions = var.replica_regions

  ttl_attribute_name = "TTL"
  ttl_enabled        = true

  tags = merge(var.tags)
}
