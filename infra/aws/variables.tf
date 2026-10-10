# All the knobs. Real/known values are defaulted from docs/AWS_FULL_SETUP.md.
# Anything marked TODO must be supplied (see terraform.tfvars.example) — those
# are values Terraform can't know from the docs alone.

variable "region" {
  type    = string
  default = "eu-central-1"
}

variable "project" {
  type    = string
  default = "krile-medusa"
}

variable "common_tags" {
  type = map(string)
  default = {
    Project   = "krile-medusa"
    ManagedBy = "opentofu"
    Note      = "AWS move-back blueprint (ElastiCache intentionally omitted; Redis runs as a container on Strato)"
  }
}

# ── S3 (the bucket you are KEEPING) ─────────────────────────────────────────
# Bucket names are globally unique. This bucket already exists, so on a real
# re-adoption you IMPORT it (see README) rather than recreate it.
variable "s3_bucket_name" {
  type    = string
  default = "krile-medusa-313003894447-eu-central-1-an"
}

variable "s3_public_prefixes" {
  description = "Object key prefixes served publicly over direct S3 URLs."
  type        = list(string)
  default     = ["planeta_admin/*", "videos/*"]
}

variable "s3_enable_versioning" {
  description = "Recommended ON for the bucket that also holds your DB dump backups."
  type        = bool
  default     = true
}

# ── RDS PostgreSQL ──────────────────────────────────────────────────────────
variable "rds_identifier" {
  type    = string
  default = "krile-medusa"
}

variable "rds_db_name" {
  type    = string
  default = "krile_medusa"
}

variable "rds_username" {
  type    = string
  default = "krilepostgres"
}

variable "rds_password" {
  description = "TODO: master password (sensitive). Do NOT commit. Pass via TF_VAR_rds_password or tfvars."
  type        = string
  sensitive   = true
  default     = ""
}

variable "rds_engine_version" {
  type    = string
  default = "18.3"
}

variable "rds_instance_class" {
  description = "TODO: confirm the class you were on (blueprint default is a small ARM class)."
  type        = string
  default     = "db.t4g.micro"
}

variable "rds_allocated_storage" {
  description = "TODO: confirm GiB you were using."
  type        = number
  default     = 20
}

# ── EC2 ─────────────────────────────────────────────────────────────────────
variable "ec2_instance_type" {
  type    = string
  default = "t4g.small" # ARM, per docs
}

variable "ec2_key_name" {
  description = "TODO: EC2 key pair name (docs reference krile-medusa-kp.pem)."
  type        = string
  default     = "krile-medusa-kp"
}

# ── CloudFront ──────────────────────────────────────────────────────────────
# OFF by default: your image URLs point straight at S3, so CloudFront is unused.
# Flip to true only if you want the CDN back in front of the bucket.
variable "enable_cloudfront" {
  type    = bool
  default = false
}
