import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, HttpTypes } from "@medusajs/framework/types"
import { Badge, Button, Checkbox, Container, Heading, Input, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { sdk } from "../lib/client"

type Article = { id: string; title: string | null; slug: string; status: string }

const ProductRelatedArticlesWidget = ({
  data: product,
}: DetailWidgetProps<HttpTypes.AdminProduct>) => {
  const queryClient = useQueryClient()
  const productId = product.id

  // All articles (the pool to pick from) + the ones already linked.
  const { data: allData, isLoading: loadingAll } = useQuery({
    queryKey: ["all-articles"],
    queryFn: () => sdk.client.fetch<{ articles: Article[] }>("/admin/articles"),
  })
  const { data: linkedData, isLoading: loadingLinked } = useQuery({
    queryKey: ["product-articles", productId],
    queryFn: () =>
      sdk.client.fetch<{ articles: Article[] }>(`/admin/products/${productId}/articles`),
    enabled: !!productId,
  })

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState("")

  // Seed the selection from the linked articles once they load.
  useEffect(() => {
    if (linkedData?.articles) {
      setSelected(new Set(linkedData.articles.map((a) => a.id)))
    }
  }, [linkedData])

  const all = allData?.articles ?? []
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return all
    return all.filter(
      (a) => (a.title ?? "").toLowerCase().includes(q) || a.slug.toLowerCase().includes(q)
    )
  }, [all, search])

  const linkedIds = useMemo(
    () => new Set((linkedData?.articles ?? []).map((a) => a.id)),
    [linkedData]
  )
  const dirty = useMemo(() => {
    if (selected.size !== linkedIds.size) return true
    for (const id of selected) if (!linkedIds.has(id)) return true
    return false
  }, [selected, linkedIds])

  const save = useMutation({
    mutationFn: () =>
      sdk.client.fetch(`/admin/products/${productId}/articles`, {
        method: "POST",
        body: { article_ids: [...selected] },
      }),
    onSuccess: () => {
      toast.success("Verknüpfte Artikel gespeichert")
      queryClient.invalidateQueries({ queryKey: ["product-articles", productId] })
    },
    onError: () => toast.error("Speichern fehlgeschlagen"),
  })

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const isLoading = loadingAll || loadingLinked

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Magazin-Artikel</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Wählen Sie Artikel, die unten auf der Produktseite angezeigt werden.
          </Text>
        </div>
        <Button
          size="small"
          variant="primary"
          disabled={!dirty || save.isPending}
          isLoading={save.isPending}
          onClick={() => save.mutate()}
        >
          Speichern
        </Button>
      </div>

      <div className="px-6 py-3">
        <Input
          placeholder="Artikel suchen…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
        />
      </div>

      <div className="px-6 py-3 max-h-80 overflow-y-auto flex flex-col gap-y-1">
        {isLoading ? (
          <Text size="small" className="text-ui-fg-subtle">
            Lädt…
          </Text>
        ) : filtered.length === 0 ? (
          <Text size="small" className="text-ui-fg-subtle">
            Keine Artikel gefunden.
          </Text>
        ) : (
          filtered.map((a) => (
            <label
              key={a.id}
              className="flex items-center gap-x-3 py-1.5 cursor-pointer hover:bg-ui-bg-subtle rounded-md px-2"
            >
              <Checkbox checked={selected.has(a.id)} onCheckedChange={() => toggle(a.id)} />
              <span className="flex-1 truncate text-ui-fg-base text-sm">
                {a.title || a.slug}
              </span>
              {a.status !== "published" ? (
                <Badge size="2xsmall" color="orange">
                  Entwurf
                </Badge>
              ) : null}
            </label>
          ))
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductRelatedArticlesWidget
