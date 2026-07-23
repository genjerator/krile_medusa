import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Button, Container, Heading, Input, Label, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { sdk } from "../lib/client"

type Branding = {
  id: string
  sales_channel_id: string
  hero_image_url: string | null
  hero_title: string | null
  hero_subtitle: string | null
  primary_color: string | null
}

const StorefrontBrandingWidget = ({ data }: { data: { id: string } }) => {
  const scId = data.id
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: result, isLoading } = useQuery({
    queryKey: ["storefront-branding", scId],
    queryFn: () =>
      sdk.client.fetch<{ branding: Branding | null }>(`/admin/storefront-branding/${scId}`),
    enabled: !!scId,
  })

  const [heroImageUrl, setHeroImageUrl] = useState("")
  const [heroTitle, setHeroTitle] = useState("")
  const [heroSubtitle, setHeroSubtitle] = useState("")
  const [primaryColor, setPrimaryColor] = useState("")

  // Seed the form once data loads (and on channel switch).
  useEffect(() => {
    const b = result?.branding
    setHeroImageUrl(b?.hero_image_url ?? "")
    setHeroTitle(b?.hero_title ?? "")
    setHeroSubtitle(b?.hero_subtitle ?? "")
    setPrimaryColor(b?.primary_color ?? "")
  }, [result?.branding])

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["storefront-branding", scId] })

  const save = useMutation({
    mutationFn: (patch: Partial<Branding>) =>
      sdk.client.fetch(`/admin/storefront-branding/${scId}`, { method: "POST", body: patch }),
    onSuccess: () => {
      invalidate()
      toast.success("Branding gespeichert")
    },
    onError: (e: Error) => toast.error(e.message || "Speichern fehlgeschlagen"),
  })

  const uploadHero = useMutation({
    mutationFn: async (file: File) => {
      const { files } = await sdk.admin.upload.create({ files: [file] })
      const url = files?.[0]?.url
      if (!url) throw new Error("Upload lieferte keine URL")
      setHeroImageUrl(url)
      return sdk.client.fetch(`/admin/storefront-branding/${scId}`, {
        method: "POST",
        body: { hero_image_url: url },
      })
    },
    onSuccess: () => {
      invalidate()
      toast.success("Hero-Bild hochgeladen")
    },
    onError: (e: Error) => toast.error(e.message || "Upload fehlgeschlagen"),
  })

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Storefront-Branding</Heading>
        <Text size="small" leading="compact" className="text-ui-fg-subtle">
          Hero und Akzentfarbe für den Shop dieses Verkaufskanals (z. B.
          planeta-buegelsysteme.de).
        </Text>
      </div>

      <div className="flex flex-col gap-4 px-6 py-4">
        {isLoading ? (
          <Text size="small" className="text-ui-fg-subtle">Lädt…</Text>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <Label size="small" weight="plus">Hero-Bild</Label>
              {heroImageUrl ? (
                <img
                  src={heroImageUrl}
                  alt="Hero"
                  className="max-h-40 w-full rounded-md object-cover"
                />
              ) : (
                <Text size="small" className="text-ui-fg-subtle">Kein Bild</Text>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) uploadHero.mutate(f)
                }}
              />
              <div>
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  isLoading={uploadHero.isPending}
                >
                  Hero-Bild hochladen
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label size="small" weight="plus">Hero-Titel</Label>
              <Input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
            </div>

            <div className="flex flex-col gap-2">
              <Label size="small" weight="plus">Hero-Untertitel</Label>
              <Input value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} />
            </div>

            <div className="flex flex-col gap-2">
              <Label size="small" weight="plus">Akzentfarbe</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor || "#1e3a5f"}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-8 w-10 rounded border border-ui-border-base"
                />
                <Input
                  value={primaryColor}
                  placeholder="#1e3a5f"
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="max-w-40"
                />
              </div>
            </div>

            <div>
              <Button
                size="small"
                onClick={() =>
                  save.mutate({
                    hero_title: heroTitle,
                    hero_subtitle: heroSubtitle,
                    primary_color: primaryColor,
                  })
                }
                isLoading={save.isPending}
              >
                Speichern
              </Button>
            </div>
          </>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "sales_channel.details.after",
})

export default StorefrontBrandingWidget
