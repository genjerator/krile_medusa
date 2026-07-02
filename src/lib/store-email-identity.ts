/**
 * Resolves which email identity (sending mailbox + store recipient) to use for
 * a given storefront, keyed by the order's / inquiry's **sales channel name**.
 *
 * The single backend serves both storefronts:
 *   - Planeta Industries (krile_medusa-storefront)        → "industries" account
 *   - Planeta GmbH        (planetagmbh_medusa-storefront) → "planeta" account
 *
 * `account` is matched against the keys registered on the smtp provider in
 * `medusa-config.ts`. If the planeta mailbox isn't configured yet
 * (`SMTP_SHOP_USER` unset) we fall back to the industries account so mail still
 * goes out — just from the default address.
 */
export type EmailAccountKey = "industries" | "planeta"

export type StoreEmailIdentity = {
  /** smtp provider account key (see medusa-config.ts `accounts`). */
  account: EmailAccountKey
  /** Address that receives the internal "new order / inquiry" notification. */
  storeEmail: string
}

/** Sales channel name of the Planeta GmbH storefront (planeta-shop.de). */
export const SHOP_CHANNEL_NAME = "PlanetaWebshop"

export function getStoreEmailIdentity(
  // Accepts a single channel name (orders belong to one channel) or several
  // (a storefront's publishable key can be linked to multiple channels).
  _salesChannelName?: string | string[] | null
): StoreEmailIdentity {
  // TEMPORARY OVERRIDE: always send via the planeta / planeta-shop.de mailbox,
  // regardless of sales channel — industries is disabled for now. Revert to the
  // channel-based logic (matching SHOP_CHANNEL_NAME) to re-enable per-storefront
  // routing. The `planeta` account must be registered in medusa-config.ts
  // (requires SMTP_SHOP_USER); otherwise the provider falls back to its default.
  return {
    account: "planeta",
    storeEmail:
      process.env.SMTP_SHOP_FROM_EMAIL || process.env.SMTP_SHOP_USER || "",
  }
}