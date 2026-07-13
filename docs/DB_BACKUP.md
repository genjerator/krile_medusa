# Database backups (Strato VPS → S3)

Daily `pg_dump` snapshots of the dockerized Postgres on the Strato VPS, kept
locally on the VPS **and** uploaded to S3. Set up on 2026-07-13.

## Overview

```
cron (03:00 daily on the VPS)
  └─ ~/app/scripts/db-backup.sh
       ├─ pg_dump inside the `postgres` container  → ~/db-backups/<db>_<date>.dump
       ├─ prune local dumps older than 14 days
       └─ upload to s3://krile-medusa-313003894447-eu-central-1-an/db_backup/
            (S3 lifecycle rule deletes dumps there after 90 days)
```

- Dump format: **pg_dump custom format** (`-Fc`) — gzip-compressed, restored
  with `pg_restore` (selective restore possible).
- The dump runs *inside* the container over the local socket → no DB password
  needed, works regardless of exposed ports.
- Retention: **14 days on the VPS disk**, **90 days in S3** (bucket lifecycle
  rule `expire-db-dumps-90d`, filtered to the `db_backup/` prefix only — media
  files in the same bucket are never expired).

## The script — `scripts/db-backup.sh`

All configuration lives in `.env.strato` (gitignored); the script has no
secrets and no hardcoded values worth editing:

| Key in `.env.strato` | Meaning | Value |
|---|---|---|
| `POSTGRES_USER` / `POSTGRES_DB` | reused from the app config | `medusa` / `medusa` |
| `BACKUP_S3_BUCKET` | target bucket | `krile-medusa-313003894447-eu-central-1-an` |
| `BACKUP_S3_PREFIX` | "folder" in the bucket | `db_backup` |
| `BACKUP_AWS_REGION` | bucket region | `eu-central-1` |
| `BACKUP_AWS_ACCESS_KEY_ID` / `..._SECRET_ACCESS_KEY` | put-only IAM user (see below) | *(secret — in `.env.strato` only)* |
| `BACKUP_COMPOSE_FILE` | compose file with the `postgres` service | `docker-compose.strato.yml` |
| `BACKUP_LOCAL_DIR` | local dump dir; relative → under `$HOME` | `db-backups` → `~/db-backups` |
| `BACKUP_RETENTION_DAYS` | local prune age | `14` |

The `BACKUP_` prefix is deliberate: `.env.strato` is fed to **every** container
via `env_file`, and plain `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` names
would leak into the Medusa app's AWS credential chain (it uses the same bucket
for media via `S3_FILE_URL`). The script maps `BACKUP_AWS_*` → `AWS_*` only for
the upload call.

Behavior details:

- Writes to `<name>.part` first, renames on success — a dump that dies halfway
  never looks like a valid snapshot. Empty output is treated as failure.
- Uses `docker compose` when available, falls back to legacy `docker-compose`.
- Uses the host `aws` CLI when installed, otherwise the `amazon/aws-cli` Docker
  image — nothing needs to be installed on the VPS.
- If `BACKUP_S3_BUCKET` / key are missing it still makes the local dump and
  prints `NOTE: ... skipped S3 upload` (exit 0).
- Defaults target Strato: repo at `~/app`, `docker-compose.strato.yml`. For an
  ad-hoc run against another stack, override via env vars, e.g.:
  `APP_DIR=$PWD COMPOSE_FILE=docker-compose.yml ENV_FILE=/path/env ./scripts/db-backup.sh`

## VPS installation

```
scp scripts/db-backup.sh .env.strato user@VPS:~/app/
ssh user@VPS "chmod +x ~/app/scripts/db-backup.sh && ~/app/scripts/db-backup.sh"
```

A good run prints two lines: `OK: ... wrote ~/db-backups/medusa_<date>.dump (...)`
and `OK: uploaded s3://.../db_backup/medusa_<date>.dump`.

Then `crontab -e` and add (absolute paths — cron has a minimal environment):

```
0 3 * * * /home/USER/app/scripts/db-backup.sh >> /home/USER/db-backups/backup.log 2>&1
```

Health check: `tail ~/db-backups/backup.log` — every night must append an
`OK: uploaded ...` line; any `ERROR` means the dump or upload failed.

## Restore

Pick a snapshot (from `~/db-backups/` on the VPS, or download from S3 with an
admin-credentialed machine: `aws s3 ls s3://krile-medusa-313003894447-eu-central-1-an/db_backup/`
then `aws s3 cp s3://.../db_backup/<file> .`), then — **this replaces the
current data** — stop the app and restore into the container:

```
docker compose -f docker-compose.strato.yml stop medusa
cat medusa_<date>.dump | docker compose -f docker-compose.strato.yml exec -T postgres pg_restore -U medusa -d medusa --clean --if-exists
docker compose -f docker-compose.strato.yml start medusa
```

To restore into local dev instead, target the local stack:
`cat <file>.dump | docker compose exec -T postgres pg_restore -U postgres -d medusa-v2 --clean --if-exists`

To inspect a dump without restoring: `docker compose exec -T postgres pg_restore --list < <file>.dump`

## AWS resources (already created — for reference/recreation)

The bucket doubles as the **public media bucket** (its policy allows anonymous
`s3:GetObject` on `/*` for storefront images/videos). Dumps are kept private by
an **explicit Deny** that outranks the public Allow:

- **Bucket policy** statement `DenyPublicReadDbBackup`: denies `s3:GetObject`
  on `db_backup/*` for every principal outside account `313003894447`.
  Verified: media URLs → HTTP 200 anonymously, dump URLs → HTTP 403.
  ⚠️ **Never remove or "simplify" this statement** — it is the only thing
  keeping database dumps (customer data!) private in a public-read bucket.
- **Lifecycle rule** `expire-db-dumps-90d`: `Prefix=db_backup/`, expire after
  90 days, abort incomplete multipart uploads after 7 days.
- **IAM user `krile-db-backup-uploader`** with inline policy `db-backup-put-only`:
  `s3:PutObject` on `arn:aws:s3:::krile-medusa-313003894447-eu-central-1-an/db_backup/*`
  and nothing else — a leaked VPS key cannot read, list, or delete backups.
  Its access key lives only in `.env.strato`. Rotate with:
  `aws iam create-access-key --user-name krile-db-backup-uploader` → update
  `.env.strato` on the VPS → `aws iam delete-access-key --user-name krile-db-backup-uploader --access-key-id <OLD>`

Recreation commands (only needed if these resources are ever lost):

```
aws s3api put-bucket-policy --bucket krile-medusa-313003894447-eu-central-1-an --policy '{"Version":"2012-10-17","Statement":[{"Sid":"PublicReadGetObject","Effect":"Allow","Principal":"*","Action":"s3:GetObject","Resource":"arn:aws:s3:::krile-medusa-313003894447-eu-central-1-an/*"},{"Sid":"DenyPublicReadDbBackup","Effect":"Deny","Principal":"*","Action":"s3:GetObject","Resource":"arn:aws:s3:::krile-medusa-313003894447-eu-central-1-an/db_backup/*","Condition":{"StringNotEquals":{"aws:PrincipalAccount":"313003894447"}}}]}'
aws s3api put-bucket-lifecycle-configuration --bucket krile-medusa-313003894447-eu-central-1-an --lifecycle-configuration '{"Rules":[{"ID":"expire-db-dumps-90d","Status":"Enabled","Filter":{"Prefix":"db_backup/"},"Expiration":{"Days":90},"AbortIncompleteMultipartUpload":{"DaysAfterInitiation":7}}]}'
aws iam create-user --user-name krile-db-backup-uploader
aws iam put-user-policy --user-name krile-db-backup-uploader --policy-name db-backup-put-only --policy-document '{"Version":"2012-10-17","Statement":[{"Sid":"PutDumpsOnly","Effect":"Allow","Action":"s3:PutObject","Resource":"arn:aws:s3:::krile-medusa-313003894447-eu-central-1-an/db_backup/*"}]}'
aws iam create-access-key --user-name krile-db-backup-uploader
```

## Troubleshooting

- `the input device is not a TTY` — the `exec` is missing `-T`; cron has no TTY.
- `role "medusa" does not exist` — script is pointed at the wrong stack/env
  file (e.g. local dev uses `postgres`/`medusa-v2`, Strato uses `medusa`/`medusa`).
- Upload fails with `AccessDenied` — key rotated / IAM policy changed, or the
  target key is outside the `db_backup/` prefix (the uploader can write nowhere else).
- Dump works but upload silently missing — check `BACKUP_S3_BUCKET` and
  `BACKUP_AWS_ACCESS_KEY_ID` are present in `.env.strato` on the VPS (the
  script prints a `NOTE:` and exits 0 when they're absent).
