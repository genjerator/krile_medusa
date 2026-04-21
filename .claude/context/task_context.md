# Task Context

## Language
TypeScript — standarts from `.claude/skills/ts-code-standarts.md`

## Key standarts for This Task
- No `any` — all module config objects must be properly typed via Medusa's `defineConfig` inference
- Use `camelCase` for variable names; object keys match Medusa's expected API shape exactly
- Avoid magic values — `process.env.REDIS_URL` referenced directly, no inline string duplication
- Keep the file small and focused — this is a config file, not application logic
- `module.exports = defineConfig(...)` pattern must be preserved (CJS interop with `esModuleInterop: true`)

## Task
Add four Redis-backed modules (Event Bus, Workflow Engine, Caching, Locking) to `medusa-config.ts` using a single `REDIS_URL` environment variable, updating the import to also pull in `Modules` from `@medusajs/framework/utils`.

## Plan
- Step 1: Update the import line to add `Modules` alongside existing `loadEnv` and `defineConfig`
- Step 2: Add a top-level `modules` array inside `defineConfig({ ... })`
- Step 3: Add Event Bus module entry using `Modules.EVENT_BUS`
- Step 4: Add Workflow Engine module entry using `Modules.WORKFLOW_ENGINE`
- Step 5: Add Caching module entry using `Modules.CACHE` with the `@medusajs/caching-redis` provider
- Step 6: Add Locking module entry using `Modules.LOCKING` with the `@medusajs/medusa/locking-redis` provider

## Files to Change
- `/home/genjerator/projects/krile_medusa/medusa-config.ts`: Full rewrite — add `Modules` import and four Redis module configurations inside `defineConfig`

## Exact Signatures
No new functions. The shape of each module config object in the `modules` array:

```ts
// Event Bus
{
  resolve: "@medusajs/medusa/event-bus-redis",
  options: {
    redisUrl: process.env.REDIS_URL,
    jobOptions: {
      removeOnComplete: { age: 3600, count: 1000 },
      removeOnFail: { age: 3600, count: 1000 },
    },
  },
}

// Workflow Engine
{
  resolve: "@medusajs/medusa/workflow-engine-redis",
  options: {
    redis: {
      redisUrl: process.env.REDIS_URL,
    },
  },
}

// Caching
{
  resolve: "@medusajs/medusa/caching",
  options: {
    providers: [
      {
        resolve: "@medusajs/caching-redis",
        id: "caching-redis",
        options: {
          redisUrl: process.env.REDIS_URL,
        },
        is_default: true,
      },
    ],
  },
}

// Locking
{
  resolve: "@medusajs/medusa/locking",
  options: {
    providers: [
      {
        resolve: "@medusajs/medusa/locking-redis",
        id: "locking-redis",
        options: {
          redisUrl: process.env.REDIS_URL,
        },
        is_default: true,
      },
    ],
  },
}
```

The `modules` array is keyed by `Modules.*` constants:

```ts
modules: [
  {
    resolve: "@medusajs/medusa/event-bus-redis",
    // ...
  },
  // ...
]
```

Note: `defineConfig` accepts a `modules` key at the top level alongside `projectConfig`.

## Types Needed
No new types. All shapes are inferred by `defineConfig` from `@medusajs/framework/utils`. `Modules` is an enum/object of string constants exported from the same package.

## Patterns to Follow

```ts
// From /home/genjerator/projects/krile_medusa/medusa-config.ts:1-16 — shows existing defineConfig usage and CJS export pattern
import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  }
})
```

## Anti-patterns — Do NOT do this
- DO NOT switch to `export default` — the file uses `module.exports` for CJS compatibility with Medusa's loader; changing this will break startup
- DO NOT add `redisPrefix` or other undocumented options not specified in the task
- DO NOT import `Modules` from `@medusajs/medusa` — it must come from `@medusajs/framework/utils` (same package already used in this file)
- DO NOT use string literals like `"event-bus"` as top-level keys; use the `resolve` property pattern inside the `modules` array
- DO NOT add `strictNullChecks`-violating patterns — `process.env.REDIS_URL` is `string | undefined`, do not assert with `!` unless task requires it (leave as-is, Medusa handles missing env at runtime)

## Public API Changes
No — this is a config file, no `__init__.py` equivalent, no version bump needed.

## Edge Cases to Handle
- `process.env.REDIS_URL` may be `undefined` at type-check time — this is acceptable and consistent with how `DATABASE_URL` is handled on line 7 (no `!` assertion); leave without assertion
- The `modules` array is additive — `projectConfig` block must remain unchanged

## Self-critique Notes
Draft reviewed against:
- Import line: confirmed `Modules` must be added to the existing named import, not a separate import statement
- Module key pattern: Medusa v2 `defineConfig` accepts `modules` as an array of `{ resolve, options }` objects — not a keyed object — confirmed from Medusa v2 Railway deployment docs pattern
- All four module resolve strings verified against task specification exactly
- `jobOptions` nesting verified: lives inside `options` of the event-bus entry, not at top level
- `caching` and `locking` use a `providers` array with `resolve`, `id`, `options`, `is_default` — this matches Medusa v2 provider registration pattern
- No gaps found after review; draft is complete.

## File Contents

### /home/genjerator/projects/krile_medusa/medusa-config.ts

```ts
import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  modules: [
    {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
        jobOptions: {
          removeOnComplete: { age: 3600, count: 1000 },
          removeOnFail: { age: 3600, count: 1000 },
        },
      },
    },
    {
      resolve: "@medusajs/medusa/workflow-engine-redis",
      options: {
        redis: {
          redisUrl: process.env.REDIS_URL,
        },
      },
    },
    {
      resolve: "@medusajs/medusa/caching",
      options: {
        providers: [
          {
            resolve: "@medusajs/caching-redis",
            id: "caching-redis",
            options: {
              redisUrl: process.env.REDIS_URL,
            },
            is_default: true,
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/locking",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/locking-redis",
            id: "locking-redis",
            options: {
              redisUrl: process.env.REDIS_URL,
            },
            is_default: true,
          },
        ],
      },
    },
  ],
})
```
