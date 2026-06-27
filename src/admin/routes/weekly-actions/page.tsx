import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Tag } from "@medusajs/icons"
import {
  Button,
  Container,
  Drawer,
  Heading,
  Input,
  Label,
  Select,
  Switch,
  Text,
  Badge,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { sdk } from "../../lib/client"

type DiscountType = "percentage" | "fixed"

type WeeklyActionItem = {
  id?: string
  product_id: string
  discount_type: DiscountType
  discount_value: number
}

type WeeklyAction = {
  id: string
  title: string
  year: number
  iso_week: number
  starts_at: string
  ends_at: string
  status: "draft" | "planned"
  is_active: boolean
  default_discount_type: DiscountType
  default_discount_value: number | null
  price_list_id: string | null
  items: WeeklyActionItem[]
}

// ── helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
  })

const toLocalInput = (iso: string) => {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`
}

const discountSummary = (a: WeeklyAction): string => {
  if (!a.items?.length) return "—"
  const first = a.items[0]
  const allSame = a.items.every(
    (i) => i.discount_type === first.discount_type && i.discount_value === first.discount_value
  )
  if (!allSame) return "mixed"
  return first.discount_type === "percentage"
    ? `-${first.discount_value}%`
    : `${first.discount_value} €`
}

// ── product picker (search + add) ────────────────────────────────────────────

type PickerProduct = { id: string; title: string; thumbnail: string | null }

const ProductSearch = ({
  open,
  excludeIds,
  onAdd,
}: {
  open: boolean
  excludeIds: string[]
  onAdd: (p: PickerProduct) => void
}) => {
  const [term, setTerm] = useState("")

  const { data, isFetching } = useQuery({
    queryKey: ["wa-product-search", term],
    queryFn: () =>
      sdk.admin.product.list({ q: term || undefined, limit: 8, fields: "id,title,thumbnail" }),
    enabled: open && term.trim().length > 1,
  })

  const results = (data?.products ?? []).filter((p) => !excludeIds.includes(p.id))

  return (
    <div className="flex flex-col gap-2">
      <Input
        placeholder="Search products to add…"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />
      {open && term.trim().length > 1 && (
        <div className="flex flex-col gap-1 rounded-lg border border-ui-border-base p-1">
          {isFetching ? (
            <Text size="small" className="text-ui-fg-muted px-2 py-1.5">
              Searching…
            </Text>
          ) : results.length === 0 ? (
            <Text size="small" className="text-ui-fg-muted px-2 py-1.5">
              No products found
            </Text>
          ) : (
            results.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() =>
                  onAdd({ id: p.id, title: p.title ?? p.id, thumbnail: p.thumbnail ?? null })
                }
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-left hover:bg-ui-bg-subtle transition-colors"
              >
                <Text size="small" leading="compact">
                  {p.title}
                </Text>
                <span className="text-ui-fg-interactive text-xs">Add</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ── edit drawer ──────────────────────────────────────────────────────────────

const EditDrawer = ({
  action,
  onClose,
}: {
  action: WeeklyAction | null
  onClose: () => void
}) => {
  const queryClient = useQueryClient()
  const open = !!action

  const [title, setTitle] = useState("")
  const [startsAt, setStartsAt] = useState("")
  const [endsAt, setEndsAt] = useState("")
  const [defaultType, setDefaultType] = useState<DiscountType>("percentage")
  const [defaultValue, setDefaultValue] = useState<string>("")
  const [items, setItems] = useState<(WeeklyActionItem & { title?: string })[]>([])

  // Resolve product titles for the existing items so the list is readable.
  const itemIds = action?.items?.map((i) => i.product_id) ?? []
  const { data: titleData } = useQuery({
    queryKey: ["wa-item-titles", action?.id],
    queryFn: () =>
      sdk.admin.product.list({ id: itemIds, limit: itemIds.length, fields: "id,title" }),
    enabled: open && itemIds.length > 0,
  })

  useEffect(() => {
    if (!action) return
    setTitle(action.title)
    setStartsAt(toLocalInput(action.starts_at))
    setEndsAt(toLocalInput(action.ends_at))
    setDefaultType(action.default_discount_type)
    setDefaultValue(
      action.default_discount_value != null ? String(action.default_discount_value) : ""
    )
    setItems(
      (action.items ?? []).map((i) => ({
        id: i.id,
        product_id: i.product_id,
        discount_type: i.discount_type,
        discount_value: i.discount_value,
      }))
    )
  }, [action?.id])

  // Merge resolved titles into items.
  const titleById = useMemo(() => {
    const map: Record<string, string> = {}
    for (const p of titleData?.products ?? []) map[p.id] = p.title ?? p.id
    return map
  }, [titleData])

  const save = useMutation({
    mutationFn: (body: any) =>
      sdk.client.fetch(`/admin/weekly-actions/${action!.id}`, { method: "POST", body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-weekly-actions"] })
      toast.success("Weekly action saved")
      onClose()
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not save weekly action"),
  })

  const resync = useMutation({
    mutationFn: () =>
      sdk.client.fetch(`/admin/weekly-actions/${action!.id}/resync`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-weekly-actions"] })
      toast.success("Prices resynced")
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not resync prices"),
  })

  const addProduct = (p: PickerProduct) => {
    setItems((prev) => [
      ...prev,
      {
        product_id: p.id,
        title: p.title,
        discount_type: defaultType,
        discount_value: defaultValue ? Number(defaultValue) : defaultType === "percentage" ? 10 : 0,
      },
    ])
  }

  const updateItem = (idx: number, patch: Partial<WeeklyActionItem>) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)))

  const removeItem = (idx: number) =>
    setItems((prev) => prev.filter((_, i) => i !== idx))

  const handleSave = () => {
    const invalid = items.find(
      (i) =>
        !(i.discount_value > 0) ||
        (i.discount_type === "percentage" && i.discount_value >= 100)
    )
    if (invalid) {
      toast.error("Each product needs a valid discount (percentage 1–99, fixed > 0)")
      return
    }
    save.mutate({
      title,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: new Date(endsAt).toISOString(),
      default_discount_type: defaultType,
      default_discount_value: defaultValue ? Number(defaultValue) : null,
      items: items.map((i) => ({
        product_id: i.product_id,
        discount_type: i.discount_type,
        discount_value: i.discount_value,
      })),
    })
  }

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>{action ? action.title : "Weekly action"}</Drawer.Title>
        </Drawer.Header>

        <Drawer.Body className="flex-1 overflow-auto p-4">
          {action && (
            <div className="flex flex-col gap-y-5">
              <div className="flex flex-col gap-y-1">
                <Label size="small">Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-y-1">
                  <Label size="small">Starts</Label>
                  <Input
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-y-1">
                  <Label size="small">Ends</Label>
                  <Input
                    type="datetime-local"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-y-1">
                  <Label size="small">Default discount type</Label>
                  <Select
                    value={defaultType}
                    onValueChange={(v) => setDefaultType(v as DiscountType)}
                  >
                    <Select.Trigger>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="percentage">Percentage (%)</Select.Item>
                      <Select.Item value="fixed">Fixed price (€)</Select.Item>
                    </Select.Content>
                  </Select>
                </div>
                <div className="flex flex-col gap-y-1">
                  <Label size="small">Default value</Label>
                  <Input
                    type="number"
                    value={defaultValue}
                    onChange={(e) => setDefaultValue(e.target.value)}
                    placeholder={defaultType === "percentage" ? "e.g. 20" : "e.g. 16.50"}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-y-2">
                <Label size="small">Products ({items.length})</Label>
                <ProductSearch
                  open={open}
                  excludeIds={items.map((i) => i.product_id)}
                  onAdd={addProduct}
                />

                <div className="flex flex-col gap-2 mt-1">
                  {items.length === 0 ? (
                    <Text size="small" className="text-ui-fg-muted">
                      No products yet — search above to add some.
                    </Text>
                  ) : (
                    items.map((it, idx) => (
                      <div
                        key={it.product_id}
                        className="flex items-center gap-2 rounded-lg border border-ui-border-base px-3 py-2"
                      >
                        <Text size="small" leading="compact" className="flex-1 truncate">
                          {it.title ?? titleById[it.product_id] ?? it.product_id}
                        </Text>
                        <Select
                          value={it.discount_type}
                          onValueChange={(v) =>
                            updateItem(idx, { discount_type: v as DiscountType })
                          }
                        >
                          <Select.Trigger className="w-28">
                            <Select.Value />
                          </Select.Trigger>
                          <Select.Content>
                            <Select.Item value="percentage">%</Select.Item>
                            <Select.Item value="fixed">€</Select.Item>
                          </Select.Content>
                        </Select>
                        <Input
                          type="number"
                          className="w-24"
                          value={String(it.discount_value)}
                          onChange={(e) =>
                            updateItem(idx, { discount_value: Number(e.target.value) })
                          }
                        />
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="text-ui-fg-muted hover:text-ui-fg-base text-sm px-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {action.price_list_id && (
                <Text size="small" className="text-ui-fg-subtle">
                  Sale price list active · status {action.status}
                </Text>
              )}
            </div>
          )}
        </Drawer.Body>

        <Drawer.Footer>
          <Button
            size="small"
            variant="secondary"
            onClick={() => resync.mutate()}
            isLoading={resync.isPending}
            disabled={save.isPending}
          >
            Resync prices
          </Button>
          <Drawer.Close asChild>
            <Button size="small" variant="secondary" disabled={save.isPending}>
              Cancel
            </Button>
          </Drawer.Close>
          <Button
            size="small"
            onClick={handleSave}
            isLoading={save.isPending}
            disabled={save.isPending}
          >
            Save
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}

// ── page ─────────────────────────────────────────────────────────────────────

const WeeklyActionsPage = () => {
  const queryClient = useQueryClient()
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const [selected, setSelected] = useState<WeeklyAction | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["admin-weekly-actions"],
    queryFn: () =>
      sdk.client.fetch<{ weekly_actions: WeeklyAction[]; count: number }>(
        "/admin/weekly-actions"
      ),
  })

  const all = data?.weekly_actions ?? []
  const years = useMemo(() => {
    const set = new Set<number>(all.map((a) => a.year))
    set.add(currentYear)
    return Array.from(set).sort((a, b) => a - b)
  }, [all, currentYear])

  const rows = all.filter((a) => a.year === year)

  const generate = useMutation({
    mutationFn: () =>
      sdk.client.fetch("/admin/weekly-actions/generate-year", {
        method: "POST",
        body: { year },
      }),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["admin-weekly-actions"] })
      toast.success(`Generated ${res?.created_count ?? 0} week(s) for ${year}`)
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not generate year"),
  })

  // Create a single weekly action for the current (or next free) week, then open
  // it so the merchant can add products right away.
  const quickCreate = useMutation({
    mutationFn: () =>
      sdk.client.fetch<{ weekly_action: WeeklyAction }>(
        "/admin/weekly-actions/quick-create",
        { method: "POST" }
      ),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["admin-weekly-actions"] })
      const wa = res?.weekly_action
      if (wa) {
        setYear(wa.year)
        setSelected(wa)
        toast.success(
          `Created KW${String(wa.iso_week).padStart(2, "0")}/${wa.year}`
        )
      }
    },
    onError: (e: any) =>
      toast.error(e?.message ?? "Could not create weekly action"),
  })

  // Manual on/off. Activating one campaign automatically deactivates the others
  // (single active) and makes its sale prices live now — handled on the backend.
  const toggle = useMutation({
    mutationFn: (vars: { id: string; active: boolean }) =>
      sdk.client.fetch(`/admin/weekly-actions/${vars.id}/toggle`, {
        method: "POST",
        body: { active: vars.active },
      }),
    onSuccess: (_res, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin-weekly-actions"] })
      toast.success(vars.active ? "Weekly action is now live" : "Weekly action turned off")
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not toggle weekly action"),
  })

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h1">Weekly Actions</Heading>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Plan weekly promotions — flip one on to make it live on the shop.
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <Select.Trigger className="w-28">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {years.map((y) => (
                <Select.Item key={y} value={String(y)}>
                  {y}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          <Button
            size="small"
            onClick={() => quickCreate.mutate()}
            isLoading={quickCreate.isPending}
          >
            New weekly action
          </Button>
          <Button
            size="small"
            variant="secondary"
            onClick={() => generate.mutate()}
            isLoading={generate.isPending}
          >
            Generate year
          </Button>
        </div>
      </div>

      <Container className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-5 h-5 border-2 border-ui-border-strong border-t-transparent rounded-full animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16">
            <Text size="small" className="text-ui-fg-muted">
              No weeks for {year} yet.
            </Text>
            <Button size="small" variant="secondary" onClick={() => generate.mutate()}>
              Generate {year}
            </Button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-ui-border-base">
                {["Week", "Dates", "Status", "Live", "Products", "Discount", ""].map((h) => (
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
              {rows.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => setSelected(a)}
                  className="border-b border-ui-border-base hover:bg-ui-bg-subtle transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Text size="small" leading="compact" weight="plus">
                        KW{String(a.iso_week).padStart(2, "0")}
                      </Text>
                      {a.is_active && (
                        <Badge size="2xsmall" color="green">
                          live
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Text size="small" leading="compact" className="text-ui-fg-subtle">
                      {fmtDate(a.starts_at)} – {fmtDate(a.ends_at)}
                    </Text>
                  </td>
                  <td className="px-6 py-4">
                    <Badge size="2xsmall" color={a.status === "planned" ? "blue" : "grey"}>
                      {a.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <Switch
                      checked={a.is_active}
                      disabled={a.status !== "planned" || toggle.isPending}
                      onCheckedChange={(v) => toggle.mutate({ id: a.id, active: v })}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Text size="small" leading="compact" className="text-ui-fg-subtle">
                      {a.items?.length ?? 0}
                    </Text>
                  </td>
                  <td className="px-6 py-4">
                    <Text size="small" leading="compact" className="text-ui-fg-subtle">
                      {discountSummary(a)}
                    </Text>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Text size="small" leading="compact" className="text-ui-fg-interactive">
                      Edit
                    </Text>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Container>

      <EditDrawer action={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Weekly Actions",
  icon: Tag,
})

export default WeeklyActionsPage
