import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { REPARATUR_MODULE } from "../../modules/reparatur"
import { buildReparaturPdf, type ReparaturPdfData } from "../../lib/reparatur-pdf"

type Input = ReparaturPdfData & { id: string }

/**
 * Builds the printable PDF for a saved reparatur, uploads it to file storage
 * (S3, public) and stores the resulting URL on the row's `pdf_url`.
 *
 * Best-effort: any failure is logged and swallowed so it never rolls back the
 * already-saved submission (the admin simply shows no PDF link in that case).
 */
export const generateReparaturPdfStep = createStep(
  "generate-reparatur-pdf-step",
  async (input: Input, { container }) => {
    const logger = container.resolve("logger")
    try {
      const fileModule = container.resolve(Modules.FILE)
      const reparaturService: any = container.resolve(REPARATUR_MODULE)

      const bytes = await buildReparaturPdf(input)
      const content = Buffer.from(bytes).toString("base64")
      const filename = `reparatur-${input.id}.pdf`

      const [uploaded] = await fileModule.createFiles([
        { filename, mimeType: "application/pdf", content, access: "public" },
      ])

      await reparaturService.updateReparaturs({ id: input.id, pdf_url: uploaded.url })
      logger.info(`[reparatur] pdf generated for ${input.id}: ${uploaded.url}`)
      return new StepResponse(uploaded.url)
    } catch (e: any) {
      logger.error(`[reparatur] failed to generate pdf for ${input.id}: ${e?.message}`)
      return new StepResponse(null)
    }
  }
)
