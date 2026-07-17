import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { ArrowPath } from "@medusajs/icons"
import { Badge, Button, Container, Input, Table, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Link } from "react-router-dom"
import { sdk } from "../lib/client"

const PAGE_SIZE = 10

type BrevoRow = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  company_name: string | null
  created_at: string
  brevo: {
    campaigns_sent: number
    campaigns_opened: number
    campaigns_clicked: number
    hard_bounces: number
    soft_bounces: number
    open_rate: number
    click_rate: number
    unsubscribed: boolean
    blacklisted: boolean
    synced_at: string
  }
}

type BrevoOverviewResponse = {
  customers: BrevoRow[]
  count: number
  limit: number
  offset: number
}

type SortKey = "email" | "campaigns" | "opened" | "clicks" | "bounces" | "created" | "synced"

const formatDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("de-DE") : "—"

// The Medusa JS SDK throws on non-2xx, but the error shape varies: the parsed
// JSON body may sit on the error itself or under `.response.data`. Dig out our
// `{ message, detail }` from wherever it landed so the real reason is shown.
const extractError = (err: unknown): { message: string; detail?: string } => {
  const e = err as Record<string, any> | undefined
  const body = e?.response?.data ?? e?.data ?? e ?? {}
  const message =
    body.message ||
    e?.message ||
    "Unbekannter Fehler. Bitte später erneut versuchen."
  const detail = typeof body.detail === "string" ? body.detail : undefined
  return { message, detail }
}

const BrevoOverviewWidget = () => {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const [order, setOrder] = useState<SortKey>("clicks")
  const [dir, setDir] = useState<"asc" | "desc">("desc")
  const queryClient = useQueryClient()

  const syncMutation = useMutation({
    mutationFn: () =>
      sdk.client.fetch("/admin/brevo-overview/sync", { method: "POST" }),
    onSuccess: () => {
      toast.info("Brevo-Sync gestartet", {
        description:
          "Der Abgleich läuft im Hintergrund und kann einige Minuten dauern. Aktualisieren Sie die Seite später, um die neuen Werte zu sehen.",
      })
      // Give the background sync a head start, then refresh the list.
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["brevo-overview"] })
      }, 60000)
    },
    onError: (err: unknown) => {
      const { message, detail } = extractError(err)
      toast.error("Brevo-Sync fehlgeschlagen", {
        description: detail ? `${message}\n\n${detail}` : message,
        duration: 15000,
      })
    },
  })

  const toggleSort = (key: SortKey) => {
    if (order === key) {
      setDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setOrder(key)
      setDir(key === "email" ? "asc" : "desc")
    }
    setPage(0)
  }

  const { data, isLoading } = useQuery({
    queryKey: ["brevo-overview", search, page, order, dir],
    queryFn: () =>
      sdk.client.fetch<BrevoOverviewResponse>("/admin/brevo-overview", {
        query: { q: search, limit: PAGE_SIZE, offset: page * PAGE_SIZE, order, dir },
      }),
  })

  const rows = data?.customers ?? []
  const count = data?.count ?? 0
  const pageCount = Math.max(Math.ceil(count / PAGE_SIZE), 1)

  const SortHeader = ({
    label,
    sortKey,
    align,
  }: {
    label: string
    sortKey: SortKey
    align?: "right"
  }) => (
    <Table.HeaderCell
      className={`cursor-pointer select-none whitespace-nowrap ${align === "right" ? "text-right" : ""}`}
      onClick={() => toggleSort(sortKey)}
    >
      {label}
      {order === sortKey ? (dir === "asc" ? " ▲" : " ▼") : ""}
    </Table.HeaderCell>
  )

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Text size="small" leading="compact" weight="plus">
            Brevo Übersicht
          </Text>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            {count} Kunden mit synchronisierten E-Mail-Statistiken — zum Sortieren
            Spaltenkopf anklicken
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <Input
            size="small"
            type="search"
            placeholder="Suchen…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(0)
            }}
            className="max-w-52"
          />
          <Button
            size="small"
            variant="secondary"
            onClick={() => syncMutation.mutate()}
            isLoading={syncMutation.isPending}
          >
            <ArrowPath /> Mit Brevo synchronisieren
          </Button>
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
            Noch keine Brevo-Daten synchronisiert.
          </Text>
        </div>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <SortHeader label="Kunde" sortKey="email" />
              <SortHeader label="Kampagnen" sortKey="campaigns" align="right" />
              <SortHeader label="Geöffnet" sortKey="opened" align="right" />
              <SortHeader label="Klicks" sortKey="clicks" align="right" />
              <SortHeader label="Bounces" sortKey="bounces" align="right" />
              <SortHeader label="Kunde seit" sortKey="created" />
              <SortHeader label="Brevo aktualisiert" sortKey="synced" />
              <Table.HeaderCell>Status</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.map((row) => {
              const name =
                [row.first_name, row.last_name].filter(Boolean).join(" ") ||
                row.company_name ||
                "—"
              return (
                <Table.Row key={row.id}>
                  <Table.Cell>
                    <Link to={`/customers/${row.id}`} className="hover:underline">
                      <Text size="small" leading="compact">
                        {row.email}
                      </Text>
                      <Text size="xsmall" leading="compact" className="text-ui-fg-subtle">
                        {name}
                      </Text>
                    </Link>
                  </Table.Cell>
                  <Table.Cell className="text-right">{row.brevo.campaigns_sent}</Table.Cell>
                  <Table.Cell className="text-right">
                    {row.brevo.campaigns_opened} ({row.brevo.open_rate}%)
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    {row.brevo.campaigns_clicked} ({row.brevo.click_rate}%)
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    {row.brevo.hard_bounces + row.brevo.soft_bounces}
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap">
                    {formatDate(row.created_at)}
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap">
                    {formatDate(row.brevo.synced_at)}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-1">
                      {row.brevo.unsubscribed && (
                        <Badge size="2xsmall" color="orange">
                          Abgemeldet
                        </Badge>
                      )}
                      {row.brevo.blacklisted && (
                        <Badge size="2xsmall" color="red">
                          Blockiert
                        </Badge>
                      )}
                      {row.brevo.hard_bounces > 0 && (
                        <Badge size="2xsmall" color="red">
                          Bounce
                        </Badge>
                      )}
                      {!row.brevo.unsubscribed &&
                        !row.brevo.blacklisted &&
                        row.brevo.hard_bounces === 0 && (
                          <Badge size="2xsmall" color="green">
                            Aktiv
                          </Badge>
                        )}
                    </div>
                  </Table.Cell>
                </Table.Row>
              )
            })}
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

export const config = defineWidgetConfig({
  zone: "customer.list.before",
})

export default BrevoOverviewWidget
