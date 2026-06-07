import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

type Input = {
  email: string
  name: string
  phone?: string
  source: string
  sales_channel_ids?: string[]
}

export const linkInquiryToCustomerStep = createStep(
  "link-inquiry-to-customer-step",
  async (input: Input, { container }) => {
    const customerService = container.resolve(Modules.CUSTOMER)
    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)

    let customer = (await customerService.listCustomers({ email: input.email }))[0]
    let createdId: string | null = null

    if (!customer) {
      const [first_name, ...rest] = input.name.trim().split(/\s+/)
      const last_name = rest.join(" ")

      customer = (
        await customerService.createCustomers([
          {
            email: input.email,
            first_name: first_name || undefined,
            ...(last_name && { last_name }),
            ...(input.phone && { phone: input.phone }),
            metadata: { source: input.source },
          },
        ])
      )[0]
      createdId = customer.id
    }

    for (const sales_channel_id of input.sales_channel_ids ?? []) {
      await remoteLink
        .create({
          [Modules.CUSTOMER]: { customer_id: customer.id },
          [Modules.SALES_CHANNEL]: { sales_channel_id },
        })
        .catch(() => {})
    }

    return new StepResponse(customer, createdId)
  },
  async (createdId: string | null | undefined, { container }) => {
    if (!createdId) {
      return
    }
    const customerService = container.resolve(Modules.CUSTOMER)
    await customerService.deleteCustomers(createdId)
  }
)
