import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChartBar, Spinner } from "@medusajs/icons"
import {
  Badge,
  Button,
  Checkbox,
  Container,
  Drawer,
  FocusModal,
  Heading,
  Input,
  Label,
  Select,
  Table,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { sdk } from "../../lib/client"

/* ─────────────────────────────── types ─────────────────────────────── */

type WeeklyAction = { id: string; title: string; email_subject?: string | null; year: number; iso_week: number }
type WeeklyActionsResponse = { weekly_actions: WeeklyAction[]; count: number }

type Campaign = {
  id: string
  name: string
  weekly_action_id: string
  weekly_action_title?: string | null
  subject: string | null
  status: string
  group_count?: number
  created_at: string
}
type CampaignsResponse = { campaigns: Campaign[]; count: number }

type GroupSend = {
  batch_id: string
  group_id: string | null
  group_name: string | null
  status: string
  total: number
  counts: Record<string, number>
}
type CampaignDetailResponse = {
  campaign: Campaign & { resolved_subject: string | null }
  group_sends: GroupSend[]
}

type Recipient = {
  id: string
  to_email: string
  status: string
  error: string | null
  sent_at: string | null
  first_name: string | null
  last_name: string | null
  delivered_at: string | null
  opened_at: string | null
  clicked_at: string | null
  bounced_at: string | null
  unsubscribed_at: string | null
}
type RecipientsResponse = { recipients: Recipient[]; count: number }

type CustomerList = {
  id: string
  name: string
  members: number
  eligible: number
  unsubscribed: number
  no_email: number
}
type CustomerListsResponse = { lists: CustomerList[]; count: number }

type Rates = {
  delivered: number
  opened: number
  clicked: number
  click_to_open: number
  unsubscribed: number
  bounced: number
}
type Metrics = {
  sent: number
  delivered: number
  opened: number
  clicked: number
  unsubscribed: number
  bounced: number
  complained: number
  failed: number
  skipped: number
  queued: number
  pending: number
  total: number
  rates: Rates
}
type StatsResponse = {
  campaign: { id: string; name: string; status: string }
  totals: Metrics
  groups: Array<Metrics & { batch_id: string; group_id: string | null; group_name: string | null }>
}

type LinkClick = { link: string; clicks: number; unique_recipients: number }
type LinkClicksResponse = { links: LinkClick[]; total_clicks: number; unique_clickers: number }

/* ──────────────────────────── small helpers ────────────────────────── */

const STATUS_COLOR: Record<string, "grey" | "blue" | "orange" | "green" | "red"> = {
  draft: "grey",
  ready: "blue",
  scheduled: "orange",
  sending: "orange",
  sent: "green",
  failed: "red",
  canceled: "red",
}

function StatusBadge({ status }: { status: string }) {
  return <Badge size="2xsmall" color={STATUS_COLOR[status] ?? "grey"}>{status}</Badge>
}

const fmt = (n: number) => n.toLocaleString("en-US")
const pct = (n: number) => `${n.toLocaleString("en-US", { maximumFractionDigits: 1 })}%`

/** A KPI tile: big number + label + optional percentage sub-line. */
function StatTile({ label, value, sub, tone }: { label: string; value: number; sub?: string; tone?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-ui-border-base bg-ui-bg-subtle px-4 py-3">
      <Text size="xsmall" leading="compact" className="text-ui-fg-subtle">{label}</Text>
      <Text className={`text-2xl font-semibold ${tone ?? "text-ui-fg-base"}`}>{fmt(value)}</Text>
      {sub ? <Text size="xsmall" leading="compact" className="text-ui-fg-muted">{sub}</Text> : null}
    </div>
  )
}

/** One labelled funnel bar: value + percentage, width ∝ percentage of `base`. */
function FunnelBar({ label, value, base, color }: { label: string; value: number; base: number; color: string }) {
  const p = base > 0 ? (value / base) * 100 : 0
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <Text size="small" leading="compact" weight="plus">{label}</Text>
        <Text size="small" leading="compact" className="text-ui-fg-subtle">
          {fmt(value)} · {pct(p)}
        </Text>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-ui-bg-base">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(0, Math.min(100, p))}%` }} />
      </div>
    </div>
  )
}

/* ───────────────────────────── list view ───────────────────────────── */

function CreateCampaignModal({ onCreated }: { onCreated: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [weeklyActionId, setWeeklyActionId] = useState("")
  const [subject, setSubject] = useState("")

  const { data: waData } = useQuery({
    queryKey: ["campaigns-weekly-actions"],
    queryFn: () => sdk.client.fetch<WeeklyActionsResponse>("/admin/weekly-actions"),
    enabled: open,
  })

  const create = useMutation({
    mutationFn: () =>
      sdk.client.fetch<{ campaign: Campaign }>("/admin/email-campaigns", {
        method: "POST",
        body: { name: name.trim(), weekly_action_id: weeklyActionId, subject: subject.trim() || undefined },
      }),
    onSuccess: (res) => {
      toast.success(`Campaign “${res.campaign.name}” created`)
      setOpen(false)
      setName("")
      setWeeklyActionId("")
      setSubject("")
      onCreated(res.campaign.id)
    },
    onError: (err: any) => toast.error(`Create failed: ${err?.message ?? "Error"}`),
  })

  const canSubmit = name.trim().length > 0 && weeklyActionId.length > 0 && !create.isPending

  return (
    <FocusModal open={open} onOpenChange={setOpen}>
      <FocusModal.Trigger asChild>
        <Button size="small" variant="primary">New campaign</Button>
      </FocusModal.Trigger>
      <FocusModal.Content>
        <FocusModal.Header>
          <Button size="small" variant="primary" disabled={!canSubmit} isLoading={create.isPending} onClick={() => create.mutate()}>
            Create campaign
          </Button>
        </FocusModal.Header>
        <FocusModal.Body className="flex flex-col items-center py-10">
          <div className="flex w-full max-w-lg flex-col gap-6">
            <div>
              <Heading level="h2">New campaign</Heading>
              <Text size="small" className="text-ui-fg-subtle">
                Choose a weekly action as the content and set a subject.
              </Text>
            </div>
            <div className="flex flex-col gap-2">
              <Label size="small" weight="plus">Name (internal)</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. W42 — Autumn promo" />
            </div>
            <div className="flex flex-col gap-2">
              <Label size="small" weight="plus">Weekly action (content)</Label>
              <Select value={weeklyActionId} onValueChange={setWeeklyActionId}>
                <Select.Trigger>
                  <Select.Value placeholder="Select a weekly action" />
                </Select.Trigger>
                <Select.Content>
                  {(waData?.weekly_actions ?? []).map((wa) => (
                    <Select.Item key={wa.id} value={wa.id}>
                      {wa.title} ({wa.year}/W{wa.iso_week})
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label size="small" weight="plus">Subject (optional)</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Empty = weekly action’s subject" />
            </div>
          </div>
        </FocusModal.Body>
      </FocusModal.Content>
    </FocusModal>
  )
}

function GenerateGroupsModal() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [size, setSize] = useState("200")
  const [includeTest, setIncludeTest] = useState(true)

  const run = useMutation({
    mutationFn: () =>
      sdk.client.fetch<{ group_count: number; total_customers: number; test: { count: number } | null }>(
        "/admin/customer-lists/chunk",
        { method: "POST", body: { size: Number(size) || 200, include_test: includeTest } }
      ),
    onSuccess: (res) => {
      toast.success(
        `Created ${res.group_count} group(s) from ${fmt(res.total_customers)} customers${res.test ? ` + test (${fmt(res.test.count)})` : ""}`
      )
      setOpen(false)
      queryClient.invalidateQueries({ queryKey: ["campaign-customer-lists"] })
    },
    onError: (err: any) => toast.error(`Generate failed: ${err?.message ?? "Error"}`),
  })

  return (
    <FocusModal open={open} onOpenChange={setOpen}>
      <FocusModal.Trigger asChild>
        <Button size="small" variant="secondary">Generate send groups</Button>
      </FocusModal.Trigger>
      <FocusModal.Content>
        <FocusModal.Header>
          <Button size="small" variant="primary" isLoading={run.isPending} onClick={() => run.mutate()}>
            Generate groups
          </Button>
        </FocusModal.Header>
        <FocusModal.Body className="flex flex-col items-center py-10">
          <div className="flex w-full max-w-lg flex-col gap-6">
            <div>
              <Heading level="h2">Generate send groups</Heading>
              <Text size="small" className="text-ui-fg-subtle">
                Splits the mailable customer base into fixed-size groups (a warm-up ramp), plus a test group.
                Best-engaged customers go in the first groups. This rebuilds the existing auto-generated
                groups — run it before assigning groups to a campaign.
              </Text>
            </div>
            <div className="flex flex-col gap-2">
              <Label size="small" weight="plus">Customers per group</Label>
              <Input type="number" min={1} value={size} onChange={(e) => setSize(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={includeTest} onCheckedChange={(v) => setIncludeTest(!!v)} />
              <Label size="small">Also create a test group (user_type = “test”)</Label>
            </div>
          </div>
        </FocusModal.Body>
      </FocusModal.Content>
    </FocusModal>
  )
}

function CampaignList({ onOpen }: { onOpen: (id: string) => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => sdk.client.fetch<CampaignsResponse>("/admin/email-campaigns"),
  })

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h1">Email campaigns</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Send weekly-action campaigns to customer groups and track the results.
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <GenerateGroupsModal />
          <CreateCampaignModal onCreated={onOpen} />
        </div>
      </div>
      <div className="px-6 py-4">
        {isLoading ? (
          <div className="flex justify-center py-10"><Spinner className="animate-spin" /></div>
        ) : !data?.campaigns.length ? (
          <Text size="small" className="text-ui-fg-subtle">No campaigns yet. Create your first one.</Text>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Weekly action</Table.HeaderCell>
                <Table.HeaderCell>Groups</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data.campaigns.map((c) => (
                <Table.Row key={c.id} className="cursor-pointer" onClick={() => onOpen(c.id)}>
                  <Table.Cell><Text size="small" weight="plus">{c.name}</Text></Table.Cell>
                  <Table.Cell><Text size="small" className="text-ui-fg-subtle">{c.weekly_action_title ?? "—"}</Text></Table.Cell>
                  <Table.Cell><Text size="small">{c.group_count ?? 0}</Text></Table.Cell>
                  <Table.Cell><StatusBadge status={c.status} /></Table.Cell>
                  <Table.Cell><Button size="small" variant="transparent" onClick={(e) => { e.stopPropagation(); onOpen(c.id) }}>Open</Button></Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>
    </Container>
  )
}

/* ──────────────────────────── detail view ──────────────────────────── */

function GroupsSection({ campaignId }: { campaignId: string }) {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["campaign", campaignId] })
    queryClient.invalidateQueries({ queryKey: ["campaign-stats", campaignId] })
    queryClient.invalidateQueries({ queryKey: ["campaigns"] })
  }

  const { data: detail } = useQuery({
    queryKey: ["campaign", campaignId],
    queryFn: () => sdk.client.fetch<CampaignDetailResponse>(`/admin/email-campaigns/${campaignId}`),
    refetchInterval: (q) => ((q.state.data as CampaignDetailResponse | undefined)?.campaign.status === "sending" ? 4000 : false),
  })
  const { data: lists } = useQuery({
    queryKey: ["campaign-customer-lists"],
    queryFn: () => sdk.client.fetch<CustomerListsResponse>("/admin/customer-lists"),
  })

  const assignedIds = useMemo(
    () => new Set((detail?.group_sends ?? []).map((g) => g.group_id).filter(Boolean) as string[]),
    [detail]
  )
  const [selected, setSelected] = useState<Set<string> | null>(null)
  // Initialise the editable selection from the assigned groups once loaded.
  const effectiveSelected = selected ?? assignedIds
  const dirty = selected !== null && (
    selected.size !== assignedIds.size || [...selected].some((id) => !assignedIds.has(id))
  )

  const saveGroups = useMutation({
    mutationFn: () =>
      sdk.client.fetch<{ added: any[]; removed: string[]; retained: string[] }>(`/admin/email-campaigns/${campaignId}/groups`, {
        method: "POST",
        body: { group_ids: [...effectiveSelected] },
      }),
    onSuccess: (res) => {
      toast.success(`Groups saved (+${res.added.length} / −${res.removed.length})`)
      if (res.retained.length) toast.warning(`${res.retained.length} group(s) kept (already sent)`)
      setSelected(null)
      invalidate()
    },
    onError: (err: any) => toast.error(`Save failed: ${err?.message ?? "Error"}`),
  })

  const generate = useMutation({
    mutationFn: (groupId?: string) =>
      sdk.client.fetch(`/admin/email-campaigns/${campaignId}/generate`, { method: "POST", body: groupId ? { group_id: groupId } : {} }),
    onSuccess: () => { toast.success("Emails generated"); invalidate() },
    onError: (err: any) => toast.error(`Generate failed: ${err?.message ?? "Error"}`),
  })

  const send = useMutation({
    mutationFn: (groupId?: string) =>
      sdk.client.fetch<{ enqueued: number }>(`/admin/email-campaigns/${campaignId}/send`, { method: "POST", body: groupId ? { group_id: groupId } : {} }),
    onSuccess: (res) => {
      toast.success(res.enqueued > 0 ? `${res.enqueued} email(s) queued` : "Nothing to send")
      invalidate()
    },
    onError: (err: any) => toast.error(`Send failed: ${err?.message ?? "Error"}`),
  })

  const sendOne = useMutation({
    mutationFn: (emailId: string) =>
      sdk.client.fetch<{ status: string }>(`/admin/ses-emails/${emailId}/send`, { method: "POST", body: {} }),
    onSuccess: (res) => {
      if (res.status === "sent") toast.success("Sent")
      else if (res.status === "skipped") toast.warning("Skipped (unsubscribed or duplicate)")
      else if (res.status === "already_sent") toast.warning("Already sent")
      else toast.error("Send failed")
      queryClient.invalidateQueries({ queryKey: ["campaign-recipients", viewBatch?.id] })
      queryClient.invalidateQueries({ queryKey: ["campaign", campaignId] })
      queryClient.invalidateQueries({ queryKey: ["campaign-stats", campaignId] })
    },
    onError: (err: any) => toast.error(`Send failed: ${err?.message ?? "Error"}`),
  })

  const toggle = (id: string) => {
    const next = new Set(effectiveSelected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  const sendsByGroup = useMemo(() => {
    const m: Record<string, GroupSend> = {}
    for (const g of detail?.group_sends ?? []) if (g.group_id) m[g.group_id] = g
    return m
  }, [detail])

  // Drill-in: the recipient list (outbox) for one group-send.
  const [viewBatch, setViewBatch] = useState<{ id: string; name: string } | null>(null)
  const [recFilter, setRecFilter] = useState<"all" | "opened" | "clicked" | "bounced" | "unsubscribed">("all")
  const { data: recData, isLoading: recLoading } = useQuery({
    queryKey: ["campaign-recipients", viewBatch?.id, recFilter],
    queryFn: () =>
      sdk.client.fetch<RecipientsResponse>(`/admin/email-campaigns/${campaignId}/recipients`, {
        query: { batch_id: viewBatch!.id, filter: recFilter },
      }),
    enabled: !!viewBatch,
  })

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Customer groups</Heading>
          <Text size="small" className="text-ui-fg-subtle">Assign groups, generate emails and send.</Text>
        </div>
        <div className="flex gap-2">
          <Button size="small" variant="secondary" disabled={!dirty || saveGroups.isPending} isLoading={saveGroups.isPending} onClick={() => saveGroups.mutate()}>
            Save groups
          </Button>
          <Button size="small" variant="secondary" disabled={generate.isPending || !assignedIds.size} isLoading={generate.isPending} onClick={() => generate.mutate(undefined)}>
            Generate all
          </Button>
          <Button size="small" variant="primary" disabled={send.isPending || !assignedIds.size} isLoading={send.isPending} onClick={() => send.mutate(undefined)}>
            Send campaign
          </Button>
        </div>
      </div>

      <div className="px-6 py-4">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell className="w-10" />
              <Table.HeaderCell>Group</Table.HeaderCell>
              <Table.HeaderCell>Recipients</Table.HeaderCell>
              <Table.HeaderCell>Outbox</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {(lists?.lists ?? []).map((l) => {
              const gs = sendsByGroup[l.id]
              const counts = gs?.counts ?? {}
              return (
                <Table.Row key={l.id}>
                  <Table.Cell onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={effectiveSelected.has(l.id)} onCheckedChange={() => toggle(l.id)} />
                  </Table.Cell>
                  <Table.Cell><Text size="small" weight="plus">{l.name}</Text></Table.Cell>
                  <Table.Cell>
                    <Text size="small">{fmt(l.eligible)} <span className="text-ui-fg-muted">/ {fmt(l.members)}</span></Text>
                    {l.unsubscribed ? <Text size="xsmall" className="text-ui-fg-muted">{fmt(l.unsubscribed)} unsubscribed</Text> : null}
                  </Table.Cell>
                  <Table.Cell>
                    {gs ? (
                      <Text size="xsmall" className="text-ui-fg-subtle">
                        {fmt(counts.sent ?? 0)} sent · {fmt((counts.pending ?? 0) + (counts.queued ?? 0) + (counts.sending ?? 0))} pending
                        {counts.failed ? ` · ${fmt(counts.failed)} failed` : ""}
                      </Text>
                    ) : <Text size="xsmall" className="text-ui-fg-muted">—</Text>}
                  </Table.Cell>
                  <Table.Cell>{gs ? <StatusBadge status={gs.status} /> : <Text size="xsmall" className="text-ui-fg-muted">not assigned</Text>}</Table.Cell>
                  <Table.Cell>
                    {gs ? (
                      <div className="flex justify-end gap-2">
                        <Button size="small" variant="transparent" disabled={!gs.total} onClick={() => setViewBatch({ id: gs.batch_id, name: l.name })}>View</Button>
                        <Button size="small" variant="transparent" disabled={generate.isPending} onClick={() => generate.mutate(l.id)}>Generate</Button>
                        <Button size="small" variant="secondary" disabled={send.isPending || !gs.total} onClick={() => send.mutate(l.id)}>Send</Button>
                      </div>
                    ) : null}
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table>
      </div>

      <Drawer open={!!viewBatch} onOpenChange={(o) => { if (!o) setViewBatch(null) }}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Recipients — {viewBatch?.name}</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="overflow-y-auto">
            <div className="mb-2 flex items-center justify-between">
              <Text size="small" weight="plus">Recipients</Text>
              <div className="flex gap-1">
                {(["all", "opened", "clicked", "bounced", "unsubscribed"] as const).map((f) => (
                  <Button key={f} size="small" variant={recFilter === f ? "primary" : "transparent"} onClick={() => setRecFilter(f)}>
                    {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            {recLoading ? (
              <div className="flex justify-center py-10"><Spinner className="animate-spin" /></div>
            ) : !recData?.recipients.length ? (
              <Text size="small" className="text-ui-fg-subtle">
                {recFilter === "all" ? "No emails generated for this group yet." : `No ${recFilter} recipients.`}
              </Text>
            ) : (
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Recipient</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                    <Table.HeaderCell className="text-center">Opened</Table.HeaderCell>
                    <Table.HeaderCell className="text-center">Clicked</Table.HeaderCell>
                    <Table.HeaderCell className="text-center">Bounced</Table.HeaderCell>
                    <Table.HeaderCell />
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {recData.recipients.map((r) => {
                    const name = [r.first_name, r.last_name].filter(Boolean).join(" ")
                    return (
                      <Table.Row key={r.id}>
                        <Table.Cell>
                          <Text size="small">{r.to_email}</Text>
                          {name ? <Text size="xsmall" className="text-ui-fg-subtle">{name}</Text> : null}
                          {r.error ? <Text size="xsmall" className="text-ui-tag-red-text">{r.error}</Text> : null}
                          {r.unsubscribed_at ? <Text size="xsmall" className="text-ui-tag-orange-text">unsubscribed</Text> : null}
                        </Table.Cell>
                        <Table.Cell><StatusBadge status={r.status} /></Table.Cell>
                        <Table.Cell className="text-center">
                          {r.opened_at ? <span title={new Date(r.opened_at).toLocaleString("en-US")} className="text-ui-tag-purple-text">✓</span> : <span className="text-ui-fg-muted">—</span>}
                        </Table.Cell>
                        <Table.Cell className="text-center">
                          {r.clicked_at ? <span title={new Date(r.clicked_at).toLocaleString("en-US")} className="text-ui-tag-green-text">✓</span> : <span className="text-ui-fg-muted">—</span>}
                        </Table.Cell>
                        <Table.Cell className="text-center">
                          {r.bounced_at ? <span title={new Date(r.bounced_at).toLocaleString("en-US")} className="text-ui-tag-red-text">✓</span> : <span className="text-ui-fg-muted">—</span>}
                        </Table.Cell>
                        <Table.Cell className="text-right">
                          <Button
                            size="small"
                            variant="secondary"
                            disabled={sendOne.isPending || ["sent", "sending"].includes(r.status)}
                            isLoading={sendOne.isPending && sendOne.variables === r.id}
                            onClick={() => sendOne.mutate(r.id)}
                          >
                            Send
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    )
                  })}
                </Table.Body>
              </Table>
            )}
          </Drawer.Body>
        </Drawer.Content>
      </Drawer>
    </Container>
  )
}

function StatsSection({ campaignId }: { campaignId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["campaign-stats", campaignId],
    queryFn: () => sdk.client.fetch<StatsResponse>(`/admin/email-campaigns/${campaignId}/stats`),
    refetchInterval: (q) => ((q.state.data as StatsResponse | undefined)?.campaign.status === "sending" ? 4000 : false),
  })

  const { data: linkData } = useQuery({
    queryKey: ["campaign-links", campaignId],
    queryFn: () => sdk.client.fetch<LinkClicksResponse>(`/admin/email-campaigns/${campaignId}/link-clicks`),
  })

  const t = data?.totals
  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Statistics</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Opens are inflated by Apple Mail Privacy Protection — clicks and unsubscribes are the reliable signals.
        </Text>
      </div>

      {isLoading || !t ? (
        <div className="flex justify-center py-10"><Spinner className="animate-spin" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 px-6 py-4 md:grid-cols-5">
            <StatTile label="Sent" value={t.sent} sub={t.skipped ? `${fmt(t.skipped)} skipped` : undefined} />
            <StatTile label="Delivered" value={t.delivered} sub={pct(t.rates.delivered)} />
            <StatTile label="Opened" value={t.opened} sub={pct(t.rates.opened)} tone="text-ui-tag-purple-text" />
            <StatTile label="Clicked" value={t.clicked} sub={pct(t.rates.clicked)} tone="text-ui-tag-green-text" />
            <StatTile label="Unsubscribed" value={t.unsubscribed} sub={pct(t.rates.unsubscribed)} tone="text-ui-tag-red-text" />
          </div>

          <div className="flex flex-col gap-3 px-6 py-4">
            <Text size="small" weight="plus">Overall funnel</Text>
            <FunnelBar label="Delivered" value={t.delivered} base={t.sent} color="bg-ui-tag-blue-icon" />
            <FunnelBar label="Opened" value={t.opened} base={t.sent} color="bg-ui-tag-purple-icon" />
            <FunnelBar label="Clicked" value={t.clicked} base={t.sent} color="bg-ui-tag-green-icon" />
            <FunnelBar label="Unsubscribed" value={t.unsubscribed} base={t.sent} color="bg-ui-tag-red-icon" />
          </div>

          {data.groups.length > 1 ? (
            <div className="px-6 py-4">
              <Text size="small" weight="plus" className="mb-3 block">Per group</Text>
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Group</Table.HeaderCell>
                    <Table.HeaderCell className="text-right">Sent</Table.HeaderCell>
                    <Table.HeaderCell className="text-right">Deliv.</Table.HeaderCell>
                    <Table.HeaderCell className="text-right">Opens</Table.HeaderCell>
                    <Table.HeaderCell className="text-right">Clicks</Table.HeaderCell>
                    <Table.HeaderCell className="text-right">Unsub.</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {data.groups.map((g) => (
                    <Table.Row key={g.batch_id}>
                      <Table.Cell><Text size="small" weight="plus">{g.group_name ?? g.group_id ?? "—"}</Text></Table.Cell>
                      <Table.Cell className="text-right"><Text size="small">{fmt(g.sent)}</Text></Table.Cell>
                      <Table.Cell className="text-right"><Text size="small">{fmt(g.delivered)}</Text></Table.Cell>
                      <Table.Cell className="text-right"><Text size="small">{fmt(g.opened)} <span className="text-ui-fg-muted">{pct(g.rates.opened)}</span></Text></Table.Cell>
                      <Table.Cell className="text-right"><Text size="small">{fmt(g.clicked)} <span className="text-ui-fg-muted">{pct(g.rates.clicked)}</span></Text></Table.Cell>
                      <Table.Cell className="text-right"><Text size="small">{fmt(g.unsubscribed)}</Text></Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          ) : null}

          <div className="px-6 py-4">
            <Text size="small" weight="plus" className="mb-1 block">Clicked links</Text>
            <Text size="xsmall" className="mb-3 block text-ui-fg-subtle">
              Which URLs were clicked (unique recipients is the honest signal — scanners can auto-click).
            </Text>
            {!linkData?.links.length ? (
              <Text size="small" className="text-ui-fg-subtle">No link clicks recorded yet.</Text>
            ) : (
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Link</Table.HeaderCell>
                    <Table.HeaderCell className="text-right">Clicks</Table.HeaderCell>
                    <Table.HeaderCell className="text-right">Unique</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {linkData.links.map((l) => (
                    <Table.Row key={l.link}>
                      <Table.Cell>
                        <a href={l.link} target="_blank" rel="noreferrer" className="text-ui-fg-interactive hover:underline">
                          <Text size="small" className="break-all">{l.link}</Text>
                        </a>
                      </Table.Cell>
                      <Table.Cell className="text-right"><Text size="small">{fmt(l.clicks)}</Text></Table.Cell>
                      <Table.Cell className="text-right"><Text size="small">{fmt(l.unique_recipients)}</Text></Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            )}
          </div>
        </>
      )}
    </Container>
  )
}

function CampaignDetail({ campaignId, onBack }: { campaignId: string; onBack: () => void }) {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ["campaign", campaignId],
    queryFn: () => sdk.client.fetch<CampaignDetailResponse>(`/admin/email-campaigns/${campaignId}`),
    refetchInterval: (q) => ((q.state.data as CampaignDetailResponse | undefined)?.campaign.status === "sending" ? 4000 : false),
  })

  const remove = useMutation({
    mutationFn: () => sdk.client.fetch(`/admin/email-campaigns/${campaignId}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Campaign deleted")
      queryClient.invalidateQueries({ queryKey: ["campaigns"] })
      onBack()
    },
    onError: (err: any) => toast.error(`Delete failed: ${err?.message ?? "Error"}`),
  })

  const c = data?.campaign
  return (
    <div className="flex flex-col gap-4">
      <Container className="flex items-center justify-between p-0">
        <div className="flex items-center gap-3 px-6 py-4">
          <Button size="small" variant="transparent" onClick={onBack}>← Back</Button>
          <div>
            <div className="flex items-center gap-2">
              <Heading level="h1">{c?.name ?? "…"}</Heading>
              {c ? <StatusBadge status={c.status} /> : null}
            </div>
            {c ? (
              <Text size="small" className="text-ui-fg-subtle">
                {c.weekly_action_title ?? "—"} · Subject: {c.resolved_subject ?? "—"}
              </Text>
            ) : null}
          </div>
        </div>
        <div className="px-6 py-4">
          <Button size="small" variant="danger" disabled={remove.isPending || c?.status === "sending"} onClick={() => { if (confirm("Delete this campaign?")) remove.mutate() }}>
            Delete
          </Button>
        </div>
      </Container>

      {isLoading ? (
        <Container><div className="flex justify-center py-10"><Spinner className="animate-spin" /></div></Container>
      ) : (
        <>
          <GroupsSection campaignId={campaignId} />
          <StatsSection campaignId={campaignId} />
        </>
      )}
    </div>
  )
}

/* ─────────────────────────────── page ──────────────────────────────── */

const CampaignsPage = () => {
  const [selected, setSelected] = useState<string | null>(null)
  return selected ? (
    <CampaignDetail campaignId={selected} onBack={() => setSelected(null)} />
  ) : (
    <CampaignList onOpen={setSelected} />
  )
}

export const config = defineRouteConfig({
  label: "Email Campaigns",
  icon: ChartBar,
})

export default CampaignsPage
