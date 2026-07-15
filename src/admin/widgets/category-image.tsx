import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Button, Container, Heading, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRef } from "react"
import { sdk } from "../lib/client"

type AdminProductCategory = {
  id: string
  name: string
  metadata?: Record<string, unknown> | null
}

const CategoryImageWidget = ({ data }: { data: AdminProductCategory }) => {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Display query — always fetch fresh metadata so the widget survives page refreshes
  const { data: result, isLoading } = useQuery({
    queryKey: ["category-image", data.id],
    queryFn: () =>
      sdk.admin.productCategory.retrieve(data.id, {
        fields: "id,name,metadata",
      }),
    enabled: !!data?.id,
  })

  const category = result?.product_category
  const imageUrl = (category?.metadata?.image as string) || ""

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["category-image", data.id] })
    queryClient.invalidateQueries({ queryKey: ["product_category", data.id] })
  }

  const uploadImage = useMutation({
    mutationFn: async (file: File) => {
      const { files } = await sdk.admin.upload.create({ files: [file] })
      const url = files?.[0]?.url
      if (!url) {
        throw new Error("Upload returned no file URL")
      }
      return sdk.admin.productCategory.update(data.id, {
        metadata: { ...(category?.metadata ?? {}), image: url },
      })
    },
    onSuccess: () => {
      invalidate()
      toast.success("Category image updated")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload image")
    },
  })

  const removeImage = useMutation({
    mutationFn: () =>
      sdk.admin.productCategory.update(data.id, {
        metadata: { ...(category?.metadata ?? {}), image: "" },
      }),
    onSuccess: () => {
      invalidate()
      toast.success("Category image removed")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove image")
    },
  })

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      uploadImage.mutate(file)
    }
    // Allow re-selecting the same file after a failed upload
    event.target.value = ""
  }

  const busy = uploadImage.isPending || removeImage.isPending

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Image</Heading>
        <div className="flex gap-2">
          {imageUrl && (
            <Button
              size="small"
              variant="secondary"
              onClick={() => removeImage.mutate()}
              disabled={busy}
              isLoading={removeImage.isPending}
            >
              Remove
            </Button>
          )}
          <Button
            size="small"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            isLoading={uploadImage.isPending}
          >
            {imageUrl ? "Replace" : "Upload"}
          </Button>
        </div>
      </div>
      <div className="px-6 py-4">
        {isLoading ? (
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Loading...
          </Text>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={category?.name || "Category image"}
            className="max-h-48 w-full rounded-md object-cover"
          />
        ) : (
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            No image uploaded. The storefront shows a placeholder for this
            category.
          </Text>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product_category.details.side.after",
})

export default CategoryImageWidget
