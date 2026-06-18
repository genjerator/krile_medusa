import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Button, Container, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useLocation, useNavigate } from "react-router-dom"
import { sdk } from "../lib/client"

const ProductChannelFilterWidget = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const activeChannelId = searchParams.get("sales_channel_id") ?? null

  const { data } = useQuery({
    queryKey: ["sales-channels-filter"],
    queryFn: () => sdk.admin.salesChannel.list({ limit: 50 }),
  })

  const channels = data?.sales_channels ?? []
  const industriesWebshop = channels.find((c) => c.name === "IndustriesWebshop")
  const planetaWebshop = channels.find((c) => c.name === "PlanetaWebshop")

  const setFilter = (channelId: string | null) => {
    const params = new URLSearchParams(location.search)
    params.delete("sales_channel_id")
    params.delete("offset")
    if (channelId) params.set("sales_channel_id", channelId)
    navigate(`/products?${params.toString()}`)
  }

  return (
    <Container className="px-6 py-3">
      <div className="flex items-center gap-3">
        <Text size="small" leading="compact" weight="plus" className="text-ui-fg-subtle">
          Channel:
        </Text>
        <div className="flex gap-2">
          <Button
            size="small"
            variant={activeChannelId === (industriesWebshop?.id ?? null) && activeChannelId !== null ? "primary" : "secondary"}
            onClick={() => industriesWebshop && setFilter(industriesWebshop.id)}
            disabled={!industriesWebshop}
          >
            industriesWebshop
          </Button>
          <Button
            size="small"
            variant={activeChannelId === (planetaWebshop?.id ?? null) && activeChannelId !== null ? "primary" : "secondary"}
            onClick={() => planetaWebshop && setFilter(planetaWebshop.id)}
            disabled={!planetaWebshop}
          >
            PlanetaWebshop
          </Button>
          <Button
            size="small"
            variant={activeChannelId === null ? "primary" : "secondary"}
            onClick={() => setFilter(null)}
          >
            All
          </Button>
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.list.before",
})

export default ProductChannelFilterWidget
