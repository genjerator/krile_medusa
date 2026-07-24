import { Button, Container, Select, Text, Textarea, toast } from "@medusajs/ui"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { TableKit } from "@tiptap/extension-table"
import { ReactNode, useEffect, useState } from "react"
import { markdownToHtml, looksLikeMarkdown } from "../lib/markdown"
import { ProductLocale } from "../lib/product-locales"

// Tailwind's CSS reset strips heading sizes and list markers, so TipTap content
// renders as flat text without these. Restore per-node styling for the editor.
const EDITOR_CLASS = [
  "rounded-md border border-ui-border-base bg-ui-bg-field px-3 py-2 min-h-[160px] text-sm",
  "focus-within:border-ui-border-interactive",
  "[&_.tiptap]:outline-none [&_.tiptap]:min-h-[120px] [&_.tiptap]:flex [&_.tiptap]:flex-col [&_.tiptap]:gap-2",
  // headings
  "[&_.tiptap_h1]:text-xl [&_.tiptap_h1]:font-semibold",
  "[&_.tiptap_h2]:text-lg [&_.tiptap_h2]:font-semibold",
  "[&_.tiptap_h3]:text-base [&_.tiptap_h3]:font-semibold",
  // lists
  "[&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-5 [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-5",
  "[&_.tiptap_li>p]:my-0",
  // blockquote + code
  "[&_.tiptap_blockquote]:border-l-2 [&_.tiptap_blockquote]:border-ui-border-base [&_.tiptap_blockquote]:pl-3 [&_.tiptap_blockquote]:text-ui-fg-subtle",
  "[&_.tiptap_code]:rounded [&_.tiptap_code]:bg-ui-bg-subtle [&_.tiptap_code]:px-1 [&_.tiptap_code]:py-0.5 [&_.tiptap_code]:text-xs",
  // tables
  "[&_.tiptap_table]:w-full [&_.tiptap_table]:my-2 [&_.tiptap_table]:border-collapse",
  "[&_.tiptap_td]:border [&_.tiptap_td]:border-ui-border-base [&_.tiptap_td]:p-2 [&_.tiptap_td]:align-top",
  "[&_.tiptap_th]:border [&_.tiptap_th]:border-ui-border-base [&_.tiptap_th]:p-2 [&_.tiptap_th]:bg-ui-bg-subtle [&_.tiptap_th]:text-left",
].join(" ")

type Props = {
  label: string
  /** Current HTML value for the active locale (description or metadata). */
  value: string
  /** Persist the editor's HTML for the active locale. Resolve/throw to toast. */
  onSave: (html: string) => Promise<unknown>
  isSaving: boolean
  helpText: ReactNode
  /** Language dropdown options. */
  locales: ProductLocale[]
  activeLocale: string
  onLocaleChange: (code: string) => void
  /** True while the active locale's value is being fetched (e.g. translation). */
  isValueLoading?: boolean
}

/**
 * Rich-text editor (TipTap) with an optional "Import from Markdown" panel that
 * converts our .md product-copy notation into editor content. Shared by the
 * product description and technical-data widgets.
 */
export const MarkdownRichEditor = ({
  label,
  value,
  onSave,
  isSaving,
  helpText,
  locales,
  activeLocale,
  onLocaleChange,
  isValueLoading = false,
}: Props) => {
  // Import panel: paste Markdown OR raw HTML and load it into the editor.
  const [importMode, setImportMode] = useState<"markdown" | "html" | null>(null)
  const [importText, setImportText] = useState("")

  const editor = useEditor({
    extensions: [StarterKit, TableKit.configure({ table: { resizable: false } })],
    content: value || "",
  })

  useEffect(() => {
    // Reset the editor from the server value when the active locale changes or a
    // refetch resolves. Skip while focused so in-progress edits aren't clobbered,
    // and skip while the value is still loading so we don't flash empty content.
    if (editor && !editor.isFocused && !isValueLoading) {
      editor.commands.setContent(value || "")
    }
  }, [value, editor, activeLocale, isValueLoading])

  const handleSave = () => {
    if (!editor) return
    onSave(editor.getHTML())
  }

  const openImport = (mode: "markdown" | "html") => {
    // Toggle the panel off if the same mode is clicked again.
    setImportMode((m) => (m === mode ? null : mode))
    setImportText("")
  }

  const handleImport = () => {
    if (!editor || !importMode) return
    // Markdown is converted to HTML first; raw HTML is loaded as-is (TipTap
    // parses the HTML string into editor nodes).
    const html = (importMode === "markdown" ? markdownToHtml(importText) : importText).trim()
    if (!html) {
      toast.error("Nothing to import")
      return
    }
    editor.commands.setContent(html)
    setImportText("")
    setImportMode(null)
    toast.success(
      `${importMode === "markdown" ? "Markdown" : "HTML"} loaded — review, then Save to keep it`
    )
  }

  return (
    <Container className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Text size="small" leading="compact" weight="plus">
            {label}
          </Text>
          <div className="w-[150px]">
            <Select value={activeLocale} onValueChange={onLocaleChange} size="small">
              <Select.Trigger>
                <Select.Value placeholder="Language" />
              </Select.Trigger>
              <Select.Content>
                {locales.map((l) => (
                  <Select.Item key={l.code} value={l.code}>
                    {l.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="small"
            variant="secondary"
            onClick={() => openImport("markdown")}
          >
            {importMode === "markdown" ? "Cancel import" : "Import from Markdown"}
          </Button>
          <Button
            size="small"
            variant="secondary"
            onClick={() => openImport("html")}
          >
            {importMode === "html" ? "Cancel import" : "Import from HTML"}
          </Button>
          <Button
            size="small"
            onClick={handleSave}
            disabled={isSaving || isValueLoading}
            isLoading={isSaving}
          >
            Save
          </Button>
        </div>
      </div>

      {importMode && (
        <div className="flex flex-col gap-2 rounded-md border border-ui-border-base bg-ui-bg-subtle p-3">
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            {importMode === "markdown"
              ? "Paste Markdown (from the .md copy) and load it into the editor. This replaces the current content — nothing is saved until you press Save."
              : "Paste raw HTML and load it into the editor. This replaces the current content — nothing is saved until you press Save. Unsupported tags/attributes are dropped by the editor."}
          </Text>
          <Textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder={
              importMode === "markdown"
                ? "# Heading\n\n**Bold**, *italic*, and\n\n- bullet\n- points"
                : "<h2>Heading</h2>\n<p><strong>Bold</strong>, <em>italic</em></p>\n<ul><li>bullet</li></ul>"
            }
            rows={8}
            className="font-mono text-xs"
          />
          <div className="flex justify-end">
            <Button
              size="small"
              onClick={handleImport}
              disabled={
                !importText.trim() ||
                (importMode === "markdown" && !looksLikeMarkdown(importText))
              }
            >
              {importMode === "markdown" ? "Convert & load" : "Load HTML"}
            </Button>
          </div>
        </div>
      )}

      <div className={EDITOR_CLASS}>
        <EditorContent editor={editor} />
      </div>

      <Text size="small" leading="compact" className="text-ui-fg-subtle">
        {helpText}
      </Text>
    </Container>
  )
}

export default MarkdownRichEditor
