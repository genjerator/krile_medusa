import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

type Input = {
  email: string
  vorname: string
  name: string
  phone?: string
  sales_channel_ids?: string[]
}

/**
 * Ensures a customer exists for a submitted repair form: looks one up by email
 * and creates it if missing (first_name = Vorname, last_name = Name), then links
 * it to the storefront's sales channel(s). Compensation deletes only a customer
 * this step created.
 */
export const linkReparaturToCustomerStep = createStep(
  "link-reparatur-to-customer-step",
  async (input: Input, { container }) => {
    const customerService = container.resolve(Modules.CUSTOMER)
    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)

    let customer = (await customerService.listCustomers({ email: input.email }))[0]
    let createdId: string | null = null

    if (!customer) {
      customer = (
        await customerService.createCustomers([
          {
            email: input.email,
            ...(input.vorname && { first_name: input.vorname }),
            ...(input.name && { last_name: input.name }),
            ...(input.phone && { phone: input.phone }),
            metadata: { source: "reparatur" },
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
