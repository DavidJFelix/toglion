resource "aws_api_gateway_domain_name" "websocket" {
  domain_name              = var.websocket_domain_name
  regional_certificate_arn = var.websocket_acm_certificate_arn

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}
