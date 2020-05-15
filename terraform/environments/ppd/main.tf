provider "aws" {
  region = "us-east-1"
}

terraform {
  backend "s3" {
    bucket = "terraformer-remote-states-use1"
    key    = "apps/magine/ppd.tfstate"
    region = "us-east-1"
  }
}

module "magine" {
  source = "../../modules/magine"

  region        = "us-east-1"
  environment   = "ppd"
  assets_bucket = "maisonette-ppd"
  cms_bucket    = "maisonette-cms-ppd"
  memory_size   = 1280
  timeout       = 300
}
