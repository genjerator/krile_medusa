import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Recomputes every customer's marketing priority into marketing_profile.
 *
 * Highest applicable tier wins (purchased > newsletter > reparatur > angebot >
 * clicked > opened > none). `unsubscribed` (derived from Brevo) is a dedicated
 * flag that SUPPRESSES everything — when set, priority becomes 'unsubscribed'
 * and priority_rank is forced to 99, regardless of the other signals.
 *
 * Signal → source (all in the same DB, so this is one set-based upsert):
 *   purchased  → any row in "order" for the customer's email
 *   newsletter → newsletter_preference.subscribed = true (by customer_id)
 *   reparatur  → any reparatur for the email
 *   angebot    → any product_inquiry for the email
 *   clicked    → any customer_campaign.clicked_at for the customer
 *   opened     → any customer_campaign.opened_at for the customer
 *   unsubscribed → metadata.brevo.unsubscribed OR .blacklisted
 *
 * This is a bulk data (DML) recompute — not a schema change.
 */
const RECOMPUTE_SQL = `
insert into "marketing_profile"
  ("id", "customer_id", "unsubscribed", "unsubscribed_at", "priority", "priority_rank")
select
  'mp_' || s.id,
  s.id,
  s.unsub,
  case when s.unsub then now() else null end,
  case
    when s.unsub then 'unsubscribed'
    when s.purchased then 'purchased'
    when s.newsletter then 'newsletter'
    when s.reparatur then 'reparatur'
    when s.angebot then 'angebot'
    when s.clicked then 'clicked'
    when s.opened then 'opened'
    else 'none'
  end,
  case
    when s.unsub then 99
    when s.purchased then 1
    when s.newsletter then 2
    when s.reparatur then 3
    when s.angebot then 4
    when s.clicked then 5
    when s.opened then 6
    else 7
  end
from (
  select
    c.id as id,
    c.email as email,
    (coalesce((c.metadata -> 'brevo' ->> 'unsubscribed')::boolean, false)
     or coalesce((c.metadata -> 'brevo' ->> 'blacklisted')::boolean, false)) as unsub,
    exists(select 1 from "order" o where o.email is not null and lower(o.email) = lower(c.email)) as purchased,
    exists(select 1 from "newsletter_preference" np where np.customer_id = c.id and np.subscribed = true and np.deleted_at is null) as newsletter,
    exists(select 1 from "reparatur" r where r.deleted_at is null and lower(r.email) = lower(c.email)) as reparatur,
    exists(select 1 from "product_inquiry" pi where pi.deleted_at is null and lower(pi.email) = lower(c.email)) as angebot,
    exists(select 1 from "customer_campaign" cc where cc.customer_id = c.id and cc.deleted_at is null and cc.clicked_at is not null) as clicked,
    exists(select 1 from "customer_campaign" cc where cc.customer_id = c.id and cc.deleted_at is null and cc.opened_at is not null) as opened
  from "customer" c
  where c.deleted_at is null and c.email is not null
) s
on conflict ("customer_id") where "deleted_at" is null
do update set
  "unsubscribed" = excluded."unsubscribed",
  "unsubscribed_at" = case when excluded."unsubscribed"
                           then coalesce("marketing_profile"."unsubscribed_at", excluded."unsubscribed_at")
                           else null end,
  "priority" = excluded."priority",
  "priority_rank" = excluded."priority_rank",
  "updated_at" = now();
`

export async function recomputeMarketingPriorities(
  container: MedusaContainer
): Promise<Record<string, number>> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  await pg.raw(RECOMPUTE_SQL)

  const rows = (await pg("marketing_profile")
    .whereNull("deleted_at")
    .select("priority")
    .count<{ priority: string; count: string }[]>("* as count")
    .groupBy("priority")) as unknown as { priority: string; count: string }[]

  const breakdown: Record<string, number> = {}
  for (const r of rows) breakdown[r.priority] = Number(r.count)

  logger.info(`[marketing-priority] recomputed: ${JSON.stringify(breakdown)}`)
  return breakdown
}
