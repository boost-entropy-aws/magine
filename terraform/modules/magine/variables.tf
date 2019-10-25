variable "region" {
  default = "us-east-1"
}

variable "service" {
  default = "magine"
}

variable "environment" {
  description = "Environment"
}

variable "description" {
  description = "Description of what your Lambda Function does"
  default     = "An image service for managing crops and optimizing sizes"
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

variable "runtime" {
  description = "Lambda function runtime, nodejs8.10 or nodejs10.x"
  default     = "nodejs8.10"
}
