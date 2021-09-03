data "aws_route53_zone" "main" {
  zone_id = data.terraform_remote_state.aws_base.outputs.main_route53_zone_id
}

resource "aws_route53_zone" "websocket" {
  name = local.websocket_domain

  tags = merge(local.common_tags)
}

resource "aws_route53_record" "websocket_ns" {
  allow_overwrite = true
  name            = local.websocket_domain
  records         = aws_route53_zone.websocket.name_servers
  ttl             = 24 * 60 * 60
  type            = "NS"
  zone_id         = data.aws_route53_zone.main.zone_id
}
