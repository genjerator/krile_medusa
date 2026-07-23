import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, HttpTypes } from "@medusajs/framework/types"
import { toast } from "@medusajs/ui"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { sdk } from "../lib/client"
import { MarkdownRichEditor } from "../components/markdown-rich-editor"
import { toEditorHtml } from "../lib/markdown"
import {
  DEFAULT_LOCALE,
  PRODUCT_LOCALES,
  metadataKeyForLocale,
} from "../lib/product-locales"

const BASE_KEY = "technische_daten_html"

const ProductTechnicalDataWidget = ({
  data: product,
}: DetailWidgetProps<HttpTypes.AdminProduct>) => {
  const queryClient = useQueryClient()
  const [locale, setLocale] = useState(DEFAULT_LOCALE)

  const metadataKey = metadataKeyForLocale(BASE_KEY, locale)
  // HTML displays as-is; Markdown (or mixed content) is rendered to HTML so the
  // editor never shows literal ** or tags.
  const currentHtml = toEditorHtml(
    (product.metadata?.[metadataKey] as string) || ""
  )

  const updateMutation = useMutation({
    mutationFn: (html: string) =>
      // Merge so existing metadata (woo_*, structured technische_daten__* keys,
      // and the other locales' tech-data) is preserved — a bare metadata update
      // would replace the whole object.
      sdk.admin.product.update(product.id, {
        metadata: { ...(product.metadata ?? {}), [metadataKey]: html },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", product.id] })
      toast.success("Technical data saved")
    },
    onError: () => toast.error("Failed to save technical data"),
  })

  return (
    <MarkdownRichEditor
      label="Technical Data (Technische Daten)"
      locales={PRODUCT_LOCALES}
      activeLocale={locale}
      onLocaleChange={setLocale}
      value={currentHtml}
      onSave={(html) => updateMutation.mutateAsync(html)}
      isSaving={updateMutation.isPending}
      helpText={
        <>
          Rich-text technical data shown on the storefront's “Technische Daten”
          tab, below the auto-generated spec table (both are displayed). Per
          language: German is the default; English/Italian are stored separately.
          Supports <strong>bold</strong>, <em>italic</em>, headings, bullet lists,
          tables and more. Use “Import from Markdown” to paste .md copy.
        </>
      }
    />
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductTechnicalDataWidget
