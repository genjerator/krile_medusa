import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { promises as fs } from "fs"
import path from "path"

// Reads the tail of Caddy's JSON access log and returns recent requests for the
// admin "Access Logs" page. Read-only; never writes. On the Strato VPS the log
// is bind-mounted into this container at /var/log/caddy/access.log (see
// docker-compose.strato.yml). Locally there is no Caddy, so it falls back to a
// sample file at <repo>/logs/caddy/access.log (and ACCESS_LOG_PATH overrides all).

const MAX_READ_BYTES = 2 * 1024 * 1024 // only ever read the last 2 MB of the file
const DEFAULT_LIMIT = 200
const MAX_LIMIT = 1000

function candidatePaths(): string[] {
  const envPath = process.env.ACCESS_LOG_PATH
  return [
    ...(envPath ? [envPath] : []),
    "/var/log/caddy/access.log",
    path.join(process.cwd(), "logs", "caddy", "access.log"),
  ]
}

async function resolveLogPath(): Promise<string | null> {
  for (const p of candidatePaths()) {
    try {
      if ((await fs.stat(p)).isFile()) return p
    } catch {
      // not present — try next candidate
    }
  }
  return null
}

// Read only the last `maxBytes` of the file; drop the first (likely partial)
// line when we didn't start at byte 0.
async function readTail(file: string, maxBytes: number): Promise<string> {
  const handle = await fs.open(file, "r")
  try {
    const { size } = await handle.stat()
    const start = size > maxBytes ? size - maxBytes : 0
    const length = size - start
    if (length <= 0) return ""
    const buf = Buffer.alloc(length)
    await handle.read(buf, 0, length, start)
    let text = buf.toString("utf8")
    if (start > 0) {
      const nl = text.indexOf("\n")
      if (nl !== -1) text = text.slice(nl + 1)
    }
    return text
  } finally {
    await handle.close()
  }
}

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

function parseLine(line: string): AccessEntry | null {
  let obj: any
  try {
    obj = JSON.parse(line)
  } catch {
    return null
  }
  const r = obj?.request
  if (!r) return null // skip non-access lines
  const tsSec = typeof obj.ts === "number" ? obj.ts : Number(obj.ts)
  return {
    time: Number.isFinite(tsSec) ? new Date(tsSec * 1000).toISOString() : "",
    client_ip: r.client_ip ?? r.remote_ip ?? null,
    method: r.method ?? null,
    host: r.host ?? null,
    uri: r.uri ?? null,
    status: typeof obj.status === "number" ? obj.status : null,
    duration_ms: typeof obj.duration === "number" ? Math.round(obj.duration * 1000) : null,
    size: typeof obj.size === "number" ? obj.size : null,
    user_agent: r.headers?.["User-Agent"]?.[0] ?? null,
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const file = await resolveLogPath()
  if (!file) {
    return res.json({ logs: [], count: 0, total_parsed: 0, available: false, source: null, hosts: [] })
  }

  const limit = Math.min(Number(req.query.limit) || DEFAULT_LIMIT, MAX_LIMIT)
  const hostFilter = (req.query.host as string) || ""
  const statusParam = (req.query.status as string) || ""
  const pathFilter = ((req.query.path as string) || "").toLowerCase()

  const text = await readTail(file, MAX_READ_BYTES)

  const all: AccessEntry[] = []
  for (const line of text.split("\n")) {
    if (!line.trim()) continue
    const entry = parseLine(line)
    if (entry) all.push(entry)
  }

  // Distinct hosts for the filter dropdown (from the whole window, pre-filter).
  const hosts = [...new Set(all.map((e) => e.host).filter((h): h is string => !!h))].sort()

  let filtered = all
  if (hostFilter) {
    filtered = filtered.filter((e) => e.host === hostFilter)
  }
  if (statusParam) {
    if (/^\dxx$/i.test(statusParam)) {
      const cls = statusParam[0]
      filtered = filtered.filter((e) => e.status != null && String(e.status)[0] === cls)
    } else {
      const n = Number(statusParam)
      if (!Number.isNaN(n)) filtered = filtered.filter((e) => e.status === n)
    }
  }
  if (pathFilter) {
    filtered = filtered.filter((e) => (e.uri ?? "").toLowerCase().includes(pathFilter))
  }

  filtered.reverse() // newest first
  const logs = filtered.slice(0, limit)

  return res.json({
    logs,
    count: logs.length,
    total_parsed: all.length,
    available: true,
    source: file,
    hosts,
  })
}
