import { ExecArgs } from "@medusajs/framework/types"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"

// Revert the auto-thumbnail test: remove the test image and thumbnail again.
export default async function revert({ container }: ExecArgs) {
  await updateProductsWorkflow(container).run({
    input: {
      products: [
        {
          id: "prod_01KWF3Y79456PPTTWAZEPAPFDP",
          images: [],
          thumbnail: null,
        },
      ],
    },
  })
  console.log("test image and thumbnail removed")
  await new Promise((r) => setTimeout(r, 5000))
}
