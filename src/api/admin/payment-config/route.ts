import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

const last20 = (s: string | undefined) => s ? `...${s.slice(-20)}` : null

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const isSandbox = process.env.PAYPAL_IS_SANDBOX !== "false"
  const clientSecret = isSandbox
    ? process.env.PAYPAL_CLIENT_SECRET_SANDBOX
    : process.env.PAYPAL_CLIENT_SECRET_LIVE

  return res.json({
    paypal_is_sandbox: isSandbox,
    paypal_client_id: isSandbox
      ? process.env.PAYPAL_CLIENT_ID_SANDBOX || null
      : process.env.PAYPAL_CLIENT_ID_LIVE || null,
    paypal_client_secret_tail: last20(clientSecret),
    paypal_webhook_id: isSandbox
      ? process.env.PAYPAL_WEBHOOK_ID_SANDBOX || null
      : process.env.PAYPAL_WEBHOOK_ID_LIVE || null,
  })
}
