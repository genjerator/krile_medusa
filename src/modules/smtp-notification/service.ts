import { AbstractNotificationProviderService } from "@medusajs/framework/utils"
import { Logger, NotificationTypes } from "@medusajs/framework/types"
import nodemailer, { Transporter } from "nodemailer"

type SmtpAccount = {
  key: string
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
  from: string
  bcc?: string
}

// Back-compat: the provider used to receive a single flat set of options.
// It now receives `accounts` (one per sending mailbox). If only the flat
// options are present we wrap them into a single "default" account.
type SmtpOptions = Partial<Omit<SmtpAccount, "key">> & {
  accounts?: SmtpAccount[]
}

type InjectedDeps = {
  logger: Logger
}

type ResolvedAccount = { transporter: Transporter; from: string; bcc?: string }

class SmtpNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "smtp"

  private accounts: Map<string, ResolvedAccount> = new Map()
  private defaultKey: string
  private logger: Logger

  constructor({ logger }: InjectedDeps, options: SmtpOptions) {
    super()
    this.logger = logger

    const accountList: SmtpAccount[] =
      options.accounts && options.accounts.length > 0
        ? options.accounts
        : [
            {
              key: "default",
              host: options.host!,
              port: options.port ?? 587,
              secure: options.secure ?? false,
              user: options.user!,
              pass: options.pass!,
              from: options.from!,
              bcc: options.bcc,
            },
          ]

    for (const acct of accountList) {
      this.accounts.set(acct.key, {
        from: acct.from,
        bcc: acct.bcc,
        transporter: nodemailer.createTransport({
          host: acct.host,
          port: acct.port,
          secure: acct.secure,
          auth: acct.user ? { user: acct.user, pass: acct.pass } : undefined,
        }),
      })
    }

    this.defaultKey = accountList[0].key
  }

  async send(
    notification: NotificationTypes.ProviderSendNotificationDTO
  ): Promise<NotificationTypes.ProviderSendNotificationResultsDTO> {
    const { to, channel, data } = notification

    if (channel !== "email") {
      throw new Error(`Channel "${channel}" not supported. Only "email" is supported.`)
    }

    const { subject, html, text, account } = data as {
      subject?: string
      html?: string
      text?: string
      account?: string
    }

    // Pick the sending mailbox by `account` key; fall back to the default.
    const acct =
      (account && this.accounts.get(account)) || this.accounts.get(this.defaultKey)!

    const info = await acct.transporter.sendMail({
      from: acct.from,
      to,
      bcc: acct.bcc,
      subject: subject ?? "(no subject)",
      html,
      text,
    })

    this.logger.info(
      `SMTP email sent to ${to} via "${account || this.defaultKey}": ${info.messageId}`
    )
    return { id: info.messageId }
  }
}

export default SmtpNotificationProviderService
