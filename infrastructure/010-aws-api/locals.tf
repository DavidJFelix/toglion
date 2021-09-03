locals {
  common_tags = {
    Application = "Toglion API"
    Stack       = "010-aws-api"
    IsTerraform = "true"
  }
  websocket_domain = "wsapi.${data.aws_route53_zone.main.name}"
}
