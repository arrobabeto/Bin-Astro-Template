import type { APIRoute } from "astro"

import { DEFAULT_LOCALE } from "~/config/locales"
import { site } from "~/config/site"
import { getRoutes, getSiteChrome } from "~/lib/routes"
import { absoluteUrl } from "~/lib/seo"

/**
 * llms.txt (https://llmstxt.org): índice del sitio para asistentes de IA.
 * La versión con el texto completo está en /llms-full.txt.
 */
export const GET: APIRoute = async ({ site: origin }) => {
  const base = origin ?? new URL("http://localhost:4321")
  const chrome = await getSiteChrome(DEFAULT_LOCALE)
  const routes = (await getRoutes()).filter((route) => !route.noindex)

  const pages = routes
    .filter((route) => route.kind === "page")
    .map(
      (route) =>
        `- [${route.title}](${absoluteUrl(route.path, base)}): ${route.description}`,
    )
  const legal = routes
    .filter((route) => route.kind === "legal")
    .map((route) => `- [${route.title}](${absoluteUrl(route.path, base)})`)

  const body = [
    `# ${site.name}`,
    "",
    `> ${chrome.description}`,
    "",
    `Contacto: ${chrome.contact.email}`,
    "",
    "## Páginas",
    "",
    ...pages,
    "",
    ...(legal.length > 0 ? ["## Legal", "", ...legal, ""] : []),
    "## Opcional",
    "",
    `- [Contenido completo](${absoluteUrl("/llms-full.txt", base)})`,
    "",
  ].join("\n")

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
