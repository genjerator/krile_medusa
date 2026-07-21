# Strato VPS Setup Guide

## Architecture

```
Internet
    │
    ▼
Strato VPS (single server)
    │
   Caddy :80/:443  (automatic HTTPS — Let's Encrypt, auto-renew)
    ├── admin.alcoccodrillo.de        → medusa:9000                       (Medusa admin/backend)
    ├── industries.alcoccodrillo.de   → storefront-planeta-industries:3000 (krile_medusa-storefront)
    └── planeta.alcoccodrillo.de      → storefront-planeta:3000            (planetagmbh_medusa-storefront)

Internal Docker network only:
    ├── postgres:5432
    └── redis:6379

AWS (kept):
    ├── RDS PostgreSQL  (use during migration, then switch to local postgres)
    └── S3 + CloudFront (product images, videos)
```

## TODO Before Starting

Replace these placeholders in the files listed:

| Placeholder | Replace with | Files |
|---|---|---|
| `STOREFRONT_PLANETA_DOMAIN` | Actual planeta domain | `Caddyfile`, `.env.strato` |
| `YOUR_EMAIL` | Your email for Let's Encrypt | `Caddyfile` |
| `CHANGE_ME` | Real secrets/passwords | `.env.strato` |
| `planeta-storefront` | Actual GHCR image name (`ghcr.io/genjerator/planeta-gmbh-storefront`) | `.env.strato` |

---

## Step 1 — Server Requirements

Minimum specs for Strato VPS:
- **RAM:** 4 GB (Medusa alone needs ~512MB, Next.js ~256MB each)
- **CPU:** 2 vCores
- **Disk:** 20 GB
- **OS:** Ubuntu 22.04 or Debian 12

---

## Step 2 — Install Docker on the VPS

SSH into the Strato VPS and run:

```bash
curl -fsSL https://get.docker.com | sh && sudo usermod -aG docker $USER && newgrp docker
```

Verify:
```bash
docker --version && docker compose version
```

---

## Step 3 — Clone the Repo

```bash
git clone git@github.com:genjerator/krile_medusa.git /home/user/app && cd /home/user/app
```

---

## Step 4 — Configure Environment

```bash
cp .env.strato.template .env.strato
nano .env.strato
```

Fill in all `CHANGE_ME` values. Key decisions:

**Database — migration phase (use RDS):**
```
DATABASE_URL=postgres://krilepostgres:PASSWORD@krile-medusa.c9akcukmi9sx.eu-central-1.rds.amazonaws.com:5432/krile_medusa?uselibpqcompat=true&sslmode=require
```

**Database — after migration (use local postgres):**
```
DATABASE_URL=postgres://medusa:YOUR_PASSWORD@postgres:5432/medusa
```

---

## Step 5 — Configure GHCR Access

The Docker images live in GitHub Container Registry (`ghcr.io/genjerator/…`).
Create a Personal Access Token with the `read:packages` scope, then log in once
on the VPS (no expiry cron needed — unlike ECR's 12-hour token):

```bash
echo "YOUR_GHCR_PAT" | docker login ghcr.io -u genjerator --password-stdin
```

Make sure the three packages (`krile-medusa`, `krile-storefront`,
`planeta-gmbh-storefront`) are set to **private** in GitHub → Packages.

---

## Step 6 — Update Caddy Config

Set your real domains and Let's Encrypt email in the `Caddyfile` (the proxy
routes by hostname to `medusa:9000` and the two storefront services):
```bash
nano Caddyfile   # replace YOUR_EMAIL and the planeta-gmbh.de domains if different
```

---

## Step 7 — Point DNS to Strato VPS

In your DNS provider, update A records **before** running SSL setup:

| Record | Type | Value |
|---|---|---|
| `admin.alcoccodrillo.de` | A | `STRATO_VPS_IP` |
| `industries.alcoccodrillo.de` | A | `STRATO_VPS_IP` |
| `planeta.alcoccodrillo.de` | A | `STRATO_VPS_IP` |

Wait for DNS propagation (5–30 min) before proceeding.

---

## Step 8 — SSL Certificates (automatic)

No script needed — **Caddy obtains and renews Let's Encrypt certs automatically**
the first time it sees traffic for each hostname. Just start the stack (Step 9)
with DNS already pointing at the VPS (Step 7) and ports 80/443 open.

```bash
docker compose -f docker-compose.strato.yml up -d
docker compose -f docker-compose.strato.yml logs -f caddy   # watch certs get issued
```

If a domain's cert fails to issue, it's almost always DNS not yet pointing at the
VPS, or port 80/443 blocked — fix that and Caddy retries on its own.

---

## Step 9 — Verify Everything

```bash
# Check all containers running
docker compose -f docker-compose.strato.yml ps

# Check the proxy is serving HTTPS (Caddy)
curl -I https://admin.planetaindustries.de/health

# Check Medusa
curl https://admin.planetaindustries.de/health

# Follow logs
docker compose -f docker-compose.strato.yml logs -f medusa
docker compose -f docker-compose.strato.yml logs -f caddy
```

---

## Database Migration (RDS → Local Postgres)

When ready to stop using RDS:

**1. Dump from RDS:**
```bash
pg_dump "postgres://krilepostgres:PASSWORD@krile-medusa.c9akcukmi9sx.eu-central-1.rds.amazonaws.com:5432/krile_medusa?sslmode=require" > dump.sql
```

**2. Restore into local postgres container:**
```bash
docker compose -f docker-compose.strato.yml exec -T postgres psql -U medusa -d medusa < dump.sql
```

**3. Switch DATABASE_URL in .env.strato:**
```bash
# Change to:
DATABASE_URL=postgres://medusa:YOUR_PASSWORD@postgres:5432/medusa
```

**4. Restart Medusa:**
```bash
docker compose -f docker-compose.strato.yml restart medusa
```

**5. Verify, then delete RDS in AWS console.**

---

## Deployment (CI/CD)

Automated via `.github/workflows/deploy-strato.yml` (build `linux/amd64` → push to
GHCR → SSH to the VPS → `compose pull` + `up -d --no-deps medusa`). It's
`workflow_dispatch` for now; flip it to `push: main` once AWS is retired.

Required GitHub repo **secrets**: `STRATO_HOST`, `STRATO_USER`, `STRATO_SSH_KEY`,
`ENV_STRATO` (full contents of `.env.strato`), `GHCR_PAT` (token with
`read:packages` for the VPS pull). Pushing uses the built-in `GITHUB_TOKEN`.

Equivalent manual deploy on the VPS:

```bash
cd ~/app
git pull
echo "YOUR_GHCR_PAT" | docker login ghcr.io -u genjerator --password-stdin
docker compose -f docker-compose.strato.yml pull
docker compose -f docker-compose.strato.yml up -d --no-deps medusa
```

Replace `medusa` with the storefront service name for storefront deploys (those
images are built and pushed from their own repos).

---

## Useful Commands

```bash
# Start all services
docker compose -f docker-compose.strato.yml up -d

# Restart single service
docker compose -f docker-compose.strato.yml restart medusa

# View logs
docker compose -f docker-compose.strato.yml logs -f medusa
docker compose -f docker-compose.strato.yml logs -f caddy

# Stop everything
docker compose -f docker-compose.strato.yml down

# Pull latest images
docker compose -f docker-compose.strato.yml pull

# Caddy reload (after editing the Caddyfile — zero-downtime)
docker compose -f docker-compose.strato.yml exec caddy caddy reload --config /etc/caddy/Caddyfile

# Postgres shell
docker compose -f docker-compose.strato.yml exec postgres psql -U medusa -d medusa
```

---

## AWS Services to Delete After Migration

Once everything runs stable on Strato for 1+ week:

1. **ALB** `krileMedusaALB` → saves ~$32/month + releases 4 Elastic IPs
2. **EC2** `krile-medusa-2` → saves ~$13/month
3. **EC2** `krileMedusaStorefrontX` → saves ~$13/month
4. **EC2** `planetaGmbhStorefront` → saves ~$13/month
5. **ElastiCache** Redis cluster → saves ~$13/month
6. **RDS** (after successful local postgres migration) → saves ~$19/month

7. **ECR** repos `krile-medusa`, `krile-storefront`, `planeta-gmbh-storefront` → images now live in GHCR; delete after the first successful GHCR deploy.

**Keep:** S3 (+ CloudFront if still fronting images). RDS only if you chose not to migrate to local Postgres.

**Estimated AWS cost after migration: ~$5–8/month** (S3 + CloudFront only)
