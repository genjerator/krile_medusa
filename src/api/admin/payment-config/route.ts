import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  return res.json({
    paypal_client_id: process.env.PAYPAL_CLIENT_ID || null,
    paypal_is_sandbox: process.env.PAYPAL_IS_SANDBOX === "true",
  })
}
