variable "access_key" {
        description = "Access key to AWS console"
}
variable "secret_key" {
        description = "Secret key to AWS console"
}

variable "table_name" {
  description = "Dynamodb table name (space is not allowed)"
  default = "til-links-live"
}

variable "table_billing_mode" {
  description = "Controls how you are charged for read and write throughput and how you manage capacity."
  default = "PAY_PER_REQUEST"
}


variable "environment" {
  description = "Name of environment"
  default = "dev"
}
