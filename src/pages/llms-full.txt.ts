import type { APIRoute } from "astro"

import { DEFAULT_LOCALE } from "~/config/locales"
import { site } from "~/config/site"
import { sectionToText } from "~/lib/llms"
import { getRoutes, getSiteChrome } from "~/lib/routes"
import { absoluteUrl } from "~/lib/seo"

/** Texto completo de las páginas indexables, en Markdown plano. */
export const GET: APIRoute = async ({ site: origin }) => {
  const base = origin ?? new URL("http://localhost:4321")
  const chrome = await getSiteChrome(DEFAULT_LOCALE)
  const routes = (await getRoutes()).filter((route) => !route.noindex)

  const blocks = routes.map((route) => {
    const content =
      route.kind === "page"
        ? route.entry.data.sections.map(sectionToText).join("\n\n")
        : (route.entry.body ?? "").trim()
    return [
      `## ${route.title}`,
      "",
      `URL: ${absoluteUrl(route.path, base)}`,
      "",
      content,
    ].join("\n")
  })

  const body = [
    `# ${site.name}`,
    "",
    `> ${chrome.description}`,
    "",
    ...blocks.flatMap((block) => [block, ""]),
  ].join("\n")

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
