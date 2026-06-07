import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { id } = req.params

  const { data } = await query.graph({
    entity: "customer",
    filters: { id },
    fields: ["id", "sales_channels.id", "sales_channels.name"],
  })

  return res.json({ sales_channels: (data[0] as any)?.sales_channels ?? [] })
}
