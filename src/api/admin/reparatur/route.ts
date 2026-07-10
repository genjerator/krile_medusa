import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { REPARATUR_MODULE } from "../../../modules/reparatur"

/** Lists repair-form submissions for the admin "Reparaturen" page (newest first). */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const reparaturService: any = req.scope.resolve(REPARATUR_MODULE)
  const salesChannelService = req.scope.resolve(Modules.SALES_CHANNEL)

  const limit = Number(req.query.limit) || 20
  const offset = Number(req.query.offset) || 0

  const [reparaturen, count] = await reparaturService.listAndCountReparaturs(
    {},
    { take: limit, skip: offset, order: { created_at: "DESC" } }
  )

  const salesChannelIds = [
    ...new Set<string>(
      reparaturen
        .map((r: any) => r.sales_channel_id)
        .filter((id: unknown): id is string => typeof id === "string")
    ),
  ]

  const salesChannels = salesChannelIds.length
    ? await salesChannelService.listSalesChannels({ id: salesChannelIds }, { select: ["id", "name"] })
    : []
  const salesChannelNames = Object.fromEntries(salesChannels.map((sc) => [sc.id, sc.name]))

  const withChannel = reparaturen.map((r: any) => ({
    ...r,
    sales_channel_name: r.sales_channel_id ? salesChannelNames[r.sales_channel_id] ?? null : null,
  }))

  return res.json({ reparaturen: withChannel, count, limit, offset })
}
