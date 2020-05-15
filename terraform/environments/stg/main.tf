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

  region        = "us-west-2"
  environment   = "stg"
  assets_bucket = "maisonette-stg"
  cms_bucket    = "maisonette-cms-stg"
  memory_size   = 1280
  timeout       = 300
}
