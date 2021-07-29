output "vpc_id" {
  value = module.vpc.vpc_id
}

output "private_subnets" {
  value = module.vpc.private_subnets
}

output "public_subnets" {
  value = module.vpc.public_subnets
}

output "intra_subnets" {
  value = module.vpc.intra_subnets
}

output "default_security_group_id" {
  value = module.vpc.default_security_group_id
}

output "dynamodb_vpc_endpoint_id" {
  value = data.aws_vpc_endpoint.dynamodb.id
}

output "execute_api_vpc_endpoint_id" {
  value = data.aws_vpc_endpoint.execute_api.id
}
