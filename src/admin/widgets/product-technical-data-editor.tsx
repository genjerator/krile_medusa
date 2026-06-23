import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, HttpTypes } from "@medusajs/framework/types"
import { Button, Container, Text, toast } from "@medusajs/ui"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { sdk } from "../lib/client"

const METADATA_KEY = "technische_daten_html"

const ProductTechnicalDataWidget = ({
  data: product,
}: DetailWidgetProps<HttpTypes.AdminProduct>) => {
  const queryClient = useQueryClient()
  const currentHtml = ((product.metadata?.[METADATA_KEY] as string) || "")

  const editor = useEditor({
    extensions: [StarterKit],
    content: currentHtml,
  })

  useEffect(() => {
    if (editor) {
      editor.commands.setContent(currentHtml)
    }
  }, [currentHtml])

  const updateMutation = useMutation({
    mutationFn: (html: string) =>
      // Merge so existing metadata (woo_*, structured technische_daten__* keys)
      // is preserved — a bare metadata update would replace the whole object.
      sdk.admin.product.update(product.id, {
        metadata: { ...(product.metadata ?? {}), [METADATA_KEY]: html },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", product.id] })
      toast.success("Technical data saved")
    },
    onError: () => toast.error("Failed to save technical data"),
  })

  const handleSave = () => {
    if (!editor) return
    updateMutation.mutate(editor.getHTML())
  }

  return (
    <Container className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <Text size="small" leading="compact" weight="plus">
          Technical Data (Technische Daten)
        </Text>
        <Button
          size="small"
          onClick={handleSave}
          disabled={updateMutation.isPending}
          isLoading={updateMutation.isPending}
        >
          Save
        </Button>
      </div>

      <div className="rounded-md border border-ui-border-base bg-ui-bg-field px-3 py-2 min-h-[160px] text-sm focus-within:border-ui-border-interactive [&_.tiptap]:outline-none [&_.tiptap]:min-h-[120px]">
        <EditorContent editor={editor} />
      </div>

      <Text size="small" leading="compact" className="text-ui-fg-subtle">
        Rich-text technical data shown on the storefront's “Technische Daten” tab,
        below the auto-generated spec table (both are displayed). Supports{" "}
        <strong>bold</strong>, <em>italic</em>, headings, bullet lists and more.
      </Text>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductTechnicalDataWidget
