import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, HttpTypes } from "@medusajs/framework/types"
import { toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { sdk } from "../lib/client"
import { MarkdownRichEditor } from "../components/markdown-rich-editor"
import { htmlToMarkdown, toEditorHtml } from "../lib/markdown"
import {
  DEFAULT_LOCALE,
  PRODUCT_LOCALES,
  TRANSLATION_LOCALE,
} from "../lib/product-locales"

type TranslationRow = {
  id: string
  locale_code: string
  translations: Record<string, string>
}

// Styling for the rendered rich text injected into the native description row
// (Tailwind arbitrary variants — listed here as literals so the admin build
// compiles them).
const NATIVE_RICH_CLASSES = [
  "[&_h1]:text-base",
  "[&_h1]:font-semibold",
  "[&_h2]:font-semibold",
  "[&_h3]:font-semibold",
  "[&_ul]:list-disc",
  "[&_ul]:pl-5",
  "[&_ol]:list-decimal",
  "[&_ol]:pl-5",
  "[&_p]:mb-2",
  "[&_table]:border-collapse",
  "[&_td]:border",
  "[&_td]:border-ui-border-base",
  "[&_td]:p-1",
  "[&_th]:border",
  "[&_th]:border-ui-border-base",
  "[&_th]:p-1",
]

const ProductDescriptionWidget = ({ data: product }: DetailWidgetProps<HttpTypes.AdminProduct>) => {
  const queryClient = useQueryClient()
  const [locale, setLocale] = useState(DEFAULT_LOCALE)

  const isBase = locale === DEFAULT_LOCALE
  const localeCode = TRANSLATION_LOCALE[locale] // undefined for the base (German)

  // Fetch the translation row for the active non-default locale.
  const translationQuery = useQuery({
    queryKey: ["product-translation", product.id, localeCode],
    enabled: !isBase && !!localeCode,
    queryFn: async () => {
      const res = await sdk.client.fetch<{ translations: TranslationRow[] }>(
        "/admin/translations",
        {
          query: {
            reference: "product",
            reference_id: product.id,
            locale_code: localeCode,
          },
        }
      )
      return res.translations?.[0] ?? null
    },
  })

  // Medusa's built-in "Description" row (product general section) shows the raw
  // stored source — Markdown notation (**bold**) and HTML tags included. Locate
  // that text node and swap in the rendered rich text. Best-effort: if the core
  // markup changes and the node isn't found, the raw text simply stays. Re-runs
  // via MutationObserver because React re-renders restore the raw text.
  useEffect(() => {
    const raw = (product.description ?? "").trim()
    if (!raw) return
    const rendered = toEditorHtml(raw)

    const apply = () => {
      for (const el of Array.from(
        document.querySelectorAll<HTMLElement>("p, span, div")
      )) {
        if (
          el.childElementCount === 0 &&
          !el.closest(".tiptap") &&
          el.textContent?.trim() === raw
        ) {
          el.classList.add(...NATIVE_RICH_CLASSES)
          el.innerHTML = rendered
        }
      }
    }
    apply()
    const observer = new MutationObserver(() => apply())
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [product.description])

  const rawValue = isBase
    ? product.description || ""
    : translationQuery.data?.translations?.description || ""
  // Existing HTML displays as-is; Markdown is rendered to HTML for the editor.
  const value = toEditorHtml(rawValue)

  const saveMutation = useMutation({
    // Convert the editor's HTML back to Markdown before storing, so the
    // storefront (which renders the description as plain text) shows no tags.
    mutationFn: async (html: string) => {
      const content = htmlToMarkdown(html)
      if (isBase) {
        return sdk.admin.product.update(product.id, { description: content })
      }
      // Preserve the locale's other translated fields (title, subtitle, …) —
      // the batch update replaces the whole translations object.
      const existing = translationQuery.data
      const merged = { ...(existing?.translations ?? {}), description: content }
      const body = existing?.id
        ? { update: [{ id: existing.id, translations: merged }] }
        : {
            create: [
              {
                reference: "product",
                reference_id: product.id,
                locale_code: localeCode,
                translations: merged,
              },
            ],
          }
      return sdk.client.fetch("/admin/translations/batch", { method: "POST", body })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", product.id] })
      queryClient.invalidateQueries({
        queryKey: ["product-translation", product.id, localeCode],
      })
      toast.success("Description saved")
    },
    onError: () => toast.error("Failed to save description"),
  })

  return (
    <MarkdownRichEditor
      label="Description"
      locales={PRODUCT_LOCALES}
      activeLocale={locale}
      onLocaleChange={setLocale}
      value={value}
      isValueLoading={!isBase && translationQuery.isLoading}
      onSave={(html) => saveMutation.mutateAsync(html)}
      isSaving={saveMutation.isPending}
      helpText={
        <>
          German is the default (the product's own description); English/Italian
          are saved as translations. Supports <strong>bold</strong>,{" "}
          <em>italic</em>, headings, bullet lists, tables and more. Use “Import
          from Markdown” to paste .md copy.
        </>
      }
    />
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductDescriptionWidget
