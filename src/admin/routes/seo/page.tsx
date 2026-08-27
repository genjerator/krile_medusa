import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChartBar, ArrowPath, ArrowUpRightMini, ArrowDownRightMini } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Heading,
  Select,
  Table,
  Tabs,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { sdk } from "../../lib/client"

// ─── types ────────────────────────────────────────────────────────────────────
type Kpis = {
  ga4: { users: number; new_users: number; sessions: number }
  gsc: { clicks: number; impressions: number; ctr: number; position: number | null }
  bing: { clicks: number; impressions: number }
}
type Overview = {
  brand: string
  from: string
  to: string
  kpis: Kpis
  deltas: any
  series: { date: string; ga4_users: number; gsc_clicks: number; gsc_impressions: number; bing_clicks: number }[]
}
type Brand = { key: string; label: string; sources: { ga4: boolean; gsc: boolean; bing: boolean } }
type Breakdown = { key: string; clicks: number; impressions: number; ctr: number; position: number | null }
type ProductRow = {
  handle: string
  product_id: string | null
  title: string
  clicks: number
  impressions: number
  ctr: number
  position: number | null
  orders: number
  units: number
  revenue: number
}

const RANGES = [
  { key: "d7", days: 7 },
  { key: "d28", days: 28 },
  { key: "d90", days: 90 },
]
const isoDay = (d: Date) => d.toISOString().slice(0, 10)

// ─── small components ─────────────────────────────────────────────────────────
const Delta = ({ v }: { v: number | null }) => {
  if (v == null) return <Text size="xsmall" className="text-ui-fg-muted">—</Text>
  const up = v >= 0
  return (
    <div className={`flex items-center gap-0.5 ${up ? "text-ui-tag-green-icon" : "text-ui-tag-red-icon"}`}>
      {up ? <ArrowUpRightMini /> : <ArrowDownRightMini />}
      <Text size="xsmall">{Math.abs(v).toFixed(1)}%</Text>
    </div>
  )
}

const Kpi = ({ label, value, delta }: { label: string; value: string; delta?: number | null }) => (
  <div className="flex flex-col gap-1 rounded-lg border border-ui-border-base bg-ui-bg-subtle px-4 py-3">
    <Text size="xsmall" leading="compact" className="text-ui-fg-subtle">{label}</Text>
    <div className="flex items-end justify-between gap-2">
      <Text size="large" weight="plus" className="text-ui-fg-base">{value}</Text>
      {delta !== undefined && <Delta v={delta} />}
    </div>
  </div>
)

/**
 * Inline SVG multi-line chart. Each series is normalised to its own max (they
 * span very different magnitudes), with x-axis date ticks and a hover tooltip
 * showing the date + each series' actual value at that point.
 */
const TrendChart = ({
  series,
  labels,
  formatN,
  loc,
}: {
  series: Overview["series"]
  labels: Record<string, string>
  formatN: (v: number) => string
  loc: string
}) => {
  const [hover, setHover] = useState<number | null>(null)
  if (!series.length) return null

  const W = 720
  const H = 170
  const padL = 8
  const padR = 8
  const padT = 10
  const padB = 22
  const lines: { key: keyof Overview["series"][number]; color: string; label: string }[] = [
    { key: "gsc_clicks", color: "#2563eb", label: labels.gscClicks },
    { key: "gsc_impressions", color: "#9ca3af", label: labels.gscImpressions },
    { key: "ga4_users", color: "#16a34a", label: labels.ga4Users },
  ]
  const n = series.length
  const x = (i: number) => padL + (i * (W - padL - padR)) / Math.max(1, n - 1)
  const maxOf = (key: keyof Overview["series"][number]) =>
    Math.max(1, ...series.map((s) => Number(s[key] ?? 0)))
  const y = (v: number, max: number) => H - padB - (v / max) * (H - padT - padB)

  const tickCount = Math.min(6, n)
  const tickIdx = Array.from({ length: tickCount }, (_, i) =>
    Math.round((i * (n - 1)) / Math.max(1, tickCount - 1))
  )
  const shortDate = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString(loc, { day: "2-digit", month: "short" })
  const longDate = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString(loc, { weekday: "short", day: "2-digit", month: "short" })

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const frac = (e.clientX - r.left) / r.width
    setHover(Math.max(0, Math.min(n - 1, Math.round(frac * (n - 1)))))
  }

  return (
    <div>
      <div className="relative w-full" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none">
          {lines.map((ln) => {
            const max = maxOf(ln.key)
            const pts = series.map((s, i) => `${x(i)},${y(Number(s[ln.key] ?? 0), max)}`).join(" ")
            return <polyline key={ln.key} points={pts} fill="none" stroke={ln.color} strokeWidth={1.5} />
          })}

          {hover != null && (
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={padT}
              y2={H - padB}
              className="text-ui-fg-muted"
              stroke="currentColor"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
          )}
          {hover != null &&
            lines.map((ln) => (
              <circle
                key={ln.key}
                cx={x(hover)}
                cy={y(Number(series[hover][ln.key] ?? 0), maxOf(ln.key))}
                r={2.5}
                fill={ln.color}
              />
            ))}

          {tickIdx.map((i) => (
            <text
              key={i}
              x={x(i)}
              y={H - 6}
              fontSize={9}
              textAnchor="middle"
              className="text-ui-fg-muted"
              fill="currentColor"
            >
              {shortDate(series[i].date)}
            </text>
          ))}
        </svg>

        {hover != null && (
          <div
            className="absolute top-0 -translate-x-1/2 pointer-events-none z-10 rounded-md border border-ui-border-base bg-ui-bg-base shadow-elevation-tooltip px-2.5 py-1.5"
            style={{ left: `${(x(hover) / W) * 100}%` }}
          >
            <Text size="xsmall" weight="plus" className="mb-1 whitespace-nowrap">
              {longDate(series[hover].date)}
            </Text>
            {lines.map((ln) => (
              <div key={ln.key} className="flex items-center gap-2 whitespace-nowrap">
                <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: ln.color }} />
                <Text size="xsmall" className="text-ui-fg-subtle">{ln.label}</Text>
                <Text size="xsmall" weight="plus" className="ml-auto">
                  {formatN(Number(series[hover][ln.key] ?? 0))}
                </Text>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-4 mt-2">
        {lines.map((ln) => (
          <div key={ln.key} className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-3 rounded-sm" style={{ backgroundColor: ln.color }} />
            <Text size="xsmall" className="text-ui-fg-subtle">
              {ln.label}
              <span className="text-ui-fg-muted"> · {formatN(maxOf(ln.key))} max</span>
            </Text>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────────
const SeoPage = () => {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const [brand, setBrand] = useState<string>("planeta")
  const [days, setDays] = useState(28)
  const [tab, setTab] = useState("products")
  const [source, setSource] = useState("gsc")

  // Language-aware number/currency formatting.
  const loc = (i18n.language || "en").startsWith("de") ? "de-DE" : "en-US"
  const fmt = useMemo(() => {
    const nf = new Intl.NumberFormat(loc)
    const cf = new Intl.NumberFormat(loc, { style: "currency", currency: "EUR" })
    const pf = new Intl.NumberFormat(loc, { style: "percent", maximumFractionDigits: 1 })
    return {
      n: (v: number) => nf.format(v),
      c: (v: number) => cf.format(v),
      pct: (v: number) => pf.format(v),
      pos: (v: number | null) => (v == null ? "—" : v.toLocaleString(loc, { maximumFractionDigits: 1 })),
    }
  }, [loc])

  const to = isoDay(new Date())
  const from = isoDay(new Date(Date.now() - (days - 1) * 86_400_000))
  const rangeQ = `brand=${brand}&from=${from}&to=${to}`

  const { data: brandsData } = useQuery({
    queryKey: ["seo", "brands"],
    queryFn: () => sdk.client.fetch<{ brands: Brand[]; bing_configured: boolean }>("/admin/seo/brands"),
  })
  const brands = brandsData?.brands ?? []

  const { data: overview, isLoading } = useQuery({
    queryKey: ["seo", "overview", brand, from, to],
    queryFn: () => sdk.client.fetch<Overview>(`/admin/seo/overview?${rangeQ}`),
  })

  const { data: breakdown } = useQuery({
    queryKey: ["seo", tab, brand, source, from, to],
    queryFn: () => sdk.client.fetch<any>(`/admin/seo/${tab}?${rangeQ}&source=${source}&limit=100`),
    enabled: tab === "queries" || tab === "pages" || tab === "products",
  })

  const { data: cookie } = useQuery({
    queryKey: ["seo", "cookie", brand, from, to],
    queryFn: () =>
      sdk.client.fetch<{ totals: { shown: number; accepted: number; declined: number; no_click: number } }>(
        `/admin/cookie-consent?${rangeQ}`
      ),
  })

  const refresh = useMutation({
    mutationFn: () => sdk.client.fetch("/admin/seo/refresh", { method: "POST", body: { days: 30 } }),
    onSuccess: () => {
      toast.success(t("seo.refreshed"))
      qc.invalidateQueries({ queryKey: ["seo"] })
    },
    onError: (e: any) => toast.error(e?.message ?? t("seo.refreshError")),
  })

  const k = overview?.kpis
  const d = overview?.deltas
  const bingOn = brandsData?.bing_configured

  const queries: Breakdown[] = tab === "queries" ? breakdown?.queries ?? [] : []
  const pages: Breakdown[] = tab === "pages" ? breakdown?.pages ?? [] : []
  const productRows: ProductRow[] = tab === "products" ? breakdown?.rows ?? [] : []

  const totalRevenue = useMemo(
    () => productRows.reduce((a, r) => a + r.revenue, 0),
    [productRows]
  )

  return (
    <Container className="flex flex-col gap-y-4 p-0">
      {/* header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-ui-border-base">
        <div className="flex flex-col">
          <Heading level="h2">{t("seo.title")}</Heading>
          <Text size="small" className="text-ui-fg-subtle">{t("seo.subtitle")}</Text>
        </div>
        <div className="flex items-center gap-2">
          <Select value={brand} onValueChange={setBrand} size="small">
            <Select.Trigger className="min-w-[180px]">
              <Select.Value placeholder={t("seo.brand")} />
            </Select.Trigger>
            <Select.Content>
              {(brands.length ? brands : [{ key: "industries", label: "Planeta Industries" }, { key: "planeta", label: "Planeta GmbH" }]).map((b: any) => (
                <Select.Item key={b.key} value={b.key}>{b.label}</Select.Item>
              ))}
            </Select.Content>
          </Select>
          <div className="flex rounded-md border border-ui-border-base overflow-hidden">
            {RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setDays(r.days)}
                className={`px-3 py-1.5 text-xs ${days === r.days ? "bg-ui-bg-base-pressed text-ui-fg-base" : "bg-ui-bg-subtle text-ui-fg-subtle"}`}
              >
                {t(`seo.range.${r.key}`)}
              </button>
            ))}
          </div>
          <Button size="small" variant="secondary" onClick={() => refresh.mutate()} isLoading={refresh.isPending}>
            <ArrowPath /> {t("seo.refresh")}
          </Button>
        </div>
      </div>

      {isLoading || !k ? (
        <div className="px-6 py-10"><Text className="text-ui-fg-subtle">{t("seo.loading")}</Text></div>
      ) : (
        <div className="flex flex-col gap-6 px-6 pb-6">
          {/* GSC KPIs */}
          <div>
            <Text size="small" weight="plus" className="mb-2">{t("seo.section.gsc")}</Text>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Kpi label={t("seo.kpi.clicks")} value={fmt.n(k.gsc.clicks)} delta={d?.gsc.clicks} />
              <Kpi label={t("seo.kpi.impressions")} value={fmt.n(k.gsc.impressions)} delta={d?.gsc.impressions} />
              <Kpi label={t("seo.kpi.ctr")} value={fmt.pct(k.gsc.ctr)} delta={d?.gsc.ctr} />
              <Kpi label={t("seo.kpi.position")} value={fmt.pos(k.gsc.position)} delta={d?.gsc.position} />
            </div>
          </div>

          {/* GA4 KPIs */}
          <div>
            <Text size="small" weight="plus" className="mb-2">{t("seo.section.ga4")}</Text>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Kpi label={t("seo.kpi.users")} value={fmt.n(k.ga4.users)} delta={d?.ga4.users} />
              <Kpi label={t("seo.kpi.newUsers")} value={fmt.n(k.ga4.new_users)} delta={d?.ga4.new_users} />
              <Kpi label={t("seo.kpi.sessions")} value={fmt.n(k.ga4.sessions)} delta={d?.ga4.sessions} />
            </div>
          </div>

          {/* Bing KPIs */}
          {bingOn && (
            <div>
              <Text size="small" weight="plus" className="mb-2">{t("seo.section.bing")}</Text>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Kpi label={t("seo.kpi.clicks")} value={fmt.n(k.bing.clicks)} delta={d?.bing.clicks} />
                <Kpi label={t("seo.kpi.impressions")} value={fmt.n(k.bing.impressions)} delta={d?.bing.impressions} />
              </div>
            </div>
          )}

          {/* Cookie consent */}
          {cookie?.totals && (
            <div>
              <Text size="small" weight="plus" className="mb-2">{t("seo.cookie.title")}</Text>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <Kpi label={t("seo.cookie.shown")} value={fmt.n(cookie.totals.shown)} />
                <Kpi label={t("seo.cookie.accepted")} value={fmt.n(cookie.totals.accepted)} />
                <Kpi label={t("seo.cookie.declined")} value={fmt.n(cookie.totals.declined)} />
                <Kpi label={t("seo.cookie.noClick")} value={fmt.n(cookie.totals.no_click)} />
                <Kpi
                  label={t("seo.cookie.acceptRate")}
                  value={fmt.pct(cookie.totals.shown > 0 ? cookie.totals.accepted / cookie.totals.shown : 0)}
                />
              </div>
            </div>
          )}

          {/* trend */}
          <div className="rounded-lg border border-ui-border-base p-4">
            <Text size="small" weight="plus" className="mb-3">{t("seo.trend")}</Text>
            <TrendChart
              series={overview?.series ?? []}
              formatN={fmt.n}
              loc={loc}
              labels={{
                gscClicks: t("seo.legend.gscClicks"),
                gscImpressions: t("seo.legend.gscImpressions"),
                ga4Users: t("seo.legend.ga4Users"),
              }}
            />
          </div>

          {/* tables */}
          <Tabs value={tab} onValueChange={setTab}>
            <div className="flex items-center justify-between">
              <Tabs.List>
                <Tabs.Trigger value="products">{t("seo.tab.products")}</Tabs.Trigger>
                <Tabs.Trigger value="queries">{t("seo.tab.queries")}</Tabs.Trigger>
                <Tabs.Trigger value="pages">{t("seo.tab.pages")}</Tabs.Trigger>
              </Tabs.List>
              <Select value={source} onValueChange={setSource} size="small">
                <Select.Trigger className="min-w-[120px]"><Select.Value /></Select.Trigger>
                <Select.Content>
                  <Select.Item value="gsc">{t("seo.source.google")}</Select.Item>
                  {bingOn && <Select.Item value="bing">{t("seo.source.bing")}</Select.Item>}
                </Select.Content>
              </Select>
            </div>

            <Tabs.Content value="products" className="mt-3">
              <div className="flex items-center gap-2 mb-2">
                <Badge size="small" color="green">{t("seo.products.badge")}</Badge>
                <Text size="small" className="text-ui-fg-subtle">
                  {t("seo.products.hint", { revenue: fmt.c(totalRevenue) })}
                </Text>
              </div>
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>{t("seo.products.product")}</Table.HeaderCell>
                    <Table.HeaderCell className="text-right">{t("seo.col.clicks")}</Table.HeaderCell>
                    <Table.HeaderCell className="text-right">{t("seo.col.impressions")}</Table.HeaderCell>
                    <Table.HeaderCell className="text-right">{t("seo.col.ctr")}</Table.HeaderCell>
                    <Table.HeaderCell className="text-right">{t("seo.col.position")}</Table.HeaderCell>
                    <Table.HeaderCell className="text-right">{t("seo.products.orders")}</Table.HeaderCell>
                    <Table.HeaderCell className="text-right">{t("seo.products.revenue")}</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {productRows.map((r) => (
                    <Table.Row key={r.handle}>
                      <Table.Cell><span className="line-clamp-1">{r.title}</span></Table.Cell>
                      <Table.Cell className="text-right">{fmt.n(r.clicks)}</Table.Cell>
                      <Table.Cell className="text-right">{fmt.n(r.impressions)}</Table.Cell>
                      <Table.Cell className="text-right">{fmt.pct(r.ctr)}</Table.Cell>
                      <Table.Cell className="text-right">{fmt.pos(r.position)}</Table.Cell>
                      <Table.Cell className="text-right">{fmt.n(r.orders)}</Table.Cell>
                      <Table.Cell className="text-right">{fmt.c(r.revenue)}</Table.Cell>
                    </Table.Row>
                  ))}
                  {!productRows.length && (
                    <Table.Row><Table.Cell colSpan={7}><Text size="small" className="text-ui-fg-subtle py-4">{t("seo.empty")}</Text></Table.Cell></Table.Row>
                  )}
                </Table.Body>
              </Table>
            </Tabs.Content>

            <Tabs.Content value="queries" className="mt-3">
              <BreakdownTable rows={queries} firstLabel={t("seo.col.query")} fmt={fmt} t={t} />
            </Tabs.Content>
            <Tabs.Content value="pages" className="mt-3">
              <BreakdownTable rows={pages} firstLabel={t("seo.col.page")} fmt={fmt} t={t} />
            </Tabs.Content>
          </Tabs>
        </div>
      )}
    </Container>
  )
}

type Fmt = {
  n: (v: number) => string
  c: (v: number) => string
  pct: (v: number) => string
  pos: (v: number | null) => string
}

const BreakdownTable = ({
  rows,
  firstLabel,
  fmt,
  t,
}: {
  rows: Breakdown[]
  firstLabel: string
  fmt: Fmt
  t: (k: string) => string
}) => (
  <Table>
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell>{firstLabel}</Table.HeaderCell>
        <Table.HeaderCell className="text-right">{t("seo.col.clicks")}</Table.HeaderCell>
        <Table.HeaderCell className="text-right">{t("seo.col.impressions")}</Table.HeaderCell>
        <Table.HeaderCell className="text-right">{t("seo.col.ctr")}</Table.HeaderCell>
        <Table.HeaderCell className="text-right">{t("seo.col.position")}</Table.HeaderCell>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {rows.map((r, i) => (
        <Table.Row key={`${r.key}-${i}`}>
          <Table.Cell><span className="line-clamp-1">{r.key}</span></Table.Cell>
          <Table.Cell className="text-right">{fmt.n(r.clicks)}</Table.Cell>
          <Table.Cell className="text-right">{fmt.n(r.impressions)}</Table.Cell>
          <Table.Cell className="text-right">{fmt.pct(r.ctr)}</Table.Cell>
          <Table.Cell className="text-right">{fmt.pos(r.position)}</Table.Cell>
        </Table.Row>
      ))}
      {!rows.length && (
        <Table.Row><Table.Cell colSpan={5}><Text size="small" className="text-ui-fg-subtle py-4">{t("seo.empty")}</Text></Table.Cell></Table.Row>
      )}
    </Table.Body>
  </Table>
)

export const config = defineRouteConfig({
  label: "SEO",
  icon: ChartBar,
})

export default SeoPage
