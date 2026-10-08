import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Dropdown data for the `/vakuumiertuten-rollen` configurator.
 *
 * Returns the colours (hover-preview image + hex chip), the product-line types
 * (with their fixed µm + preview image), the pack size, the defaults, and the
 * **full active price matrix** as `combinations`. The storefront drives
 * everything from `combinations`: the type/width/height dropdowns offer only
 * values that appear there (cascading availability), and the live price is a
 * client-side lookup — no per-keystroke round-trip. `/price` exists for an
 * authoritative server check; add-to-cart re-validates anyway.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: configs } = await query.graph({
    entity: "vacuum_bag_config",
    fields: ["id", "pack_size", "default_color_id", "active"],
    filters: { active: true } as any,
  })
  const config: any = configs[0]

  const { data: colors } = await query.graph({
    entity: "vacuum_bag_color",
    fields: ["id", "name", "slug", "hex", "image_url", "rank", "is_default", "active"],
    filters: { active: true } as any,
  })

  const { data: types } = await query.graph({
    entity: "vacuum_bag_type",
    fields: [
      "id",
      "name",
      "slug",
      "thickness_um",
      "description",
      "image_url",
      "rank",
      "is_default",
      "active",
    ],
    filters: { active: true } as any,
  })

  const { data: prices } = await query.graph({
    entity: "vacuum_bag_price",
    fields: [
      "thickness_um",
      "width_mm",
      "height_mm",
      "price",
      "currency_code",
      "active",
      "type.slug",
    ],
    filters: { active: true } as any,
  })

  // Colour is cosmetic — price depends only on (type, width, height). So the
  // matrix (Transparent rows) drives availability + price; the chosen colour just
  // swaps the image and the variant/SKU.
  const combinations = prices
    .filter((p: any) => p.type?.slug)
    .map((p: any) => ({
      type: p.type?.slug,
      thickness_um: p.thickness_um,
      width_mm: p.width_mm,
      height_mm: p.height_mm,
      price: p.price,
      currency_code: p.currency_code,
    }))

  const sortedColors = [...colors].sort(
    (a: any, b: any) => (a.rank ?? 0) - (b.rank ?? 0)
  )
  const defaultColor =
    sortedColors.find((c: any) => c.id === config?.default_color_id)?.slug ??
    sortedColors.find((c: any) => c.is_default)?.slug ??
    sortedColors[0]?.slug ??
    null

  const sortedTypes = [...types].sort(
    (a: any, b: any) => (a.rank ?? 0) - (b.rank ?? 0)
  )
  const defaultType =
    sortedTypes.find((t: any) => t.is_default)?.slug ??
    sortedTypes[0]?.slug ??
    null

  const distinct = (key: "width_mm" | "height_mm") =>
    [...new Set(combinations.map((c) => c[key] as number))].sort((a, b) => a - b)

  return res.json({
    pack_size: config?.pack_size ?? 1000,
    default_color: defaultColor,
    default_type: defaultType,
    colors: sortedColors.map((c: any) => ({
      slug: c.slug,
      name: c.name,
      hex: c.hex,
      image_url: c.image_url,
      is_default: c.is_default,
    })),
    types: sortedTypes.map((t: any) => ({
      slug: t.slug,
      name: t.name,
      thickness_um: t.thickness_um,
      description: t.description,
      image_url: t.image_url,
      is_default: t.is_default,
    })),
    widths: distinct("width_mm"),
    heights: distinct("height_mm"),
    combinations,
  })
}
