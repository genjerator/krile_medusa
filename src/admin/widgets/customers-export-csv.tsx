import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { ArrowDownTray } from "@medusajs/icons"
import { Button, Container, Text, toast } from "@medusajs/ui"
import { useState } from "react"
import { sdk } from "../lib/client"

/**
 * "Export CSV" button shown above the admin Customers list. Calls the custom
 * `/admin/customers/export-csv` route and downloads the returned file.
 *
 * The SDK returns the raw Response (not parsed JSON) because we send
 * `accept: text/csv`, so we can read the body as a blob and trigger a download.
 */
const CustomersExportCsvWidget = () => {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const res = await sdk.client.fetch<Response>("/admin/customers/export-csv", {
        headers: { accept: "text/csv" },
      })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `customers-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      toast.success("Customers exported")
    } catch (err: any) {
      toast.error("Export failed", { description: err?.message ?? "Unknown error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="mb-4 flex items-center justify-between px-6 py-4">
      <div className="flex flex-col gap-y-1">
        <Text size="small" leading="compact" weight="plus">
          Export customers
        </Text>
        <Text size="small" leading="compact" className="text-ui-fg-subtle">
          Download all customers with an email address as a CSV file.
        </Text>
      </div>
      <Button size="small" variant="secondary" onClick={handleExport} isLoading={loading}>
        <ArrowDownTray />
        Export CSV
      </Button>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "customer.list.before",
})

export default CustomersExportCsvWidget
