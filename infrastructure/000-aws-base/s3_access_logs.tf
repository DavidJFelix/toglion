module "aws_s3_access_logs_us_east_1" {
  source = "./modules/s3_access_logs"
  providers = {
    aws = aws.us_east_1
  }
  tags = merge(local.common_tags)
}

module "aws_s3_access_logs_us_east_2" {
  source = "./modules/s3_access_logs"
  providers = {
    aws = aws.us_east_2
  }
  tags = merge(local.common_tags)
}

module "aws_s3_access_logs_us_west_1" {
  source = "./modules/s3_access_logs"
  providers = {
    aws = aws.us_west_1
  }
  tags = merge(local.common_tags)
}

module "aws_s3_access_logs_us_west_2" {
  source = "./modules/s3_access_logs"
  providers = {
    aws = aws.us_west_2
  }
  tags = merge(local.common_tags)
}
