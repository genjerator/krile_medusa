import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import * as fs from "fs"
import * as path from "path"
import importOne from "./import-products-from-json"

/**
 * Import the Pacovis / Planeta catalog batch created on 2026-08-06 (the products
 * extracted from the PDF catalogs) into whatever DB this runs against — so they
 * can be moved to prod without raw SQL.
 *
 * It simply replays the existing, idempotent `import-products-from-json` importer
 * for each source JSON (create if the handle is new, update copy/images if it
 * already exists — variants are never duplicated). Categories & sales channels
 * are resolved by NAME per environment, so run the category import first if the
 * Pacovis categories are not on the target DB yet.
 *
 * Local:  pnpm medusa exec ./src/scripts/import-pacovis-batch.ts
 * Prod :  docker exec app-medusa-1 sh -c 'REDIS_URL= pnpm medusa exec ./src/scripts/import-pacovis-batch.js'
 *
 * After this, run apply-product-updates to rename the Paco items and attach the
 * cleaned images:  ... pnpm medusa exec ./src/scripts/apply-product-updates.js
 */

// All Pacovis / Planeta catalog product files (every `pacovis-*.json` except the
// category tree). Discovered at runtime so new catalog files are picked up
// automatically.
const IMPORTS_DIR = path.join(__dirname, "imports")
function listFiles(): string[] {
  return fs
    .readdirSync(IMPORTS_DIR)
    .filter(
      (f) =>
        f.startsWith("pacovis-") &&
        f.endsWith(".json") &&
        f !== "pacovis-categories.json"
    )
    .sort()
}

export default async function importPacovisBatch(execArgs: ExecArgs) {
  const logger = execArgs.container.resolve(ContainerRegistrationKeys.LOGGER)
  const FILES = listFiles()
  logger.info(`📦 import-pacovis-batch: ${FILES.length} catalog file(s)`)
  const failed: string[] = []
  for (const file of FILES) {
    const jsonPath = path.join(__dirname, "imports", file)
    logger.info(`── importing ${file}`)
    try {
      await importOne({ ...execArgs, args: [jsonPath] })
    } catch (e: any) {
      // Keep going so one bad file can't block the rest; surfaced in the summary.
      failed.push(file)
      logger.error(`   ✗ ${file}: ${e?.message ?? e}`)
    }
  }
  console.log(
    `BATCH DONE: files=${FILES.length} failed=${failed.length}` +
      (failed.length ? `\n  failed files: ${failed.join(", ")}` : "")
  )
}
