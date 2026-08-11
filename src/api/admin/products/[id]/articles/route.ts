import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { ARTICLE_MODULE } from "../../../../../modules/article"

/**
 * Related-articles management for a product (admin).
 *
 * GET  /admin/products/:id/articles         → the articles currently linked to the product
 * POST /admin/products/:id/articles { article_ids } → replace the linked set with `article_ids`
 *
 * Links are managed via the Remote Link service (same as customer↔sales-channel).
 */

const linkedArticleIds = async (query: any, productId: string): Promise<string[]> => {
  const { data } = await query.graph({
    entity: "product",
    filters: { id: productId },
    fields: ["id", "articles.id"],
  })
  return ((data[0] as any)?.articles ?? []).map((a: any) => a.id)
}

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "product",
    filters: { id: req.params.id },
    fields: ["id", "articles.id", "articles.slug", "articles.title", "articles.status"],
  })
  res.json({ articles: (data[0] as any)?.articles ?? [] })
}

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const remoteLink = req.scope.resolve(ContainerRegistrationKeys.REMOTE_LINK)
  const productId = req.params.id

  const body = (req.body ?? {}) as { article_ids?: unknown }
  const desired = Array.isArray(body.article_ids)
    ? [...new Set(body.article_ids.filter((v): v is string => typeof v === "string"))]
    : []

  const current = await linkedArticleIds(query, productId)
  const toAdd = desired.filter((id) => !current.includes(id))
  const toRemove = current.filter((id) => !desired.includes(id))

  for (const article_id of toAdd) {
    await remoteLink
      .create({
        [Modules.PRODUCT]: { product_id: productId },
        [ARTICLE_MODULE]: { article_id },
      })
      .catch(() => {})
  }
  for (const article_id of toRemove) {
    await remoteLink
      .dismiss({
        [Modules.PRODUCT]: { product_id: productId },
        [ARTICLE_MODULE]: { article_id },
      })
      .catch(() => {})
  }

  const { data } = await query.graph({
    entity: "product",
    filters: { id: productId },
    fields: ["id", "articles.id", "articles.slug", "articles.title", "articles.status"],
  })
  res.json({ articles: (data[0] as any)?.articles ?? [] })
}
