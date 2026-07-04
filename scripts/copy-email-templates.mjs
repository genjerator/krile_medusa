#!/usr/bin/env node
/**
 * Postbuild step: copy the email `.html` templates into the compiled server
 * output so they exist at runtime.
 *
 * `medusa build` transpiles `.ts` and copies `.mjs`, but it does NOT copy loose
 * `.html` files — and the renderer (`src/lib/email-templates/weekly-action/render.ts`)
 * reads its templates from disk. Without this copy the admin "Generate email
 * HTML" route would fail with ENOENT in the built/Docker image.
 *
 * Runs after `medusa build` (see the "build" script in package.json).
 */
import { cpSync, existsSync, mkdirSync } from "node:fs"
import { join } from "node:path"

// Add any other on-disk template dirs here if more get introduced.
const TEMPLATE_DIRS = ["src/lib/email-templates/weekly-action/templates"]

const SERVER_OUT = ".medusa/server"

if (!existsSync(SERVER_OUT)) {
  console.warn(`[copy-email-templates] ${SERVER_OUT} not found — did 'medusa build' run? Skipped.`)
  process.exit(0)
}

for (const dir of TEMPLATE_DIRS) {
  if (!existsSync(dir)) {
    console.warn(`[copy-email-templates] source ${dir} not found — skipped.`)
    continue
  }
  const dest = join(SERVER_OUT, dir)
  mkdirSync(dest, { recursive: true })
  cpSync(dir, dest, { recursive: true })
  console.log(`[copy-email-templates] ${dir} → ${dest}`)
}
