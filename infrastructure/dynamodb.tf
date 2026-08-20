resource "aws_dynamodb_table" "links" {
  name         = "til-links-live"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "postDate"
  range_key    = "linkId"

  attribute {
    name = "postDate"
    type = "S"
  }

  attribute {
    name = "linkId"
    type = "S"
  }

  tags = {
    environment = "dev"
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_dynamodb_table" "wikipedia_metadata" {
  name         = "til-wikipedia-metadata"
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
