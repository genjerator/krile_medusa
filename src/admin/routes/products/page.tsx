import {
  createDataTableColumnHelper,
  DataTable,
  useDataTable,
  Badge,
  Button,
  Container,
  Heading,
  Text,
} from "@medusajs/ui"
import { ArrowUpRightOnBox } from "@medusajs/icons"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
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

  if (withoutParent.length > 0 && withParent.length > 0) {
    return { category: withoutParent[0].name, subcategory: withParent[0].name }
  }
  if (withParent.length > 0) {
    const leaf = withParent[0]
    return {
      category: leaf.parent_category?.name ?? null,
      subcategory: leaf.name,
    }
  }
  return { category: withoutParent[0].name, subcategory: null }
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
    id: "storefront",
    header: "",
    cell: ({ row }) => {
      const p = row.original
      if (!p.handle) return null
      const url = `${getStorefrontUrl(p.sales_channels)}/de/products/${p.handle}`
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

const ProductsPage = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [pageIndex, setPageIndex] = useState(0)
  const [channelId, setChannelId] = useState<string | null>(null)

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
    fields: "id,title,handle,thumbnail,status,sales_channels.id,sales_channels.name,categories.id,categories.name,categories.parent_category_id,categories.parent_category.name",
    order: "-created_at",
  }
  if (search) queryParams.q = search
  if (channelId) queryParams.sales_channel_id = channelId

  const { data, isLoading } = useQuery({
    queryKey: ["products-custom-list", pageIndex, search, channelId],
    queryFn: () => sdk.admin.product.list(queryParams),
    placeholderData: (prev) => prev,
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
    onRowClick: (_, row) => navigate(`/products/${row.id}`),
  })

  return (
    <div className="flex flex-col gap-y-2 p-6">
      <div className="flex items-center justify-between mb-2">
        <Heading level="h1">Products</Heading>
        <Button size="small" onClick={() => navigate("/products/create")}>
          Create
        </Button>
      </div>

      <Container className="p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-3 border-b border-ui-border-base">
          <Text size="small" weight="plus" className="text-ui-fg-subtle mr-1">
            Channel:
          </Text>
          <Button
            size="small"
            variant={channelId === null ? "primary" : "secondary"}
            onClick={() => { setChannelId(null); setPageIndex(0) }}
          >
            All
          </Button>
          {industriesWebshop && (
            <Button
              size="small"
              variant={channelId === industriesWebshop.id ? "primary" : "secondary"}
              onClick={() => { setChannelId(industriesWebshop.id); setPageIndex(0) }}
            >
              IndustriesWebshop
            </Button>
          )}
          {planetaWebshop && (
            <Button
              size="small"
              variant={channelId === planetaWebshop.id ? "primary" : "secondary"}
              onClick={() => { setChannelId(planetaWebshop.id); setPageIndex(0) }}
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

export default ProductsPage
