provider "aws" {
  region = "us-east-1"
}

terraform {
  required_version = ">= 0.11.10"

  backend "s3" {
    bucket = "terraformer-remote-states-use1"
    key    = "apps/magine/dev.tfstate"
    region = "us-east-1"
  }
}

variable "region" {
  default = "us-east-1"
}

variable "service" {
  default = "magine"
}

variable "environment" {
  default = "dev"
}

data "aws_s3_bucket_object" "magine" {
  bucket = "magine-test"
  key    = "magine.zip"
}

resource "aws_iam_role" "lambda" {
  name = "${var.service}-${var.environment}-lambda-role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_iam_policy" "sns" {
  name = "${var.service}-${var.environment}-sns-policy"

  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "sns:Publish",
            "Resource": "${aws_sns_topic.magine.arn}"
        }
    ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "sns" {
  role       = "${aws_iam_role.lambda.name}"
  policy_arn = "${aws_iam_policy.sns.arn}"
}

resource "aws_iam_policy" "cloudwatch" {
  name = "${var.service}-${var.environment}-cloudwatch-policy"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogStreams"
    ],
      "Resource": [
        "arn:aws:logs:*:*:*"
    ]
  }
 ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "cloudwatch" {
  role       = "${aws_iam_role.lambda.name}"
  policy_arn = "${aws_iam_policy.cloudwatch.arn}"
}

resource "aws_iam_policy" "s3" {
  name = "${var.service}-${var.environment}-s3-policy"

  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "ListObjectsInBucket",
            "Effect": "Allow",
            "Action": "s3:ListBucket",
            "Resource": ["${aws_s3_bucket.magine.arn}"]
        },
        {
            "Sid": "AllObjectActions",
            "Effect": "Allow",
            "Action": "s3:*Object",
            "Resource": ["${aws_s3_bucket.magine.arn}/*"]
        }
    ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "s3" {
  role       = "${aws_iam_role.lambda.name}"
  policy_arn = "${aws_iam_policy.s3.arn}"
}

resource "aws_lambda_function" "magine" {
  s3_bucket     = "magine-test"
  s3_key        = "${data.aws_s3_bucket_object.magine.key}"
  function_name = "${var.service}-${var.environment}"
  role          = "${aws_iam_role.lambda.arn}"
  handler       = "lambda/main.route"
  runtime       = "nodejs8.10"
  timeout       = 300

  environment {
    variables = {
      BUCKET    = "${aws_s3_bucket.magine.id}"
      REGION    = "${var.region}"
      TOPIC_ARN = "${aws_sns_topic.magine.arn}"
    }
  }

  tags {
    Name        = "${var.service}-${var.environment}"
    Environment = "${var.environment}"
  }
}

resource "aws_lambda_permission" "allow_bucket" {
  statement_id  = "AllowExecutionFromS3Bucket"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.magine.arn}"
  principal     = "s3.amazonaws.com"
  source_arn    = "${aws_s3_bucket.magine.arn}"
}

resource "aws_s3_bucket" "magine" {
  bucket = "${var.service}-${var.environment}"
  acl    = "private"

  tags {
    Name        = "${var.service}-${var.environment}"
    Environment = "${var.environment}"
  }
}

resource "aws_s3_bucket_notification" "notification_1" {
  bucket = "${aws_s3_bucket.magine.id}"

  lambda_function {
    lambda_function_arn = "${aws_lambda_function.magine.arn}"
    events              = ["s3:ObjectCreated:*"]
    filter_prefix       = "media/original"
  }

  lambda_function {
    lambda_function_arn = "${aws_lambda_function.magine.arn}"
    events              = ["s3:ObjectCreated:*"]
    filter_prefix       = "media/cmsimage/original"
  }

  lambda_function {
    lambda_function_arn = "${aws_lambda_function.magine.arn}"
    events              = ["s3:ObjectCreated:*"]
    filter_prefix       = "media/taxons/original"
  }

  lambda_function {
    lambda_function_arn = "${aws_lambda_function.magine.arn}"
    events              = ["s3:ObjectCreated:*"]
    filter_prefix       = "media/products/original"
  }
}

resource "random_uuid" "uuid" {}

resource "aws_s3_bucket_object" "image" {
  bucket = "${aws_s3_bucket.magine.id}"
  acl    = "private"
  key    = "media/original/medium/${random_uuid.uuid.result}/sample.jpg"
  source = "sample.jpg"

  depends_on = [
    "aws_lambda_function.magine",
    "aws_s3_bucket.magine",
    "aws_s3_bucket_notification.notification_1",
  ]
}

resource "aws_s3_bucket_object" "json" {
  bucket = "${aws_s3_bucket.magine.id}"
  acl    = "private"
  key    = "media/original/medium/${random_uuid.uuid.result}/sample.json"
  source = "sample.json"

  depends_on = [
    "aws_lambda_function.magine",
    "aws_s3_bucket.magine",
    "aws_s3_bucket_notification.notification_1",
    "aws_sns_topic.magine"
  ]
}

resource "aws_sns_topic" "magine" {
  name = "${var.service}-${var.environment}"

  delivery_policy = <<EOF
{
  "http": {
    "defaultHealthyRetryPolicy": {
      "numRetries": 3,
      "numNoDelayRetries": 0,
      "minDelayTarget": 20,
      "maxDelayTarget": 20,
      "numMinDelayRetries": 0,
      "numMaxDelayRetries": 0,
      "backoffFunction": "linear"
    },
    "disableSubscriptionOverrides": false
  }
}
EOF

  tags {
    Name        = "${var.service}-${var.environment}"
    Environment = "${var.environment}"
  }
}
