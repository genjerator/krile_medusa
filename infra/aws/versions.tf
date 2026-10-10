# Provider + backend config.
# Works with both OpenTofu (`tofu`) and Terraform (`terraform`) — same HCL.
#
# State: kept local by default (terraform.tfstate). For a shared/durable state,
# uncomment the S3 backend below and point it at the bucket you are keeping.

terraform {
  required_version = ">= 1.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
  }

  # ── Optional remote state in the S3 bucket you're keeping ──────────────────
  # backend "s3" {
  #   bucket = "krile-medusa-313003894447-eu-central-1-an"
  #   key    = "infra/terraform.tfstate"
  #   region = "eu-central-1"
  # }
}

provider "aws" {
  region = var.region
}

# CloudFront-related resources (ACM certs, some metrics) live in us-east-1.
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}
