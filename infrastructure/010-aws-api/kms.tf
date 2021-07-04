resource "aws_kms_key" "dynamodb_us_east_1" {
  provider            = aws.us_east_1
  description         = "A key for the dynamodb tables for the API application"
  enable_key_rotation = true
  tags                = merge(local.common_tags)
}

resource "aws_kms_alias" "dynamodb_us_east_1" {
  provider      = aws.us_east_1
  name_prefix   = "alias/api/dynamodb"
  target_key_id = aws_kms_key.dynamodb_us_east_1.key_id
}

resource "aws_kms_key" "dynamodb_us_east_2" {
  provider            = aws.us_east_2
  description         = "A key for the dynamodb tables for the API application"
  enable_key_rotation = true
  tags                = merge(local.common_tags)
}

resource "aws_kms_alias" "dynamodb_us_east_2" {
  provider      = aws.us_east_2
  name_prefix   = "alias/api/dynamodb"
  target_key_id = aws_kms_key.dynamodb_us_east_2.key_id
}

resource "aws_kms_key" "dynamodb_us_west_1" {
  provider            = aws.us_west_1
  description         = "A key for the dynamodb tables for the API application"
  enable_key_rotation = true
  tags                = merge(local.common_tags)
}

resource "aws_kms_alias" "dynamodb_us_west_1" {
  provider      = aws.us_west_1
  name_prefix   = "alias/api/dynamodb"
  target_key_id = aws_kms_key.dynamodb_us_west_1.key_id
}

resource "aws_kms_key" "dynamodb_us_west_2" {
  provider            = aws.us_west_2
  description         = "A key for the dynamodb tables for the API application"
  enable_key_rotation = true
  tags                = merge(local.common_tags)
}

resource "aws_kms_alias" "dynamodb_us_west_2" {
  provider      = aws.us_west_2
  name_prefix   = "alias/api/dynamodb"
  target_key_id = aws_kms_key.dynamodb_us_west_2.key_id
}
