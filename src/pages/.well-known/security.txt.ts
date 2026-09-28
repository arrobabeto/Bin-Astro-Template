import type { APIRoute } from "astro"

import { site } from "~/config/site"

/** RFC 9116. Se regenera en cada build con una vigencia de un año. */
export const GET: APIRoute = ({ site: origin }) => {
  const base = (origin ?? new URL("http://localhost:4321")).origin
  const expires = new Date()
  expires.setFullYear(expires.getFullYear() + 1)

  const body = [
    `Contact: ${site.securityContact}`,
    `Expires: ${expires.toISOString()}`,
    "Preferred-Languages: es, en",
    `Canonical: ${base}/.well-known/security.txt`,
    "",
  ].join("\n")

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
