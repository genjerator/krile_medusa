import {
  defineMiddlewares,
  validateAndTransformBody,
} from "@medusajs/framework/http"
import { PostNewsletterSchema } from "./route"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/newsletter",
      method: "POST",
      middlewares: [validateAndTransformBody(PostNewsletterSchema)],
    },
  ],
})
