import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChartBar } from "@medusajs/icons"
import { Container, Heading, Text, Badge } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { sdk } from "../../lib/client"

type DashboardStats = {
  currency_code: string
  month: { orders: number; revenue: number; new_customers: number }
  totals: { customers: number }
  series: { key: string; label: string; orders: number; revenue: number }[]
}

const eur = (amount: number, currency: string) =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: (currency || "EUR").toUpperCase(),
    maximumFractionDigits: 2,
  }).format(Number(amount || 0))

const int = (n: number) => new Intl.NumberFormat("de-DE").format(Number(n || 0))

// ── KPI card ──────────────────────────────────────────────────────────────────
const Kpi = ({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) => (
  <Container className="flex flex-col gap-y-2 p-6">
    <Text size="small" leading="compact" className="text-ui-fg-subtle">
      {label}
    </Text>
    <Heading level="h2" className="text-3xl">
      {value}
    </Heading>
    {hint && (
      <Text size="small" leading="compact" className="text-ui-fg-muted">
        {hint}
      </Text>
    )}
  </Container>
)

const DashboardPage = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => sdk.client.fetch<DashboardStats>("/admin/dashboard/stats"),
  })

  const currency = data?.currency_code || "eur"

  return (
    <div className="flex flex-col gap-y-4 p-6">
      <div>
        <Heading level="h1">Dashboard</Heading>
        <Text size="small" leading="compact" className="text-ui-fg-subtle">
          Bestellungen, Umsatz und Kunden im Überblick.
        </Text>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-5 h-5 border-2 border-ui-border-strong border-t-transparent rounded-full animate-spin" />
        </div>
      ) : isError || !data ? (
        <Container className="p-6">
          <Text size="small" className="text-ui-fg-error">
            Statistiken konnten nicht geladen werden.
          </Text>
        </Container>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-1 small:grid-cols-2 large:grid-cols-4 gap-4">
            <Kpi label="Bestellungen (dieser Monat)" value={int(data.month.orders)} />
            <Kpi
              label="Umsatz (dieser Monat)"
              value={eur(data.month.revenue, currency)}
            />
            <Kpi label="Kunden gesamt" value={int(data.totals.customers)} />
            <Kpi
              label="Neue Kunden (dieser Monat)"
              value={int(data.month.new_customers)}
            />
          </div>

          {/* Trend chart */}
          <Container className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <Text size="small" leading="compact" weight="plus">
                  Bestellungen & Umsatz
                </Text>
                <Text size="small" leading="compact" className="text-ui-fg-subtle">
                  Letzte 6 Monate
                </Text>
              </div>
              <Badge size="2xsmall" color="grey">
                {currency.toUpperCase()}
              </Badge>
            </div>

            <ResponsiveContainer width="100%" height={340}>
              <ComposedChart data={data.series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis
                  yAxisId="orders"
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  width={32}
                />
                <YAxis
                  yAxisId="revenue"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  width={64}
                  tickFormatter={(v: number) => eur(v, currency)}
                />
                <Tooltip
                  formatter={(value: any, name: any) =>
                    name === "Umsatz"
                      ? [eur(Number(value), currency), name]
                      : [int(Number(value)), name]
                  }
                />
                <Legend />
                <Bar
                  yAxisId="orders"
                  dataKey="orders"
                  name="Bestellungen"
                  fill="#1e3a5f"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={44}
                />
                <Line
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenue"
                  name="Umsatz"
                  stroke="#e11d48"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Container>
        </>
      )}
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Dashboard",
  icon: ChartBar,
})

export default DashboardPage
