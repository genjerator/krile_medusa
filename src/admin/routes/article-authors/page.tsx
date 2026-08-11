import { defineRouteConfig } from "@medusajs/admin-sdk"
import { User, Trash, PencilSquare } from "@medusajs/icons"
import {
  Badge, Button, Container, Drawer, Heading, IconButton, Input, Label,
  Switch, Text, Table, toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { sdk } from "../../lib/client"
import { MarkdownRichEditor } from "../../components/markdown-rich-editor"
import { toEditorHtml } from "../../lib/markdown"
import { DEFAULT_LOCALE, PRODUCT_LOCALES } from "../../lib/product-locales"

type Author = {
  id: string
  name: string
  slug: string
  role: string | null
  photo_url: string | null
  linkedin_url: string | null
  website_url: string | null
  xing_url: string | null
  bio: string | null
  bio_en: string | null
  bio_it: string | null
  active: boolean
}

const bioColumn = (l: string): "bio" | "bio_en" | "bio_it" =>
  l === DEFAULT_LOCALE ? "bio" : (`bio_${l}` as "bio_en" | "bio_it")

const AuthorsPage = () => {
  const qc = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const listQuery = useQuery({
    queryKey: ["article-authors"],
    queryFn: async () =>
      sdk.client.fetch<{ article_authors: Author[] }>("/admin/article-authors"),
  })
  const authors = listQuery.data?.article_authors ?? []

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      sdk.client.fetch(`/admin/article-authors/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["article-authors"] })
      toast.success("Author deleted")
    },
    onError: () => toast.error("Failed to delete author"),
  })

  return (
    <Container className="flex flex-col gap-4 p-0">
      <div className="flex items-center justify-between px-6 pt-6">
        <div>
          <Heading level="h1">Magazin Authors</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Contributors shown on articles (photo, bio, LinkedIn) and their author page.
          </Text>
        </div>
        <Button size="small" onClick={() => setCreating(true)}>New author</Button>
      </div>

      <div className="px-6 pb-6">
        {authors.length === 0 ? (
          <Text size="small" className="text-ui-fg-muted">No authors yet.</Text>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Role</Table.HeaderCell>
                <Table.HeaderCell>Active</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {authors.map((a) => (
                <Table.Row key={a.id}>
                  <Table.Cell>{a.name}</Table.Cell>
                  <Table.Cell>{a.role ?? <span className="text-ui-fg-muted">—</span>}</Table.Cell>
                  <Table.Cell>
                    <Badge size="2xsmall" color={a.active ? "green" : "grey"}>
                      {a.active ? "active" : "hidden"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center justify-end gap-2">
                      <IconButton size="small" variant="transparent" onClick={() => setEditingId(a.id)}>
                        <PencilSquare />
                      </IconButton>
                      <IconButton size="small" variant="transparent" onClick={() => {
                        if (confirm(`Delete author "${a.name}"?`)) deleteMutation.mutate(a.id)
                      }}>
                        <Trash />
                      </IconButton>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>

      {creating && (
        <CreateAuthorDrawer open={creating} onClose={() => setCreating(false)}
          onCreated={(id) => { setCreating(false); setEditingId(id) }} />
      )}
      {editingId && (
        <EditAuthorDrawer id={editingId} open={!!editingId} onClose={() => setEditingId(null)} />
      )}
    </Container>
  )
}

const CreateAuthorDrawer = ({ open, onClose, onCreated }: {
  open: boolean; onClose: () => void; onCreated: (id: string) => void
}) => {
  const qc = useQueryClient()
  const [name, setName] = useState("")

  const createMutation = useMutation({
    mutationFn: async () =>
      sdk.client.fetch<{ article_author: Author }>("/admin/article-authors", {
        method: "POST", body: { name },
      }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["article-authors"] })
      toast.success("Author created")
      onCreated(res.article_author.id)
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to create author"),
  })

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Content>
        <Drawer.Header><Drawer.Title>New author</Drawer.Title></Drawer.Header>
        <Drawer.Body className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label size="small">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Max Mustermann" />
            <Text size="xsmall" className="text-ui-fg-muted">Slug is derived from the name.</Text>
          </div>
        </Drawer.Body>
        <Drawer.Footer>
          <Button variant="secondary" size="small" onClick={onClose}>Cancel</Button>
          <Button size="small" disabled={!name.trim() || createMutation.isPending}
            isLoading={createMutation.isPending} onClick={() => createMutation.mutate()}>Create</Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}

const EditAuthorDrawer = ({ id, open, onClose }: {
  id: string; open: boolean; onClose: () => void
}) => {
  const qc = useQueryClient()
  const [locale, setLocale] = useState(DEFAULT_LOCALE)
  const [form, setForm] = useState<Partial<Author>>({})

  const authorQuery = useQuery({
    queryKey: ["article-author", id],
    queryFn: async () =>
      sdk.client.fetch<{ article_author: Author }>(`/admin/article-authors/${id}`),
  })
  const author = authorQuery.data?.article_author
  useEffect(() => { if (author) setForm(author) }, [author?.id])

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["article-author", id] })
    qc.invalidateQueries({ queryKey: ["article-authors"] })
  }
  const set = (k: keyof Author, v: any) => setForm((f) => ({ ...f, [k]: v }))

  const detailsMutation = useMutation({
    mutationFn: async () =>
      sdk.client.fetch(`/admin/article-authors/${id}`, {
        method: "POST",
        body: {
          name: form.name, slug: form.slug, role: form.role, photo_url: form.photo_url,
          linkedin_url: form.linkedin_url, website_url: form.website_url, xing_url: form.xing_url,
          active: form.active,
        },
      }),
    onSuccess: () => { invalidate(); toast.success("Author saved") },
    onError: () => toast.error("Failed to save author"),
  })

  const bioMutation = useMutation({
    mutationFn: async (html: string) =>
      sdk.client.fetch(`/admin/article-authors/${id}`, {
        method: "POST", body: { [bioColumn(locale)]: html },
      }),
    onSuccess: () => { invalidate(); toast.success("Bio saved") },
    onError: () => toast.error("Failed to save bio"),
  })

  const rawBio = author ? (author[bioColumn(locale)] as string | null) || "" : ""

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Content className="max-w-[720px]">
        <Drawer.Header>
          <Drawer.Title>{author ? `Edit ${author.name}` : "Edit author"}</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name"><Input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} /></Field>
            <Field label="Slug"><Input value={form.slug ?? ""} onChange={(e) => set("slug", e.target.value)} /></Field>
            <Field label="Role"><Input value={form.role ?? ""} onChange={(e) => set("role", e.target.value)} placeholder="Redaktion" /></Field>
            <Field label="Photo URL"><Input value={form.photo_url ?? ""} onChange={(e) => set("photo_url", e.target.value)} placeholder="https://…" /></Field>
            <Field label="LinkedIn URL"><Input value={form.linkedin_url ?? ""} onChange={(e) => set("linkedin_url", e.target.value)} placeholder="https://www.linkedin.com/in/…" /></Field>
            <Field label="Website URL"><Input value={form.website_url ?? ""} onChange={(e) => set("website_url", e.target.value)} placeholder="https://…" /></Field>
            <Field label="Xing URL"><Input value={form.xing_url ?? ""} onChange={(e) => set("xing_url", e.target.value)} placeholder="https://…" /></Field>
            <div className="flex flex-col gap-1">
              <Label size="small">Active</Label>
              <div className="flex h-8 items-center gap-2">
                <Switch checked={form.active ?? true} onCheckedChange={(c) => set("active", c)} />
                <Text size="small" className="text-ui-fg-subtle">{form.active ? "Visible" : "Hidden"}</Text>
              </div>
            </div>
          </div>
          <div>
            <Button size="small" variant="secondary" onClick={() => detailsMutation.mutate()}
              isLoading={detailsMutation.isPending}>Save details</Button>
          </div>

          <MarkdownRichEditor
            label="Bio"
            locales={PRODUCT_LOCALES}
            activeLocale={locale}
            onLocaleChange={setLocale}
            value={toEditorHtml(rawBio)}
            isValueLoading={authorQuery.isLoading}
            onSave={(html) => bioMutation.mutateAsync(html)}
            isSaving={bioMutation.isPending}
            helpText={<>Short bio shown on the author page. German is the default; EN/IT stored separately.</>}
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
  label: "Magazin Authors",
  icon: User,
})

export default AuthorsPage
