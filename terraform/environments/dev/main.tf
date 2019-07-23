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

  region      = "us-east-1"
  environment = "dev"
}

