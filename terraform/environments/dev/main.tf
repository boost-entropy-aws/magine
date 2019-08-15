provider "aws" {
  region = "us-east-1"
}

terraform {
  backend "s3" {
    bucket = "terraformer-remote-states-use1"
    key    = "apps/magine/dev.tfstate"
    region = "us-east-1"
  }
}

module "magine" {
  source = "../../modules/magine"

  description   = "An image service for managing crops and optimizing sizes"
  region        = "us-east-1"
  environment   = "dev"
  assets_bucket = "maisonette-dev"
  memory_size   = 1280
  timeout       = 300
}
