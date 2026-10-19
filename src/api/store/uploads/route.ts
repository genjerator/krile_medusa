import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules, MedusaError } from "@medusajs/framework/utils"

/**
 * POST /store/uploads
 *
 * Public, rate-limited, type/size-restricted image upload for the branded-bag
 * configurator (customer logo + flattened preview). Multipart field "file"
 * (PNG/SVG/JPEG/WebP, max 3 MB — enforced by the `logoUpload` multer middleware
 * in api/middlewares.ts). Stores the file via the File module (S3) and returns
 * the public url, so the storefront can attach it to the inquiry.
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const file = (req as unknown as { file?: Express.Multer.File }).file

  if (!file?.buffer?.length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      'No file uploaded — send the image as multipart field "file".'
    )
  }

  const fileModule = req.scope.resolve(Modules.FILE)

  // Keep the original extension so S3 serves the right content type.
  const extFromName = (file.originalname?.match(/\.[a-zA-Z0-9]+$/)?.[0] ?? "").toLowerCase()
  const extFromMime =
    file.mimetype === "image/png" ? ".png"
    : file.mimetype === "image/svg+xml" ? ".svg"
    : file.mimetype === "image/webp" ? ".webp"
    : ".jpg"
  const ext = extFromName || extFromMime

  const [uploaded] = await fileModule.createFiles([
    {
      filename: `branded-bag-logo-${Date.now()}${ext}`,
      mimeType: file.mimetype,
      content: file.buffer.toString("base64"),
      access: "public",
    },
  ])

  res.status(201).json({
    url: uploaded.url,
    name: file.originalname ?? null,
  })
}
