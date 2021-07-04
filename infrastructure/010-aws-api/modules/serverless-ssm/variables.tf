variable "subnets" {
  description = "The subnets to deploy the lambda to"
  type        = list(string)
  default     = []
}

variable "security_groups" {
  description = "The security groups to deploy the lambda to"
  type        = list(string)
  default     = []
}

variable "role_arn" {
  description = "The ARN of the lambda execution role"
  type        = string
}

variable "deployment_bucket" {
  description = "The bucket to deploy serverless code to"
  type        = string
}

variable "global_dynamodb_table" {
  description = "The global table used as an application database"
  type        = string
}

variable "regional_dynamodb_table" {
  description = "The regional table used as a region-local database"
  type        = string
}
