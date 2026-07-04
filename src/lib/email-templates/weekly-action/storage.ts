import { existsSync } from "node:fs"
import { join } from "node:path"

/**
 * On-disk location of the generated weekly-action email files. One file per
 * action: `weeklyaction{actionId}.html`. Written by the admin "Generate email
 * HTML" button and read back by the list "Preview" button.
 *
 * Note: this lives on the backend's local filesystem (under the process CWD),
 * so it is per-instance and not persisted across redeploys — it's a
 * regenerate-any-time preview cache, not durable storage.
 */
export const EMAIL_DIR = join(process.cwd(), "static", "weekly-action-emails")

export const emailFileName = (actionId: string) => `weeklyaction${actionId}.html`

export const emailFilePath = (actionId: string) => join(EMAIL_DIR, emailFileName(actionId))

export const emailExists = (actionId: string): boolean => existsSync(emailFilePath(actionId))
