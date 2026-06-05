import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, HttpTypes } from "@medusajs/framework/types"
import { Button, Container, Text, toast } from "@medusajs/ui"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { sdk } from "../lib/client"

const ProductDescriptionWidget = ({ data: product }: DetailWidgetProps<HttpTypes.AdminProduct>) => {
  const queryClient = useQueryClient()

  const editor = useEditor({
    extensions: [StarterKit],
    content: product.description || "",
  })

  useEffect(() => {
    if (editor && product.description !== undefined) {
      editor.commands.setContent(product.description || "")
    }
  }, [product.description])

  const updateMutation = useMutation({
    mutationFn: (description: string) =>
      sdk.admin.product.update(product.id, { description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", product.id] })
      toast.success("Description saved")
    },
    onError: () => toast.error("Failed to save description"),
  })

  const handleSave = () => {
    if (!editor) return
    updateMutation.mutate(editor.getHTML())
  }

  return (
    <Container className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <Text size="small" leading="compact" weight="plus">
          Description
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
        Supports <strong>bold</strong>, <em>italic</em>, headings, bullet lists and more.
      </Text>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductDescriptionWidget
