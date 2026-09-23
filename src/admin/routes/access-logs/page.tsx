import { defineRouteConfig } from "@medusajs/admin-sdk"
import { DocumentText } from "@medusajs/icons"
import { Container, Heading, Select, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { sdk } from "../../lib/client"

type AccessEntry = {
  time: string
  client_ip: string | null
  method: string | null
  host: string | null
  uri: string | null
  status: number | null
  duration_ms: number | null
  size: number | null
  user_agent: string | null
}

type AccessLogResponse = {
  logs: AccessEntry[]
  count: number
  total_parsed: number
  available: boolean
  source: string | null
  hosts: string[]
}

const LIMIT_OPTIONS = [100, 250, 500]
const STATUS_OPTIONS = ["2xx", "3xx", "4xx", "5xx"]

const statusColor = (status: number | null) => {
  if (status == null) return "text-ui-fg-muted"
  if (status >= 500) return "text-ui-fg-error"
  if (status >= 400) return "text-ui-tag-orange-text"
  if (status >= 300) return "text-ui-fg-subtle"
  return "text-ui-tag-green-text"
}

// Radix-based Select forbids an empty-string item value, so "all" is the
// sentinel for "no filter".
const ALL = "all"

const AccessLogsPage = () => {
  const [host, setHost] = useState(ALL)
  const [status, setStatus] = useState(ALL)
  const [limit, setLimit] = useState(100)
  const [pathSearch, setPathSearch] = useState("")
  const [autoRefresh, setAutoRefresh] = useState(false)

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin-access-logs", host, status, limit],
    queryFn: () => {
      const qs = new URLSearchParams()
      qs.set("limit", String(limit))
      if (host !== ALL) qs.set("host", host)
      if (status !== ALL) qs.set("status", status)
      return sdk.client.fetch<AccessLogResponse>(`/admin/access-logs?${qs.toString()}`)
    },
    refetchInterval: autoRefresh ? 10000 : false,
  })

  // Path filter is applied client-side on the fetched window for instant feedback.
  const rows = (data?.logs ?? []).filter(
    (e) => !pathSearch || (e.uri ?? "").toLowerCase().includes(pathSearch.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h1">Access Logs</Heading>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Recent requests from the Caddy access log
          </Text>
        </div>
        <Text size="small" leading="compact" className="text-ui-fg-muted">
          {data?.available ? `${rows.length} shown · ${data.total_parsed} in window` : "log not available"}
        </Text>
      </div>

      <Container className="p-0 overflow-hidden">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-ui-border-base">
          <div className="w-56">
            <Select value={host} onValueChange={setHost}>
              <Select.Trigger>
                <Select.Value placeholder="All hosts" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value={ALL}>All hosts</Select.Item>
                {(data?.hosts ?? []).map((h) => (
                  <Select.Item key={h} value={h}>
                    {h}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>

          <div className="w-36">
            <Select value={status} onValueChange={setStatus}>
              <Select.Trigger>
                <Select.Value placeholder="All status" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value={ALL}>All status</Select.Item>
                {STATUS_OPTIONS.map((s) => (
                  <Select.Item key={s} value={s}>
                    {s}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>

          <input
            type="text"
            placeholder="Filter path…"
            value={pathSearch}
            onChange={(e) => setPathSearch(e.target.value)}
            className="flex-1 min-w-40 max-w-sm border border-ui-border-base rounded-lg px-3 py-2 text-sm bg-ui-bg-field focus:outline-none focus:ring-1 focus:ring-ui-border-interactive"
          />

          <div className="w-28">
            <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {LIMIT_OPTIONS.map((n) => (
                  <Select.Item key={n} value={String(n)}>
                    {n} rows
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>

          <label className="flex items-center gap-2 text-sm text-ui-fg-subtle select-none">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh
          </label>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-3 py-1.5 text-sm border border-ui-border-base rounded-lg disabled:opacity-40 hover:bg-ui-bg-subtle transition-colors"
          >
            {isFetching ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-5 h-5 border-2 border-ui-border-strong border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !data?.available ? (
          <div className="flex flex-col items-center justify-center gap-1 py-16">
            <Text size="small" leading="compact" className="text-ui-fg-muted">
              No access log found.
            </Text>
            <Text size="small" leading="compact" className="text-ui-fg-muted">
              Set ACCESS_LOG_PATH, or mount Caddy's log at /var/log/caddy/access.log.
            </Text>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <Text size="small" leading="compact" className="text-ui-fg-muted">
              No matching requests
            </Text>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ui-border-base">
                  {["Time", "IP", "Method", "Host", "Path", "Status", "ms", "User-Agent"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium text-ui-fg-subtle uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((e, i) => (
                  <tr key={i} className="border-b border-ui-border-base hover:bg-ui-bg-subtle transition-colors">
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <Text size="small" leading="compact" className="text-ui-fg-subtle">
                        {e.time
                          ? new Date(e.time).toLocaleString("de-DE", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })
                          : "—"}
                      </Text>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <Text size="small" leading="compact" className="font-mono text-ui-fg-subtle">
                        {e.client_ip ?? "—"}
                      </Text>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <Text size="small" leading="compact" weight="plus">
                        {e.method ?? "—"}
                      </Text>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <Text size="small" leading="compact" className="text-ui-fg-subtle">
                        {e.host ?? "—"}
                      </Text>
                    </td>
                    <td className="px-4 py-2.5 max-w-md">
                      <Text size="small" leading="compact" className="font-mono truncate block" title={e.uri ?? ""}>
                        {e.uri ?? "—"}
                      </Text>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <Text size="small" leading="compact" weight="plus" className={statusColor(e.status)}>
                        {e.status ?? "—"}
                      </Text>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <Text size="small" leading="compact" className="text-ui-fg-muted">
                        {e.duration_ms ?? "—"}
                      </Text>
                    </td>
                    <td className="px-4 py-2.5 max-w-xs">
                      <Text size="small" leading="compact" className="text-ui-fg-muted truncate block" title={e.user_agent ?? ""}>
                        {e.user_agent ?? "—"}
                      </Text>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Container>

      {data?.source && (
        <Text size="xsmall" leading="compact" className="text-ui-fg-muted font-mono">
          source: {data.source}
        </Text>
      )}
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Access Logs",
  icon: DocumentText,
})

export default AccessLogsPage
