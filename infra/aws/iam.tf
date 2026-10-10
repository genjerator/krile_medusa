# IAM: EC2 instance role (ECR pull) + the S3 upload user Medusa uses.

# ── EC2 role + instance profile (ECR read-only pull) ────────────────────────
resource "aws_iam_role" "ec2" {
  name = "${var.project}-ec2-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
  tags = var.common_tags
}

resource "aws_iam_role_policy_attachment" "ec2_ecr_read" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_instance_profile" "ec2" {
  name = "${var.project}-ec2-profile"
  role = aws_iam_role.ec2.name
}

# ── S3 upload user (KEEP THIS — Medusa on Strato uses its keys to upload) ────
# The user was `krileMedusaS3User` with PutObject/GetObject/DeleteObject on the
# public media prefix. On a real re-adoption, IMPORT the existing user so its
# access keys keep working (see README). Creating fresh keys means updating the
# S3_* secrets on the app host.
resource "aws_iam_user" "s3_uploader" {
  name = "krileMedusaS3User"
  tags = var.common_tags
}

resource "aws_iam_user_policy" "s3_uploader" {
  name = "s3-uploads"
  user = aws_iam_user.s3_uploader.name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"]
      Resource = "arn:aws:s3:::${var.s3_bucket_name}/planeta_admin/*"
    }]
  })
}

# Access keys are commented out on purpose: importing the existing user keeps
# its current keys. Uncomment ONLY if you deliberately want Terraform to mint a
# new key pair (then read them from the sensitive outputs and update .env).
# resource "aws_iam_access_key" "s3_uploader" {
#   user = aws_iam_user.s3_uploader.name
# }
