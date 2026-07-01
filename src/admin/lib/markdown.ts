import { marked } from "marked"

// Convert Markdown (the notation used in our .md product copy) into HTML that
// the TipTap editors understand. GitHub-flavoured markdown, single line breaks
// preserved. `marked.parse` is synchronous when no async extensions are used.
export function markdownToHtml(markdown: string): string {
  return marked.parse(markdown, { async: false, gfm: true, breaks: true }) as string
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
