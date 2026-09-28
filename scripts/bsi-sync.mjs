#!/usr/bin/env node
/**
 * Regenera binflow/surface-inventory.yaml desde el contenido.
 * Conserva `notes` y `deny_reason` escritos a mano en filas existentes.
 *
 * Uso: pnpm bsi:sync   (córrelo al agregar/quitar secciones o páginas)
 */
import fs from "node:fs"
import YAML from "yaml"

import { generateSurfaces, INVENTORY_PATH, readInventory } from "./lib/bsi.mjs"

const current = readInventory()
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"))
const projectKey = current?.project_key ?? pkg.name

const previous = new Map(
  (current?.surfaces ?? []).map((row) => [row.bf_id, row]),
)

const surfaces = generateSurfaces().map((row) => {
  const { conditional: _conditional, ...clean } = row
  const old = previous.get(row.bf_id)
  if (old?.notes && old.notes !== row.notes) clean.notes = old.notes
  if (old?.deny_reason) clean.deny_reason = old.deny_reason
  return clean
})

const header = [
  "# Binflow Surface Inventory (BSI v1, perfil astro_repo).",
  "# Generado con `pnpm bsi:sync` a partir de src/content/. Valídalo con `pnpm check:bsi`.",
  "# Los locators apuntan a ids estables de sección, nunca a índices sections[n].",
  "# Guía: docs/guias/binflow.md",
  "",
].join("\n")

const body = YAML.stringify(
  { version: 1, project_key: projectKey, surfaces },
  { lineWidth: 0, flowCollectionPadding: false },
)

fs.mkdirSync("binflow", { recursive: true })
fs.writeFileSync(INVENTORY_PATH, header + body)

const added = surfaces.filter((row) => !previous.has(row.bf_id)).length
const removed = [...previous.keys()].filter(
  (id) => !surfaces.some((row) => row.bf_id === id),
).length
console.log(
  `ok    ${INVENTORY_PATH}: ${surfaces.length} superficies (+${added} / -${removed})`,
)
