import { marked } from "marked"
import TurndownService from "turndown"

// Convert Markdown (the notation used in our .md product copy) into HTML that
// the TipTap editors understand. GitHub-flavoured markdown, single line breaks
// preserved. `marked.parse` is synchronous when no async extensions are used.
export function markdownToHtml(markdown: string): string {
  return marked.parse(markdown, { async: false, gfm: true, breaks: true }) as string
}

// Does this string contain HTML tags?
const HTML_TAG_RE = /<[a-zA-Z/][^>]*>/

// Convert the TipTap editor's HTML back into Markdown for storage. The
// storefront renders the product description as plain text, so storing Markdown
// (instead of HTML) means no literal tags are shown.
let _turndown: TurndownService | null = null
export function htmlToMarkdown(html: string): string {
  if (!_turndown) {
    _turndown = new TurndownService({
      headingStyle: "atx",
      bulletListMarker: "-",
      emDelimiter: "*",
      codeBlockStyle: "fenced",
    })
  }
  return _turndown.turndown(html || "").trim()
}

// Prepare a stored value for the HTML editor: pure HTML is used as-is; anything
// containing Markdown notation is rendered to HTML first (marked passes embedded
// HTML tags through, so mixed Markdown + HTML content also displays correctly
// instead of showing literal ** or tags).
export function toEditorHtml(value: string): string {
  if (!value) return ""
  if (HTML_TAG_RE.test(value) && !looksLikeMarkdown(value)) return value
  return markdownToHtml(value)
}

// Heuristic: does this text look like it contains Markdown notation worth
// converting? Used to enable/disable the import button.
export function looksLikeMarkdown(text: string): boolean {
  // Headings, bold/italic, bullet/numbered lists, code, links, blockquotes,
  // or a GFM pipe table (a row containing pipes, or a |---|---| divider).
  return /(^|\n)\s*#{1,6}\s|\*\*|__|(^|\n)\s*[-*+]\s|(^|\n)\s*\d+\.\s|`|\[[^\]]+\]\([^)]+\)|(^|\n)\s*>|(^|\n)[^\n]*\|[^\n]*\||(^|\n)\s*\|?\s*:?-{2,}:?\s*\|/.test(
    text
  )
}
