import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Wrench } from "@medusajs/icons"
import { Button, Container, Drawer, Heading, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { sdk } from "../../lib/client"

type Reparatur = {
  id: string
  kd_nr: string | null
  name: string
  vorname: string
  kontakt: string | null
  strasse_nr: string
  plz: string
  ort: string
  land: string
  tel: string | null
  email: string
  kunden_nummer: string | null
  geraete_nummer: string | null
  anderer_empfaenger: boolean
  datum: string | null
  beschreibung: string
  unterschrift_ort: string | null
  unterschrift_datum: string | null
  unterschrift: string | null
  pdf_url: string | null
  source_url: string | null
  created_at: string
  sales_channel_id: string | null
  sales_channel_name: string | null
}

const PAGE_SIZE = 20

const fmtDate = (v: string) =>
  new Date(v).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

const DetailRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-y-1">
    <Text size="small" leading="compact" weight="plus" className="text-ui-fg-subtle">
      {label}
    </Text>
    <Text size="small" leading="compact" className="text-ui-fg-base">
      {children || "—"}
    </Text>
  </div>
)

const ReparaturPage = () => {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Reparatur | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reparatur", page],
    queryFn: () =>
      sdk.client.fetch<{ reparaturen: Reparatur[]; count: number }>(
        `/admin/reparatur?limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}`
      ),
  })

  const q = search.toLowerCase()
  const rows = (data?.reparaturen ?? []).filter(
    (r) =>
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.vorname.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      (r.geraete_nummer ?? "").toLowerCase().includes(q)
  )

  const totalPages = Math.ceil((data?.count ?? 0) / PAGE_SIZE)

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h1">Reparaturen</Heading>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Reparaturanfragen aus dem Reparaturformular
          </Text>
        </div>
        <Text size="small" leading="compact" className="text-ui-fg-muted">
          {data?.count ?? 0} gesamt
        </Text>
      </div>

      <Container className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-ui-border-base">
          <input
            type="text"
            placeholder="Suche nach Name, E-Mail oder Geräte-Nr…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm border border-ui-border-base rounded-lg px-3 py-2 text-sm bg-ui-bg-field focus:outline-none focus:ring-1 focus:ring-ui-border-interactive"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-5 h-5 border-2 border-ui-border-strong border-t-transparent rounded-full animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <Text size="small" leading="compact" className="text-ui-fg-muted">
              Noch keine Reparaturanfragen
            </Text>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-ui-border-base">
                {["Name", "Vorname", "Ort", "Geräte-Nr.", "E-Mail", "PDF", "Datum"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-medium text-ui-fg-subtle uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className="border-b border-ui-border-base hover:bg-ui-bg-subtle transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <Text size="small" leading="compact" weight="plus">
                      {r.name}
                    </Text>
                  </td>
                  <td className="px-6 py-4">
                    <Text size="small" leading="compact" className="text-ui-fg-subtle">
                      {r.vorname}
                    </Text>
                  </td>
                  <td className="px-6 py-4">
                    <Text size="small" leading="compact" className="text-ui-fg-subtle">
                      {r.ort}
                    </Text>
                  </td>
                  <td className="px-6 py-4">
                    <Text size="small" leading="compact" className="text-ui-fg-subtle">
                      {r.geraete_nummer ?? "—"}
                    </Text>
                  </td>
                  <td className="px-6 py-4">
                    <Text size="small" leading="compact" className="text-ui-fg-subtle">
                      {r.email}
                    </Text>
                  </td>
                  <td className="px-6 py-4">
                    {r.pdf_url ? (
                      <a
                        href={r.pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-ui-fg-interactive hover:underline text-sm"
                      >
                        PDF
                      </a>
                    ) : (
                      <span className="text-ui-fg-muted text-sm">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Text size="small" leading="compact" className="text-ui-fg-subtle">
                      {fmtDate(r.created_at)}
                    </Text>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-ui-border-base">
            <Text size="small" leading="compact" className="text-ui-fg-subtle">
              Seite {page + 1} von {totalPages}
            </Text>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 text-sm border border-ui-border-base rounded-lg disabled:opacity-40 hover:bg-ui-bg-subtle transition-colors"
              >
                Zurück
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 text-sm border border-ui-border-base rounded-lg disabled:opacity-40 hover:bg-ui-bg-subtle transition-colors"
              >
                Weiter
              </button>
            </div>
          </div>
        )}
      </Container>

      <Drawer open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null) }}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>
              Reparatur{selected ? ` — ${selected.vorname} ${selected.name}` : ""}
            </Drawer.Title>
          </Drawer.Header>

          <Drawer.Body className="flex-1 overflow-auto p-4">
            {selected && (
              <div className="flex flex-col gap-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <DetailRow label="Kd. Nr.">{selected.kd_nr}</DetailRow>
                  <DetailRow label="Kunden-Nr.">{selected.kunden_nummer}</DetailRow>
                  <DetailRow label="Name">{selected.name}</DetailRow>
                  <DetailRow label="Vorname">{selected.vorname}</DetailRow>
                  <DetailRow label="Kontakt">{selected.kontakt}</DetailRow>
                  <DetailRow label="Geräte-Nr.">{selected.geraete_nummer}</DetailRow>
                </div>

                <DetailRow label="Adresse">
                  {selected.strasse_nr}
                  <br />
                  {selected.plz} {selected.ort}
                  <br />
                  {selected.land}
                </DetailRow>

                <div className="grid grid-cols-2 gap-4">
                  <DetailRow label="Telefon">{selected.tel}</DetailRow>
                  <DetailRow label="E-Mail">
                    <a
                      href={`mailto:${selected.email}`}
                      className="text-ui-fg-interactive hover:underline"
                    >
                      {selected.email}
                    </a>
                  </DetailRow>
                  <DetailRow label="Anderer Empfänger">
                    {selected.anderer_empfaenger ? "Ja" : "Nein"}
                  </DetailRow>
                  <DetailRow label="Channel">{selected.sales_channel_name}</DetailRow>
                </div>

                <div className="flex flex-col gap-y-1">
                  <Text size="small" leading="compact" weight="plus" className="text-ui-fg-subtle">
                    Beschreibung
                  </Text>
                  <div className="rounded-lg border border-ui-border-base bg-ui-bg-subtle p-3">
                    <Text size="small" className="whitespace-pre-wrap break-words">
                      {selected.beschreibung}
                    </Text>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <DetailRow label="Unterschrift (Ort)">{selected.unterschrift_ort}</DetailRow>
                  <DetailRow label="Unterschrift (Datum)">{selected.unterschrift_datum}</DetailRow>
                  <DetailRow label="Unterschrift">{selected.unterschrift}</DetailRow>
                  <DetailRow label="Eingegangen">{fmtDate(selected.created_at)}</DetailRow>
                </div>

                <DetailRow label="PDF">
                  {selected.pdf_url ? (
                    <a
                      href={selected.pdf_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-ui-fg-interactive hover:underline"
                    >
                      Reparaturformular öffnen
                    </a>
                  ) : (
                    "—"
                  )}
                </DetailRow>

                {selected.source_url && (
                  <DetailRow label="Seite">
                    <a
                      href={selected.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-ui-fg-interactive hover:underline break-all"
                    >
                      {selected.source_url}
                    </a>
                  </DetailRow>
                )}
              </div>
            )}
          </Drawer.Body>

          <Drawer.Footer>
            <Drawer.Close asChild>
              <Button size="small" variant="secondary">Schließen</Button>
            </Drawer.Close>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Reparaturen",
  icon: Wrench,
})

export default ReparaturPage
