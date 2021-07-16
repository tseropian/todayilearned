provider "aws" {
    access_key = "${var.access_key}"
    secret_key = "${var.secret_key}"
    region = "eu-west-1"
}

resource "aws_dynamodb_table" "todayilearned-links" {
  name        = "${var.table_name}"
  billing_mode = "${var.table_billing_mode}"
  hash_key       = "postDate"
  range_key       = "linkId"
  attribute {
    name = "linkId"
    type = "S"
  }
  attribute {
    name = "postDate"
    type = "S"
  }
  
  tags = {
    environment       = "${var.environment}"
  }
}