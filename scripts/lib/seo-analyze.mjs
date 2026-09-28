/**
 * Análisis SEO de una página HTML ya construida. Lo usan `check:seo`
 * (reglas que bloquean CI) y `seo:extract` (datos para la skill /seo-audit).
 */
import { JSDOM } from "jsdom"

export const TITLE_RANGE = [30, 60]
export const DESCRIPTION_RANGE = [70, 160]

function jsonLdTypes(value, types = []) {
  if (Array.isArray(value)) value.forEach((item) => jsonLdTypes(item, types))
  else if (value && typeof value === "object") {
    if (value["@type"]) types.push(value["@type"])
    for (const child of Object.values(value)) jsonLdTypes(child, types)
  }
  return types
}

export function analyzePage({ route, html }) {
  const { document } = new JSDOM(html).window
  const meta = (selector) =>
    document.querySelector(selector)?.getAttribute("content")?.trim() ?? ""

  const title = document.querySelector("title")?.textContent?.trim() ?? ""
  const description = meta('meta[name="description"]')
  const robots = meta('meta[name="robots"]')

  const jsonLd = []
  const jsonLdErrors = []
  for (const script of document.querySelectorAll(
    'script[type="application/ld+json"]',
  )) {
    try {
      jsonLd.push(JSON.parse(script.textContent ?? ""))
    } catch (error) {
      jsonLdErrors.push(String(error))
    }
  }

  const headings = [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")].map(
    (el) => ({
      level: Number(el.tagName.slice(1)),
      text: el.textContent?.replace(/\s+/g, " ").trim() ?? "",
    }),
  )

  const images = [...document.querySelectorAll("img")].map((img) => ({
    src: img.getAttribute("src") ?? "",
    alt: img.getAttribute("alt"),
    width: img.getAttribute("width"),
    height: img.getAttribute("height"),
    loading: img.getAttribute("loading"),
    fetchpriority: img.getAttribute("fetchpriority"),
  }))

  const links = [...document.querySelectorAll("a[href]")].map((a) => ({
    href: a.getAttribute("href") ?? "",
    text: a.textContent?.replace(/\s+/g, " ").trim() ?? "",
    rel: a.getAttribute("rel") ?? "",
  }))

  const main = document.querySelector("main")
  const text = (main?.textContent ?? "").replace(/\s+/g, " ").trim()

  return {
    route,
    lang: document.documentElement.getAttribute("lang") ?? "",
    title,
    titleLength: title.length,
    description,
    descriptionLength: description.length,
    robots,
    noindex: /noindex/i.test(robots),
    canonical:
      document.querySelector('link[rel="canonical"]')?.getAttribute("href") ??
      "",
    hreflang: [
      ...document.querySelectorAll('link[rel="alternate"][hreflang]'),
    ].map((el) => ({
      hreflang: el.getAttribute("hreflang") ?? "",
      href: el.getAttribute("href") ?? "",
    })),
    og: {
      title: meta('meta[property="og:title"]'),
      description: meta('meta[property="og:description"]'),
      image: meta('meta[property="og:image"]'),
      url: meta('meta[property="og:url"]'),
    },
    h1: headings.filter((h) => h.level === 1).map((h) => h.text),
    headings,
    wordCount: text ? text.split(" ").length : 0,
    firstParagraph:
      main?.querySelector("p")?.textContent?.replace(/\s+/g, " ").trim() ?? "",
    images,
    internalLinks: links.filter((l) => /^(\/|#)/.test(l.href)),
    externalLinks: links.filter((l) => /^https?:\/\//.test(l.href)),
    jsonLdTypes: jsonLdTypes(jsonLd),
    jsonLdErrors,
    ids: [...document.querySelectorAll("[id]")].map((el) => el.id),
  }
}
