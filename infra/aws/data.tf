# Use the account's default VPC + subnets (the original setup didn't use a
# custom VPC). Swap these for explicit IDs if you provision a dedicated VPC.

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# Latest Amazon Linux 2023 for ARM64 (Graviton) — matches the aarch64 Docker
# setup in the docs. Pinned by owner (Amazon) + name pattern, not a hardcoded id.
data "aws_ami" "al2023_arm64" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-arm64"]
  }
  filter {
    name   = "architecture"
    values = ["arm64"]
  }
}

data "aws_caller_identity" "current" {}
