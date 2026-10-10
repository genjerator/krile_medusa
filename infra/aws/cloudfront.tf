# CloudFront — OFF by default (var.enable_cloudfront = false).
# Your image URLs point straight at S3, so the CDN is unused. Kept here so a
# future "put a CDN back in front of the bucket" is a one-line flag flip.

resource "aws_cloudfront_origin_access_control" "media" {
  count                             = var.enable_cloudfront ? 1 : 0
  name                              = "${var.project}-s3-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "media" {
  count               = var.enable_cloudfront ? 1 : 0
  enabled             = true
  comment             = "${var.project} media"
  default_root_object = ""

  origin {
    domain_name              = aws_s3_bucket.media.bucket_regional_domain_name
    origin_id                = "s3-media"
    origin_access_control_id = aws_cloudfront_origin_access_control.media[0].id
  }

  default_cache_behavior {
    target_origin_id       = "s3-media"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  price_class = "PriceClass_100" # EU + North America
  tags        = var.common_tags
}
