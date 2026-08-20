terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  # Bucket todayilearned-tfstate is bootstrapped outside this stack.
  # Do not destroy it: it holds this state.
  backend "s3" {
    bucket       = "todayilearned-tfstate"
    key          = "infrastructure/terraform.tfstate"
    region       = "eu-west-1"
    encrypt      = true
    use_lockfile = true
  }
}
