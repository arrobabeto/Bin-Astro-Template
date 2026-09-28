import type { APIRoute } from "astro"

import { indexableBuild } from "~/lib/seo"

/**
 * robots.txt generado en el build. En previews de Vercel (o NOINDEX=true)
 * bloquea todo para que Google no indexe copias del sitio.
 */
export const GET: APIRoute = ({ site }) => {
  const origin = (site ?? new URL("http://localhost:4321")).origin
  const body = indexableBuild
    ? [
        "User-agent: *",
        "Allow: /",
        "Disallow: /api/",
        "",
        `Sitemap: ${origin}/sitemap.xml`,
        "",
      ].join("\n")
    : ["User-agent: *", "Disallow: /", ""].join("\n")

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
