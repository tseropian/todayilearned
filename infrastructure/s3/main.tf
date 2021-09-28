provider "aws" {
  profile    = "${var.profile}"
  region = "eu-west-1"
}

resource "aws_s3_bucket" "todayilearned-prod" {
  bucket = "todayilearned-prod"
  acl = "public-read"
  policy = file("policy.json")
  website {
    index_document = "index.html"
    error_document = "error.html"
  }
}