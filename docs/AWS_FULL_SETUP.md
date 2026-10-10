# AWS Full Setup Guide — Krile Medusa

## Infrastructure Overview

| Service | Details |
|---|---|
| **Backend EC2** | `18.196.77.51` — t4g.small ARM, runs Medusa via Docker |
| **Storefront EC2** | `18.184.127.175` — runs Next.js storefront via Docker |
| **RDS** | PostgreSQL 18.3, `krile-medusa.c9akcukmi9sx.eu-central-1.rds.amazonaws.com` |
| **ElastiCache** | Redis, `krile-medusa-0001-001.krile-medusa.7fivpe.euc1.cache.amazonaws.com` |
| **ECR (backend)** | `313003894447.dkr.ecr.eu-central-1.amazonaws.com/krile-medusa` |
| **ECR (storefront)** | `313003894447.dkr.ecr.eu-central-1.amazonaws.com/krile-storefront` |
| **S3 Bucket** | `krile-medusa-313003894447-eu-central-1-an` |
| **CloudFront** | `dpc56b2hptc18.cloudfront.net` (distribution `ECVOTE548YRS8`) |
| **Region** | `eu-central-1` (Frankfurt) |
| **Security Group** | `sg-0be44b1b5e7670616` (backend + RDS + Redis) |
| **IAM Role** | `krile-medusa-ec2-role` → `krile-medusa-ec2-profile` (both EC2s) |

---

## 1. S3 File Uploads

### Medusa Config (`medusa-config.ts`)
S3 provider configured with `planeta_admin/` prefix:
```ts
{
  resolve: "@medusajs/file-s3",
  id: "s3",
  options: {
    file_url: process.env.S3_FILE_URL,
    access_key_id: process.env.S3_ACCESS_KEY_ID,
    secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
    region: process.env.S3_REGION,
    bucket: process.env.S3_BUCKET,
    prefix: "planeta_admin/",
  },
}
```

### S3 Bucket Policy
```json
{
  "Version": "2012-10-17",
  "Id": "PolicyForCloudFrontPrivateContent",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": { "Service": "cloudfront.amazonaws.com" },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::krile-medusa-313003894447-eu-central-1-an/*",
      "Condition": {
        "ArnLike": {
          "AWS:SourceArn": "arn:aws:cloudfront::313003894447:distribution/ECVOTE548YRS8"
        }
      }
    },
    {
      "Sid": "PublicReadMediaFolders",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": [
        "arn:aws:s3:::krile-medusa-313003894447-eu-central-1-an/planeta_admin/*",
        "arn:aws:s3:::krile-medusa-313003894447-eu-central-1-an/videos/*"
      ]
    }
  ]
}
```

### S3 Block Public Access Settings
- BlockPublicAcls: OFF
- IgnorePublicAcls: OFF
- BlockPublicPolicy: OFF
- RestrictPublicBuckets: OFF

### IAM Policy for S3 Uploads (attached to `krileMedusaS3User`)
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
    "Resource": "arn:aws:s3:::krile-medusa-313003894447-eu-central-1-an/planeta_admin/*"
  }]
}
```

---

## 2. Security Group Rules (`sg-0be44b1b5e7670616`)

| Port | Source | Purpose |
|---|---|---|
| 22 | 0.0.0.0/0 | SSH |
| 80 | 0.0.0.0/0 | HTTP |
| 443 | 0.0.0.0/0 | HTTPS |
| 9000 | 0.0.0.0/0 | Medusa API |
| 5432 | sg-0be44b1b5e7670616 | RDS PostgreSQL (internal) |
| 6379 | sg-0be44b1b5e7670616 | ElastiCache Redis (internal) |

### Whitelist Your IP
```bash
# PostgreSQL
MY_IP=$(curl -s https://checkip.amazonaws.com) && aws ec2 authorize-security-group-ingress --group-id sg-0be44b1b5e7670616 --protocol tcp --port 5432 --cidr "${MY_IP}/32" && echo "Added $MY_IP"

# Redis
MY_IP=$(curl -s https://checkip.amazonaws.com) && aws ec2 authorize-security-group-ingress --group-id sg-0be44b1b5e7670616 --protocol tcp --port 6379 --cidr "${MY_IP}/32" && echo "Added $MY_IP"

# SSH
MY_IP=$(curl -s https://checkip.amazonaws.com) && aws ec2 authorize-security-group-ingress --group-id sg-0be44b1b5e7670616 --protocol tcp --port 22 --cidr "${MY_IP}/32" && echo "Added $MY_IP"
```

---

## 3. RDS PostgreSQL

- **Endpoint:** `krile-medusa.c9akcukmi9sx.eu-central-1.rds.amazonaws.com`
- **Database:** `krile_medusa`
- **User:** `krilepostgres`
- **SSL:** required (`uselibpqcompat=true&sslmode=require`)

### Connection URL
```
postgres://krilepostgres:PASSWORD@krile-medusa.c9akcukmi9sx.eu-central-1.rds.amazonaws.com:5432/krile_medusa?uselibpqcompat=true&sslmode=require
```

### Connect via DataGrip
1. Download cert: `curl -o ~/Downloads/global-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem`
2. Host: `krile-medusa.c9akcukmi9sx.eu-central-1.rds.amazonaws.com`, Port: `5432`
3. SSL mode: `verify-full`, CA file: `global-bundle.pem`

### Connect via psql
```bash
psql "host=krile-medusa.c9akcukmi9sx.eu-central-1.rds.amazonaws.com port=5432 dbname=krile_medusa user=krilepostgres password=PASSWORD sslmode=verify-full sslrootcert=$HOME/Downloads/global-bundle.pem"
```

---

## 4. IAM Role Setup (ECR Pull)

Both EC2 instances have `krile-medusa-ec2-profile` attached which allows ECR pull without credentials.

```bash
# Create role
aws iam create-role --role-name krile-medusa-ec2-role --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ec2.amazonaws.com"},"Action":"sts:AssumeRole"}]}'

# Attach ECR policy
aws iam attach-role-policy --role-name krile-medusa-ec2-role --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly

# Create instance profile
aws iam create-instance-profile --instance-profile-name krile-medusa-ec2-profile
aws iam add-role-to-instance-profile --instance-profile-name krile-medusa-ec2-profile --role-name krile-medusa-ec2-role

# Attach to EC2
aws ec2 associate-iam-instance-profile --instance-id INSTANCE_ID --iam-instance-profile Name=krile-medusa-ec2-profile
```

---

## 5. Backend EC2 Deployment (18.196.77.51)

### Install Docker
```bash
sudo dnf update -y && sudo dnf install -y docker git && sudo systemctl enable docker && sudo systemctl start docker && sudo mkdir -p /usr/local/lib/docker/cli-plugins && sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-aarch64 -o /usr/bin/docker-compose && sudo chmod +x /usr/bin/docker-compose && sudo usermod -aG docker ec2-user
```

### Clone Repo
```bash
git clone https://github.com/genjerator/krile_medusa.git /home/ec2-user/app
```

### Copy `.env.aws`
```bash
scp -i ~/Downloads/krile-medusa-kp.pem .env.aws ec2-user@18.196.77.51:/home/ec2-user/app/.env.aws
```

### Start Container
```bash
cd /home/ec2-user/app && docker-compose -f docker-compose.aws.yml up -d
```

### Run Migrations
```bash
docker exec app-medusa-1 pnpm medusa db:migrate
```

### Create Admin User
```bash
docker exec app-medusa-1 sh -c 'pnpm add ts-node && pnpm medusa user --email EMAIL --password PASSWORD'
```

### Useful Commands
```bash
# Logs (no Redis noise)
docker logs app-medusa-1 -f 2>&1 | grep -iv redis

# Check health
curl http://localhost:9000/health

# Restart
docker-compose -f docker-compose.aws.yml up -d
```

---

## 6. Storefront EC2 Deployment (18.184.127.175)

### Security Group
- `sg-0978d21f06c7ddfa3`
- Port 22 and 8000 open to `0.0.0.0/0`

### Install Docker
```bash
sudo dnf update -y && sudo dnf install -y docker git && sudo systemctl enable docker && sudo systemctl start docker && sudo usermod -aG docker ec2-user
```

### CI/CD Flow
1. GitHub Actions builds `linux/arm64` image
2. Pushes to ECR `krile-storefront`
3. SSH deploys to `18.184.127.175`
4. Runs on port `8000`

### GitHub Secrets Required
| Secret | Value |
|---|---|
| `AWS_ACCESS_KEY_ID` | IAM access key |
| `AWS_SECRET_ACCESS_KEY` | IAM secret key |
| `EC2_SSH_KEY` | Contents of `~/Downloads/krile-medusa-kp.pem` |
| `STOREFRONT_EC2_HOST` | `18.184.127.175` |
| `MEDUSA_BACKEND_URL` | `http://18.196.77.51:9000` |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | `pk_e5c9c2aafadc09e9ee2ca38315dd4f655070b59e71c31bb7659b9e5a31609bd2` |
| `NEXT_PUBLIC_BASE_URL` | `http://18.184.127.175:8000` |
| `NEXT_PUBLIC_DEFAULT_REGION` | `eu` |

---

## 7. GitHub Actions (Backend)

Secrets required in `krile_medusa` repo:

| Secret | Value |
|---|---|
| `AWS_ACCESS_KEY_ID` | IAM access key |
| `AWS_SECRET_ACCESS_KEY` | IAM secret key |
| `EC2_HOST` | `18.196.77.51` |
| `EC2_SSH_KEY` | Contents of `~/Downloads/krile-medusa-kp.pem` |
| `ENV_AWS` | Full contents of `.env.aws` |

---

## 8. Environment Variables (`.env.aws`)

```env
COOKIE_SECURE=false
STORE_CORS=http://18.196.77.51:9000
ADMIN_CORS=http://18.196.77.51:9000
AUTH_CORS=http://18.196.77.51:9000
JWT_SECRET=...
COOKIE_SECRET=...

DATABASE_URL=postgres://krilepostgres:PASSWORD@krile-medusa.c9akcukmi9sx.eu-central-1.rds.amazonaws.com:5432/krile_medusa?uselibpqcompat=true&sslmode=require

# REDIS_URL=redis://krile-medusa-0001-001.krile-medusa.7fivpe.euc1.cache.amazonaws.com:6379

S3_FILE_URL=https://dpc56b2hptc18.cloudfront.net
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_REGION=eu-central-1
S3_BUCKET=krile-medusa-313003894447-eu-central-1-an
```

> **Note:** `COOKIE_SECURE=false` is required because the server runs on HTTP. Once HTTPS is set up via ALB + ACM, set it back to `true` and re-enable `NODE_ENV=production`.
