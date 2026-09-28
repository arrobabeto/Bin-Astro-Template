#!/usr/bin/env node
/**
 * Extrae los datos SEO de cada página publicada a .seo/extract.json.
 * Es la materia prima de la skill /seo-audit (skills/seo-audit/SKILL.md).
 *
 * Uso: pnpm build:ci && pnpm seo:extract [--stdout]
 */
import fs from "node:fs"

import { checkSiteUrl } from "./lib/env.mjs"
import { listPages, requireBuild } from "./lib/output.mjs"
import { analyzePage } from "./lib/seo-analyze.mjs"

requireBuild()

const pages = listPages()
  .map(analyzePage)
  .filter((page) => page.route !== "/404")
  .map(({ ids: _ids, ...page }) => page)

const report = {
  generatedAt: new Date().toISOString(),
  siteUrl: checkSiteUrl(),
  pages,
}

if (process.argv.includes("--stdout")) {
  console.log(JSON.stringify(report, null, 2))
} else {
  fs.mkdirSync(".seo", { recursive: true })
  fs.writeFileSync(".seo/extract.json", JSON.stringify(report, null, 2))
  console.log(`ok    .seo/extract.json (${pages.length} páginas)`)
}
