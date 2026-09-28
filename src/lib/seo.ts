import { site } from "~/config/site"
import { isIndexableBuild } from "~/config/site-url"

/** false en previews de Vercel o con NOINDEX=true: todo el sitio va noindex. */
export const indexableBuild = isIndexableBuild(process.env)

/** "Servicios" → "Servicios | Mi Sitio". No duplica el nombre si ya está. */
export function buildTitle(title: string): string {
  if (title.includes(site.name)) return title
  return `${title}${site.titleSeparator}${site.name}`
}

export function absoluteUrl(pathOrUrl: string, base: URL | string): string {
  return new URL(pathOrUrl, base).toString()
}

/** Serializa JSON-LD para <script> sin permitir romper la etiqueta. */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029")
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}
