/**
 * Generación del Binflow Surface Inventory (BSI v1, perfil astro_repo) a
 * partir del contenido. La fuente de verdad del texto es el YAML/Markdown;
 * el inventario solo describe DÓNDE vive cada superficie editable.
 * Ver docs/guias/binflow.md
 */
import fs from "node:fs"
import path from "node:path"
import YAML from "yaml"

import { DEFAULT_LOCALE, ENABLED_LOCALES } from "../../src/config/locales.ts"
import {
  NESTED_BSI_FIELDS,
  SECTION_BSI_FIELDS,
} from "../../src/lib/bsi-fields.ts"

export const INVENTORY_PATH = "binflow/surface-inventory.yaml"
export const PUBLICATION_TARGET = "github_content"
export const KINDS = new Set([
  "copy",
  "style_target",
  "image",
  "chrome_denied",
  "catalog_bound",
  "video",
  "overlay",
  "container",
])

/** Secciones que pueden no renderizarse según variables de entorno. */
export const CONDITIONAL_SECTIONS = {
  newsletter: "Solo se renderiza con PUBLIC_NEWSLETTER_ENABLED=true.",
}

const DENY_REASON = "Etiqueta o URL de CTA: es chrome, no texto editable."

function bfArea(slug) {
  return slug === "" ? "home" : slug.replaceAll("/", "-")
}

function componentPath(type) {
  const name = type.charAt(0).toUpperCase() + type.slice(1)
  return `src/components/sections/Section${name}.astro`
}

function listFiles(dir, pattern) {
  if (!fs.existsSync(dir)) return []
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...listFiles(full, pattern))
    else if (pattern.test(entry.name)) out.push(full.split(path.sep).join("/"))
  }
  return out.sort()
}

function parseContentPath(file, base) {
  const rel = file.slice(base.length + 1).replace(/\.(ya?ml|md)$/, "")
  const [locale, ...rest] = rel.split("/")
  const slug = rest.join("/")
  return { locale, slug: slug === "index" ? "" : slug }
}

function frontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---/)
  return match ? YAML.parse(match[1]) : {}
}

function sampleOf(value) {
  if (typeof value === "string") return value.replace(/\s+/g, " ").trim()
  if (value && typeof value === "object" && "src" in value) return value.src
  if (value && typeof value === "object" && "label" in value) return value.label
  return ""
}

function pageRows(file) {
  const { locale, slug } = parseContentPath(file, "src/content/pages")
  const data = YAML.parse(fs.readFileSync(file, "utf8"))
  const area = bfArea(slug)
  const rows = []

  for (const section of data.sections ?? []) {
    const fields = SECTION_BSI_FIELDS[section.type]
    if (!fields) continue
    for (const [field, kind] of Object.entries(fields)) {
      const fieldPath = NESTED_BSI_FIELDS[field] ?? field
      const value =
        field === "shell"
          ? section
          : fieldPath.split(".").reduce((node, key) => node?.[key], section)
      if (value === undefined || value === null) continue
      const pointer = `sections.${section.id}`
      const row = {
        bf_id: `${area}.${section.id}.${field}`,
        kind,
        area,
        section: section.id,
        path: file,
        locator:
          field === "shell"
            ? `github:${file}#${pointer}`
            : kind === "image"
              ? `github:${file}#${pointer}.${field}.src`
              : `github:${file}#${pointer}.${fieldPath}`,
        locales: [locale],
        publication_target: PUBLICATION_TARGET,
        sample: field === "shell" ? "" : sampleOf(value),
      }
      if (kind === "image") {
        row.alt_locator = `github:${file}#${pointer}.${field}.alt`
        row.presentation = "img"
      }
      if (kind === "chrome_denied") row.deny_reason = DENY_REASON
      const notes = [`Componente: ${componentPath(section.type)}`]
      if (CONDITIONAL_SECTIONS[section.type]) {
        notes.push(CONDITIONAL_SECTIONS[section.type])
        row.conditional = true
      }
      row.notes = notes.join(" ")
      rows.push(row)
    }
  }
  return rows
}

/** Colecciones Markdown publicadas como documento editable (título + cuerpo). */
export const DOCUMENT_COLLECTIONS = [{ base: "src/content/legal" }]

/**
 * Colecciones de entradas (blog): en BSI son `catalog_bound`, con filas
 * genéricas por campo en lugar de una por entrada. La página de cada entrada
 * marca `bf("catalog", "article", "<campo>", "catalog_bound")`.
 */
export const CATALOG_COLLECTIONS = [
  {
    base: "src/content/articulos",
    section: "article",
    area: "blog",
    fields: {
      title: "frontmatter.title",
      body: "body",
      cover: "frontmatter.image",
    },
    denyReason:
      "Entrada de blog: se crea o edita con la familia de artículos, no con edit_text.",
  },
]

function catalogRows({ base, section, area, fields, denyReason }) {
  const files = listFiles(base, /\.md$/)
  if (files.length === 0) return []
  const found = new Set(
    files.map((file) => parseContentPath(file, base).locale),
  )
  const locales = readEnabledLocales().filter((locale) => found.has(locale))
  if (locales.length === 0) return []
  return Object.entries(fields).map(([field, pointer]) => ({
    bf_id: `catalog.${section}.${field}`,
    kind: "catalog_bound",
    area,
    section,
    path: base,
    locator: `github:${base}/{locale}/{slug}.md#${pointer}`,
    locales,
    publication_target: PUBLICATION_TARGET,
    sample: "",
    deny_reason: denyReason,
  }))
}

function documentRows(file, { base }) {
  const { locale, slug } = parseContentPath(file, base)
  const data = frontmatter(fs.readFileSync(file, "utf8"))
  const area = bfArea(slug)
  const common = {
    area,
    section: "document",
    path: file,
    locales: [locale],
    publication_target: PUBLICATION_TARGET,
  }
  return [
    {
      bf_id: `${area}.document.shell`,
      kind: "container",
      ...common,
      locator: `github:${file}`,
      sample: "",
    },
    {
      bf_id: `${area}.document.title`,
      kind: "style_target",
      ...common,
      locator: `github:${file}#frontmatter.title`,
      sample: sampleOf(data.title),
    },
    {
      bf_id: `${area}.document.body`,
      kind: "container",
      ...common,
      locator: `github:${file}#body`,
      sample: "",
      notes:
        "Cuerpo Markdown completo: no es texto atómico; los cambios pasan por revisión legal.",
    },
  ]
}

function chromeRows(file) {
  const locale = path.basename(file).replace(/\.(ya?ml)$/, "")
  const data = YAML.parse(fs.readFileSync(file, "utf8"))
  return [
    {
      bf_id: "chrome.footer.tagline",
      kind: "copy",
      area: "chrome",
      section: "footer",
      path: file,
      locator: `github:${file}#footer.tagline`,
      locales: [locale],
      publication_target: PUBLICATION_TARGET,
      sample: sampleOf(data.footer?.tagline),
      notes: "Componente: src/components/layout/Footer.astro",
    },
  ]
}

/** Une filas iguales de distintos idiomas en una sola con {locale}. */
function mergeLocales(rows) {
  const byId = new Map()
  for (const row of rows) {
    const existing = byId.get(row.bf_id)
    if (!existing) {
      byId.set(row.bf_id, row)
      continue
    }
    const [first] = existing.locales
    const generic = (value) =>
      typeof value === "string"
        ? value
            .replace(`/${first}/`, "/{locale}/")
            .replace(`/${first}.`, "/{locale}.")
        : value
    existing.path = generic(existing.path)
    existing.locator = generic(existing.locator)
    if (existing.alt_locator)
      existing.alt_locator = generic(existing.alt_locator)
    existing.locales = [...new Set([...existing.locales, ...row.locales])]
  }
  return [...byId.values()]
}

/** El idioma por defecto va primero. */
export function readEnabledLocales() {
  return [
    DEFAULT_LOCALE,
    ...ENABLED_LOCALES.filter((locale) => locale !== DEFAULT_LOCALE),
  ]
}

export function generateSurfaces() {
  const enabled = new Set(readEnabledLocales())
  const inEnabled = (file, base) =>
    enabled.has(parseContentPath(file, base).locale)

  const rows = [
    ...listFiles("src/content/pages", /\.ya?ml$/)
      .filter((file) => inEnabled(file, "src/content/pages"))
      .flatMap((file) => pageRows(file)),
    ...DOCUMENT_COLLECTIONS.flatMap((collection) =>
      listFiles(collection.base, /\.md$/)
        .filter((file) => inEnabled(file, collection.base))
        .flatMap((file) => documentRows(file, collection)),
    ),
    ...CATALOG_COLLECTIONS.flatMap(catalogRows),
    ...listFiles("src/content/site", /\.ya?ml$/)
      .filter((file) =>
        enabled.has(path.basename(file).replace(/\.(ya?ml)$/, "")),
      )
      .flatMap(chromeRows),
  ]
  // El idioma por defecto se procesa primero: su texto queda como `sample`.
  const order = readEnabledLocales()
  const rank = (row) => order.indexOf(row.locales[0])
  return mergeLocales(rows.toSorted((a, b) => rank(a) - rank(b)))
}

export function readInventory() {
  if (!fs.existsSync(INVENTORY_PATH)) return null
  return YAML.parse(fs.readFileSync(INVENTORY_PATH, "utf8"))
}

/** Campos que el generador controla (el resto se puede editar a mano). */
export const STRUCTURAL_FIELDS = ["kind", "area", "section", "path", "locator"]
