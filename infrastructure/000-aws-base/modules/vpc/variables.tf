variable "cidr_block" {
  default     = "10.0.0.0/16"
  description = "The CIDR block to use for the VPC. IPv4; max /16"
  type        = string
}

variable "tags" {
  default     = {}
  description = "Tags applied to the VPC resources"
  type        = map
}
