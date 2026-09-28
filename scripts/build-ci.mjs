#!/usr/bin/env node
/**
 * Build para CI y `pnpm verify`: usa PUBLIC_SITE_URL (o un dominio de prueba
 * .invalid si no hay) y falla si Astro imprime advertencias inesperadas.
 * La lista de advertencias permitidas es corta a propósito.
 */
import { spawnSync } from "node:child_process"

import { checkSiteUrl } from "./lib/env.mjs"

const ALLOWED = [
  // Redirecciones: Vercel las resuelve en config.json, no hace falta HTML.
  /file not created, response body was empty/,
]

const result = spawnSync("pnpm", ["exec", "astro", "build"], {
  env: { ...process.env, PUBLIC_SITE_URL: checkSiteUrl() },
  encoding: "utf8",
})

const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`
process.stdout.write(result.stdout ?? "")
process.stderr.write(result.stderr ?? "")

if (result.status !== 0) process.exit(result.status ?? 1)

const unexpected = output
  .split("\n")
  .filter((line) => /\[WARN\]|\bwarn(ing)?\b/i.test(line))
  .filter((line) => !ALLOWED.some((pattern) => pattern.test(line)))

if (unexpected.length > 0) {
  console.error("\nFAIL  advertencias inesperadas en el build:")
  for (const line of unexpected) console.error(`  ${line}`)
  process.exit(1)
}

console.log(`\nok    build completo sin advertencias (${checkSiteUrl()})`)
