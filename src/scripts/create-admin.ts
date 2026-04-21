import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function createAdmin({ container }: ExecArgs) {
  const userModule = container.resolve(Modules.USER)
  const authModule = container.resolve(Modules.AUTH)

  const email = process.env.ADMIN_EMAIL || "admin@example.com"
  const password = process.env.ADMIN_PASSWORD || "supersecret"

  const existing = await userModule.listUsers({ email })
  if (existing.length > 0) {
    console.log(`Admin user already exists: ${email}, skipping.`)
    return
  }

  const user = await userModule.createUsers({
    email,
    first_name: "Admin",
    last_name: "User",
  })

  await authModule.createAuthIdentities({
    provider_identities: [
      {
        entity_id: email,
        provider: "emailpass",
        provider_metadata: {
          password,
        },
      },
    ],
    app_metadata: {
      user_id: user.id,
    },
  })

  console.log(`Admin user created: ${email}`)
}
