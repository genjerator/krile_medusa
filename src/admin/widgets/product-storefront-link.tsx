import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, HttpTypes } from "@medusajs/framework/types"
import { ArrowUpRightOnBox } from "@medusajs/icons"
import { Button, Container, Text } from "@medusajs/ui"

const STOREFRONT_BY_CHANNEL: Record<string, string> = {
  IndustriesWebshop: "https://www.planetaindustries.de",
  PlanetaWebshop: "https://www.planeta.de",
}
const DEFAULT_STOREFRONT = "https://www.planetaindustries.de"

const getStorefrontUrl = (channels: Array<{ name: string }> | undefined | null) => {
  if (!channels?.length) return DEFAULT_STOREFRONT
  for (const ch of channels) {
    if (STOREFRONT_BY_CHANNEL[ch.name]) return STOREFRONT_BY_CHANNEL[ch.name]
  }
  return DEFAULT_STOREFRONT
}

const ProductStorefrontLinkWidget = ({ data: product }: DetailWidgetProps<HttpTypes.AdminProduct>) => {
  const channels = (product as any).sales_channels as Array<{ name: string }> | undefined
  const storefrontUrl = getStorefrontUrl(channels)
  const productUrl = `${storefrontUrl}/de/products/${product.handle}`

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Text size="small" leading="compact" weight="plus">
            Storefront
          </Text>
          <Text size="small" leading="compact" className="text-ui-fg-subtle font-mono">
            {product.handle}
          </Text>
        </div>
        <a href={productUrl} target="_blank" rel="noopener noreferrer">
          <Button size="small" variant="secondary">
            <ArrowUpRightOnBox />
            View
          </Button>
        </a>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.side.before",
})

export default ProductStorefrontLinkWidget
