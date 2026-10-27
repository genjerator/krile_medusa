import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * How many customers who RECEIVED a marketing email went on to place an order.
 *
 * "Received" = a `customer_campaign` row with `delivered_at` set (same set the
 * email funnel counts as "Delivered"). Orders are matched by email, exactly like
 * `marketing-priority.ts` (`lower(o.email) = lower(c.email)`), so guest orders
 * under the same address count too. Read-only.
 *
 * Reports three things:
 *   recipients_total        — distinct customers who received ≥1 campaign email
 *   ordered_after_receiving — of those, how many placed ≥1 order ON OR AFTER
 *                             their first delivery (true post-email attribution)
 *   ordered_ever            — of those, how many have ANY order (context; may
 *                             include orders predating the campaign)
 * plus the campaign window (earliest/latest delivery) and total order counts.
 *
 * Run:
 *   local — npx medusa exec ./src/scripts/campaign-order-conversion.ts
 *   prod  — ssh root@217.154.144.21 "cd ~/app && docker compose -f docker-compose.strato.yml exec -T medusa pnpm medusa exec ./src/scripts/campaign-order-conversion.js"
 */
export default async function campaignOrderConversion({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  const res: any = await pg.raw(`
    with recipients as (
      select cc.customer_id, min(cc.delivered_at) as first_delivered
      from customer_campaign cc
      where cc.delivered_at is not null
      group by cc.customer_id
    ),
    rc as (
      select r.customer_id, r.first_delivered, c.email
      from recipients r
      join customer c on c.id = r.customer_id
      where c.email is not null
    )
    select
      (select count(*) from rc) as recipients_total,
      count(*) filter (where exists (
        select 1 from "order" o
        where o.email is not null
          and lower(o.email) = lower(rc.email)
          and o.created_at >= rc.first_delivered
      )) as ordered_after_receiving,
      count(*) filter (where exists (
        select 1 from "order" o
        where o.email is not null
          and lower(o.email) = lower(rc.email)
      )) as ordered_ever,
      (select min(first_delivered) from rc) as campaign_first_delivery,
      (select max(first_delivered) from rc) as campaign_last_delivery,
      (select count(*) from "order" o
        where o.email is not null
          and exists (
            select 1 from rc
            where lower(rc.email) = lower(o.email)
              and o.created_at >= rc.first_delivered
          )) as orders_after_receiving_total
    from rc
  `)

  const r = res.rows?.[0] ?? {}
  const recips = Number(r.recipients_total ?? 0)
  const afterRecv = Number(r.ordered_after_receiving ?? 0)
  const ever = Number(r.ordered_ever ?? 0)
  const pct = (n: number) =>
    recips > 0 ? `${((n / recips) * 100).toFixed(1)}%` : "n/a"

  logger.info("📈 Email campaign → order conversion:")
  logger.info(`   Recipients (received ≥1 email):        ${recips}`)
  logger.info(`   Ordered AFTER receiving (attributed):  ${afterRecv}  (${pct(afterRecv)})`)
  logger.info(`   Ordered ever (any time, context):      ${ever}  (${pct(ever)})`)
  logger.info(`   Total orders placed after receiving:   ${Number(r.orders_after_receiving_total ?? 0)}`)
  logger.info(`   Campaign delivery window:              ${r.campaign_first_delivery} → ${r.campaign_last_delivery}`)
}
