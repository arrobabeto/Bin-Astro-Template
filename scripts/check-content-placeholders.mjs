#!/usr/bin/env node
/**
 * Textos de relleno.
 *  - Siempre: nada de "lorem ipsum" ni TODO/FIXME en el contenido publicable.
 *  - En sitios creados con `pnpm bootstrap` (existe template.lock.json):
 *    también falla si quedan datos de ejemplo del template (dominio, correo,
 *    teléfono, nombre del template, aviso legal sin revisar, portada demo o
 *    provisional) y advierte si un
 *    archivo demo sigue sin cambios. Así ningún sitio sale con datos demo.
 */
import fs from "node:fs"
import path from "node:path"

import { reporter, sha256, walk } from "./lib/output.mjs"

const r = reporter()
const isSite = fs.existsSync("template.lock.json")

const ALWAYS = [
  { label: "lorem ipsum", regex: /lorem ipsum/i },
  { label: "TODO/FIXME", regex: /\b(TODO|FIXME|XXX)\b/ },
]

const TEMPLATE_MARKERS = [
  { label: "dominio de ejemplo", regex: /tu-dominio\.mx/ },
  { label: "teléfono de ejemplo", regex: /\+52 55 0000 0000/ },
  { label: "nombre del template", regex: /Bin Astro Template/ },
  { label: "texto marcado como ejemplo", regex: /\[EJEMPLO\]/ },
  {
    label: "aviso legal de plantilla sin revisar",
    regex: /Plantilla de referencia/,
  },
  {
    label: "portada demo del template (corre `pnpm demo:clear`)",
    regex: /bin-astro-template:demo/,
  },
  {
    label: "portada provisional sin diseñar (skill disenar-sitio)",
    regex: /bin-astro-template:home-pendiente/,
  },
]

const TARGETS = ["src/content", "src/config/site.ts", "src/i18n", "public"]
const TEXT = /\.(md|mdx|ya?ml|json|ts|txt|svg|webmanifest|xsl)$/

const files = TARGETS.flatMap((target) =>
  fs.existsSync(target) && fs.statSync(target).isFile()
    ? [target]
    : walk(target),
).filter((file) => TEXT.test(file))

const rules = isSite ? [...ALWAYS, ...TEMPLATE_MARKERS] : ALWAYS
for (const file of files) {
  const lines = fs.readFileSync(file, "utf8").split("\n")
  lines.forEach((line, index) => {
    for (const { label, regex } of rules) {
      if (regex.test(line)) {
        r.fail(`${path.normalize(file)}:${index + 1}: ${label}`)
      }
    }
  })
}

if (isSite) {
  const lock = JSON.parse(fs.readFileSync("template.lock.json", "utf8"))
  for (const [file, hash] of Object.entries(lock.demoFiles ?? {})) {
    if (fs.existsSync(file) && sha256(file) === hash) {
      r.warn(`${file} sigue igual que el contenido demo del template`)
    }
  }
}

r.ok(`${files.length} archivos revisados`)
if (!isSite) {
  r.ok(
    "modo template: los datos de ejemplo se permiten (se bloquean tras `pnpm bootstrap`)",
  )
}
r.done(isSite ? "sin datos de ejemplo del template" : "sin textos de relleno")
