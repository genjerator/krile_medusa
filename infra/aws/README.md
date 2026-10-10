# AWS "move-back" blueprint (OpenTofu / Terraform)

Infrastructure-as-code for the AWS side of Krile Medusa, so that if you ever
move back from Strato to AWS it's a repeatable `apply` instead of a manual
console rebuild. Authored from `docs/AWS_FULL_SETUP.md`.

**ElastiCache is intentionally NOT here.** Redis now runs as a Docker container
(`redis:7-alpine` in `docker-compose.strato.yml`), so there's no managed cache
to recreate. On AWS the same container approach works on the EC2 host.

## What this manages
- **VPC/subnets** — uses the account default (no custom VPC in the original setup)
- **Security groups** — backend (22/80/443/9000 public, 5432 internal) + storefront (22/8000)
- **RDS PostgreSQL 18**
- **EC2 ×2** — backend + storefront, ARM/Graviton, ECR pull via instance profile
- **IAM** — EC2 role/instance-profile + the `krileMedusaS3User` S3 upload user
- **S3** — the media bucket, public-read prefixes, versioning, and a
  `db-backups/` → Glacier lifecycle rule
- **ECR** — `krile-medusa` + `krile-storefront` repos
- **CloudFront** — present but **disabled** (`enable_cloudfront = false`)

## What this does NOT manage (by design)
- **Your data.** Terraform recreates the *shape* of RDS and S3, never their
  contents. The database comes from a dump restore; the media already lives in
  S3 (and stays there). Keep those flows separate.
- **Secrets.** `rds_password` and the IAM access keys are supplied out-of-band.

## Usage

```bash
cd infra/aws
cp terraform.tfvars.example terraform.tfvars   # fill in TODOs
tofu init        # or: terraform init
tofu plan
tofu apply
```

### Two modes

**A. Preserve as a blueprint (recommended now).** Keep these files in the repo
as living documentation. You are *not* required to `apply` them while AWS is a
cold standby.

**B. Re-adopt the LIVE resources (import, don't recreate).** The bucket, IAM
user, and (if still up) other resources already exist. Bucket names and IAM user
names are unique, so you must **import** rather than recreate to avoid conflicts
and to keep the S3 user's existing access keys working:

```bash
tofu import aws_s3_bucket.media krile-medusa-313003894447-eu-central-1-an
tofu import aws_iam_user.s3_uploader krileMedusaS3User
tofu import aws_iam_role.ec2 krile-medusa-ec2-role
# ...then `tofu plan` and reconcile any drift before applying.
```

## TODO / confirm before a real apply
- `rds_instance_class`, `rds_allocated_storage`, `rds_engine_version` — set to
  what you actually ran (blueprint defaults are conservative).
- `ec2_key_name` — an EC2 key pair that exists in `eu-central-1`.
- Host bootstrap (Docker, 2 GiB swap, compose) still follows
  `docs/EC2_SETUP.md`, or move it into `user_data` for a hands-off rebuild.
