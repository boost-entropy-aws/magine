provider "aws" {
  region = "us-west-2"
}

terraform {
  backend "s3" {
    bucket = "terraformer-remote-states-usw2"
    key    = "apps/magine/dev.tfstate"
    region = "us-west-2"
  }
}

module "magine" {
  source = "../../modules/magine"

  region        = "us-west-2"
  environment   = "dev"
  assets_bucket = "maisonette-dev"
  memory_size   = 1280
  timeout       = 300
}
