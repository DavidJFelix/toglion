# Infrastructure

This folder contains a number of packages used to create the infrastructure for this project.
Each package is self contained, but the packages are organized in a way that represents some of the inter-package dependencies.
The primary technology for managing infrastructure is `terraform` with state managed remotely in [Terraform Cloud](https://app.terraform.io/).
Most infrastructure is managed in this directory, but some ad-hoc and project level infrastructure is managed by outside tools which may or many not reference values managed in this folder.
One notable external tool is `serverless` which manages `CloudFormation` apps and AWS lambdas itself.
The `serverless` code does reference values declared in this folder.

## Organization

Projects are designed to govern independent resource goals, but may have inter-stack dependencies that dictate the order in which they run and required packages.
The order to run these packages is instructed by a 3-digit prefix number (eg: `000-name`). These numbers can be duplicated and are ordered lowest-first. The most significant 2 digits are designed to be used for normal use cases while the least significant digit should **normally** be "0". The least significant digit is for squeezing new packages between dependent items and should be used with caution.

## Disaster Recovery

* Create an Admin AWS user with CLI access.
* Run each package/subdirectory in this folder in numeric order, following the README instructions in each package.
Projects with the same number prefix are considered peers and not dependent on each other, so they may be run concurrently. For example:
  - Run `000-aws-base` first
  - Run `010-aws-api` and `010-example-project` concurrently or in any order second.
  - Run `020-second-example` after all previous projects have completed

These plans don't include notes for setting up terraform cloud or AWS accounts.
In the event of a disaster, those questions should be asked external to this project, as these instructions only help with direct infrastructure recovery, not CI/CD recovery.