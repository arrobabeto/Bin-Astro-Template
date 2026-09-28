#!/usr/bin/env node
/**
 * Reglas SEO que bloquean CI, sobre el HTML publicado (.vercel/output/static).
 * Criterio: Google Search Central. Detalle en docs/guias/seo.md
 * Las advertencias (warn) no bloquean; revísalas con la skill /seo-audit.
 */
import fs from "node:fs"
import path from "node:path"

import { checkSiteUrl } from "./lib/env.mjs"
import {
  listPages,
  OUT_DIR,
  reporter,
  requireBuild,
  VERCEL_CONFIG,
} from "./lib/output.mjs"
import {
  analyzePage,
  DESCRIPTION_RANGE,
  TITLE_RANGE,
} from "./lib/seo-analyze.mjs"

requireBuild()
const r = reporter()
const siteUrl = checkSiteUrl()
const pages = listPages().map(analyzePage)
const byRoute = new Map(pages.map((page) => [page.route, page]))
const content = pages.filter((page) => page.route !== "/404")
const indexable = content.filter((page) => !page.noindex)

const redirectSources = new Set(
  fs.existsSync(VERCEL_CONFIG)
    ? JSON.parse(fs.readFileSync(VERCEL_CONFIG, "utf8"))
        .routes.filter((route) => route.status === 301 || route.status === 308)
        .map((route) => route.src.replace(/^\^|\$$/g, ""))
    : [],
)

function inRange(value, [min, max]) {
  return value >= min && value <= max
}

function targetExists(pathname) {
  if (byRoute.has(pathname)) return true
  const file = path.join(OUT_DIR, pathname)
  return fs.existsSync(file) && fs.statSync(file).isFile()
}

// ── Por página ──────────────────────────────────────────────────────────────
for (const page of content) {
  const p = page.route
  if (!page.title) r.fail(`${p}: falta <title>`)
  if (!page.description) r.fail(`${p}: falta meta description`)
  if (!page.lang) r.fail(`${p}: falta <html lang>`)
  if (page.h1.length !== 1)
    r.fail(`${p}: debe tener exactamente un <h1> (tiene ${page.h1.length})`)
  if (page.jsonLdErrors.length > 0) r.fail(`${p}: JSON-LD inválido`)
  if (
    !page.og.image.startsWith("https://") &&
    !page.og.image.startsWith("http")
  ) {
    r.fail(`${p}: og:image debe ser una URL absoluta`)
  }

  if (!page.noindex) {
    if (!page.canonical.startsWith(siteUrl)) {
      r.fail(
        `${p}: canonical "${page.canonical}" no usa PUBLIC_SITE_URL (${siteUrl})`,
      )
    }
    if (!inRange(page.titleLength, TITLE_RANGE)) {
      r.warn(
        `${p}: title de ${page.titleLength} caracteres (ideal ${TITLE_RANGE.join("–")})`,
      )
    }
    if (!inRange(page.descriptionLength, DESCRIPTION_RANGE)) {
      r.warn(
        `${p}: description de ${page.descriptionLength} caracteres (ideal ${DESCRIPTION_RANGE.join("–")})`,
      )
    }
  }

  for (const image of page.images) {
    if (image.alt === null)
      r.fail(`${p}: <img src="${image.src}"> sin atributo alt`)
    if (!image.width || !image.height) {
      r.fail(`${p}: <img src="${image.src}"> sin width/height (provoca CLS)`)
    }
  }

  for (const link of page.internalLinks) {
    const [rawPath, hash] = link.href.split("#")
    const target = rawPath === "" ? p : rawPath.replace(/\/$/, "") || "/"
    if (target.startsWith("/api/")) continue
    if (!targetExists(target)) {
      if (redirectSources.has(target)) {
        r.warn(
          `${p}: enlace a ${target} pasa por una redirección; enlaza al destino final`,
        )
      } else {
        r.fail(`${p}: enlace roto → ${link.href}`)
      }
      continue
    }
    if (
      hash &&
      byRoute.has(target) &&
      !byRoute.get(target).ids.includes(hash)
    ) {
      r.fail(`${p}: el ancla #${hash} no existe en ${target}`)
    }
  }

  for (const alt of page.hreflang) {
    if (alt.hreflang === "x-default") continue
    const altRoute = new URL(alt.href).pathname
    const other = byRoute.get(altRoute)
    if (!other)
      r.fail(
        `${p}: hreflang ${alt.hreflang} apunta a ${altRoute}, que no existe`,
      )
    else if (
      !other.hreflang.some((back) => new URL(back.href).pathname === p)
    ) {
      r.fail(`${p}: hreflang no recíproco con ${altRoute}`)
    }
  }
}

// ── Duplicados ──────────────────────────────────────────────────────────────
for (const field of ["title", "description"]) {
  const seen = new Map()
  for (const page of indexable) {
    const value = page[field]
    if (seen.has(value))
      r.fail(`${field} duplicado en ${seen.get(value)} y ${page.route}`)
    else seen.set(value, page.route)
  }
}

// ── sitemap.xml ─────────────────────────────────────────────────────────────
const sitemapFile = path.join(OUT_DIR, "sitemap.xml")
if (!fs.existsSync(sitemapFile)) {
  r.fail("falta /sitemap.xml")
} else {
  const locs = [
    ...fs.readFileSync(sitemapFile, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g),
  ].map((match) => match[1])
  const inSitemap = new Set()
  for (const loc of locs) {
    if (!loc.startsWith(siteUrl))
      r.fail(`sitemap: ${loc} no usa PUBLIC_SITE_URL`)
    const route = new URL(loc).pathname
    inSitemap.add(route)
    const page = byRoute.get(route)
    if (!page) r.fail(`sitemap: ${route} no existe`)
    else if (page.noindex)
      r.fail(`sitemap: ${route} es noindex y no debe estar`)
    else if (page.canonical !== loc)
      r.fail(`sitemap: ${route} no es la URL canónica`)
  }
  for (const page of indexable) {
    if (!inSitemap.has(page.route))
      r.fail(`sitemap: falta la página indexable ${page.route}`)
  }
  r.ok(`sitemap con ${locs.length} URL canónicas`)
}

// ── robots.txt y llms.txt ───────────────────────────────────────────────────
const robotsFile = path.join(OUT_DIR, "robots.txt")
if (!fs.existsSync(robotsFile)) r.fail("falta /robots.txt")
else if (
  !fs
    .readFileSync(robotsFile, "utf8")
    .includes(`Sitemap: ${siteUrl}/sitemap.xml`)
) {
  r.fail("robots.txt no declara el sitemap con PUBLIC_SITE_URL")
} else r.ok("robots.txt declara el sitemap")

for (const file of [
  "llms.txt",
  "llms-full.txt",
  "site.webmanifest",
  ".well-known/security.txt",
]) {
  if (fs.existsSync(path.join(OUT_DIR, file))) r.ok(`/${file} publicado`)
  else r.fail(`falta /${file}`)
}

r.ok(`${content.length} páginas revisadas (${indexable.length} indexables)`)
r.done("reglas SEO en verde")
