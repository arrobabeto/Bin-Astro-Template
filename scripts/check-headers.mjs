#!/usr/bin/env node
/**
 * Cabeceras de seguridad. Las páginas estáticas no pasan por el middleware
 * de Astro, así que viven en vercel.json.
 *
 * Uso:
 *   pnpm check:headers                         # valida vercel.json
 *   pnpm check:headers --live https://dominio  # valida el sitio en línea
 */
import fs from "node:fs"

import { reporter } from "./lib/output.mjs"

const REQUIRED = {
  "strict-transport-security": /max-age=\d{7,}/,
  "x-content-type-options": /^nosniff$/,
  "x-frame-options": /^(DENY|SAMEORIGIN)$/,
  "referrer-policy": /strict-origin-when-cross-origin|no-referrer/,
  "permissions-policy": /camera=\(\)/,
  "content-security-policy": /default-src 'self'/,
}

const r = reporter()
const liveIndex = process.argv.indexOf("--live")

function validate(headers, where) {
  for (const [name, pattern] of Object.entries(REQUIRED)) {
    const value = headers.get(name)
    if (!value) r.fail(`${where}: falta ${name}`)
    else if (!pattern.test(value))
      r.fail(`${where}: ${name} inesperado ("${value}")`)
    else r.ok(`${where}: ${name}`)
  }
  const csp = headers.get("content-security-policy") ?? ""
  for (const directive of [
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
  ]) {
    if (csp && !csp.includes(directive))
      r.fail(`${where}: la CSP no incluye ${directive}`)
  }
}

if (liveIndex !== -1) {
  const base = process.argv[liveIndex + 1]
  if (!base) {
    r.fail("uso: --live https://tu-dominio")
    r.done()
  }
  const response = await fetch(new URL("/", base))
  validate(response.headers, base)
  const api = await fetch(new URL("/api/forms/contact", base), {
    method: "GET",
  })
  if (!/noindex/.test(api.headers.get("x-robots-tag") ?? "")) {
    r.warn(`${base}/api/*: sin X-Robots-Tag noindex`)
  }
  r.done("cabeceras de seguridad en producción")
}

const config = JSON.parse(fs.readFileSync("vercel.json", "utf8"))
const global = (config.headers ?? []).find((rule) => rule.source === "/(.*)")
if (!global) {
  r.fail('vercel.json: falta la regla de cabeceras para "/(.*)"')
  r.done()
}
validate(
  new Headers(global.headers.map(({ key, value }) => [key, value])),
  "vercel.json",
)
if (config.trailingSlash !== undefined) {
  r.fail("vercel.json: no declares trailingSlash; lo controla astro.config.ts")
}
r.done("cabeceras de seguridad declaradas")
