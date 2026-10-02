import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Envelope } from "@medusajs/icons"
import { Badge, Button, Container, Heading, Select, Table, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { sdk } from "../../lib/client"

/**
 * Email campaign tool (SES) — /app/email-campaign.
 * Lists the test audience (user_type="test") and sends a chosen weekly action
 * to a recipient via POST /admin/weekly-actions/:id/send.
 * Test users come from GET /admin/custom?view=test-recipients (see route note).
 */

type TestUser = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  user_type: string | null
  unsubscribed: boolean
}
type TestUsersResponse = { test_users: TestUser[]; count: number }

type WeeklyAction = {
  id: string
  title: string
  status: "draft" | "planned"
  is_active: boolean
  year: number
  iso_week: number
  items?: unknown[]
}
type WeeklyActionsResponse = { weekly_actions: WeeklyAction[]; count: number }

type OutboxEmail = {
  id: string
  to_email: string
  source_id: string
  status: string
  ses_message_id: string | null
  error: string | null
  generated_at: string | null
  sent_at: string | null
}
type OutboxResponse = { emails: OutboxEmail[]; count: number }

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleString("de-DE") : "—")

const statusColor = (s: string): "green" | "red" | "orange" | "grey" =>
  s === "sent" ? "green" : s === "failed" ? "red" : s === "skipped" ? "grey" : "orange"

const EmailCampaignPage = () => {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ["ec-test-users"],
    queryFn: () =>
      sdk.client.fetch<TestUsersResponse>("/admin/custom", {
        query: { view: "test-recipients" },
      }),
  })

  const { data: waData, isLoading: waLoading } = useQuery({
    queryKey: ["ec-weekly-actions"],
    queryFn: () => sdk.client.fetch<WeeklyActionsResponse>("/admin/weekly-actions"),
  })

  const sendable = useMemo(
    () =>
      (waData?.weekly_actions ?? []).filter(
        (a) => a.status === "planned" && (a.items?.length ?? 0) > 0
      ),
    [waData]
  )

  const [selectedId, setSelectedId] = useState<string>("")
  useEffect(() => {
    if (selectedId || sendable.length === 0) return
    setSelectedId((sendable.find((a) => a.is_active) ?? sendable[0]).id)
  }, [sendable, selectedId])

  // weekly action id → title (to label outbox rows).
  const waById = useMemo(() => {
    const m = new Map<string, WeeklyAction>()
    for (const a of waData?.weekly_actions ?? []) m.set(a.id, a)
    return m
  }, [waData])
  const waLabel = (id: string) => {
    const a = waById.get(id)
    return a ? `${a.title} (KW${a.iso_week}/${a.year})` : id
  }

  // Outbox (ses_emails) for the selected weekly action's test batch.
  const batchId = selectedId ? `test:weekly_action:${selectedId}` : ""
  const { data: outboxData, isLoading: outboxLoading } = useQuery({
    queryKey: ["ec-outbox", batchId],
    queryFn: () =>
      sdk.client.fetch<OutboxResponse>("/admin/ses-emails", { query: { batch_id: batchId } }),
    enabled: !!batchId,
  })

  const generate = useMutation({
    mutationFn: () =>
      sdk.client.fetch<{ total: number; pending: number; skipped: number }>(
        "/admin/ses-emails/generate",
        { method: "POST", body: { source_id: selectedId, source_type: "weekly_action" } }
      ),
    onSuccess: (res) => {
      toast.success(`Generiert: ${res.pending} offen, ${res.skipped} übersprungen (${res.total} gesamt)`)
      queryClient.invalidateQueries({ queryKey: ["ec-outbox", batchId] })
    },
    onError: (err: any) => toast.error(`Generieren fehlgeschlagen: ${err?.message ?? "Fehler"}`),
  })

  const sendOutbox = useMutation({
    mutationFn: (row: OutboxEmail) =>
      sdk.client.fetch<{ status: string }>(`/admin/ses-emails/${row.id}/send`, { method: "POST" }),
    onSuccess: (res, row) => {
      if (res.status === "skipped") toast.warning(`${row.to_email}: übersprungen (abgemeldet)`)
      else toast.success(`Gesendet an ${row.to_email}`)
      queryClient.invalidateQueries({ queryKey: ["ec-outbox", batchId] })
    },
    onError: (err: any, row) => {
      toast.error(`Senden an ${row?.to_email} fehlgeschlagen: ${err?.message ?? "Fehler"}`)
      queryClient.invalidateQueries({ queryKey: ["ec-outbox", batchId] })
    },
  })

  const users = data?.test_users ?? []
  const outbox = outboxData?.emails ?? []

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">E-Mail-Kampagnen</Heading>
      </div>

      {/* Weekly action picker */}
      <div className="px-6 py-4 flex flex-col gap-2 max-w-md">
        <Text size="small" weight="plus">Wochenaktion</Text>
        {waLoading ? (
          <Text className="text-ui-fg-subtle">Lädt…</Text>
        ) : sendable.length === 0 ? (
          <Text className="text-ui-fg-subtle">Keine versandfertige Wochenaktion (geplant + mit Produkten).</Text>
        ) : (
          <Select value={selectedId} onValueChange={setSelectedId}>
            <Select.Trigger>
              <Select.Value placeholder="Wochenaktion wählen" />
            </Select.Trigger>
            <Select.Content>
              {sendable.map((a) => (
                <Select.Item key={a.id} value={a.id}>
                  {a.title} (KW{a.iso_week}/{a.year}){a.is_active ? " · aktiv" : ""}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        )}
        <Button
          size="small"
          className="self-start mt-1"
          disabled={!selectedId || generate.isPending}
          isLoading={generate.isPending}
          onClick={() => generate.mutate()}
        >
          Test-E-Mails für diese Wochenaktion generieren
        </Button>
      </div>

      {/* Test recipients */}
      <div className="px-6 py-4">
        <Text size="small" weight="plus" className="mb-3">
          Testempfänger <span className="text-ui-fg-subtle">(user_type = &quot;test&quot;)</span>
        </Text>

        {isLoading ? (
          <Text className="text-ui-fg-subtle">Lädt…</Text>
        ) : users.length === 0 ? (
          <Text className="text-ui-fg-subtle">Keine Testempfänger gefunden.</Text>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>E-Mail</Table.HeaderCell>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {users.map((user) => (
                <Table.Row key={user.id}>
                  <Table.Cell>{user.email}</Table.Cell>
                  <Table.Cell>
                    {[user.first_name, user.last_name].filter(Boolean).join(" ") || "—"}
                  </Table.Cell>
                  <Table.Cell>
                    {user.unsubscribed ? (
                      <Badge color="red" size="2xsmall">abgemeldet</Badge>
                    ) : (
                      <Badge color="green" size="2xsmall">aktiv</Badge>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>

      {/* Outbox (ses_emails) for the selected weekly action */}
      <div className="px-6 py-4">
        <Text size="small" weight="plus" className="mb-3">
          Generierte E-Mails <span className="text-ui-fg-subtle">(Outbox — ses_emails)</span>
        </Text>
        {!selectedId ? (
          <Text className="text-ui-fg-subtle">Wochenaktion wählen.</Text>
        ) : outboxLoading ? (
          <Text className="text-ui-fg-subtle">Lädt…</Text>
        ) : outbox.length === 0 ? (
          <Text className="text-ui-fg-subtle">Noch nichts generiert — oben auf „E-Mails für Testkunden generieren“ klicken.</Text>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Wochenaktion</Table.HeaderCell>
                <Table.HeaderCell>E-Mail</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Generiert</Table.HeaderCell>
                <Table.HeaderCell>Gesendet</Table.HeaderCell>
                <Table.HeaderCell />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {outbox.map((e) => (
                <Table.Row key={e.id}>
                  <Table.Cell>{waLabel(e.source_id)}</Table.Cell>
                  <Table.Cell>{e.to_email}</Table.Cell>
                  <Table.Cell>
                    <Badge color={statusColor(e.status)} size="2xsmall">{e.status}</Badge>
                  </Table.Cell>
                  <Table.Cell>{fmt(e.generated_at)}</Table.Cell>
                  <Table.Cell>{fmt(e.sent_at)}</Table.Cell>
                  <Table.Cell className="text-right">
                    <Button
                      size="small"
                      variant="secondary"
                      disabled={e.status === "sent" || e.status === "sending" || sendOutbox.isPending}
                      isLoading={sendOutbox.isPending && sendOutbox.variables?.id === e.id}
                      onClick={() => sendOutbox.mutate(e)}
                    >
                      Senden
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "E-Mail-Kampagnen (Prototyp)",
  icon: Envelope,
})

export default EmailCampaignPage
