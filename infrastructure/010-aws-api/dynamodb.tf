# Global primary database for app data
module "global_dynamodb_table" {
  source = "./modules/dynamodb"
  providers = {
    aws = aws.us_east_1
  }

  name_prefix                        = "api-global"
  is_global                          = true
  server_side_encryption_kms_key_arn = aws_kms_key.dynamodb_us_east_1.arn

  replica_regions = [
    {
      region_name = "us-east-2"
      kms_key_arn = aws_kms_key.dynamodb_us_east_2.arn
    },
    {
      region_name = "us-west-1"
      kms_key_arn = aws_kms_key.dynamodb_us_west_1.arn
    },
    {
      region_name = "us-west-2"
      kms_key_arn = aws_kms_key.dynamodb_us_west_2.arn
    }
  ]

  tags = merge(local.common_tags)
}

# Regioanl Databases for app session data
module "us_east_1_dynamodb_table" {
  source = "./modules/dynamodb"
  providers = {
    aws = aws.us_east_1
  }

  name_prefix                        = "api-regional"
  server_side_encryption_kms_key_arn = aws_kms_key.dynamodb_us_east_1.arn
  tags                               = merge(local.common_tags)
}

module "us_east_2_dynamodb_table" {
  source = "./modules/dynamodb"
  providers = {
    aws = aws.us_east_1
  }

  name_prefix                        = "api-regional"
  server_side_encryption_kms_key_arn = aws_kms_key.dynamodb_us_east_2.arn
  tags                               = merge(local.common_tags)
}

module "us_west_1_dynamodb_table" {
  source = "./modules/dynamodb"
  providers = {
    aws = aws.us_east_1
  }

  name_prefix                        = "api-regional"
  server_side_encryption_kms_key_arn = aws_kms_key.dynamodb_us_west_1.arn
  tags                               = merge(local.common_tags)
}

module "us_west_2_dynamodb_table" {
  source = "./modules/dynamodb"
  providers = {
    aws = aws.us_east_1
  }

  name_prefix                        = "api-regional"
  server_side_encryption_kms_key_arn = aws_kms_key.dynamodb_us_west_2.arn
  tags                               = merge(local.common_tags)
}
