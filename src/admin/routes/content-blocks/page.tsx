import { defineRouteConfig } from "@medusajs/admin-sdk"
import { DocumentText, Trash, PencilSquare } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Drawer,
  Heading,
  IconButton,
  Input,
  Label,
  Switch,
  Text,
  Table,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { sdk } from "../../lib/client"
import { MarkdownRichEditor } from "../../components/markdown-rich-editor"
import { toEditorHtml } from "../../lib/markdown"
import {
  DEFAULT_LOCALE,
  PRODUCT_LOCALES,
} from "../../lib/product-locales"

type ContentBlock = {
  id: string
  key: string
  title: string | null
  status: "draft" | "published"
  body: string | null
  body_en: string | null
  body_it: string | null
}

// Locale dropdown code → the block's HTML column. German is the base `body`.
const bodyColumn = (locale: string): "body" | "body_en" | "body_it" =>
  locale === DEFAULT_LOCALE ? "body" : (`body_${locale}` as "body_en" | "body_it")

const ContentBlocksPage = () => {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const listQuery = useQuery({
    queryKey: ["content-blocks"],
    queryFn: async () =>
      sdk.client.fetch<{ content_blocks: ContentBlock[] }>("/admin/content-blocks"),
  })

  const blocks = listQuery.data?.content_blocks ?? []

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      sdk.client.fetch(`/admin/content-blocks/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-blocks"] })
      toast.success("Content block deleted")
    },
    onError: () => toast.error("Failed to delete content block"),
  })

  return (
    <Container className="flex flex-col gap-4 p-0">
      <div className="flex items-center justify-between px-6 pt-6">
        <div>
          <Heading level="h1">Content Blocks</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Reusable static content for the storefront, edited per language.
            Each block is addressed by its <code>key</code>.
          </Text>
        </div>
        <Button size="small" onClick={() => setCreating(true)}>
          New block
        </Button>
      </div>

      <div className="px-6 pb-6">
        {blocks.length === 0 ? (
          <Text size="small" className="text-ui-fg-muted">
            No content blocks yet. Create one to get started.
          </Text>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Key</Table.HeaderCell>
                <Table.HeaderCell>Title</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {blocks.map((b) => (
                <Table.Row key={b.id}>
                  <Table.Cell>
                    <code className="text-ui-fg-base">{b.key}</code>
                  </Table.Cell>
                  <Table.Cell>{b.title ?? <span className="text-ui-fg-muted">—</span>}</Table.Cell>
                  <Table.Cell>
                    <Badge size="2xsmall" color={b.status === "published" ? "green" : "grey"}>
                      {b.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center justify-end gap-2">
                      <IconButton size="small" variant="transparent" onClick={() => setEditingId(b.id)}>
                        <PencilSquare />
                      </IconButton>
                      <IconButton
                        size="small"
                        variant="transparent"
                        onClick={() => {
                          if (confirm(`Delete content block "${b.key}"?`)) deleteMutation.mutate(b.id)
                        }}
                      >
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
        <CreateBlockDrawer
          open={creating}
          onClose={() => setCreating(false)}
          onCreated={(id) => {
            setCreating(false)
            setEditingId(id)
          }}
        />
      )}

      {editingId && (
        <EditBlockDrawer
          id={editingId}
          open={!!editingId}
          onClose={() => setEditingId(null)}
        />
      )}
    </Container>
  )
}

/** New-block drawer: just key + title. Body is edited after creation. */
const CreateBlockDrawer = ({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: (id: string) => void
}) => {
  const queryClient = useQueryClient()
  const [key, setKey] = useState("")
  const [title, setTitle] = useState("")

  const createMutation = useMutation({
    mutationFn: async () =>
      sdk.client.fetch<{ content_block: ContentBlock }>("/admin/content-blocks", {
        method: "POST",
        body: { key, title },
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["content-blocks"] })
      toast.success("Content block created")
      onCreated(res.content_block.id)
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to create content block"),
  })

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>New content block</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label size="small">Key</Label>
            <Input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="about-hero"
            />
            <Text size="xsmall" className="text-ui-fg-muted">
              Lowercase slug used to fetch the block. Spaces become dashes.
            </Text>
          </div>
          <div className="flex flex-col gap-1">
            <Label size="small">Title (admin label)</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="About – Hero"
            />
          </div>
        </Drawer.Body>
        <Drawer.Footer>
          <Button variant="secondary" size="small" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="small"
            disabled={!key.trim() || createMutation.isPending}
            isLoading={createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            Create
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}

/** Edit drawer: title + status + the rich-text body editor (DE/EN/IT). */
const EditBlockDrawer = ({
  id,
  open,
  onClose,
}: {
  id: string
  open: boolean
  onClose: () => void
}) => {
  const queryClient = useQueryClient()
  const [locale, setLocale] = useState(DEFAULT_LOCALE)

  const blockQuery = useQuery({
    queryKey: ["content-block", id],
    queryFn: async () =>
      sdk.client.fetch<{ content_block: ContentBlock }>(`/admin/content-blocks/${id}`),
  })
  const block = blockQuery.data?.content_block

  const [title, setTitle] = useState("")
  const [status, setStatus] = useState<"draft" | "published">("published")
  // Sync local details state once the block loads (or changes).
  useEffect(() => {
    if (block) {
      setTitle(block.title ?? "")
      setStatus(block.status)
    }
  }, [block?.id])

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["content-block", id] })
    queryClient.invalidateQueries({ queryKey: ["content-blocks"] })
  }

  const detailsMutation = useMutation({
    mutationFn: async () =>
      sdk.client.fetch(`/admin/content-blocks/${id}`, {
        method: "POST",
        body: { title, status },
      }),
    onSuccess: () => {
      invalidate()
      toast.success("Details saved")
    },
    onError: () => toast.error("Failed to save details"),
  })

  const bodyMutation = useMutation({
    mutationFn: async (html: string) =>
      sdk.client.fetch(`/admin/content-blocks/${id}`, {
        method: "POST",
        body: { [bodyColumn(locale)]: html },
      }),
    onSuccess: () => {
      invalidate()
      toast.success("Content saved")
    },
    onError: () => toast.error("Failed to save content"),
  })

  const rawBody = block ? (block[bodyColumn(locale)] as string | null) || "" : ""
  const value = toEditorHtml(rawBody)

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Content className="max-w-[720px]">
        <Drawer.Header>
          <Drawer.Title>
            {block ? <>Edit “{block.key}”</> : "Edit content block"}
          </Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-6 overflow-y-auto">
          <div className="flex items-end gap-4">
            <div className="flex flex-1 flex-col gap-1">
              <Label size="small">Title (admin label)</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="About – Hero"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label size="small">Published</Label>
              <div className="flex h-8 items-center gap-2">
                <Switch
                  checked={status === "published"}
                  onCheckedChange={(c) => setStatus(c ? "published" : "draft")}
                />
                <Text size="small" className="text-ui-fg-subtle">
                  {status === "published" ? "Visible" : "Hidden"}
                </Text>
              </div>
            </div>
            <Button
              size="small"
              variant="secondary"
              onClick={() => detailsMutation.mutate()}
              isLoading={detailsMutation.isPending}
            >
              Save details
            </Button>
          </div>

          <MarkdownRichEditor
            label="Content"
            locales={PRODUCT_LOCALES}
            activeLocale={locale}
            onLocaleChange={setLocale}
            value={value}
            isValueLoading={blockQuery.isLoading}
            onSave={(html) => bodyMutation.mutateAsync(html)}
            isSaving={bodyMutation.isPending}
            helpText={
              <>
                German is the default; English/Italian are stored separately.
                Content is saved as HTML and rendered on the storefront. Supports{" "}
                <strong>bold</strong>, <em>italic</em>, headings, bullet lists,
                tables and more. Use “Import from Markdown” to paste .md copy.
              </>
            }
          />
        </Drawer.Body>
        <Drawer.Footer>
          <Button variant="secondary" size="small" onClick={onClose}>
            Close
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}

export const config = defineRouteConfig({
  label: "Content Blocks",
  icon: DocumentText,
})

export default ContentBlocksPage
