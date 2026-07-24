import { Module } from "@medusajs/framework/utils"
import ContentBlockModuleService from "./service"

export const CONTENT_BLOCK_MODULE = "contentBlock"

export default Module(CONTENT_BLOCK_MODULE, {
  service: ContentBlockModuleService,
})
