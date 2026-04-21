# Project Overview

_Last updated: 2026-04-20 by planner after task: add four Redis modules to medusa-config.ts for Railway deployment_

## Language(s)
- TypeScript: `tsconfig.json` — standarts: `.claude/skills/ts-code-standarts.md`

## Key Files
| File | Purpose |
|------|---------|
| `medusa-config.ts` | Medusa v2 project configuration — `defineConfig` with `projectConfig` and `modules` |
| `package.json` | Dependencies and scripts; Medusa v2.13.6, pnpm 10.33.0, Node >=20 |
| `tsconfig.json` | TS config targeting ES2021, Node16 module resolution, `strictNullChecks: true` |
| `instrumentation.ts` | OpenTelemetry / observability bootstrap (do not modify without reason) |
| `src/` | Application source — custom modules, routes, scripts |

## Architecture & Conventions
- Config uses `module.exports = defineConfig(...)` (CJS interop) — never change to `export default`
- All framework utilities (`loadEnv`, `defineConfig`, `Modules`) imported from `@medusajs/framework/utils`
- Redis modules registered as array entries under `modules` key in `defineConfig`, each with `{ resolve, options }`
- Provider-based modules (caching, locking) use a nested `providers` array with `{ resolve, id, options, is_default }`
- Environment variables are referenced directly via `process.env.*` — no wrapper helpers
- Package manager is pnpm; do not use npm or yarn commands

## Do Not Touch
- `pnpm-lock.yaml`: managed by pnpm, never edit manually
- `node_modules/`: never edit
- `.medusa/`: build output directory, regenerated on `medusa build`

## Known Constraints
- `strictNullChecks: true` — `process.env.*` values are `string | undefined`; Medusa handles missing env at runtime, do not add blanket `!` assertions
- Node >=20 required (set in `engines`)
- Medusa version is 2.13.6 — all module resolve paths must match v2 package structure
