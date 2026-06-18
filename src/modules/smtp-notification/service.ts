import { AbstractNotificationProviderService } from "@medusajs/framework/utils"
import { Logger, NotificationTypes } from "@medusajs/framework/types"
import nodemailer, { Transporter } from "nodemailer"

type SmtpOptions = {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
  from: string
  bcc?: string
}

type InjectedDeps = {
  logger: Logger
}

class SmtpNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "smtp"

  private transporter: Transporter
  private from: string
  private bcc: string | undefined
  private logger: Logger

  constructor({ logger }: InjectedDeps, options: SmtpOptions) {
    super()
    this.logger = logger
    this.from = options.from
    this.bcc = options.bcc

    this.transporter = nodemailer.createTransport({
      host: options.host,
      port: options.port,
      secure: options.secure,
      auth: options.user ? { user: options.user, pass: options.pass } : undefined,
    })
  }

  async send(
    notification: NotificationTypes.ProviderSendNotificationDTO
  ): Promise<NotificationTypes.ProviderSendNotificationResultsDTO> {
    const { to, channel, data } = notification

    if (channel !== "email") {
      throw new Error(`Channel "${channel}" not supported. Only "email" is supported.`)
    }

    const { subject, html, text } = data as { subject?: string; html?: string; text?: string }

    const info = await this.transporter.sendMail({
      from: this.from,
      to,
      bcc: this.bcc,
      subject: subject ?? "(no subject)",
      html,
      text,
    })

    this.logger.info(`SMTP email sent to ${to}: ${info.messageId}`)
    return { id: info.messageId }
  }
}

export default SmtpNotificationProviderService
