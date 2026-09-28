#!/usr/bin/env node
/**
 * Contrato BSI:
 *  1. El inventario existe, es v1 y cada fila tiene los campos obligatorios.
 *  2. bf_id únicos y sin locators con índice sections[n].
 *  3. El inventario coincide con el contenido (si no: `pnpm bsi:sync`).
 *  4. Con build: cada data-bf-id del HTML está en el inventario y viceversa.
 *  5. src/lib/bf.ts solo genera atributos (no descubre el inventario).
 */
import fs from "node:fs"
import { JSDOM } from "jsdom"

import {
  CONDITIONAL_SECTIONS,
  generateSurfaces,
  INVENTORY_PATH,
  KINDS,
  readEnabledLocales,
  readInventory,
  STRUCTURAL_FIELDS,
} from "./lib/bsi.mjs"
import { listPages, OUT_DIR, reporter } from "./lib/output.mjs"

const r = reporter()
const inventory = readInventory()

if (!inventory) {
  r.fail(`falta ${INVENTORY_PATH} (genera uno con \`pnpm bsi:sync\`)`)
  r.done()
}

if (inventory.version === 1) r.ok("version: 1")
else r.fail("el inventario debe declarar version: 1")
if (inventory.project_key) r.ok(`project_key: ${inventory.project_key}`)
else r.fail("falta project_key")

const surfaces = Array.isArray(inventory.surfaces) ? inventory.surfaces : []
if (surfaces.length === 0) r.fail("el inventario no tiene superficies")

const [defaultLocale] = readEnabledLocales()
const seen = new Set()
for (const row of surfaces) {
  const where = row.bf_id ?? "(fila sin bf_id)"
  for (const key of [
    "bf_id",
    "kind",
    "area",
    "section",
    "path",
    "locator",
    "publication_target",
  ]) {
    if (!row[key]) r.fail(`${where}: falta \`${key}\``)
  }
  if (!Array.isArray(row.locales) || row.locales.length === 0) {
    r.fail(`${where}: \`locales\` debe ser una lista`)
  }
  if (row.kind && !KINDS.has(row.kind))
    r.fail(`${where}: kind inválido ${row.kind}`)
  if (seen.has(row.bf_id)) r.fail(`bf_id repetido: ${row.bf_id}`)
  seen.add(row.bf_id)
  if (/sections\[\d+\]/.test(row.locator ?? "")) {
    r.fail(`${where}: el locator usa un índice sections[n]`)
  }
  if (row.locator && !row.locator.startsWith("github:")) {
    r.fail(`${where}: en astro_repo los locators empiezan con github:`)
  }
  const file = String(row.path ?? "").replace("{locale}", defaultLocale)
  if (file && !fs.existsSync(file)) r.fail(`${where}: no existe ${file}`)
  if (row.kind === "chrome_denied" && !row.deny_reason) {
    r.fail(`${where}: chrome_denied necesita deny_reason`)
  }
}
r.ok(`${surfaces.length} filas con estructura válida`)

// Binflow busca textos por coincidencia parcial: los samples repetidos son ambiguos.
const samples = new Map()
for (const row of surfaces) {
  if (!row.sample) continue
  const key = `${row.sample}|${(row.locales ?? []).join(",")}`
  if (samples.has(key)) {
    r.warn(
      `${row.bf_id} y ${samples.get(key)} tienen el mismo sample "${row.sample}" (usa textos distintos)`,
    )
  } else samples.set(key, row.bf_id)
}

// 3. Deriva contra el contenido
const expected = new Map(generateSurfaces().map((row) => [row.bf_id, row]))
const actual = new Map(surfaces.map((row) => [row.bf_id, row]))
let drift = 0
for (const [id, row] of expected) {
  const current = actual.get(id)
  if (!current) {
    r.fail(`falta en el inventario: ${id}`)
    drift++
    continue
  }
  for (const field of STRUCTURAL_FIELDS) {
    if (current[field] !== row[field]) {
      r.fail(
        `${id}: \`${field}\` es "${current[field]}", se esperaba "${row[field]}"`,
      )
      drift++
    }
  }
  if (row.sample && current.sample !== row.sample) {
    r.warn(
      `${id}: el sample cambió (corre \`pnpm bsi:sync\` para actualizarlo)`,
    )
  }
}
for (const id of actual.keys()) {
  if (!expected.has(id)) {
    r.fail(`sobra en el inventario (ya no existe en el contenido): ${id}`)
    drift++
  }
}
if (drift === 0) r.ok("inventario sincronizado con src/content/")
else console.error("      → corre `pnpm bsi:sync` y revisa el diff")

// 4. Cruce con el HTML publicado
if (fs.existsSync(`${OUT_DIR}/index.html`)) {
  const markers = new Map()
  for (const page of listPages()) {
    const { document } = new JSDOM(page.html).window
    for (const el of document.querySelectorAll("[data-bf-id]")) {
      markers.set(el.getAttribute("data-bf-id"), {
        kind: el.getAttribute("data-bf-kind"),
        section: el.getAttribute("data-bf-section"),
        route: page.route,
      })
    }
  }
  for (const [id, marker] of markers) {
    const row = actual.get(id)
    if (!row)
      r.fail(`${marker.route}: data-bf-id="${id}" no está en el inventario`)
    else if (row.kind !== marker.kind) {
      r.fail(
        `${id}: data-bf-kind="${marker.kind}" pero el inventario dice ${row.kind}`,
      )
    }
  }
  const conditionalNote = Object.values(CONDITIONAL_SECTIONS)
  for (const row of surfaces) {
    const isConditional = conditionalNote.some((note) =>
      String(row.notes ?? "").includes(note),
    )
    if (!markers.has(row.bf_id) && !isConditional) {
      r.fail(`${row.bf_id} está en el inventario pero no aparece en el HTML`)
    }
  }
  r.ok(`${markers.size} marcadores data-bf-* cruzados con el HTML`)
} else {
  r.warn("sin build: se omitió el cruce con el HTML (corre `pnpm build:ci`)")
}

// 5. bf() solo genera atributos
const helper = fs
  .readFileSync("src/lib/bf.ts", "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\/\/.*$/gm, "")
if (/fetch\(|import\.meta\.glob|surface-inventory|readFile/.test(helper)) {
  r.fail("src/lib/bf.ts no debe cargar ni descubrir el inventario")
} else {
  r.ok("bf() solo genera atributos")
}

r.done("contrato BSI válido")
