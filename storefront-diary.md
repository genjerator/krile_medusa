# Storefront Diary

A running log of changes across the backend (`krile_medusa`) and the storefront
repos (`krile_medusa-storefront`, `planetagmbh_medusa-storefront`).

**How this works:** a git `post-commit` hook in each repo auto-appends a factual
entry (date, hash, author, message, changed files) on every commit. When work
goes through Claude in a session, Claude enriches the latest entries with context
(the "why", notable decisions, follow-ups).

Newest entries are at the bottom.

---
