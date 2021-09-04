resource "aws_apigatewayv2_domain_name" "websocket" {
  domain_name = var.websocket_domain_name

  domain_name_configuration {
    certificate_arn = var.websocket_acm_certificate_arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }
}
