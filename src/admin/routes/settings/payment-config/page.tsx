import { defineRouteConfig } from "@medusajs/admin-sdk"
import { CreditCard } from "@medusajs/icons"
import { Badge, Container, Heading, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../../../lib/client"

type PaymentConfig = {
  paypal_is_sandbox: boolean
  paypal_client_id: string | null
  paypal_client_secret_tail: string | null
  paypal_webhook_id: string | null
}

const Field = ({ label, value }: { label: string; value: string | null }) => (
  <div className="flex flex-col gap-1">
    <Text size="small" weight="plus" className="text-ui-fg-subtle">{label}</Text>
    {value ? (
      <Text size="small" className="font-mono text-ui-fg-base break-all">{value}</Text>
    ) : (
      <Text size="small" className="text-ui-fg-muted">Not configured</Text>
    )}
  </div>
)

const PaymentConfigPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["payment-config"],
    queryFn: () => sdk.client.fetch<PaymentConfig>("/admin/payment-config"),
  })

  return (
    <div className="flex flex-col gap-4 p-6">
      <div>
        <Heading level="h1">Payment Configuration</Heading>
        <Text size="small" leading="compact" className="text-ui-fg-subtle">
          Active payment provider settings
        </Text>
      </div>

      <Container className="p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-ui-border-base pb-4">
          <Heading level="h2">PayPal</Heading>
          {!isLoading && (
            <Badge color={data?.paypal_is_sandbox ? "orange" : "green"} size="2xsmall">
              {data?.paypal_is_sandbox ? "Sandbox" : "Live"}
            </Badge>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-5 w-80 bg-ui-bg-subtle animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <Field label="Client ID" value={data?.paypal_client_id ?? null} />
            <Field label="Client Secret (last 20 chars)" value={data?.paypal_client_secret_tail ?? null} />
            <Field label="Webhook ID" value={data?.paypal_webhook_id ?? null} />
          </div>
        )}
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Payment Config",
  icon: CreditCard,
})

export default PaymentConfigPage
