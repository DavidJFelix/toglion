data "aws_region" "current" {}

resource "aws_route53_record" "websocket_api_gateway" {
  allow_overwrite = true
  name            = var.websocket_domain_name
  type            = "A"
  zone_id         = var.websocket_route53_zone_id

  alias {
    name                   = aws_apigatewayv2_domain_name.websocket.domain_name_configuration[0].target_domain_name
    zone_id                = aws_apigatewayv2_domain_name.websocket.domain_name_configuration[0].hosted_zone_id
    evaluate_target_health = false
  }

  latency_routing_policy {
    region = data.aws_region.current
  }
}
