import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Badge, Container, Heading, Text } from "@medusajs/ui"

const paymentLabel = (providerId: string) => {
  if (providerId?.includes("paypal")) return { label: "PayPal", color: "blue" as const }
  if (providerId?.includes("manual")) return { label: "Vorkasse", color: "grey" as const }
  return { label: providerId ?? "—", color: "grey" as const }
}

const OrderPaymentMethodWidget = ({ data }: { data: any }) => {
  const session = data?.payment_collections?.[0]?.payment_sessions?.[0]
  const payment = paymentLabel(session?.provider_id)

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Zahlungsmethode</Heading>
        <Badge color={payment.color} size="2xsmall">
          {payment.label}
        </Badge>
      </div>
      {session && (
        <div className="px-6 py-4">
          <Text className="txt-small text-ui-fg-subtle">Provider: {session.provider_id}</Text>
          <Text className="txt-small text-ui-fg-subtle">Status: {session.status}</Text>
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.side.after",
})

export default OrderPaymentMethodWidget
