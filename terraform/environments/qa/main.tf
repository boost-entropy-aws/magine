provider "aws" {
  region = "us-west-2"
}

terraform {
  backend "s3" {
    bucket = "terraformer-remote-states-usw2"
    key    = "apps/magine/qa.tfstate"
    region = "us-west-2"
  }
}

module "magine" {
  source = "../../modules/magine"

  region        = "us-west-2"
  environment   = "qa"
  assets_bucket = "maisonette-qa"
  memory_size   = 1280
  timeout       = 300
  runtime       = "nodejs10.x"
}
