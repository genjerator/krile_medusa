import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function testSmtp({ container }: ExecArgs) {
  const logger = container.resolve("logger")
  const notificationModule = container.resolve(Modules.NOTIFICATION)

  const to = process.env.SMTP_TEST_TO || process.env.SMTP_USER || "test@example.com"

  logger.info(`Sending test email to ${to}...`)

  await notificationModule.createNotifications({
    to,
    channel: "email",
    template: "test",
    data: {
      subject: "SMTP Test — Planeta Industries",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h1 style="color: #1e3a5f;">✅ SMTP funktioniert!</h1>
          <p>Diese E-Mail wurde vom lokalen Medusa-Backend gesendet.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #6b7280; font-size: 14px;">
            Host: ${process.env.SMTP_HOST}<br/>
            Port: ${process.env.SMTP_PORT}<br/>
            Von: ${process.env.SMTP_FROM}
          </p>
        </div>
      `,
      text: "SMTP funktioniert! Diese E-Mail wurde vom lokalen Medusa-Backend gesendet.",
    },
  })

  logger.info(`✅ Test email sent to ${to}`)
}
