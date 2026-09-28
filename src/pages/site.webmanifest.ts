import type { APIRoute } from "astro"

import { DEFAULT_LOCALE, LOCALE_META } from "~/config/locales"
import { site } from "~/config/site"
import { getSiteChrome } from "~/lib/routes"

export const GET: APIRoute = async () => {
  const chrome = await getSiteChrome(DEFAULT_LOCALE)
  const manifest = {
    name: site.name,
    short_name: site.name,
    description: chrome.description,
    lang: LOCALE_META[DEFAULT_LOCALE].htmlLang,
    start_url: "/",
    display: "standalone",
    theme_color: site.themeColor,
    background_color: site.backgroundColor,
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { "Content-Type": "application/manifest+json; charset=utf-8" },
  })
}
