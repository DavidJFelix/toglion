variable "domain_name" {
  description = "The domain name used by the app"
  type        = string
}

variable "route53_zone_id" {
  description = "The route53 zone to apply ACM domain validations to"
  type        = string
}
