# S3 media bucket (the one you're keeping). Also a good home for DB dump
# backups under a db-backups/ prefix (see README) with a lifecycle to Glacier.
#
# Existing bucket -> IMPORT rather than recreate (bucket names are global).

resource "aws_s3_bucket" "media" {
  bucket = var.s3_bucket_name
  tags   = var.common_tags
}

# Public-read is required: image URLs point straight at S3, so the objects must
# be publicly gettable. Do NOT flip these on unless you also front with CloudFront.
resource "aws_s3_bucket_public_access_block" "media" {
  bucket                  = aws_s3_bucket.media.id
  block_public_acls       = false
  ignore_public_acls      = false
  block_public_policy     = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_versioning" "media" {
  bucket = aws_s3_bucket.media.id
  versioning_configuration {
    status = var.s3_enable_versioning ? "Enabled" : "Suspended"
  }
}

# Recommended: age DB dumps out to cheap cold storage. Only touches the
# db-backups/ prefix so it never affects live media.
resource "aws_s3_bucket_lifecycle_configuration" "backups" {
  bucket = aws_s3_bucket.media.id
  rule {
    id     = "db-backups-to-glacier"
    status = "Enabled"
    filter { prefix = "db-backups/" }
    transition {
      days          = 30
      storage_class = "DEEP_ARCHIVE"
    }
    expiration { days = 365 }
  }
}

# Bucket policy: public read on the media prefixes, plus (optionally) the
# CloudFront OAC principal when the CDN is enabled.
data "aws_iam_policy_document" "media" {
  statement {
    sid       = "PublicReadMediaFolders"
    effect    = "Allow"
    actions   = ["s3:GetObject"]
    resources = [for p in var.s3_public_prefixes : "${aws_s3_bucket.media.arn}/${p}"]
    principals {
      type        = "*"
      identifiers = ["*"]
    }
  }

  dynamic "statement" {
    for_each = var.enable_cloudfront ? [1] : []
    content {
      sid       = "AllowCloudFrontServicePrincipal"
      effect    = "Allow"
      actions   = ["s3:GetObject"]
      resources = ["${aws_s3_bucket.media.arn}/*"]
      principals {
        type        = "Service"
        identifiers = ["cloudfront.amazonaws.com"]
      }
      condition {
        test     = "StringEquals"
        variable = "AWS:SourceArn"
        values   = [aws_cloudfront_distribution.media[0].arn]
      }
    }
  }
}

resource "aws_s3_bucket_policy" "media" {
  bucket = aws_s3_bucket.media.id
  policy = data.aws_iam_policy_document.media.json
  depends_on = [aws_s3_bucket_public_access_block.media]
}
