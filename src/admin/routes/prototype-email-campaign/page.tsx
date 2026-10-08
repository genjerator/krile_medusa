import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Envelope } from "@medusajs/icons"
import { Badge, Button, Checkbox, Container, Heading, Input, Select, Table, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Fragment, useEffect, useMemo, useState } from "react"
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

type Batch = {
  id: string
  audience: string
  source_type: string | null
  source_id: string | null
  status: string
  scheduled_at: string | null
  total: number
  counts: Record<string, number>
}
type BatchesResponse = { batches: Batch[]; count: number }

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleString("de-DE") : "—")

const statusColor = (s: string): "green" | "red" | "orange" | "grey" =>
  s === "sent" ? "green" : s === "failed" ? "red" : s === "skipped" ? "grey" : "orange"

/**
 * The per-recipient outbox for ONE batch (mail-by-mail). Fetches its own rows and
 * sends them individually via the shared /admin/ses-emails/:id/send route. Rendered
 * inline when a batch row is expanded.
 */
const BatchOutbox = ({
  batchId,
  redirectTest,
  testEmail,
}: {
  batchId: string
  redirectTest: boolean
  testEmail: string
}) => {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ["ec-batch-outbox", batchId],
    queryFn: () => sdk.client.fetch<OutboxResponse>("/admin/ses-emails", { query: { batch_id: batchId } }),
  })

  const sendOne = useMutation({
    mutationFn: (row: OutboxEmail) =>
      sdk.client.fetch<{ status: string }>(`/admin/ses-emails/${row.id}/send`, {
        method: "POST",
        body: redirectTest && testEmail.trim() ? { override_to: testEmail.trim() } : {},
      }),
    onSuccess: (res, row) => {
      const dest = redirectTest && testEmail.trim() ? testEmail.trim() : row.to_email
      if (res.status === "skipped") toast.warning(`${row.to_email}: übersprungen (abgemeldet)`)
      else toast.success(`Gesendet an ${dest}`)
      queryClient.invalidateQueries({ queryKey: ["ec-batch-outbox", batchId] })
      queryClient.invalidateQueries({ queryKey: ["ec-batches"] })
    },
    onError: (err: any, row) => {
      toast.error(`Senden an ${row?.to_email} fehlgeschlagen: ${err?.message ?? "Fehler"}`)
      queryClient.invalidateQueries({ queryKey: ["ec-batch-outbox", batchId] })
    },
  })

  const rows = data?.emails ?? []
  if (isLoading) return <Text className="text-ui-fg-subtle px-6 py-3">Lädt…</Text>
  if (rows.length === 0) return <Text className="text-ui-fg-subtle px-6 py-3">Keine Empfänger in diesem Batch.</Text>

  return (
    <div className="bg-ui-bg-subtle px-6 py-3">
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>E-Mail</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Gesendet</Table.HeaderCell>
            <Table.HeaderCell />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((e) => (
            <Table.Row key={e.id}>
              <Table.Cell>{e.to_email}</Table.Cell>
              <Table.Cell>
                <Badge color={statusColor(e.status)} size="2xsmall">{e.status}</Badge>
              </Table.Cell>
              <Table.Cell>{fmt(e.sent_at)}</Table.Cell>
              <Table.Cell className="text-right">
                <Button
                  size="small"
                  variant="secondary"
                  disabled={e.status === "sent" || e.status === "sending" || sendOne.isPending}
                  isLoading={sendOne.isPending && sendOne.variables?.id === e.id}
                  onClick={() => sendOne.mutate(e)}
                >
                  Senden
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  )
}

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

  // Test override: when on, every send is redirected to this inbox.
  const [redirectTest, setRedirectTest] = useState(true)
  const [testEmail, setTestEmail] = useState("e.medjesi@gmail.com")

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
      sdk.client.fetch<{ status: string }>(`/admin/ses-emails/${row.id}/send`, {
        method: "POST",
        body: redirectTest && testEmail.trim() ? { override_to: testEmail.trim() } : {},
      }),
    onSuccess: (res, row) => {
      const dest = redirectTest && testEmail.trim() ? testEmail.trim() : row.to_email
      if (res.status === "skipped") toast.warning(`${row.to_email}: übersprungen (abgemeldet)`)
      else toast.success(`Gesendet an ${dest}`)
      queryClient.invalidateQueries({ queryKey: ["ec-outbox", batchId] })
    },
    onError: (err: any, row) => {
      toast.error(`Senden an ${row?.to_email} fehlgeschlagen: ${err?.message ?? "Fehler"}`)
      queryClient.invalidateQueries({ queryKey: ["ec-outbox", batchId] })
    },
  })

  // Campaign batches (the "ramp" segment built by seed-campaign-batches).
  const { data: batchesData, isLoading: batchesLoading } = useQuery({
    queryKey: ["ec-batches"],
    queryFn: () => sdk.client.fetch<BatchesResponse>("/admin/ses-batches", { query: { audience: "ramp" } }),
  })
  const batches = batchesData?.batches ?? []
  const [expanded, setExpanded] = useState<string | null>(null)

  const assignBatch = useMutation({
    mutationFn: (b: Batch) =>
      sdk.client.fetch<{ updated_rows: number }>(`/admin/ses-batches/${b.id}/assign`, {
        method: "POST",
        body: { source_id: selectedId, source_type: "weekly_action" },
      }),
    onSuccess: (res, b) => {
      toast.success(`${b.audience}: „${waLabel(selectedId)}“ zugewiesen (${res.updated_rows} Empfänger)`)
      queryClient.invalidateQueries({ queryKey: ["ec-batches"] })
    },
    onError: (err: any, b) => toast.error(`${b.audience}: Zuweisen fehlgeschlagen: ${err?.message ?? "Fehler"}`),
  })

  const sendBatch = useMutation({
    mutationFn: (b: Batch) =>
      sdk.client.fetch<{ sent: number; skipped: number; failed: number; processed: number }>(
        `/admin/ses-batches/${b.id}/send`,
        { method: "POST", body: redirectTest && testEmail.trim() ? { override_to: testEmail.trim() } : {} }
      ),
    onSuccess: (res, b) => {
      toast.success(`${b.audience}: ${res.sent} gesendet, ${res.skipped} übersprungen, ${res.failed} Fehler`)
      queryClient.invalidateQueries({ queryKey: ["ec-batches"] })
      queryClient.invalidateQueries({ queryKey: ["ec-batch-outbox", b.id] })
    },
    onError: (err: any, b) => {
      toast.error(`${b.audience}: Senden fehlgeschlagen: ${err?.message ?? "Fehler"}`)
      queryClient.invalidateQueries({ queryKey: ["ec-batches"] })
    },
  })

  const confirmSendBatch = (b: Batch) => {
    const pending = b.counts.pending ?? 0
    const dest = redirectTest && testEmail.trim() ? `Testadresse ${testEmail.trim()}` : "die echten Empfänger"
    if (window.confirm(`Ganzen Batch „${b.audience}“ senden?\n\n${pending} offene E-Mail(s) → ${dest}.`)) {
      sendBatch.mutate(b)
    }
  }

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

        {/* Test override: force every "Senden" to one inbox (for testing). */}
        <div className="mb-3 flex items-center gap-x-2">
          <Checkbox
            id="redirect-test"
            checked={redirectTest}
            onCheckedChange={(v) => setRedirectTest(v === true)}
          />
          <label htmlFor="redirect-test" className="text-ui-fg-subtle text-sm">
            Test: alle E-Mails an diese Adresse senden
          </label>
          <Input
            size="small"
            type="email"
            value={testEmail}
            disabled={!redirectTest}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="test@example.com"
            className="w-64"
          />
        </div>
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

      {/* Campaign batches (ramp segment) — generate with seed-campaign-batches.ts */}
      <div className="px-6 py-4">
        <Text size="small" weight="plus" className="mb-1">
          Kampagnen-Batches <span className="text-ui-fg-subtle">(Segment „ramp“ — ses_batch)</span>
        </Text>
        <Text size="small" leading="compact" className="text-ui-fg-subtle mb-3">
          Nach Engagement sortiert (beste zuerst). Erst eine Wochenaktion zuweisen, dann den ganzen Batch
          senden oder einzeln aufklappen. Der Test-Umleitungsschalter oben gilt auch hier.
        </Text>

        {batchesLoading ? (
          <Text className="text-ui-fg-subtle">Lädt…</Text>
        ) : batches.length === 0 ? (
          <Text className="text-ui-fg-subtle">
            Keine Batches — zuerst seed-campaign-batches.ts ausführen.
          </Text>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Batch</Table.HeaderCell>
                <Table.HeaderCell>Kampagne</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Empfänger</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Offen</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Gesendet</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Fehler</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Überspr.</Table.HeaderCell>
                <Table.HeaderCell />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {batches.map((b) => {
                const assigned = !!b.source_id
                const pending = b.counts.pending ?? 0
                const isExpanded = expanded === b.id
                return (
                  <Fragment key={b.id}>
                    <Table.Row>
                      <Table.Cell>{b.audience}</Table.Cell>
                      <Table.Cell>
                        {assigned ? (
                          waLabel(b.source_id as string)
                        ) : (
                          <Badge color="orange" size="2xsmall">nicht zugewiesen</Badge>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color={statusColor(b.status)} size="2xsmall">{b.status}</Badge>
                      </Table.Cell>
                      <Table.Cell className="text-right">{b.total}</Table.Cell>
                      <Table.Cell className="text-right">{pending}</Table.Cell>
                      <Table.Cell className="text-right">{b.counts.sent ?? 0}</Table.Cell>
                      <Table.Cell className="text-right">{b.counts.failed ?? 0}</Table.Cell>
                      <Table.Cell className="text-right">{b.counts.skipped ?? 0}</Table.Cell>
                      <Table.Cell className="text-right">
                        <div className="flex items-center justify-end gap-x-2">
                          {!assigned ? (
                            <Button
                              size="small"
                              variant="secondary"
                              disabled={!selectedId || (assignBatch.isPending && assignBatch.variables?.id === b.id)}
                              isLoading={assignBatch.isPending && assignBatch.variables?.id === b.id}
                              onClick={() => assignBatch.mutate(b)}
                            >
                              Wochenaktion zuweisen
                            </Button>
                          ) : (
                            <Button
                              size="small"
                              disabled={pending === 0 || (sendBatch.isPending && sendBatch.variables?.id === b.id)}
                              isLoading={sendBatch.isPending && sendBatch.variables?.id === b.id}
                              onClick={() => confirmSendBatch(b)}
                            >
                              Ganzen Batch senden
                            </Button>
                          )}
                          <Button
                            size="small"
                            variant="transparent"
                            onClick={() => setExpanded(isExpanded ? null : b.id)}
                          >
                            {isExpanded ? "Verbergen" : "Anzeigen"}
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                    {isExpanded && (
                      <Table.Row key={`${b.id}-rows`}>
                        <Table.Cell colSpan={9} className="p-0">
                          <BatchOutbox batchId={b.id} redirectTest={redirectTest} testEmail={testEmail} />
                        </Table.Cell>
                      </Table.Row>
                    )}
                  </Fragment>
                )
              })}
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
