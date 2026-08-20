variable "profile" {
  description = "AWS CLI profile"
  type        = string
  default     = "personal"
}

variable "environment" {
  description = "Value for the environment tag"
  type        = string
  default     = "production"
}
