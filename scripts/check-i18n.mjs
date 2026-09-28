#!/usr/bin/env node
/**
 * Coherencia de idiomas activos (src/config/locales.ts):
 *  - cada idioma activo tiene site/<idioma>.yaml, pages/<idioma>/index.yaml
 *    y los mismos documentos legales que el idioma por defecto;
 *  - no hay carpetas de idiomas desconocidos;
 *  - translationKey (por defecto, el slug) no se repite dentro de un idioma
 *    y las traducciones
 *    apuntan a una página que existe en el idioma por defecto.
 */
import fs from "node:fs"
import path from "node:path"
import YAML from "yaml"

import {
  DEFAULT_LOCALE,
  ENABLED_LOCALES,
  LOCALE_META,
} from "../src/config/locales.ts"
import { reporter, walk } from "./lib/output.mjs"

const r = reporter()

if (!ENABLED_LOCALES.includes(DEFAULT_LOCALE)) {
  r.fail(`DEFAULT_LOCALE "${DEFAULT_LOCALE}" debe estar en ENABLED_LOCALES`)
}

function frontmatter(file) {
  const match = fs.readFileSync(file, "utf8").match(/^---\n([\s\S]*?)\n---/)
  return match ? YAML.parse(match[1]) : {}
}

/** { locale → Map(translationKey → archivo) } para una colección. */
function translationKeys(collection) {
  const byLocale = new Map()
  const base = `src/content/${collection}`
  for (const file of walk(base)) {
    if (!/\.(ya?ml|md)$/.test(file)) continue
    const locale = path.relative(base, file).split(path.sep)[0]
    if (!(locale in LOCALE_META)) {
      r.fail(`${file}: la carpeta "${locale}" no es un idioma de LOCALE_META`)
      continue
    }
    const data = file.endsWith(".md")
      ? frontmatter(file)
      : YAML.parse(fs.readFileSync(file, "utf8"))
    const slug = path
      .relative(path.join(base, locale), file)
      .replace(/\.(ya?ml|md)$/, "")
      .split(path.sep)
      .join("/")
    // Mismo valor por defecto que src/lib/routes.ts.
    const key =
      data?.translationKey ??
      (collection === "pages" && slug === "index" ? "home" : slug)
    const keys = byLocale.get(locale) ?? new Map()
    if (keys.has(key))
      r.fail(`${file}: translationKey "${key}" repetido con ${keys.get(key)}`)
    keys.set(key, file)
    byLocale.set(locale, keys)
  }
  return byLocale
}

const pages = translationKeys("pages")
const legal = translationKeys("legal")
const articles = translationKeys("articulos")

for (const locale of ENABLED_LOCALES) {
  const site = `src/content/site/${locale}.yaml`
  if (!fs.existsSync(site)) r.fail(`${locale}: falta ${site}`)
  const home = `src/content/pages/${locale}/index.yaml`
  if (!fs.existsSync(home)) r.fail(`${locale}: falta ${home}`)

  for (const key of legal.get(DEFAULT_LOCALE)?.keys() ?? []) {
    if (!legal.get(locale)?.has(key)) {
      r.fail(
        `${locale}: falta el documento legal "${key}" (existe en ${DEFAULT_LOCALE})`,
      )
    }
  }
  r.ok(
    `${locale} (${LOCALE_META[locale].label}): ${pages.get(locale)?.size ?? 0} páginas`,
  )
}

for (const [collection, byLocale] of [
  ["pages", pages],
  ["legal", legal],
  ["articulos", articles],
]) {
  const defaults = byLocale.get(DEFAULT_LOCALE) ?? new Map()
  for (const [locale, keys] of byLocale) {
    if (locale === DEFAULT_LOCALE) continue
    if (!ENABLED_LOCALES.includes(locale)) {
      r.warn(
        `${collection}/${locale}: hay contenido pero el idioma no está activo`,
      )
    }
    for (const [key, file] of keys) {
      if (!defaults.has(key)) {
        r.warn(
          `${file}: "${key}" no tiene versión en ${DEFAULT_LOCALE} (sin hreflang)`,
        )
      }
    }
  }
}

for (const file of fs.readdirSync("src/content/site")) {
  const locale = file.replace(/\.ya?ml$/, "")
  if (!(locale in LOCALE_META))
    r.fail(`src/content/site/${file}: idioma desconocido`)
}

r.done("idiomas coherentes")
