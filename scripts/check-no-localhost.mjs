#!/usr/bin/env node
/**
 * Ninguna URL de localhost debe llegar al sitio publicado (canonical, OG,
 * sitemap, JSON-LD...). Es el síntoma de un build sin PUBLIC_SITE_URL.
 *
 * Uso:
 *   pnpm check:no-localhost                         # revisa el build local
 *   pnpm check:no-localhost --live https://dominio  # revisa el sitio en línea
 */
import fs from "node:fs"
import path from "node:path"

import { OUT_DIR, reporter, requireBuild, walk } from "./lib/output.mjs"

const r = reporter()
const PATTERN = /(https?:)?\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?/g
const liveIndex = process.argv.indexOf("--live")

if (liveIndex !== -1) {
  const base = process.argv[liveIndex + 1]
  if (!base) {
    r.fail("uso: --live https://tu-dominio")
    r.done()
  }
  const paths = ["/", "/robots.txt", "/sitemap.xml", "/llms.txt"]
  for (const pathname of paths) {
    const url = new URL(pathname, base)
    const response = await fetch(url, { redirect: "follow" })
    const body = await response.text()
    const hits = body.match(PATTERN)
    if (!response.ok) r.fail(`${url}: HTTP ${response.status}`)
    else if (hits) r.fail(`${url}: contiene ${[...new Set(hits)].join(", ")}`)
    else r.ok(`${url}`)
  }
  r.done("sin localhost en producción")
}

requireBuild()
let files = 0
for (const file of walk(OUT_DIR)) {
  if (!/\.(html|xml|txt|json|webmanifest|xsl)$/.test(file)) continue
  files++
  const hits = fs.readFileSync(file, "utf8").match(PATTERN)
  if (hits) {
    r.fail(
      `${path.relative(OUT_DIR, file)}: contiene ${[...new Set(hits)].join(", ")}`,
    )
  }
}
r.ok(`${files} archivos de texto revisados`)
r.done("sin URLs de localhost en el build")
