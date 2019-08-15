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

variable "memory_size" {
  description = "Amount of memory in MB your Lambda Function can use at runtime"
  default     = 128
}

variable "timeout" {
  description = "The amount of time your Lambda Function has to run in seconds"
  default     = 3
}


