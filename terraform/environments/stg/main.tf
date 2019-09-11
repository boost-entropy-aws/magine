provider "aws" {
  region = "us-west-2"
}

terraform {
  backend "s3" {
    bucket = "terraformer-remote-states-usw2"
    key    = "apps/magine/stg.tfstate"
    region = "us-west-2"
  }
}

module "magine" {
  source = "../../modules/magine"

  description   = "An image service for managing crops and optimizing sizes"
  region        = "us-west-2"
  environment   = "stg"
  assets_bucket = "maisonette-stg"
  memory_size   = 1280
  timeout       = 300
}
