import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Button, Checkbox, Container, Label, Text, toast } from "@medusajs/ui"
import { useMutation } from "@tanstack/react-query"
import { useRef, useState } from "react"
import { sdk } from "../lib/client"

type ImportStats = {
  rowsRead: number
  skippedUnusable: number
  skippedByFilter: number
  duplicatesInFile: number
  toCreate: number
  toUpdate: number
  created: number
  updated: number
  failed: number
  dryRun: boolean
  issues: string[]
}

const CrmImportWidget = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [onlyEmail, setOnlyEmail] = useState(true)
  const [requireAddress, setRequireAddress] = useState(false)
  const [dryRun, setDryRun] = useState(true)
  const [stats, setStats] = useState<ImportStats | null>(null)

  const importMutation = useMutation({
    mutationFn: async () => {
      if (!file) {
        throw new Error("Bitte zuerst eine Datei auswählen.")
      }
      const formData = new FormData()
      formData.append("file", file)
      formData.append("dry_run", String(dryRun))
      formData.append("only_email", String(onlyEmail))
      formData.append("require_address", String(requireAddress))

      return sdk.client.fetch<{ stats: ImportStats }>("/admin/crm-import", {
        method: "POST",
        body: formData,
        // Let the browser set the multipart boundary itself.
        headers: { "content-type": null } as unknown as Record<string, string>,
      })
    },
    onSuccess: ({ stats }) => {
      setStats(stats)
      toast.success(
        stats.dryRun
          ? `Testlauf: ${stats.toCreate} würden angelegt, ${stats.toUpdate} aktualisiert.`
          : `Import fertig: ${stats.created} angelegt, ${stats.updated} aktualisiert, ${stats.failed} fehlgeschlagen.`
      )
    },
    onError: (error: Error) => {
      toast.error(error.message || "Import fehlgeschlagen")
    },
  })

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Text size="small" leading="compact" weight="plus">
            Kunden-Import aus CRM-Datei (CSV / Excel)
          </Text>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Bestehende Kunden (gleiche E-Mail oder Kundennummer) werden aktualisiert, neue
            angelegt — es wird nie etwas gelöscht.
          </Text>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null)
            setStats(null)
          }}
        />
        <Button
          size="small"
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={importMutation.isPending}
        >
          {file ? file.name : "Datei auswählen"}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-6 px-6 py-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="crm-only-email"
            checked={onlyEmail}
            onCheckedChange={(v) => setOnlyEmail(v === true)}
          />
          <Label htmlFor="crm-only-email" size="small">
            Nur Kontakte mit E-Mail-Adresse
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="crm-require-address"
            checked={requireAddress}
            onCheckedChange={(v) => setRequireAddress(v === true)}
          />
          <Label htmlFor="crm-require-address" size="small">
            Nur Kontakte mit vollständiger Adresse
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="crm-dry-run"
            checked={dryRun}
            onCheckedChange={(v) => setDryRun(v === true)}
          />
          <Label htmlFor="crm-dry-run" size="small">
            Testlauf (nichts speichern)
          </Label>
        </div>
        <Button
          size="small"
          onClick={() => importMutation.mutate()}
          disabled={!file || importMutation.isPending}
          isLoading={importMutation.isPending}
        >
          {dryRun ? "Testlauf starten" : "Import starten"}
        </Button>
      </div>

      {stats && (
        <div className="px-6 py-4">
          <Text size="small" leading="compact" weight="plus">
            {stats.dryRun ? "Testlauf-Ergebnis" : "Import-Ergebnis"}
          </Text>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            {stats.rowsRead} Zeilen gelesen · {stats.skippedByFilter} durch Filter übersprungen ·{" "}
            {stats.skippedUnusable} unbrauchbar · {stats.duplicatesInFile} Duplikate in der Datei
          </Text>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            {stats.dryRun
              ? `${stats.toCreate} Kunden würden neu angelegt, ${stats.toUpdate} aktualisiert.`
              : `${stats.created} Kunden neu angelegt, ${stats.updated} aktualisiert, ${stats.failed} fehlgeschlagen.`}
          </Text>
          {stats.issues.length > 0 && (
            <div className="mt-2 max-h-40 overflow-y-auto rounded-md bg-ui-bg-subtle p-2">
              {stats.issues.map((issue, i) => (
                <Text key={i} size="xsmall" leading="compact" className="text-ui-fg-subtle">
                  {issue}
                </Text>
              ))}
            </div>
          )}
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "customer.list.before",
})

export default CrmImportWidget
