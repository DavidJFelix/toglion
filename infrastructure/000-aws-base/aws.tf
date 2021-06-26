// Default AWS provider is in the region us-east-1 (Viginia)
provider "aws" {
  region = "us-east-1"
}

// Define aliases for other AWS regions
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

provider "aws" {
  alias  = "us_east_2"
  region = "us-east-2"
}

provider "aws" {
  alias  = "us_west_1"
  region = "us-west-1"
}

provider "aws" {
  alias  = "us_west_2"
  region = "us-west-2"
}

// Create a pointer to the caller identity which provides reflective account information
data "aws_caller_identity" "current" {}
