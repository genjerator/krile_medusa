import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  createDataTableColumnHelper,
  DataTable,
  useDataTable,
  Badge,
  Button,
  Container,
  Heading,
  Text,
  toast,
} from "@medusajs/ui"
import { ArrowDownTray, ArrowUpRightOnBox, Channels } from "@medusajs/icons"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { sdk } from "../../lib/client"

type ProductCategory = {
  id: string
  name: string
  parent_category_id: string | null
  parent_category?: { name: string } | null
}

type Product = {
  id: string
  title: string
  handle: string | null
  thumbnail: string | null
  status: string
  categories?: ProductCategory[]
  sales_channels?: Array<{ id: string; name: string }>
  variants?: Array<{
    id: string
    prices?: Array<{ amount: number; currency_code: string }>
  }>
}

const PAGE_SIZE = 20

const STOREFRONT_BY_CHANNEL: Record<string, string> = {
  IndustriesWebshop: "https://www.planetaindustries.de",
  PlanetaWebshop: "https://www.planeta.de",
}
const DEFAULT_STOREFRONT = "https://www.planetaindustries.de"

const getStorefrontUrl = (channels: Array<{ name: string }> | undefined | null) => {
  if (!channels?.length) return DEFAULT_STOREFRONT
  for (const ch of channels) {
    if (STOREFRONT_BY_CHANNEL[ch.name]) return STOREFRONT_BY_CHANNEL[ch.name]
  }
  return DEFAULT_STOREFRONT
}

const getCategoryInfo = (categories: ProductCategory[] | undefined) => {
  if (!categories?.length) return { category: null, subcategory: null }

  const withParent = categories.filter((c) => c.parent_category_id)
  const withoutParent = categories.filter((c) => !c.parent_category_id)

  // All child categories, comma-separated when there is more than one.
  const subcategory = withParent.length
    ? withParent.map((c) => c.name).join(", ")
    : null

  if (withoutParent.length > 0) {
    return { category: withoutParent[0].name, subcategory }
  }
  if (withParent.length > 0) {
    return { category: withParent[0].parent_category?.name ?? null, subcategory }
  }
  return { category: null, subcategory: null }
}

type VariantPrice = { amount: number; currency_code: string }

// One price per variant (prefer EUR, else the first price), in variant order.
const getVariantPrices = (variants: Product["variants"]): VariantPrice[] => {
  if (!variants?.length) return []
  return variants
    .map((v) => {
      const list = v.prices ?? []
      return list.find((p) => p.currency_code === "eur") ?? list[0] ?? null
    })
    .filter((p): p is VariantPrice => p != null)
}

// Format a raw Medusa amount (stored as-is, not in cents) as money.
const formatMoney = (amount: number, currency: string): string => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount)
  } catch {
    return `${amount} ${currency.toUpperCase()}`
  }
}

const STATUS_COLOR: Record<string, "green" | "grey" | "orange" | "red" | "blue" | "purple"> = {
  published: "green",
  draft: "grey",
  proposed: "blue",
  rejected: "red",
}

const columnHelper = createDataTableColumnHelper<Product>()

const columns = [
  columnHelper.accessor("title", {
    header: "Product",
    cell: ({ row }) => (
      <div className="flex items-center gap-3 min-w-0">
        {row.original.thumbnail ? (
          <img
            src={row.original.thumbnail}
            alt=""
            className="w-8 h-8 object-cover rounded flex-shrink-0"
          />
        ) : (
          <div className="w-8 h-8 bg-ui-bg-subtle rounded flex-shrink-0" />
        )}
        <Text size="small" leading="compact" className="truncate">
          {row.original.title}
        </Text>
      </div>
    ),
    size: 280,
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue()
      return (
        <Badge color={STATUS_COLOR[status] ?? "grey"} size="2xsmall" className="capitalize">
          {status}
        </Badge>
      )
    },
    size: 100,
  }),
  columnHelper.display({
    id: "category",
    header: "Category",
    cell: ({ row }) => {
      const { category } = getCategoryInfo(row.original.categories)
      return category ? (
        <Text size="small" leading="compact" className="text-ui-fg-base">
          {category}
        </Text>
      ) : (
        <Text size="small" leading="compact" className="text-ui-fg-muted">—</Text>
      )
    },
    size: 160,
  }),
  columnHelper.display({
    id: "subcategory",
    header: "Subcategory",
    cell: ({ row }) => {
      const { subcategory } = getCategoryInfo(row.original.categories)
      return subcategory ? (
        <Text size="small" leading="compact" className="text-ui-fg-base">
          {subcategory}
        </Text>
      ) : (
        <Text size="small" leading="compact" className="text-ui-fg-muted">—</Text>
      )
    },
    size: 160,
  }),
  columnHelper.display({
    id: "prices",
    header: "Prices",
    cell: ({ row }) => {
      const prices = getVariantPrices(row.original.variants)
      return prices.length ? (
        <Text size="small" leading="compact" className="text-ui-fg-base">
          {prices.map((p) => formatMoney(p.amount, p.currency_code)).join(", ")}
        </Text>
      ) : (
        <Text size="small" leading="compact" className="text-ui-fg-muted">—</Text>
      )
    },
    size: 160,
  }),
  columnHelper.display({
    id: "storefront",
    header: "",
    cell: ({ row }) => {
      const p = row.original
      if (!p.handle) return null
      const url = `${getStorefrontUrl(p.sales_channels)}/de/product/${p.handle}`
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          title={`View ${p.handle} on storefront`}
        >
          <Button size="small" variant="transparent">
            <ArrowUpRightOnBox />
          </Button>
        </a>
      )
    },
    size: 50,
  }),
]

const ProductsByChannelPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get("q") ?? ""
  const setSearch = (value: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set("q", value)
        else next.delete("q")
        return next
      },
      { replace: true }
    )
  }
  const [pageIndex, setPageIndex] = useState(0)
  const [channelId, setChannelId] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const queryClient = useQueryClient()

  // Switch channel: reset to first page and clear the cached product list so
  // fresh data is fetched (no stale rows from the previously selected channel).
  const changeChannel = (id: string | null) => {
    setChannelId(id)
    setPageIndex(0)
    queryClient.invalidateQueries({ queryKey: ["products-custom-list"] })
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const qs = channelId ? `?sales_channel_id=${encodeURIComponent(channelId)}` : ""
      const res = await sdk.client.fetch<Response>(`/admin/products/export-csv${qs}`, {
        headers: { accept: "text/csv" },
      })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `products-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      toast.success("Products exported")
    } catch (err: any) {
      toast.error("Export failed", { description: err?.message ?? "Unknown error" })
    } finally {
      setExporting(false)
    }
  }

  const { data: channelsData } = useQuery({
    queryKey: ["sales-channels-filter"],
    queryFn: () => sdk.admin.salesChannel.list({ limit: 50 }),
  })
  const channels = (channelsData as any)?.sales_channels ?? []
  const industriesWebshop = channels.find((c: any) => c.name === "IndustriesWebshop")
  const planetaWebshop = channels.find((c: any) => c.name === "PlanetaWebshop")

  const queryParams: Record<string, any> = {
    limit: PAGE_SIZE,
    offset: pageIndex * PAGE_SIZE,
    fields: "id,title,handle,thumbnail,status,sales_channels.id,sales_channels.name,categories.id,categories.name,categories.parent_category_id,categories.parent_category.name,variants.id,variants.prices.amount,variants.prices.currency_code",
    order: "-created_at",
  }
  if (search) queryParams.q = search
  if (channelId) queryParams.sales_channel_id = channelId

  const { data, isLoading } = useQuery({
    queryKey: ["products-custom-list", pageIndex, search, channelId],
    queryFn: () => sdk.admin.product.list(queryParams),
    // Keep previous rows only while paging/searching within the SAME channel;
    // on a channel switch drop the placeholder so stale rows don't flash.
    placeholderData: (prev, prevQuery) => {
      const prevChannelId = (prevQuery?.queryKey as unknown[] | undefined)?.[3] ?? null
      return prevChannelId === channelId ? prev : undefined
    },
  })

  const products: Product[] = (data as any)?.products ?? []
  const count: number = (data as any)?.count ?? 0

  const table = useDataTable<Product>({
    data: products,
    columns: columns as any,
    rowCount: count,
    isLoading,
    pagination: {
      state: { pageIndex, pageSize: PAGE_SIZE },
      onPaginationChange: (state) => setPageIndex(state.pageIndex),
    },
    search: {
      state: search,
      onSearchChange: (v) => {
        setSearch(v)
        setPageIndex(0)
      },
      debounce: 400,
    },
    // NOTE: Medusa types `row` as the data, but at runtime it passes the
    // TanStack Row object (row.id is the index, row.original is the product).
    onRowClick: (_, row) => {
      const r = row as any
      navigate(`/products/${r.original?.id ?? r.id}`)
    },
  })

  return (
    <div className="flex flex-col gap-y-2 p-6">
      <div className="flex items-center justify-between mb-2">
        <Heading level="h1">Products by Channel</Heading>
        <div className="flex items-center gap-2">
          <Button size="small" variant="secondary" onClick={handleExport} isLoading={exporting}>
            <ArrowDownTray />
            Export CSV
          </Button>
          <Button size="small" onClick={() => navigate("/products/create")}>
            Create
          </Button>
        </div>
      </div>

      <Container className="p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-3 border-b border-ui-border-base">
          <Text size="small" weight="plus" className="text-ui-fg-subtle mr-1">
            Channel:
          </Text>
          <Button
            size="small"
            variant={channelId === null ? "primary" : "secondary"}
            onClick={() => changeChannel(null)}
          >
            All
          </Button>
          {industriesWebshop && (
            <Button
              size="small"
              variant={channelId === industriesWebshop.id ? "primary" : "secondary"}
              onClick={() => changeChannel(industriesWebshop.id)}
            >
              IndustriesWebshop
            </Button>
          )}
          {planetaWebshop && (
            <Button
              size="small"
              variant={channelId === planetaWebshop.id ? "primary" : "secondary"}
              onClick={() => changeChannel(planetaWebshop.id)}
            >
              PlanetaWebshop
            </Button>
          )}
        </div>

        <DataTable instance={table}>
          <DataTable.Toolbar className="px-6 py-4">
            <DataTable.Search placeholder="Search products..." />
          </DataTable.Toolbar>
          <DataTable.Table />
          <DataTable.Pagination />
        </DataTable>
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Products by Channel",
  icon: Channels,
})

export default ProductsByChannelPage
