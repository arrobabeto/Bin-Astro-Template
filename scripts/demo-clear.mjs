#!/usr/bin/env node
/**
 * Borra la portada de demostración del template para empezar el diseño real.
 *  - Reemplaza cada src/content/pages/<idioma>/index.yaml marcado como demo
 *    por una portada provisional mínima (una sección, un h1).
 *  - Borra las imágenes src/assets/images/demo-*.
 *  - Vacía el menú y quita el botón del encabezado en src/content/site/<idioma>.yaml
 *    (apuntaban a secciones de la portada demo).
 *  - Regenera el inventario de Binflow.
 * Solo actúa sobre archivos con el marcador `bin-astro-template:demo`: nunca
 * toca una portada real.
 *
 * Uso:  pnpm demo:clear            (borra)
 *       pnpm demo:clear --dry-run  (solo lista lo que haría)
 * Guía: docs/guias/disenar-el-sitio.md
 */
import { spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { parseArgs } from "node:util"
import YAML from "yaml"

import { walk } from "./lib/output.mjs"

const DEMO_MARKER = "bin-astro-template:demo"
const PAGES_DIR = "src/content/pages"
const SITE_DIR = "src/content/site"
const IMAGES_DIR = "src/assets/images"

const { values: args } = parseArgs({
  options: { "dry-run": { type: "boolean", default: false } },
})
const dryRun = args["dry-run"]

const PLACEHOLDER_HOME = {
  es: `# bin-astro-template:home-pendiente
# Portada provisional que dejó \`pnpm demo:clear\`. Reemplázala con el diseño
# real (skill disenar-sitio). En un sitio creado con \`pnpm bootstrap\`,
# check:placeholders falla mientras este marcador siga aquí.
title: Página de inicio en construcción
description: >-
  Portada provisional mientras se diseña el sitio. Muy pronto encontrarás aquí
  toda la información.
sections:
  - type: prose
    id: inicio
    heading: Página en construcción
    body: Estamos preparando esta página. Vuelve pronto.
`,
  en: `# bin-astro-template:home-pendiente
# Temporary home page left by \`pnpm demo:clear\`. Replace it with the real
# design (skill disenar-sitio). In a site created with \`pnpm bootstrap\`,
# check:placeholders fails while this marker is here.
title: Home page under construction
description: >-
  Temporary home page while the website is being designed. All the
  information will be available here very soon.
sections:
  - type: prose
    id: inicio
    heading: Page under construction
    body: We are preparing this page. Please come back soon.
`,
}

const demoHomes = walk(PAGES_DIR)
  .map((file) => file.split(path.sep).join("/"))
  .filter((file) => /\/index\.ya?ml$/.test(file))
  .filter((file) => fs.readFileSync(file, "utf8").includes(DEMO_MARKER))

if (demoHomes.length === 0) {
  console.error(
    `FAIL  no hay portada demo (ningún ${PAGES_DIR}/<idioma>/index.yaml tiene el marcador ${DEMO_MARKER}).`,
  )
  console.error(
    "      La portada ya es contenido real: edítala con la skill editar-contenido.",
  )
  process.exit(1)
}

const locales = demoHomes.map((file) => file.split("/").at(-2))
const images = walk(IMAGES_DIR)
  .map((file) => file.split(path.sep).join("/"))
  .filter((file) => path.basename(file).startsWith("demo-"))
const siteFiles = locales
  .map((locale) => `${SITE_DIR}/${locale}.yaml`)
  .filter((file) => fs.existsSync(file))

const prefix = dryRun ? "plan " : "ok   "
function act(message, change) {
  if (!dryRun) change()
  console.log(`${prefix} ${message}`)
}

console.log(
  dryRun
    ? "\nBin Astro Template · demo:clear (simulación, no se cambia nada)\n"
    : "\nBin Astro Template · demo:clear\n",
)

for (const [index, file] of demoHomes.entries()) {
  const locale = locales[index]
  act(`${file} → portada provisional`, () =>
    fs.writeFileSync(file, PLACEHOLDER_HOME[locale] ?? PLACEHOLDER_HOME.es),
  )
}

for (const file of images) {
  act(`${file} borrada`, () => fs.rmSync(file))
}

for (const file of siteFiles) {
  act(`${file} → menú vacío y sin botón en el encabezado`, () => {
    const raw = fs
      .readFileSync(file, "utf8")
      .split("\n")
      .filter((line) => !(line.startsWith("#") && line.includes(DEMO_MARKER)))
      .join("\n")
    const doc = YAML.parseDocument(raw)
    doc.set("nav", doc.createNode([]))
    doc.delete("headerCta")
    fs.writeFileSync(file, doc.toString({ lineWidth: 0 }))
  })
}

if (dryRun) {
  console.log(`${prefix} binflow/surface-inventory.yaml → pnpm bsi:sync`)
  console.log("\nCorre `pnpm demo:clear` sin --dry-run para aplicarlo.")
  process.exit(0)
}

const sync = spawnSync(process.execPath, ["scripts/bsi-sync.mjs"], {
  stdio: "inherit",
})
if (sync.status !== 0) process.exit(sync.status ?? 1)

console.log(`
Listo: el contenido de ejemplo se borró. Siguiente paso (docs/guias/disenar-el-sitio.md):
  - Opción 1, Figma: define FIGMA_API_KEY y FIGMA_FILE_KEY en .env y pide la
    página por su node-id (skill construir-desde-figma).
  - Opción 2, Hallmark: pide a tu agente que diseñe el home con Hallmark
    (skill disenar-sitio).
`)
