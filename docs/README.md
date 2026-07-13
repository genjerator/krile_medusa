# Documentation

Project documentation for the `krile_medusa` backend.

## Features

- [Weekly Actions](./weekly-actions.md) — functional + technical reference for
  the weekly promotions feature (data model, workflows, API, admin UI, and the
  campaign email). Template lives in
  `src/lib/email-templates/weekly-action/render.ts`.
- [Weekly Actions — design](./weekly-actions-design.md) — original design
  rationale and phased plan.

## Infrastructure & deployment

- [AWS — full setup](./AWS_FULL_SETUP.md)
- [AWS — commands](./AWS_COMMANDS.md)
- [EC2 setup](./EC2_SETUP.md)
- [RDS → local restore](./RDS_RESTORE_LOCAL.md)
- [Strato setup](./STRATO_SETUP.md)
- [VPS (Strato)](./VPS_strato.md)
- [DB backups (Strato → S3)](./DB_BACKUP.md) — daily `pg_dump` cron on the VPS,
  upload to the `db_backup/` prefix in the media bucket, restore procedure,
  IAM/bucket-policy reference.

> Kept at the repo root by convention: `README.md`, `CLAUDE.md` (project
> instructions), and `storefront-diary.md` (maintained by a git post-commit
> hook — do not move).
