import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChatBubble } from "@medusajs/icons"
import { Button, Container, Drawer, Heading, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { sdk } from "../../lib/client"

type Inquiry = {
  id: string
  product_id: string
  product_handle: string | null
  name: string
  email: string
  message: string
  created_at: string
  sales_channel_id: string | null
  sales_channel_name: string | null
}

const DEFAULT_STOREFRONT_URL = "https://www.planetaindustries.de"

const STOREFRONT_URL_BY_CHANNEL: Record<string, string> = {
  "IndustriesWebshop": "https://www.planetaindustries.de",
  "PlanetaWebshop": "https://www.planeta.de",
}

const getStorefrontUrl = (channelName: string | null) =>
  (channelName && STOREFRONT_URL_BY_CHANNEL[channelName]) || DEFAULT_STOREFRONT_URL

const PAGE_SIZE = 20

const DetailRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-y-1">
    <Text size="small" leading="compact" weight="plus" className="text-ui-fg-subtle">
      {label}
    </Text>
    <Text size="small" leading="compact" className="text-ui-fg-base">
      {children}
    </Text>
  </div>
)

const InquiriesPage = () => {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Inquiry | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["admin-inquiries", page],
    queryFn: () =>
      sdk.client.fetch<{ inquiries: Inquiry[]; count: number }>(
        `/admin/inquiries?limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}`
      ),
  })

  const inquiries = (data?.inquiries ?? []).filter(
    (i) =>
      !search ||
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.email.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil((data?.count ?? 0) / PAGE_SIZE)

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h1">Inquiries</Heading>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Product offer requests from customers
          </Text>
        </div>
        <Text size="small" leading="compact" className="text-ui-fg-muted">
          {data?.count ?? 0} total
        </Text>
      </div>

      <Container className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-ui-border-base">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm border border-ui-border-base rounded-lg px-3 py-2 text-sm bg-ui-bg-field focus:outline-none focus:ring-1 focus:ring-ui-border-interactive"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-5 h-5 border-2 border-ui-border-strong border-t-transparent rounded-full animate-spin" />
          </div>
        ) : inquiries.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <Text size="small" leading="compact" className="text-ui-fg-muted">
              No inquiries yet
            </Text>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-ui-border-base">
                {["Name", "E-Mail", "Product", "Channel", "Message", "Date"].map((h) => (
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
              {inquiries.map((inquiry) => (
                <tr
                  key={inquiry.id}
                  onClick={() => setSelected(inquiry)}
                  className="border-b border-ui-border-base hover:bg-ui-bg-subtle transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <Text size="small" leading="compact" weight="plus">
                      {inquiry.name}
                    </Text>
                  </td>
                  <td className="px-6 py-4">
                    <Text size="small" leading="compact" className="text-ui-fg-subtle">
                      {inquiry.email}
                    </Text>
                  </td>
                  <td className="px-6 py-4">
                    <Text size="small" leading="compact" className="text-ui-fg-subtle text-xs">
                      <a
                        href={`/app/products/${inquiry.product_id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-ui-fg-interactive hover:underline"
                      >
                        admin
                      </a>
                      {" : "}
                      {inquiry.product_handle ? (
                        <a
                          href={`${getStorefrontUrl(inquiry.sales_channel_name)}/de/products/${inquiry.product_handle}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-ui-fg-interactive hover:underline"
                        >
                          site
                        </a>
                      ) : (
                        <span className="text-ui-fg-muted">site</span>
                      )}
                    </Text>
                  </td>
                  <td className="px-6 py-4">
                    <Text size="small" leading="compact" className="text-ui-fg-subtle">
                      {inquiry.sales_channel_name ?? "—"}
                    </Text>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <Text size="small" leading="compact" className="text-ui-fg-subtle truncate block">
                      {inquiry.message}
                    </Text>
                  </td>
                  <td className="px-6 py-4">
                    <Text size="small" leading="compact" className="text-ui-fg-subtle">
                      {new Date(inquiry.created_at).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
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
              Page {page + 1} of {totalPages}
            </Text>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 text-sm border border-ui-border-base rounded-lg disabled:opacity-40 hover:bg-ui-bg-subtle transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 text-sm border border-ui-border-base rounded-lg disabled:opacity-40 hover:bg-ui-bg-subtle transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Container>

      <Drawer open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null) }}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Inquiry{selected ? ` — ${selected.name}` : ""}</Drawer.Title>
          </Drawer.Header>

          <Drawer.Body className="flex-1 overflow-auto p-4">
            {selected && (
              <div className="flex flex-col gap-y-4">
                <DetailRow label="Name">{selected.name}</DetailRow>
                <DetailRow label="E-Mail">
                  <a
                    href={`mailto:${selected.email}`}
                    className="text-ui-fg-interactive hover:underline"
                  >
                    {selected.email}
                  </a>
                </DetailRow>
                <DetailRow label="Channel">{selected.sales_channel_name ?? "—"}</DetailRow>
                <DetailRow label="Product">
                  <a
                    href={`/app/products/${selected.product_id}`}
                    className="text-ui-fg-interactive hover:underline"
                  >
                    admin
                  </a>
                  {selected.product_handle ? (
                    <>
                      {" : "}
                      <a
                        href={`${getStorefrontUrl(selected.sales_channel_name)}/de/products/${selected.product_handle}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-ui-fg-interactive hover:underline"
                      >
                        site
                      </a>
                    </>
                  ) : null}
                </DetailRow>
                <DetailRow label="Date">
                  {new Date(selected.created_at).toLocaleString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </DetailRow>

                <div className="flex flex-col gap-y-1">
                  <Text size="small" leading="compact" weight="plus" className="text-ui-fg-subtle">
                    Message
                  </Text>
                  <div className="rounded-lg border border-ui-border-base bg-ui-bg-subtle p-3">
                    <Text size="small" className="whitespace-pre-wrap break-words">
                      {selected.message}
                    </Text>
                  </div>
                </div>
              </div>
            )}
          </Drawer.Body>

          <Drawer.Footer>
            <Drawer.Close asChild>
              <Button size="small" variant="secondary">Close</Button>
            </Drawer.Close>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Inquiries",
  icon: ChatBubble,
})

export default InquiriesPage
