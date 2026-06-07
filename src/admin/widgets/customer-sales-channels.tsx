import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Badge, Container, Heading, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../lib/client"

type SalesChannel = { id: string; name: string }

const CustomerSalesChannelsWidget = ({ data }: { data: any }) => {
  const { data: result, isLoading } = useQuery({
    queryKey: ["customer-sales-channels", data?.id],
    queryFn: () =>
      sdk.client.fetch<{ sales_channels: SalesChannel[] }>(
        `/admin/customers/${data.id}/sales-channels`
      ),
    enabled: !!data?.id,
  })

  const channels = result?.sales_channels ?? []

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Channel</Heading>
      </div>
      <div className="px-6 py-4 flex flex-wrap gap-2">
        {isLoading ? (
          <Text className="txt-small text-ui-fg-subtle">Loading...</Text>
        ) : channels.length === 0 ? (
          <Text className="txt-small text-ui-fg-subtle">No channel linked</Text>
        ) : (
          channels.map((channel) => (
            <Badge key={channel.id} size="2xsmall" color="grey">
              {channel.name}
            </Badge>
          ))
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "customer.details.side.after",
})

export default CustomerSalesChannelsWidget
