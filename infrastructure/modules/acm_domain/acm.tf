
resource "aws_acm_certificate" "this" {
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

  tags = merge(var.tags)

  validation_method = "DNS"
}

resource "aws_acm_certificate_validation" "this" {
  certificate_arn         = aws_acm_certificate.this.arn
  validation_record_fqdns = [for record in aws_route53_record.this : record.fqdn]
}
