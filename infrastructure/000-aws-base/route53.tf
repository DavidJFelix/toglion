resource "aws_route53_zone" "main" {
  name = var.domain_name

  tags = merge(local.common_tags)
}
