variable "access_key" {
  description = "Access key to AWS console"
}

variable "secret_key" {
  description = "Secret key to AWS console"
}

variable "table_name" {
  description = "DynamoDB table name for Wikipedia page metadata cache"
  default     = "til-wikipedia-metadata"
}

variable "environment" {
  description = "Name of environment"
  default     = "production"
}
