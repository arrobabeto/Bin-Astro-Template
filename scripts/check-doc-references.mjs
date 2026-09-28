#!/usr/bin/env node
/**
 * Las rutas que citan README, docs, AGENTS.md, skills y reglas deben existir.
 * Revisa rutas entre `backticks` relativas a la raíz (o a la carpeta de la
 * skill) y enlaces Markdown relativos al archivo que los contiene.
 *
 * Un documento puede declarar rutas de ejemplo que no existen a propósito:
 *   <!-- check:docs ejemplos: src/content/pages/es/servicios.yaml src/x/ -->
 * Una ruta terminada en / cubre todo lo que empiece con ella.
 */
import fs from "node:fs"
import path from "node:path"

import { reporter, walk } from "./lib/output.mjs"

const SOURCES = [
  "README.md",
  "AGENTS.md",
  "CLAUDE.md",
  "CHANGELOG.md",
  "docs",
  "skills",
  ".cursor/rules",
  ".github",
]
const IGNORE = [/^skills\/hallmark\//]

const ROOTS =
  "src|scripts|docs|skills|binflow|public|tests|\\.cursor|\\.agents|\\.claude|\\.codex|\\.github|\\.husky"
const ROOT_FILES =
  "astro\\.config\\.ts|vercel\\.json|package\\.json|\\.env\\.example|AGENTS\\.md|CLAUDE\\.md|README\\.md|CHANGELOG\\.md|skills-lock\\.json|playwright\\.config\\.ts|vitest\\.config\\.ts|eslint\\.config\\.js|tsconfig\\.json|pnpm-workspace\\.yaml"
const CODE_PATH = new RegExp(
  `\`((?:(?:${ROOTS})/[A-Za-z0-9_./[\\]-]*[A-Za-z0-9_\\]/-])|(?:${ROOT_FILES}))\``,
  "g",
)
const MD_LINK = /\]\(([^)\s]+)\)/g
/** Rutas de ejemplo o con comodines que no deben existir literalmente. */
const PLACEHOLDER =
  /[*<>{}]|AAAA|mi-seccion|MiSeccion|SectionNombre|nombre-skill|\.\.\.$/

const r = reporter()
const files = SOURCES.flatMap((source) =>
  !fs.existsSync(source)
    ? []
    : fs.statSync(source).isFile()
      ? [source]
      : walk(source).filter((file) => /\.(md|mdc|ya?ml)$/.test(file)),
).filter((file) => !IGNORE.some((regex) => regex.test(file)))

const EXAMPLES = /<!--\s*check:docs ejemplos:([^>]*)-->/g

function examplesOf(content) {
  const list = [...content.matchAll(EXAMPLES)].flatMap(([, paths]) =>
    paths.trim().split(/\s+/),
  )
  return (ref) =>
    list.some((example) =>
      example.endsWith("/") ? ref.startsWith(example) : ref === example,
    )
}

/** Carpeta de la skill que contiene el archivo, si aplica. */
function skillDir(file) {
  const match = /^skills\/[^/]+/.exec(file)
  return match ? match[0] : undefined
}

let checked = 0
for (const file of files) {
  const content = fs.readFileSync(file, "utf8")
  const isExample = examplesOf(content)
  const skill = skillDir(file)

  for (const [, ref] of content.matchAll(CODE_PATH)) {
    if (PLACEHOLDER.test(ref) || isExample(ref)) continue
    checked++
    const clean = ref.replace(/\/$/, "")
    const exists =
      fs.existsSync(clean) ||
      (skill !== undefined && fs.existsSync(path.join(skill, clean)))
    if (!exists) r.fail(`${file}: no existe \`${ref}\``)
  }

  for (const [, href] of content.matchAll(MD_LINK)) {
    if (/^(https?:|mailto:|tel:|#)/.test(href) || PLACEHOLDER.test(href))
      continue
    // Las reglas de Cursor usan `mdc:` con rutas desde la raíz.
    const clean = href.split("#")[0]
    const target = clean.startsWith("mdc:")
      ? path.normalize(clean.slice(4))
      : path.normalize(path.join(path.dirname(file), clean))
    if (!target || target === ".") continue
    checked++
    if (!fs.existsSync(target)) r.fail(`${file}: enlace roto → ${href}`)
  }
}

r.ok(`${checked} referencias revisadas en ${files.length} documentos`)
r.done("referencias de la documentación válidas")
