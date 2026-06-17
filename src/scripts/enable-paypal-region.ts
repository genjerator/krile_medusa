import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { updateRegionsWorkflow } from "@medusajs/medusa/core-flows"

const PAYPAL_PROVIDER_ID = "pp_paypal_paypal"

/**
 * Enables the PayPal payment provider on every region (keeping the existing
 * providers). The region was seeded with only `pp_system_default`, so PayPal
 * never showed up at checkout even though the provider is configured in
 * medusa-config.ts. Run with: npx medusa exec ./src/scripts/enable-paypal-region.ts
 */
export default async function enablePaypalRegion({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const regionModule = container.resolve(Modules.REGION)
  const paymentModule = container.resolve(Modules.PAYMENT)

  // 1. Confirm the PayPal provider is actually registered in the running backend.
  const providers = await paymentModule.listPaymentProviders(
    {},
    { select: ["id", "is_enabled"] }
  )
  logger.info(`Registered payment providers: ${providers.map((p) => p.id).join(", ")}`)

  if (!providers.some((p) => p.id === PAYPAL_PROVIDER_ID)) {
    logger.error(
      `Provider "${PAYPAL_PROVIDER_ID}" is NOT registered. Make sure PAYPAL_CLIENT_ID is set ` +
        `in the backend .env and restart the Medusa server, then re-run this script.`
    )
    return
  }

  // 2. Read each region's current providers via the module link (graph), then
  //    set the union including PayPal. `payment_providers` is a linked relation,
  //    so it must be read through the query graph, not regionModule relations.
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "payment_providers.id"],
  })

  for (const region of regions) {
    const current: string[] = (region.payment_providers ?? []).map((p: any) => p.id)
    if (current.includes(PAYPAL_PROVIDER_ID)) {
      logger.info(`  ${region.name}: PayPal already enabled — skipping`)
      continue
    }

    const next = Array.from(new Set([...current, PAYPAL_PROVIDER_ID]))
    await updateRegionsWorkflow(container).run({
      input: {
        selector: { id: region.id },
        update: { payment_providers: next },
      },
    })
    logger.info(`  ${region.name}: enabled PayPal (providers: ${next.join(", ")})`)
  }

  logger.info("✅ Done. PayPal is now available at checkout for the listed regions.")
}
