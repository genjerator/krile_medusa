output "backend_public_ip" {
  value = aws_instance.backend.public_ip
}

output "storefront_public_ip" {
  value = aws_instance.storefront.public_ip
}

output "rds_endpoint" {
  value = aws_db_instance.main.address
}

output "rds_connection_url_template" {
  description = "Fill in the password; matches the app's expected DSN."
  value       = "postgres://${var.rds_username}:PASSWORD@${aws_db_instance.main.address}:5432/${var.rds_db_name}?uselibpqcompat=true&sslmode=require"
}

output "s3_bucket" {
  value = aws_s3_bucket.media.bucket
}

output "ecr_repository_urls" {
  value = { for k, r in aws_ecr_repository.repos : k => r.repository_url }
}

output "cloudfront_domain" {
  value       = var.enable_cloudfront ? aws_cloudfront_distribution.media[0].domain_name : null
  description = "null when CloudFront is disabled (the default)."
}
