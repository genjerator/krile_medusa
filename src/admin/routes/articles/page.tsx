import { defineRouteConfig } from "@medusajs/admin-sdk"
import { DocumentText, Trash, PencilSquare } from "@medusajs/icons"
import {
  Badge, Button, Container, Drawer, Heading, IconButton, Input, Label,
  Select, Switch, Text, Table, Textarea, toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { sdk } from "../../lib/client"
import { MarkdownRichEditor } from "../../components/markdown-rich-editor"
import { toEditorHtml } from "../../lib/markdown"
import { DEFAULT_LOCALE, PRODUCT_LOCALES } from "../../lib/product-locales"

type Author = { id: string; name: string }
type Article = {
  id: string; slug: string; status: "draft" | "published"
  published_at: string | null; cover_image: string | null; category: string | null
  author_id: string | null; author?: { id: string; name: string } | null
  sales_channel_id: string | null
  title: string; title_en: string | null; title_it: string | null
  excerpt: string | null; excerpt_en: string | null; excerpt_it: string | null
  body: string | null; body_en: string | null; body_it: string | null
  meta_title: string | null; meta_title_en: string | null; meta_title_it: string | null
  meta_description: string | null; meta_description_en: string | null; meta_description_it: string | null
}

// base field name + locale → column (German = base column)
const col = (base: string, l: string) => (l === DEFAULT_LOCALE ? base : `${base}_${l}`)

const ArticlesPage = () => {
  const qc = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const listQuery = useQuery({
    queryKey: ["articles"],
    queryFn: async () => sdk.client.fetch<{ articles: Article[] }>("/admin/articles"),
  })
  const articles = listQuery.data?.articles ?? []

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sdk.client.fetch(`/admin/articles/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["articles"] }); toast.success("Article deleted") },
    onError: () => toast.error("Failed to delete article"),
  })

  return (
    <Container className="flex flex-col gap-4 p-0">
      <div className="flex items-center justify-between px-6 pt-6">
        <div>
          <Heading level="h1">Magazin</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Blog / magazine articles (de/en/it), shown at <code>/magazin</code>.
          </Text>
        </div>
        <Button size="small" onClick={() => setCreating(true)}>New article</Button>
      </div>

      <div className="px-6 pb-6">
        {articles.length === 0 ? (
          <Text size="small" className="text-ui-fg-muted">No articles yet.</Text>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Title</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Published</Table.HeaderCell>
                <Table.HeaderCell>Author</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {articles.map((a) => (
                <Table.Row key={a.id}>
                  <Table.Cell>{a.title}</Table.Cell>
                  <Table.Cell>
                    <Badge size="2xsmall" color={a.status === "published" ? "green" : "grey"}>{a.status}</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {a.published_at ? new Date(a.published_at).toLocaleDateString() : <span className="text-ui-fg-muted">—</span>}
                  </Table.Cell>
                  <Table.Cell>{a.author?.name ?? <span className="text-ui-fg-muted">—</span>}</Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center justify-end gap-2">
                      <IconButton size="small" variant="transparent" onClick={() => setEditingId(a.id)}><PencilSquare /></IconButton>
                      <IconButton size="small" variant="transparent" onClick={() => {
                        if (confirm(`Delete article "${a.title}"?`)) deleteMutation.mutate(a.id)
                      }}><Trash /></IconButton>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>

      {creating && (
        <CreateArticleDrawer open={creating} onClose={() => setCreating(false)}
          onCreated={(id) => { setCreating(false); setEditingId(id) }} />
      )}
      {editingId && (
        <EditArticleDrawer id={editingId} open={!!editingId} onClose={() => setEditingId(null)} />
      )}
    </Container>
  )
}

const CreateArticleDrawer = ({ open, onClose, onCreated }: {
  open: boolean; onClose: () => void; onCreated: (id: string) => void
}) => {
  const qc = useQueryClient()
  const [title, setTitle] = useState("")

  const createMutation = useMutation({
    mutationFn: async () =>
      sdk.client.fetch<{ article: Article }>("/admin/articles", { method: "POST", body: { title } }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["articles"] })
      toast.success("Article created")
      onCreated(res.article.id)
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to create article"),
  })

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Content>
        <Drawer.Header><Drawer.Title>New article</Drawer.Title></Drawer.Header>
        <Drawer.Body className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label size="small">Title (German)</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Vakuumieren richtig gemacht" />
            <Text size="xsmall" className="text-ui-fg-muted">Slug is derived from the title; edit details after creating.</Text>
          </div>
        </Drawer.Body>
        <Drawer.Footer>
          <Button variant="secondary" size="small" onClick={onClose}>Cancel</Button>
          <Button size="small" disabled={!title.trim() || createMutation.isPending}
            isLoading={createMutation.isPending} onClick={() => createMutation.mutate()}>Create</Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}

const EditArticleDrawer = ({ id, open, onClose }: {
  id: string; open: boolean; onClose: () => void
}) => {
  const qc = useQueryClient()
  const [locale, setLocale] = useState(DEFAULT_LOCALE)
  const [form, setForm] = useState<Record<string, any>>({})

  const articleQuery = useQuery({
    queryKey: ["article", id],
    queryFn: async () => sdk.client.fetch<{ article: Article }>(`/admin/articles/${id}`),
  })
  const article = articleQuery.data?.article

  const authorsQuery = useQuery({
    queryKey: ["article-authors"],
    queryFn: async () => sdk.client.fetch<{ article_authors: Author[] }>("/admin/article-authors"),
  })
  const authors = authorsQuery.data?.article_authors ?? []

  const channelsQuery = useQuery({
    queryKey: ["sales-channels"],
    queryFn: async () =>
      sdk.client.fetch<{ sales_channels: { id: string; name: string }[] }>(
        "/admin/sales-channels?limit=100"
      ),
  })
  const channels = channelsQuery.data?.sales_channels ?? []

  useEffect(() => {
    if (article) {
      setForm({
        ...article,
        published_at: article.published_at ? article.published_at.slice(0, 10) : "",
        author_id: article.author_id ?? "",
      })
    }
  }, [article?.id])

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["article", id] })
    qc.invalidateQueries({ queryKey: ["articles"] })
  }
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }))

  const detailsMutation = useMutation({
    mutationFn: async () => {
      const f = form
      const body: Record<string, any> = {
        slug: f.slug, status: f.status, category: f.category, cover_image: f.cover_image,
        author_id: f.author_id || null,
        sales_channel_id: f.sales_channel_id || null,
        published_at: f.published_at || null,
      }
      for (const base of ["title", "excerpt", "meta_title", "meta_description"]) {
        for (const l of ["de", "en", "it"]) body[col(base, l)] = f[col(base, l)] ?? null
      }
      return sdk.client.fetch(`/admin/articles/${id}`, { method: "POST", body })
    },
    onSuccess: () => { invalidate(); toast.success("Article saved") },
    onError: () => toast.error("Failed to save article"),
  })

  const bodyMutation = useMutation({
    mutationFn: async (html: string) =>
      sdk.client.fetch(`/admin/articles/${id}`, { method: "POST", body: { [col("body", locale)]: html } }),
    onSuccess: () => { invalidate(); toast.success("Content saved") },
    onError: () => toast.error("Failed to save content"),
  })

  const rawBody = article ? ((article as any)[col("body", locale)] as string | null) || "" : ""

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Content className="max-w-[820px]">
        <Drawer.Header>
          <Drawer.Title>{article ? `Edit “${article.slug}”` : "Edit article"}</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-6 overflow-y-auto">
          {/* non-localized meta */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Slug"><Input value={form.slug ?? ""} onChange={(e) => set("slug", e.target.value)} /></Field>
            <Field label="Published date">
              <Input type="date" value={form.published_at ?? ""} onChange={(e) => set("published_at", e.target.value)} />
            </Field>
            <Field label="Category"><Input value={form.category ?? ""} onChange={(e) => set("category", e.target.value)} placeholder="Ratgeber" /></Field>
            <Field label="Author">
              <Select value={form.author_id ? form.author_id : "none"}
                onValueChange={(v) => set("author_id", v === "none" ? "" : v)}>
                <Select.Trigger><Select.Value placeholder="— none —" /></Select.Trigger>
                <Select.Content>
                  <Select.Item value="none">— none —</Select.Item>
                  {authors.map((a) => <Select.Item key={a.id} value={a.id}>{a.name}</Select.Item>)}
                </Select.Content>
              </Select>
            </Field>
            <Field label="Cover image URL">
              <Input value={form.cover_image ?? ""} onChange={(e) => set("cover_image", e.target.value)} placeholder="https://…" />
            </Field>
            <Field label="Sales channel">
              <Select value={form.sales_channel_id ? form.sales_channel_id : "all"}
                onValueChange={(v) => set("sales_channel_id", v === "all" ? "" : v)}>
                <Select.Trigger><Select.Value placeholder="— all channels —" /></Select.Trigger>
                <Select.Content>
                  <Select.Item value="all">— all channels —</Select.Item>
                  {channels.map((c) => <Select.Item key={c.id} value={c.id}>{c.name}</Select.Item>)}
                </Select.Content>
              </Select>
            </Field>
            <div className="flex flex-col gap-1">
              <Label size="small">Published</Label>
              <div className="flex h-8 items-center gap-2">
                <Switch checked={form.status === "published"} onCheckedChange={(c) => set("status", c ? "published" : "draft")} />
                <Text size="small" className="text-ui-fg-subtle">{form.status === "published" ? "Visible" : "Hidden"}</Text>
              </div>
            </div>
          </div>

          {/* localized text (locale switch shared with the body editor below) */}
          <div className="flex flex-col gap-4 rounded-lg border border-ui-border-base p-4">
            <div className="flex items-center justify-between">
              <Text size="small" weight="plus">Text ({locale.toUpperCase()})</Text>
              <div className="flex gap-1">
                {PRODUCT_LOCALES.map((l) => (
                  <Button key={l.code} size="small" variant={l.code === locale ? "primary" : "secondary"}
                    onClick={() => setLocale(l.code)}>{l.code.toUpperCase()}</Button>
                ))}
              </div>
            </div>
            <Field label="Title"><Input value={form[col("title", locale)] ?? ""} onChange={(e) => set(col("title", locale), e.target.value)} /></Field>
            <Field label="Excerpt"><Textarea value={form[col("excerpt", locale)] ?? ""} onChange={(e) => set(col("excerpt", locale), e.target.value)} rows={2} /></Field>
            <Field label="Meta title (SEO)"><Input value={form[col("meta_title", locale)] ?? ""} onChange={(e) => set(col("meta_title", locale), e.target.value)} placeholder="falls back to Title" /></Field>
            <Field label="Meta description (SEO)"><Textarea value={form[col("meta_description", locale)] ?? ""} onChange={(e) => set(col("meta_description", locale), e.target.value)} rows={2} placeholder="falls back to Excerpt" /></Field>
          </div>

          <div>
            <Button size="small" variant="secondary" onClick={() => detailsMutation.mutate()} isLoading={detailsMutation.isPending}>
              Save article
            </Button>
          </div>

          <MarkdownRichEditor
            label="Body"
            locales={PRODUCT_LOCALES}
            activeLocale={locale}
            onLocaleChange={setLocale}
            value={toEditorHtml(rawBody)}
            isValueLoading={articleQuery.isLoading}
            onSave={(html) => bodyMutation.mutateAsync(html)}
            isSaving={bodyMutation.isPending}
            helpText={<>Article body. German is the default; EN/IT stored separately. Saved as HTML.</>}
          />
        </Drawer.Body>
        <Drawer.Footer>
          <Button variant="secondary" size="small" onClick={onClose}>Close</Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1">
    <Label size="small">{label}</Label>
    {children}
  </div>
)

export const config = defineRouteConfig({
  label: "Magazin",
  icon: DocumentText,
})

export default ArticlesPage
