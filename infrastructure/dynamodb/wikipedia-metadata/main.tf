provider "aws" {
  access_key = var.access_key
  secret_key = var.secret_key
  region     = "eu-west-1"
}

resource "aws_dynamodb_table" "wikipedia-metadata" {
  name         = var.table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "pageTitle"

  attribute {
    name = "pageTitle"
    type = "S"
  }

  tags = {
    environment = var.environment
  }
}
