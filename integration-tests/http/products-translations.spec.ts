import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"

jest.setTimeout(120 * 1000)

medusaIntegrationTestRunner({
  inApp: true,
  env: {
    MEDUSA_FF_TRANSLATION: "true",
  },
  testSuite: ({ api, getContainer }) => {
    let publishableKey: string
    let productId: string

    beforeAll(async () => {
      const container = getContainer()
      const productModule = container.resolve(Modules.PRODUCT)
      const salesChannelModule = container.resolve(Modules.SALES_CHANNEL)
      const translationModule = container.resolve(Modules.TRANSLATION)
      const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)
      const query = container.resolve(ContainerRegistrationKeys.QUERY)

      // Create sales channel
      const [salesChannel] = await salesChannelModule.createSalesChannels([{
        name: "Test Webshop",
        description: "Test channel",
      }])

      // Create publishable API key via query
      const { data: existingKeys } = await query.graph({
        entity: "api_key",
        filters: { type: "publishable" },
        fields: ["id", "token"],
      })

      let apiKey = existingKeys[0]
      if (!apiKey) {
        const { data: [created] } = await query.graph({
          entity: "api_key",
          fields: ["id", "token"],
        })
        apiKey = created
      }

      // Create a publishable key via the workflow if needed
      if (!apiKey) {
        const { createApiKeysWorkflow, linkSalesChannelsToApiKeyWorkflow } = await import(
          "@medusajs/medusa/core-flows"
        )
        const { result: [key] } = await createApiKeysWorkflow(container).run({
          input: {
            api_keys: [{ title: "Test Key", type: "publishable", created_by: "" }],
          },
        })
        await linkSalesChannelsToApiKeyWorkflow(container).run({
          input: { id: key.id, add: [salesChannel.id] },
        })
        publishableKey = (key as any).token
      } else {
        publishableKey = (apiKey as any).token
      }

      // Create locales
      const existingLocales = await translationModule.listLocales()
      const codes = existingLocales.map((l: any) => l.code)
      if (!codes.includes("de-DE")) {
        await translationModule.createLocales([{ code: "de-DE", name: "Deutsch" }])
      }
      if (!codes.includes("en-US")) {
        await translationModule.createLocales([{ code: "en-US", name: "English" }])
      }

      // Create product
      const [product] = await productModule.createProducts([{
        title: "Test Machine EN",
        handle: "test-machine-translations",
        description: "English description",
        status: "published",
      }])
      productId = product.id

      // Link to sales channel
      await remoteLink.create({
        [Modules.PRODUCT]: { product_id: product.id },
        [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannel.id },
      })

      // Add German translation
      await translationModule.createTranslations({
        reference_id: product.id,
        reference: "product",
        locale_code: "de-DE",
        translations: {
          title: "Testmaschine DE",
          description: "Deutsche Beschreibung",
        },
      })
    })

    describe("Products – Translations", () => {
      it("returns English content by default", async () => {
        const response = await api.get(
          `/store/products/${productId}`,
          { headers: { "x-publishable-api-key": publishableKey } }
        )
        expect(response.status).toEqual(200)
        expect(response.data.product.title).toEqual("Test Machine EN")
        expect(response.data.product.description).toEqual("English description")
      })

      it("returns German content when locale=de-DE", async () => {
        const response = await api.get(
          `/store/products/${productId}?locale=de-DE`,
          { headers: { "x-publishable-api-key": publishableKey } }
        )
        expect(response.status).toEqual(200)
        expect(response.data.product.title).toEqual("Testmaschine DE")
        expect(response.data.product.description).toEqual("Deutsche Beschreibung")
      })

      it("falls back to English for unsupported locale", async () => {
        const response = await api.get(
          `/store/products/${productId}?locale=fr-FR`,
          { headers: { "x-publishable-api-key": publishableKey } }
        )
        expect(response.status).toEqual(200)
        expect(response.data.product.title).toEqual("Test Machine EN")
      })
    })
  },
})
