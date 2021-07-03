resource "aws_iam_access_key" "terraform_cloud" {
  user    = aws_iam_user.terraform_cloud.name
  pgp_key = "keybase:davidjfelix"
}

resource "aws_iam_access_key" "github_serverless" {
  user    = aws_iam_user.github_serverless.name
  pgp_key = "keybase:davidjfelix"
}


resource "aws_iam_group" "automation_cicd" {
  name = "automation-cicd"
  path = "/automation/cicd/"
}

resource "aws_iam_user" "terraform_cloud" {
  name = "terraform-cloud"
  path = "/automation/cicd/terraform-cloud/"
}

resource "aws_iam_user" "github_serverless" {
  name = "github-serverless"
  path = "/automation/cicd/github-serverless/"
}
