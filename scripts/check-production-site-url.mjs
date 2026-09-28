#!/usr/bin/env node
/**
 * Contrato de src/config/site-url.ts (sin red): cómo se resuelve el origen
 * canónico y qué rechaza el guard de producción de astro.config.ts.
 */
import {
  isIndexableBuild,
  LOCAL_SITE_URL,
  productionSiteUrlError,
  resolveSiteUrl,
} from "../src/config/site-url.ts"
import { reporter } from "./lib/output.mjs"

const r = reporter()

function expect(label, actual, expected) {
  if (actual === expected) r.ok(label)
  else
    r.fail(
      `${label}: se obtuvo ${JSON.stringify(actual)}, se esperaba ${JSON.stringify(expected)}`,
    )
}

expect(
  "PUBLIC_SITE_URL gana y pierde la barra final",
  resolveSiteUrl({
    PUBLIC_SITE_URL: "https://www.ejemplo.mx/",
    VERCEL_PROJECT_PRODUCTION_URL: "x.vercel.app",
  }),
  "https://www.ejemplo.mx",
)
expect(
  "sin PUBLIC_SITE_URL usa el dominio de producción de Vercel",
  resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "www.ejemplo.mx" }),
  "https://www.ejemplo.mx",
)
expect("sin nada, localhost", resolveSiteUrl({}), LOCAL_SITE_URL)

for (const [label, url] of [
  ["localhost", "http://localhost:4321"],
  ["loopback", "https://127.0.0.1"],
  ["http", "http://www.ejemplo.mx"],
  ["dominio .invalid", "https://www.sitio-de-prueba.invalid"],
  ["con ruta", "https://www.ejemplo.mx/es"],
  ["no es URL", "ejemplo"],
]) {
  expect(
    `producción rechaza ${label}`,
    typeof productionSiteUrlError(url, "production"),
    "string",
  )
}
expect(
  "producción acepta https público",
  productionSiteUrlError("https://www.ejemplo.mx", "production"),
  null,
)
expect(
  "preview no aplica el guard",
  productionSiteUrlError("http://localhost:4321", "preview"),
  null,
)
expect(
  "build local no aplica el guard",
  productionSiteUrlError(LOCAL_SITE_URL, undefined),
  null,
)

expect("build local es indexable", isIndexableBuild({}), true)
expect(
  "producción es indexable",
  isIndexableBuild({ VERCEL_ENV: "production" }),
  true,
)
expect("preview es noindex", isIndexableBuild({ VERCEL_ENV: "preview" }), false)
expect(
  "NOINDEX=true es noindex",
  isIndexableBuild({ NOINDEX: "true", VERCEL_ENV: "production" }),
  false,
)

r.done("contrato de PUBLIC_SITE_URL")
