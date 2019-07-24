variable "region" {
  default = "us-east-1"
}

variable "service" {
  default = "magine"
}

variable "environment" {
  description = "Environment"
}

variable "assets_bucket" {
  description = "Target bucket for transformed images"
}
