import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Badge, Container, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../lib/client"

type BrevoStats = {
  campaigns_sent: number
  campaigns_opened: number
  total_opens: number
  campaigns_clicked: number
  hard_bounces: number
  soft_bounces: number
  open_rate: number
  click_rate: number
  bounce_rate: number
  unsubscribed: boolean
  blacklisted: boolean
  last_email_at: string | null
  synced_at: string
}

const Rate = ({ label, value }: { label: string; value: number }) => (
  <div className="flex flex-col items-center rounded-md bg-ui-bg-subtle px-4 py-3">
    <Text size="xlarge" weight="plus" leading="compact">
      {value}%
    </Text>
    <Text size="small" leading="compact" className="text-ui-fg-subtle">
      {label}
    </Text>
  </div>
)

const CustomerBrevoWidget = ({ data }: { data: { id: string } }) => {
  // Display query on mount — survives page refreshes independent of the
  // customer object the page passes in.
  const { data: result, isLoading } = useQuery({
    queryKey: ["customer-brevo-stats", data.id],
    queryFn: () => sdk.admin.customer.retrieve(data.id, { fields: "id,metadata" }),
    enabled: !!data?.id,
  })

  const brevo = result?.customer?.metadata?.brevo as BrevoStats | undefined

  const formatDate = (iso: string | null | undefined) =>
    iso ? new Date(iso).toLocaleDateString("de-DE") : "—"

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          Brevo E-Mail-Statistik
        </Text>
        <div className="flex gap-2">
          {brevo &&
            (brevo.unsubscribed ? (
              <Badge size="2xsmall" color="orange">Abgemeldet</Badge>
            ) : (
              <Badge size="2xsmall" color="green">Angemeldet</Badge>
            ))}
          {brevo?.blacklisted && <Badge size="2xsmall" color="red">Blockiert</Badge>}
          {brevo && brevo.hard_bounces > 0 && (
            <Badge size="2xsmall" color="red">Hard Bounce</Badge>
          )}
        </div>
      </div>

      <div className="px-6 py-4">
        {isLoading ? (
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Lädt…
          </Text>
        ) : !brevo ? (
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Noch keine Brevo-Daten synchronisiert.
          </Text>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              <Rate label="Öffnungsrate" value={brevo.open_rate} />
              <Rate label="Klickrate" value={brevo.click_rate} />
              <Rate label="Bounce-Rate" value={brevo.bounce_rate} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1">
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                Kampagnen erhalten: {brevo.campaigns_sent}
              </Text>
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                Geöffnet: {brevo.campaigns_opened} ({brevo.total_opens} Öffnungen)
              </Text>
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                Geklickt: {brevo.campaigns_clicked}
              </Text>
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                Bounces: {brevo.hard_bounces} hart / {brevo.soft_bounces} weich
              </Text>
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                Abgemeldet: {brevo.unsubscribed ? "Ja" : "Nein"}
              </Text>
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                Letzte Kampagne: {formatDate(brevo.last_email_at)}
              </Text>
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                Zuletzt synchronisiert: {formatDate(brevo.synced_at)}
              </Text>
            </div>
          </>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "customer.details.after",
})

export default CustomerBrevoWidget
