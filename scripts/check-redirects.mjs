#!/usr/bin/env node
/**
 * Cada entrada de src/config/redirects.ts debe publicarse como 301 real en
 * .vercel/output/config.json, apuntar a una página que existe y no encadenarse.
 */
import fs from "node:fs"

import { redirects } from "../src/config/redirects.ts"
import {
  listPages,
  reporter,
  requireBuild,
  VERCEL_CONFIG,
} from "./lib/output.mjs"

requireBuild()
const r = reporter()

const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
const routes = JSON.parse(fs.readFileSync(VERCEL_CONFIG, "utf8")).routes
const pages = new Set(listPages().map((page) => page.route))

for (const [from, to] of Object.entries(redirects)) {
  const destination = typeof to === "string" ? to : to.destination
  const route = routes.find(
    (item) => item.src === `^${from}$` || item.src === `^${escape(from)}$`,
  )
  if (!route) {
    r.fail(`${from}: no aparece en ${VERCEL_CONFIG}`)
    continue
  }
  if (route.status !== 301)
    r.fail(`${from}: status ${route.status}, se esperaba 301`)
  if (route.headers?.Location !== destination) {
    r.fail(
      `${from}: Location ${route.headers?.Location}, se esperaba ${destination}`,
    )
  }
  if (destination in redirects)
    r.fail(`${from} → ${destination} encadena otra redirección`)
  if (destination.startsWith("/") && !pages.has(destination)) {
    r.fail(`${from} → ${destination}: el destino no existe`)
  }
  if (pages.has(from))
    r.fail(`${from} redirige pero también existe como página`)
  r.ok(`${from} → ${destination} (301)`)
}

if (!routes.some((item) => item.status === 308 && item.src === "^/(.*)/$")) {
  r.fail('falta la redirección 308 de barra final (trailingSlash: "never")')
} else {
  r.ok("URLs con barra final → 308 a la versión sin barra")
}

r.done("redirecciones publicadas como 301")
