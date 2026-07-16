import { ExecArgs } from "@medusajs/framework/types"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"

// Temporary trigger for testing the product-auto-thumbnail subscriber.
export default async function trigger({ container }: ExecArgs) {
  await updateProductsWorkflow(container).run({
    input: {
      products: [
        {
          id: "prod_01KWF3Y79456PPTTWAZEPAPFDP",
          images: [
            {
              url: "https://krile-medusa-313003894447-eu-central-1-an.s3.eu-central-1.amazonaws.com/planeta_admin%2Feismaschine%20gelato%20expert1-01KWES6TS1EYHM4WQA48977R3K.png",
            },
          ],
        },
      ],
    },
  })
  console.log("test image added to product")
  // Give the in-process event worker time to handle product.updated before exit.
  await new Promise((r) => setTimeout(r, 15000))
}
