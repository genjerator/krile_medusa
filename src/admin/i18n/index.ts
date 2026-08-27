import en from "./json/en.json" with { type: "json" }
import de from "./json/de.json" with { type: "json" }

// Merged into the admin's react-i18next resources; keys live under the "seo"
// namespace and render in whichever language the admin is set to (falls back to
// English for unsupported languages).
export default {
  en: { translation: en },
  de: { translation: de },
}
