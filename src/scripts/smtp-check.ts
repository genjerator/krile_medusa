import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function testSmtp({ container }: ExecArgs) {
  const logger = container.resolve("logger")
  const notificationModule = container.resolve(Modules.NOTIFICATION)

  // Hardwired to the SHOP mailbox (planeta / planeta-shop.de). Industries is
  // intentionally NOT used anywhere in this check — we only want to prove the
  // shop account sends real mail end-to-end.
  const account = "planeta"
  const prefix = "SHOP"

  // Previous (multi-account) behaviour, disabled on purpose so nothing here can
  // ever go out via planetaindustries.de:
  //   const account = process.env.SMTP_SHOP_ACCOUNT || "industries"
  //   const prefix = account === "planeta" ? "SHOP" : "INDUSTRIES"

  // Send to the maintainer's inbox to confirm real delivery from the shop box.
  const to = "e.medjesi@gmail.com"

  logger.info(
    `[smtp-check] account="${account}" (prefix ${prefix}) → ` +
      `from="${process.env.SMTP_SHOP_FROM}", ` +
      `user="${process.env.SMTP_SHOP_USER}", ` +
      `host="${process.env.SMTP_SHOP_HOST}". Sending to ${to}...`
  )

  await notificationModule.createNotifications({
    to,
    channel: "email",
    template: "test",
    data: {
      account,
      subject: "SMTP Test — planeta-shop.de",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h1 style="color: #1e3a5f;">✅ SMTP funktioniert!</h1>
          <p>Diese E-Mail wurde über das <strong>${account}</strong>-Konto (planeta-shop.de) gesendet.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #6b7280; font-size: 14px;">
            Konto: ${account}<br/>
            Host: ${process.env.SMTP_SHOP_HOST}<br/>
            Port: ${process.env.SMTP_SHOP_PORT}<br/>
            Von: ${process.env.SMTP_SHOP_FROM}
          </p>
        </div>
      `,
      text: `SMTP funktioniert! Gesendet über das ${account}-Konto (planeta-shop.de).`,
    },
  })

  logger.info(`✅ Test email sent via "${account}" (shop) to ${to}`)
}
