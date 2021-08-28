
resource "aws_acm_certificate" "main" {
  domain_name = "${var.domain_name}"

  options {
    certificate_transparency_logging_preference = "ENABLED"
  }

  lifecycle {
    create_before_destroy = true
  }

  subject_alternative_names = [
    "*.${var.domain_name}",
  ]

  tags = merge(local.common_tags)

  validation_method = "DNS"
}

resource "aws_acm_certificate_validation" "main" {
  certificate_arn         = aws_acm_certificate.main.arn
  validation_record_fqdns = [for record in aws_route53_record.main : record.fqdn]
}
