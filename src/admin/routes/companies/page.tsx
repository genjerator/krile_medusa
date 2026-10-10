import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  createDataTableColumnHelper,
  DataTable,
  useDataTable,
  Button,
  Container,
  Heading,
  Input,
  Text,
} from "@medusajs/ui"
import { ArrowUpRightOnBox, Buildings } from "@medusajs/icons"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { sdk } from "../../lib/client"

type Company = {
  id: string
  external_id: string
  name: string
  category: string | null
  street: string | null
  postal_code: string | null
  city: string | null
  phone: string | null
  website: string | null
  email: string
  source_url: string | null
  website_status: string | null
  website_http_code: number | null
}

const PAGE_SIZE = 20

const dash = (
  <Text size="small" leading="compact" className="text-ui-fg-muted">
    —
  </Text>
)

const columnHelper = createDataTableColumnHelper<Company>()

const columns = [
  columnHelper.accessor("name", {
    header: "Company",
    cell: ({ row }) => (
      <div className="flex flex-col min-w-0">
        <Text size="small" leading="compact" weight="plus" className="truncate">
          {row.original.name}
        </Text>
        {row.original.category ? (
          <Text size="xsmall" leading="compact" className="text-ui-fg-subtle truncate">
            {row.original.category}
          </Text>
        ) : null}
      </div>
    ),
    size: 240,
  }),
  columnHelper.display({
    id: "location",
    header: "City",
    cell: ({ row }) => {
      const { city, postal_code } = row.original
      if (!city && !postal_code) return dash
      return (
        <Text size="small" leading="compact">
          {[postal_code, city].filter(Boolean).join(" ")}
        </Text>
      )
    },
    size: 160,
  }),
  columnHelper.accessor("email", {
    header: "Email",
    cell: ({ getValue }) => (
      <Text size="small" leading="compact" className="truncate">
        {getValue()}
      </Text>
    ),
    size: 220,
  }),
  columnHelper.accessor("phone", {
    header: "Phone",
    cell: ({ getValue }) =>
      getValue() ? (
        <Text size="small" leading="compact">
          {getValue()}
        </Text>
      ) : (
        dash
      ),
    size: 140,
  }),
  columnHelper.accessor("website", {
    header: "Website",
    cell: ({ row }) => {
      const url = row.original.website
      if (!url) return dash
      const href = /^https?:\/\//i.test(url) ? url : `https://${url}`
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-ui-fg-interactive hover:underline min-w-0"
          title={url}
        >
          <Text size="small" leading="compact" className="truncate">
            {url.replace(/^https?:\/\//i, "").replace(/\/$/, "")}
          </Text>
          <ArrowUpRightOnBox className="flex-shrink-0" />
        </a>
      )
    },
    size: 220,
  }),
]

const WEBSITE_FILTERS: Array<{ label: string; value: string }> = [
  { label: "All", value: "" },
  { label: "With site", value: "yes" },
  { label: "No site", value: "no" },
]

const CompaniesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const setParam = (key: string, value: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: true }
    )
  }

  const search = searchParams.get("q") ?? ""
  const city = searchParams.get("city") ?? ""
  const hasWebsite = searchParams.get("has_website") ?? ""

  const [pageIndex, setPageIndex] = useState(0)

  // City input: local state + debounce into the URL param.
  const [cityInput, setCityInput] = useState(city)
  useEffect(() => {
    const t = setTimeout(() => {
      if (cityInput !== city) {
        setParam("city", cityInput)
        setPageIndex(0)
      }
    }, 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityInput])

  const queryParams: Record<string, any> = {
    limit: PAGE_SIZE,
    offset: pageIndex * PAGE_SIZE,
  }
  if (search) queryParams.q = search
  if (city) queryParams.city = city
  if (hasWebsite) queryParams.has_website = hasWebsite

  const { data, isLoading } = useQuery({
    queryKey: ["outreach-companies", pageIndex, search, city, hasWebsite],
    queryFn: () =>
      sdk.client.fetch<{ companies: Company[]; count: number }>(
        "/admin/outreach/companies",
        { query: queryParams }
      ),
    placeholderData: (prev) => prev,
  })

  const companies: Company[] = data?.companies ?? []
  const count: number = data?.count ?? 0

  const table = useDataTable<Company>({
    data: companies,
    columns: columns as any,
    rowCount: count,
    isLoading,
    getRowId: (row) => row.id,
    pagination: {
      state: { pageIndex, pageSize: PAGE_SIZE },
      onPaginationChange: (state) => setPageIndex(state.pageIndex),
    },
    search: {
      state: search,
      onSearchChange: (v) => {
        setParam("q", v)
        setPageIndex(0)
      },
      debounce: 400,
    },
  })

  return (
    <div className="flex flex-col gap-y-2 p-6">
      <div className="flex items-center justify-between mb-2">
        <Heading level="h1">Companies</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          {count.toLocaleString()} total
        </Text>
      </div>

      <Container className="p-0 overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-b border-ui-border-base">
          <Input
            size="small"
            placeholder="Filter by city…"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            className="w-48"
          />
          <div className="flex items-center gap-1 ml-auto">
            <Text size="small" weight="plus" className="text-ui-fg-subtle mr-1">
              Website:
            </Text>
            {WEBSITE_FILTERS.map((f) => (
              <Button
                key={f.value || "all"}
                size="small"
                variant={hasWebsite === f.value ? "primary" : "secondary"}
                onClick={() => {
                  setParam("has_website", f.value)
                  setPageIndex(0)
                }}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        <DataTable instance={table}>
          <DataTable.Toolbar className="px-6 py-4">
            <DataTable.Search placeholder="Search name, email, website…" />
          </DataTable.Toolbar>
          <DataTable.Table />
          <DataTable.Pagination />
        </DataTable>
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Companies",
  icon: Buildings,
})

export default CompaniesPage
