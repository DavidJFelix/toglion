variable "is_global" {
  description = "Whether or not its a global table"
  type        = bool
  default     = false
}

variable "name_prefix" {
  description = "Name of the DynamoDB table"
  type        = string
}

variable "replica_regions" {
  description = "Region names for creating replicas for a global DynamoDB table"
  type        = list(map(any))
  default     = []
}

variable "server_side_encryption_kms_key_arn" {
  description = "The ARN of the CMK that should be used for the AWS KMS encryption"
  type        = string
}

variable "tags" {
  description = "A map of tags to add to all resources"
  type        = map(string)
  default     = {}
}
