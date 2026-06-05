import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, HttpTypes } from "@medusajs/framework/types"
import { Button, Container, Text, toast } from "@medusajs/ui"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { sdk } from "../lib/client"

const CloneProductWidget = ({ data: product }: DetailWidgetProps<HttpTypes.AdminProduct>) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const cloneMutation = useMutation({
    mutationFn: async () => {
      // Fetch full product with all relations needed for cloning
      const { product: full } = await sdk.admin.product.retrieve(product.id, {
        fields: "title,subtitle,description,handle,status,weight,length,width,height,origin_country,material,hs_code,mid_code,metadata,thumbnail,images.*,options.*,options.values.*,variants.*,variants.options.*,categories.*,tags.*,collection_id",
      })

      const baseHandle = `${full.handle}-copy`
      const timestamp = Date.now()
      const newHandle = `${baseHandle}-${timestamp}`

      const payload: HttpTypes.AdminCreateProduct = {
        title: `Copy of ${full.title}`,
        handle: newHandle,
        ...(full.subtitle && { subtitle: full.subtitle }),
        ...(full.description && { description: full.description }),
        status: "draft",
        ...(full.weight && { weight: full.weight }),
        ...(full.length && { length: full.length }),
        ...(full.width && { width: full.width }),
        ...(full.height && { height: full.height }),
        ...(full.origin_country && { origin_country: full.origin_country }),
        ...(full.material && { material: full.material }),
        ...(full.hs_code && { hs_code: full.hs_code }),
        ...(full.mid_code && { mid_code: full.mid_code }),
        ...(full.metadata && { metadata: full.metadata }),
        ...(full.collection_id && { collection_id: full.collection_id }),
        ...(full.images?.length && { images: full.images.map((img: any) => ({ url: img.url })) }),
        ...(full.thumbnail && { thumbnail: full.thumbnail }),
        ...(full.categories?.length && { category_ids: full.categories.map((c: any) => c.id) }),
        ...(full.tags?.length && { tags: full.tags.map((t: any) => ({ id: t.id })) }),
        options: (full.options ?? []).map((opt: any) => ({
          title: opt.title,
          values: (opt.values ?? []).map((v: any) => v.value),
        })),
        variants: (full.variants ?? []).map((v: any) => ({
          title: v.title,
          sku: v.sku ? `${v.sku}-COPY-${timestamp}` : undefined,
          manage_inventory: v.manage_inventory,
          allow_backorder: v.allow_backorder,
          ...(v.weight && { weight: v.weight }),
          ...(v.length && { length: v.length }),
          ...(v.width && { width: v.width }),
          ...(v.height && { height: v.height }),
          prices: [],
          options: Object.fromEntries(
            (v.options ?? []).map((o: any) => [o.option?.title ?? o.title, o.value])
          ),
        })),
      }

      const { product: created } = await sdk.admin.product.create(payload)
      return created
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Product cloned", {
        description: `"${created.title}" created as draft.`,
        action: {
          label: "View",
          altText: "View cloned product",
          onClick: () => navigate(`/products/${created.id}`),
        },
      })
    },
    onError: (err: any) => {
      toast.error("Clone failed", { description: err?.message ?? "Unknown error" })
    },
  })

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Text size="small" leading="compact" weight="plus">
            Clone Product
          </Text>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Creates a draft copy with all variants and images.
          </Text>
        </div>
        <Button
          size="small"
          variant="secondary"
          isLoading={cloneMutation.isPending}
          disabled={cloneMutation.isPending}
          onClick={() => cloneMutation.mutate()}
        >
          Duplicate
        </Button>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.side.before",
})

export default CloneProductWidget
