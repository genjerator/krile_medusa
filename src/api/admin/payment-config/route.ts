import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const isSandbox = process.env.PAYPAL_IS_SANDBOX !== "false"
  return res.json({
    paypal_client_id: isSandbox
      ? process.env.PAYPAL_CLIENT_ID_SANDBOX || null
      : process.env.PAYPAL_CLIENT_ID_LIVE || null,
    paypal_is_sandbox: isSandbox,
  })
}
