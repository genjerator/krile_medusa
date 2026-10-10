import { ExecArgs } from "@medusajs/framework/types"
import { OUTREACH_MODULE } from "../modules/outreach"

export default async function verify({ container }: ExecArgs) {
  const outreach: any = container.resolve(OUTREACH_MODULE)

  const run = async (label: string, filters: any) => {
    const [, count] = await outreach.listAndCountOutreachCompanies(filters, { take: 1 })
    console.log(`  ${label}: ${count}`)
  }

  const [sample] = await outreach.listAndCountOutreachCompanies(
    {},
    { take: 1, order: { city: "ASC", name: "ASC" } }
  ).then((r: any) => r[0])
  console.log("VERIFY OUTREACH FILTERS:")
  await run("all", {})
  await run("city ILIKE %berlin%", { city: { $ilike: "%berlin%" } })
  await run("q(name/email/website) ILIKE %hotel%", {
    $or: [
      { name: { $ilike: "%hotel%" } },
      { email: { $ilike: "%hotel%" } },
      { website: { $ilike: "%hotel%" } },
    ],
  })
  await run("has_website=yes", { website: { $ne: null } })
  await run("has_website=no", { website: null })
  await run("combined city+q", {
    city: { $ilike: "%münchen%" },
    $or: [{ name: { $ilike: "%gmbh%" } }, { email: { $ilike: "%gmbh%" } }],
  })
}
