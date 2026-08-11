import { MedusaService } from "@medusajs/framework/utils"
import Article from "./models/article"
import ArticleAuthor from "./models/article-author"

class ArticleModuleService extends MedusaService({
  Article,
  ArticleAuthor,
}) {}

export default ArticleModuleService
