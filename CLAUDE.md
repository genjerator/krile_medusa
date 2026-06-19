# Project instructions

## Storefront diary

`storefront-diary.md` (in this repo) is a shared change log for the backend
(`krile_medusa`) and the storefront repos (`krile_medusa-storefront`,
`planetagmbh_medusa-storefront`).

A git `post-commit` hook in each repo automatically appends a factual entry on
every commit. **In any session where you (Claude) create a commit in one of these
repos, after committing, enrich the just-added diary entry**: add a short
paragraph explaining the *why* of the change, notable decisions, and any
follow-ups. Keep the auto-generated factual lines; append the context below them.
Do not rewrite older entries.
