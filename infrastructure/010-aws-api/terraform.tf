data "terraform_remote_state" "aws_base" {
  backend = "remote"

  config = {
    organization = "toglion"
    workspaces = {
      name = "000-aws-base"
    }
  }
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 3.37.0"
    }
  }
}
