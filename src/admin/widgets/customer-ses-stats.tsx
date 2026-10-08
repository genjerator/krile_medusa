import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Badge, Container, Table, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../lib/client"

type SesStats = {
  campaigns_total: number
  campaigns_sent: number
  campaigns_delivered: number
  campaigns_opened: number
  campaigns_clicked: number
  bounced: number
  complained: number
  open_rate: number
  click_rate: number
  unsubscribed: boolean
  last_opened_at: string | null
  last_clicked_at: string | null
}

type RecentCampaign = {
  campaign_id: string
  sent_at: string | null
  opened_at: string | null
  clicked_at: string | null
  bounced_at: string | null
}

type Result = { stats: SesStats; recent: RecentCampaign[] }

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

const fmtDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("de-DE") : "—"

const CustomerSesWidget = ({ data }: { data: { id: string } }) => {
  const { data: result, isLoading } = useQuery({
    queryKey: ["customer-ses-stats", data.id],
    queryFn: () => sdk.client.fetch<Result>(`/admin/customers/${data.id}/ses-stats`),
    enabled: !!data?.id,
  })

  const stats = result?.stats
  const recent = result?.recent ?? []
  const hasData = !!stats && stats.campaigns_total > 0

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          SES E-Mail-Statistik <span className="text-ui-fg-subtle">(Kampagnen)</span>
        </Text>
        <div className="flex gap-2">
          {stats &&
            (stats.unsubscribed ? (
              <Badge size="2xsmall" color="orange">Abgemeldet</Badge>
            ) : (
              <Badge size="2xsmall" color="green">Angemeldet</Badge>
            ))}
          {stats && stats.bounced > 0 && <Badge size="2xsmall" color="red">Bounce</Badge>}
          {stats && stats.complained > 0 && <Badge size="2xsmall" color="red">Beschwerde</Badge>}
        </div>
      </div>

      <div className="px-6 py-4">
        {isLoading ? (
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Lädt…
          </Text>
        ) : !hasData ? (
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Noch keine SES-Kampagnen an diesen Kunden gesendet.
          </Text>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Rate label="Öffnungsrate" value={stats.open_rate} />
              <Rate label="Klickrate" value={stats.click_rate} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1">
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                Kampagnen gesendet: {stats.campaigns_sent}
              </Text>
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                Zugestellt: {stats.campaigns_delivered}
              </Text>
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                Geöffnet: {stats.campaigns_opened}
              </Text>
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                Geklickt: {stats.campaigns_clicked}
              </Text>
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                Letzte Öffnung: {fmtDate(stats.last_opened_at)}
              </Text>
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                Letzter Klick: {fmtDate(stats.last_clicked_at)}
              </Text>
            </div>

            {recent.length > 0 && (
              <div className="mt-4">
                <Text size="small" leading="compact" weight="plus" className="mb-2">
                  Letzte Kampagnen
                </Text>
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>Kampagne</Table.HeaderCell>
                      <Table.HeaderCell>Gesendet</Table.HeaderCell>
                      <Table.HeaderCell>Geöffnet</Table.HeaderCell>
                      <Table.HeaderCell>Geklickt</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {recent.map((c) => (
                      <Table.Row key={c.campaign_id}>
                        <Table.Cell className="font-mono text-xs">{c.campaign_id}</Table.Cell>
                        <Table.Cell>{fmtDate(c.sent_at)}</Table.Cell>
                        <Table.Cell>
                          {c.opened_at ? (
                            <Badge size="2xsmall" color="green">{fmtDate(c.opened_at)}</Badge>
                          ) : (
                            "—"
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          {c.clicked_at ? (
                            <Badge size="2xsmall" color="green">{fmtDate(c.clicked_at)}</Badge>
                          ) : (
                            "—"
                          )}
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            )}
          </>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "customer.details.after",
})

export default CustomerSesWidget
