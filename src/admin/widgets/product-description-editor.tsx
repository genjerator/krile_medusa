import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, HttpTypes } from "@medusajs/framework/types"
import { toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { sdk } from "../lib/client"
import { MarkdownRichEditor } from "../components/markdown-rich-editor"
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

  const value = isBase
    ? product.description || ""
    : translationQuery.data?.translations?.description || ""

  const saveMutation = useMutation({
    mutationFn: async (html: string) => {
      if (isBase) {
        return sdk.admin.product.update(product.id, { description: html })
      }
      // Preserve the locale's other translated fields (title, subtitle, …) —
      // the batch update replaces the whole translations object.
      const existing = translationQuery.data
      const merged = { ...(existing?.translations ?? {}), description: html }
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
