import { defineRouteConfig } from "@medusajs/admin-sdk"
import { DocumentText } from "@medusajs/icons"
import { Badge, Container, Heading, Input, Select, Table, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { sdk } from "../../lib/client"

const PAGE_SIZE = 20

type Source = "brevo" | "ses"

type WebhookLog = {
  id: string
  event: string | null
  email: string | null
  campaign_id: number | string | null
  matched: boolean
  created_at: string
  // SES only: the clicked URL and the product handle parsed from it (Click events).
  link?: string | null
  product?: string | null
}

type LogsResponse = {
  logs: WebhookLog[]
  count: number
  limit: number
  offset: number
}

const SOURCES: Record<Source, { label: string; endpoint: string; note: string }> = {
  ses: {
    label: "SES (Kampagnen)",
    endpoint: "/admin/ses-event-logs",
    note: "empfangene SES-Ereignisse (Öffnen/Klick/Zustellung/Bounce) — neueste zuerst",
  },
  brevo: {
    label: "Brevo",
    endpoint: "/admin/brevo-webhook-logs",
    note: "empfangene Brevo-Ereignisse (30 Tage Aufbewahrung) — neueste zuerst",
  },
}

const formatDateTime = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString("de-DE") : "—"

const BrevoWebhookLogsPage = () => {
  const [source, setSource] = useState<Source>("ses")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ["webhook-logs", source, search, page],
    queryFn: () =>
      sdk.client.fetch<LogsResponse>(SOURCES[source].endpoint, {
        query: { q: search, limit: PAGE_SIZE, offset: page * PAGE_SIZE },
      }),
  })

  const rows = data?.logs ?? []
  const count = data?.count ?? 0
  const pageCount = Math.max(Math.ceil(count / PAGE_SIZE), 1)

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Webhook Logs</Heading>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            {count} {SOURCES[source].note}
          </Text>
        </div>
        <div className="flex items-center gap-x-2">
          <Select
            value={source}
            onValueChange={(v) => {
              setSource(v as Source)
              setPage(0)
            }}
          >
            <Select.Trigger className="w-44">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {(Object.keys(SOURCES) as Source[]).map((s) => (
                <Select.Item key={s} value={s}>
                  {SOURCES[s].label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          <Input
            size="small"
            type="search"
            placeholder="E-Mail suchen…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(0)
            }}
            className="max-w-60"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="px-6 py-4">
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Lädt…
          </Text>
        </div>
      ) : rows.length === 0 ? (
        <div className="px-6 py-4">
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Noch keine Webhook-Ereignisse empfangen.
          </Text>
        </div>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Zeitpunkt</Table.HeaderCell>
              <Table.HeaderCell>Ereignis</Table.HeaderCell>
              <Table.HeaderCell>E-Mail</Table.HeaderCell>
              <Table.HeaderCell className="text-right">Kampagne</Table.HeaderCell>
              {source === "ses" && <Table.HeaderCell>Ziel / Produkt</Table.HeaderCell>}
              <Table.HeaderCell>Kunde zugeordnet</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.map((row) => (
              <Table.Row key={row.id}>
                <Table.Cell className="whitespace-nowrap">
                  {formatDateTime(row.created_at)}
                </Table.Cell>
                <Table.Cell>{row.event ?? "—"}</Table.Cell>
                <Table.Cell>{row.email ?? "—"}</Table.Cell>
                <Table.Cell className="text-right">
                  {row.campaign_id ?? "—"}
                </Table.Cell>
                {source === "ses" && (
                  <Table.Cell>
                    {row.link ? (
                      <a
                        href={row.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-ui-fg-interactive hover:underline"
                        title={row.link}
                      >
                        {row.product ?? row.link}
                      </a>
                    ) : (
                      "—"
                    )}
                  </Table.Cell>
                )}
                <Table.Cell>
                  {row.matched ? (
                    <Badge size="2xsmall" color="green">
                      Ja
                    </Badge>
                  ) : (
                    <Badge size="2xsmall" color="grey">
                      Nein
                    </Badge>
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      {pageCount > 1 && (
        <Table.Pagination
          count={count}
          pageSize={PAGE_SIZE}
          pageIndex={page}
          pageCount={pageCount}
          canPreviousPage={page > 0}
          canNextPage={page < pageCount - 1}
          previousPage={() => setPage((p) => Math.max(p - 1, 0))}
          nextPage={() => setPage((p) => Math.min(p + 1, pageCount - 1))}
        />
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Webhook Logs (Brevo/SES)",
  icon: DocumentText,
})

export default BrevoWebhookLogsPage
