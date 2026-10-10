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
  group_name?: string | null
}
type BatchesResponse = { batches: Batch[]; count: number }

type CustomerList = {
  id: string
  name: string
  members: number
  eligible: number
  unsubscribed: number
  no_email: number
  created_at: string
}
type CustomerListsResponse = { lists: CustomerList[]; count: number }

const SEGMENT_RULE_OPTIONS = [
  { value: "all", label: "Alle (berechtigten) Kunden" },
  { value: "clicked", label: "Hat (Brevo) geklickt" },
  { value: "opened", label: "Hat (Brevo) geöffnet" },
  { value: "buyer", label: "Hat bestellt" },
  { value: "rest", label: "Rest (keine Aktivität)" },
  { value: "user_type:test", label: "Testempfänger (user_type=test)" },
]

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
      queryClient.invalidateQueries({ queryKey: ["ec-test-batch"] })
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

/**
 * Customer lists = native customer groups used as email audiences. For the selected
 * weekly action you generate a send batch per list (POST /admin/ses-emails/generate
 * with group_id) and send it (POST /admin/ses-batches/:id/send). Membership is
 * managed in the native admin (Customers → Groups) or built by rule via
 * POST /admin/customer-lists/from-segment.
 */
const CustomerListsSection = ({
  selectedId,
  waLabel,
  redirectTest,
  testEmail,
}: {
  selectedId: string
  waLabel: (id: string) => string
  redirectTest: boolean
  testEmail: string
}) => {
  const queryClient = useQueryClient()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [newName, setNewName] = useState("")
  const [newRule, setNewRule] = useState("all")

  const { data: listsData, isLoading } = useQuery({
    queryKey: ["ec-customer-lists"],
    queryFn: () => sdk.client.fetch<CustomerListsResponse>("/admin/customer-lists"),
  })
  const lists = listsData?.lists ?? []

  const { data: groupBatchesData } = useQuery({
    queryKey: ["ec-group-batches"],
    queryFn: () => sdk.client.fetch<BatchesResponse>("/admin/ses-batches", { query: { audience: "groups" } }),
  })
  // audience "group:<id>" → batch, so each list row can show its generated batch.
  const batchByGroup = useMemo(() => {
    const m = new Map<string, Batch>()
    for (const b of groupBatchesData?.batches ?? []) {
      if (b.audience.startsWith("group:")) m.set(b.audience.slice("group:".length), b)
    }
    return m
  }, [groupBatchesData])

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["ec-customer-lists"] })
    queryClient.invalidateQueries({ queryKey: ["ec-group-batches"] })
  }

  const createList = useMutation({
    mutationFn: () =>
      sdk.client.fetch<{ name: string; added: number; total: number }>(
        "/admin/customer-lists/from-segment",
        { method: "POST", body: { name: newName.trim(), rule: newRule } }
      ),
    onSuccess: (res) => {
      toast.success(`Liste „${res.name}“: ${res.added} hinzugefügt (${res.total} gesamt)`)
      setNewName("")
      invalidate()
    },
    onError: (err: any) => toast.error(`Liste erstellen fehlgeschlagen: ${err?.message ?? "Fehler"}`),
  })

  const generate = useMutation({
    mutationFn: (list: CustomerList) =>
      sdk.client.fetch<{ pending: number; skipped: number; total: number }>(
        "/admin/ses-emails/generate",
        { method: "POST", body: { source_id: selectedId, source_type: "weekly_action", group_id: list.id } }
      ),
    onSuccess: (res, list) => {
      toast.success(`${list.name}: ${res.pending} offen, ${res.skipped} übersprungen (${res.total} gesamt)`)
      invalidate()
    },
    onError: (err: any, list) => toast.error(`${list.name}: Generieren fehlgeschlagen: ${err?.message ?? "Fehler"}`),
  })

  const sendBatch = useMutation({
    mutationFn: (batch: Batch) =>
      sdk.client.fetch<{ sent: number; skipped: number; failed: number }>(
        `/admin/ses-batches/${batch.id}/send`,
        { method: "POST", body: redirectTest && testEmail.trim() ? { override_to: testEmail.trim() } : {} }
      ),
    onSuccess: (res, batch) => {
      toast.success(`Liste gesendet: ${res.sent} gesendet, ${res.skipped} übersprungen, ${res.failed} Fehler`)
      invalidate()
      queryClient.invalidateQueries({ queryKey: ["ec-batch-outbox", batch.id] })
    },
    onError: (err: any) => toast.error(`Senden fehlgeschlagen: ${err?.message ?? "Fehler"}`),
  })

  const confirmGenerate = (list: CustomerList) => {
    if (!selectedId) {
      toast.error("Zuerst eine Wochenaktion wählen.")
      return
    }
    generate.mutate(list)
  }

  const confirmSend = (list: CustomerList, batch: Batch) => {
    const pending = batch.counts.pending ?? 0
    const dest = redirectTest && testEmail.trim() ? `Testadresse ${testEmail.trim()}` : "die echten Empfänger"
    if (window.confirm(`Liste „${list.name}“ senden?\n\n${pending} offene E-Mail(s) → ${dest}.`)) {
      sendBatch.mutate(batch)
    }
  }

  return (
    <div className="px-6 py-4">
      <Text size="small" weight="plus" className="mb-1">
        Kundenlisten <span className="text-ui-fg-subtle">(Kundengruppen als Verteiler)</span>
      </Text>
      <Text size="small" leading="compact" className="text-ui-fg-subtle mb-3">
        Eine Liste ist eine Kundengruppe. Wähle oben eine Wochenaktion, „Generieren“ erzeugt die Sendung
        für eine Liste, „Senden“ verschickt sie. Mitglieder pflegst du im normalen Admin unter
        Kunden → Gruppen, oder du baust eine Liste per Regel unten. Der Test-Umleitungsschalter oben gilt auch hier.
      </Text>

      {/* Build a list by rule */}
      <div className="flex flex-wrap items-end gap-2 mb-4">
        <div className="flex flex-col gap-1">
          <Text size="xsmall" className="text-ui-fg-subtle">Neue Liste (Name)</Text>
          <Input
            size="small"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="z. B. Segment: Klicker"
            className="w-64"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Text size="xsmall" className="text-ui-fg-subtle">Regel</Text>
          <Select value={newRule} onValueChange={setNewRule}>
            <Select.Trigger className="w-64">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {SEGMENT_RULE_OPTIONS.map((o) => (
                <Select.Item key={o.value} value={o.value}>{o.label}</Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
        <Button
          size="small"
          variant="secondary"
          disabled={!newName.trim() || createList.isPending}
          isLoading={createList.isPending}
          onClick={() => createList.mutate()}
        >
          Liste aus Regel erstellen
        </Button>
      </div>

      {isLoading ? (
        <Text className="text-ui-fg-subtle">Lädt…</Text>
      ) : lists.length === 0 ? (
        <Text className="text-ui-fg-subtle">
          Keine Kundengruppen — eine Liste oben per Regel erstellen oder im Admin unter Kunden → Gruppen anlegen.
        </Text>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Liste</Table.HeaderCell>
              <Table.HeaderCell>Kampagne</Table.HeaderCell>
              <Table.HeaderCell className="text-right">Mitglieder</Table.HeaderCell>
              <Table.HeaderCell className="text-right">Berechtigt</Table.HeaderCell>
              <Table.HeaderCell className="text-right">Abgemeldet</Table.HeaderCell>
              <Table.HeaderCell className="text-right">Offen</Table.HeaderCell>
              <Table.HeaderCell className="text-right">Gesendet</Table.HeaderCell>
              <Table.HeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {lists.map((list) => {
              const batch = batchByGroup.get(list.id)
              const pending = batch?.counts.pending ?? 0
              const isExpanded = batch ? expanded === batch.id : false
              return (
                <Fragment key={list.id}>
                  <Table.Row>
                    <Table.Cell>{list.name}</Table.Cell>
                    <Table.Cell>
                      {batch?.source_id ? (
                        waLabel(batch.source_id)
                      ) : (
                        <Badge color="grey" size="2xsmall">nicht generiert</Badge>
                      )}
                    </Table.Cell>
                    <Table.Cell className="text-right">{list.members}</Table.Cell>
                    <Table.Cell className="text-right">{list.eligible}</Table.Cell>
                    <Table.Cell className="text-right">{list.unsubscribed}</Table.Cell>
                    <Table.Cell className="text-right">{batch ? pending : "—"}</Table.Cell>
                    <Table.Cell className="text-right">{batch?.counts.sent ?? "—"}</Table.Cell>
                    <Table.Cell className="text-right">
                      <div className="flex items-center justify-end gap-x-2">
                        <Button
                          size="small"
                          variant="secondary"
                          disabled={!selectedId || list.eligible === 0 || (generate.isPending && generate.variables?.id === list.id)}
                          isLoading={generate.isPending && generate.variables?.id === list.id}
                          onClick={() => confirmGenerate(list)}
                        >
                          {batch ? "Neu generieren" : "Generieren"}
                        </Button>
                        <Button
                          size="small"
                          disabled={!batch || pending === 0 || (sendBatch.isPending && sendBatch.variables?.id === batch?.id)}
                          isLoading={!!batch && sendBatch.isPending && sendBatch.variables?.id === batch.id}
                          onClick={() => batch && confirmSend(list, batch)}
                        >
                          Senden
                        </Button>
                        <Button
                          size="small"
                          variant="transparent"
                          disabled={!batch}
                          onClick={() => batch && setExpanded(isExpanded ? null : batch.id)}
                        >
                          {isExpanded ? "Verbergen" : "Anzeigen"}
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                  {batch && isExpanded && (
                    <Table.Row key={`${batch.id}-rows`}>
                      <Table.Cell colSpan={8} className="p-0">
                        <BatchOutbox batchId={batch.id} redirectTest={redirectTest} testEmail={testEmail} />
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
  )
}

type LinkClick = { link: string; clicks: number; unique_recipients: number }
type LinkClicksResponse = {
  campaign_id: string | null
  links: LinkClick[]
  total_clicks: number
  unique_clickers: number
}

/**
 * Per-link click report for the selected weekly action (campaign). Reads
 * GET /admin/ses-link-clicks?campaign_id=<id>, which aggregates SES Click events
 * from ses_event_log by URL. "unique" = distinct recipients (the honest signal;
 * raw clicks can be inflated by scanners / Apple MPP).
 */
const LinkClicksSection = ({
  campaignId,
  campaignLabel,
}: {
  campaignId: string
  campaignLabel: string
}) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["ec-link-clicks", campaignId],
    queryFn: () =>
      sdk.client.fetch<LinkClicksResponse>("/admin/ses-link-clicks", { query: { campaign_id: campaignId } }),
    enabled: !!campaignId,
  })
  const links = data?.links ?? []

  return (
    <div className="px-6 py-4">
      <Text size="small" weight="plus" className="mb-1">
        Link-Klicks <span className="text-ui-fg-subtle">(welche Links in der E-Mail geklickt wurden)</span>
      </Text>
      <Text size="small" leading="compact" className="text-ui-fg-subtle mb-3">
        Für die gewählte Wochenaktion{campaignId ? ` „${campaignLabel}“` : ""}. „Eindeutig“ = verschiedene
        Empfänger (verlässlicher als Klicks gesamt, da Scanner/Apple-Mail Klicks künstlich erhöhen können).
      </Text>

      {!campaignId ? (
        <Text className="text-ui-fg-subtle">Zuerst oben eine Wochenaktion wählen.</Text>
      ) : isLoading ? (
        <Text className="text-ui-fg-subtle">Lädt…</Text>
      ) : isError ? (
        <Text className="text-ui-fg-subtle">Klicks konnten nicht geladen werden.</Text>
      ) : links.length === 0 ? (
        <Text className="text-ui-fg-subtle">Noch keine Klicks erfasst.</Text>
      ) : (
        <>
          <Text size="small" className="text-ui-fg-subtle mb-2">
            {data?.total_clicks ?? 0} Klicks gesamt · {data?.unique_clickers ?? 0} eindeutige Klicker
          </Text>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Link</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Klicks</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Eindeutig</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {links.map((l) => (
                <Table.Row key={l.link}>
                  <Table.Cell>
                    <a href={l.link} target="_blank" rel="noreferrer" className="text-ui-fg-interactive break-all">
                      {l.link}
                    </a>
                  </Table.Cell>
                  <Table.Cell className="text-right">{l.clicks}</Table.Cell>
                  <Table.Cell className="text-right">{l.unique_recipients}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </>
      )}
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

  // Test batch (a real ses_batch, audience "test") for the selected weekly action.
  const { data: testBatchesData } = useQuery({
    queryKey: ["ec-test-batch"],
    queryFn: () => sdk.client.fetch<BatchesResponse>("/admin/ses-batches", { query: { audience: "test" } }),
  })
  const testBatch = testBatchesData?.batches?.[0] ?? null

  const generate = useMutation({
    mutationFn: () =>
      sdk.client.fetch<{ total: number; pending: number; skipped: number }>(
        "/admin/ses-emails/generate",
        { method: "POST", body: { source_id: selectedId, source_type: "weekly_action" } }
      ),
    onSuccess: (res) => {
      toast.success(`Test-Batch generiert: ${res.pending} offen, ${res.skipped} übersprungen (${res.total} gesamt)`)
      queryClient.invalidateQueries({ queryKey: ["ec-test-batch"] })
    },
    onError: (err: any) => toast.error(`Generieren fehlgeschlagen: ${err?.message ?? "Fehler"}`),
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
      queryClient.invalidateQueries({ queryKey: ["ec-test-batch"] })
      queryClient.invalidateQueries({ queryKey: ["ec-batch-outbox", b.id] })
    },
    onError: (err: any, b) => {
      toast.error(`${b.audience}: Senden fehlgeschlagen: ${err?.message ?? "Fehler"}`)
      queryClient.invalidateQueries({ queryKey: ["ec-batches"] })
      queryClient.invalidateQueries({ queryKey: ["ec-test-batch"] })
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

      {/* Global test redirect — applies to every send on this page (test + ramp). */}
      <div className="px-6 py-4">
        <div className="flex items-center gap-x-2">
          <Checkbox
            id="redirect-test"
            checked={redirectTest}
            onCheckedChange={(v) => setRedirectTest(v === true)}
          />
          <label htmlFor="redirect-test" className="text-ui-fg-subtle text-sm">
            Testmodus: alle Sendungen (Test- und Kampagnen-Batches) an diese Adresse umleiten
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
      </div>

      {/* Customer lists (native customer groups as audiences) — the primary flow. */}
      <CustomerListsSection
        selectedId={selectedId}
        waLabel={waLabel}
        redirectTest={redirectTest}
        testEmail={testEmail}
      />

      {/* Per-link click report for the selected campaign. */}
      <LinkClicksSection campaignId={selectedId} campaignLabel={selectedId ? waLabel(selectedId) : ""} />

      {/* Test batch (a real ses_batch, audience "test") */}
      <div className="px-6 py-4">
        <Text size="small" weight="plus" className="mb-1">
          Test-Batch <span className="text-ui-fg-subtle">(Audience „test“ — ses_batch)</span>
        </Text>
        <Text size="small" leading="compact" className="text-ui-fg-subtle mb-3">
          Eigener Batch für die Testempfänger — wie ein Kampagnen-Batch. „Test-E-Mails … generieren“ (oben)
          erstellt bzw. ersetzt ihn für die gewählte Wochenaktion.
        </Text>

        {!testBatch ? (
          <Text className="text-ui-fg-subtle">
            Noch nichts generiert — oben auf „Test-E-Mails für diese Wochenaktion generieren“ klicken.
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
              {(() => {
                const b = testBatch
                const pending = b.counts.pending ?? 0
                const isExpanded = expanded === b.id
                return (
                  <Fragment key={b.id}>
                    <Table.Row>
                      <Table.Cell>{b.audience}</Table.Cell>
                      <Table.Cell>
                        {b.source_id ? (
                          waLabel(b.source_id)
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
                          <Button
                            size="small"
                            disabled={pending === 0 || (sendBatch.isPending && sendBatch.variables?.id === b.id)}
                            isLoading={sendBatch.isPending && sendBatch.variables?.id === b.id}
                            onClick={() => confirmSendBatch(b)}
                          >
                            Ganzen Batch senden
                          </Button>
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
              })()}
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
