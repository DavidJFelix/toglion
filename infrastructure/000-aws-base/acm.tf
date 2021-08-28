module "main_aws_acm_us_east_1" {
  source = "./modules/acm_domain"
  providers = {
    aws = aws.us_east_1
  }

  domain_name     = var.domain_name
  route53_zone_id = aws_route53_zone.main.zone_id

  tags = merge(local.common_tags)
}

module "main_aws_acm_us_east_2" {
  source = "./modules/acm_domain"
  providers = {
    aws = aws.us_east_2
  }

  domain_name     = var.domain_name
  route53_zone_id = aws_route53_zone.main.zone_id

  tags = merge(local.common_tags)
}

module "main_aws_acm_us_west_1" {
  source = "./modules/acm_domain"
  providers = {
    aws = aws.us_west_1
  }

  domain_name     = var.domain_name
  route53_zone_id = aws_route53_zone.main.zone_id

  tags = merge(local.common_tags)
}

module "main_aws_acm_us_west_2" {
  source = "./modules/acm_domain"
  providers = {
    aws = aws.us_west_2
  }

  domain_name     = var.domain_name
  route53_zone_id = aws_route53_zone.main.zone_id

  tags = merge(local.common_tags)
}
