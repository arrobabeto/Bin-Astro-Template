#!/usr/bin/env node
/**
 * Convierte una copia del template en un sitio nuevo. Pregunta nombre,
 * dominio y contacto, reescribe la identidad del proyecto y deja
 * template.lock.json (a partir de ahí `check:placeholders` es estricto).
 *
 * Uso interactivo:  pnpm bootstrap
 * Sin preguntas:    pnpm bootstrap --nombre "Mi Empresa" --dominio www.miempresa.mx \
 *                     [--correo hola@miempresa.mx] [--telefono "+52 ..."] \
 *                     [--direccion "..."] [--project-key mi-empresa]
 * Guía: docs/guias/crear-sitio-nuevo.md
 */
import { spawnSync } from "node:child_process"
import fs from "node:fs"
import { createInterface } from "node:readline/promises"
import { parseArgs } from "node:util"
import YAML from "yaml"

import { productionSiteUrlError } from "../src/config/site-url.ts"
import { INVENTORY_PATH } from "./lib/bsi.mjs"
import { sha256, walk } from "./lib/output.mjs"

const { values: args } = parseArgs({
  options: {
    nombre: { type: "string" },
    dominio: { type: "string" },
    correo: { type: "string" },
    telefono: { type: "string" },
    direccion: { type: "string" },
    "project-key": { type: "string" },
    force: { type: "boolean", default: false },
  },
})

if (fs.existsSync("template.lock.json") && !args.force) {
  console.error(
    "FAIL  este proyecto ya pasó por bootstrap (existe template.lock.json).",
  )
  console.error("      Usa --force solo si sabes lo que haces.")
  process.exit(1)
}

const rl = process.stdin.isTTY
  ? createInterface({ input: process.stdin, output: process.stdout })
  : null

async function ask(label, { initial, fallback = "", required = false } = {}) {
  if (initial !== undefined) return initial.trim()
  if (!rl) {
    if (required) {
      console.error(
        `FAIL  falta --${label.split(" ")[0].toLowerCase()} (modo sin terminal)`,
      )
      process.exit(1)
    }
    return fallback
  }
  for (;;) {
    const hint = fallback ? ` (${fallback})` : ""
    const answer = (await rl.question(`${label}${hint}: `)).trim() || fallback
    if (answer || !required) return answer
  }
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function normalizeSiteUrl(value) {
  const withProtocol = /^https?:\/\//.test(value) ? value : `https://${value}`
  return withProtocol.replace(/\/+$/, "")
}

console.log("\nBin Astro Template · nuevo sitio\n")

const name = await ask("Nombre del sitio o empresa", {
  initial: args.nombre,
  required: true,
})
let siteUrl
for (;;) {
  siteUrl = normalizeSiteUrl(
    await ask("Dominio (ej. www.miempresa.mx)", {
      initial: args.dominio,
      required: true,
    }),
  )
  const error = productionSiteUrlError(siteUrl, "production")
  if (!error) break
  console.error(`      ${error}`)
  if (!rl || args.dominio) process.exit(1)
}
const host = new URL(siteUrl).hostname.replace(/^www\./, "")
const email = await ask("Correo de contacto", {
  initial: args.correo,
  fallback: `hola@${host}`,
})
const phone = await ask("Teléfono (opcional)", { initial: args.telefono })
const address = await ask("Dirección o ciudad (opcional)", {
  initial: args.direccion,
})
const packageName = slugify(name)
const projectKey = await ask("project_key de Binflow", {
  initial: args["project-key"],
  fallback: packageName,
})
rl?.close()

// Huella del contenido demo antes de tocar nada (check:placeholders la usa).
const demoFiles = Object.fromEntries(
  [
    ...walk("src/content/pages"),
    ...walk("src/content/legal"),
    ...walk("src/assets/images"),
    "public/favicon.svg",
  ]
    .filter((file) => fs.existsSync(file) && !file.endsWith(".DS_Store"))
    .map((file) => [file.split("\\").join("/"), sha256(file)]),
)

// package.json
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"))
const templateVersion = pkg.version
pkg.name = packageName
pkg.displayName = name
pkg.description = `Sitio web de ${name}.`
pkg.version = "0.1.0"
fs.writeFileSync("package.json", `${JSON.stringify(pkg, null, 2)}\n`)
console.log(`ok    package.json → ${packageName}`)

// src/config/site.ts
const siteFile = "src/config/site.ts"
fs.writeFileSync(
  siteFile,
  fs
    .readFileSync(siteFile, "utf8")
    .replace(/name: ".*?",/, `name: ${JSON.stringify(name)},`)
    .replace(
      /securityContact: ".*?",/,
      `securityContact: "mailto:seguridad@${host}",`,
    ),
)
console.log(`ok    ${siteFile}`)

// Textos globales de cada idioma
for (const file of walk("src/content/site").filter((f) => /\.ya?ml$/.test(f))) {
  const doc = YAML.parseDocument(fs.readFileSync(file, "utf8"))
  doc.setIn(["contact", "email"], email)
  if (phone) doc.setIn(["contact", "phone"], phone)
  else doc.deleteIn(["contact", "phone"])
  if (address) doc.setIn(["contact", "address"], address)
  else doc.deleteIn(["contact", "address"])
  fs.writeFileSync(file, doc.toString({ lineWidth: 0 }))
  console.log(`ok    ${file}`)
}

// .env local
if (!fs.existsSync(".env")) fs.copyFileSync(".env.example", ".env")
const envContent = fs.readFileSync(".env", "utf8")
fs.writeFileSync(
  ".env",
  /^PUBLIC_SITE_URL=.*$/m.test(envContent)
    ? envContent.replace(/^PUBLIC_SITE_URL=.*$/m, `PUBLIC_SITE_URL=${siteUrl}`)
    : `${envContent.trimEnd()}\nPUBLIC_SITE_URL=${siteUrl}\n`,
)
console.log(`ok    .env → PUBLIC_SITE_URL=${siteUrl}`)

// Binflow
if (fs.existsSync(INVENTORY_PATH)) {
  const doc = YAML.parseDocument(fs.readFileSync(INVENTORY_PATH, "utf8"))
  doc.set("project_key", projectKey)
  fs.writeFileSync(INVENTORY_PATH, doc.toString({ lineWidth: 0 }))
}

fs.writeFileSync(
  "template.lock.json",
  `${JSON.stringify(
    {
      template: "bin-astro-template",
      templateVersion,
      bootstrappedAt: new Date().toISOString(),
      site: { name, url: siteUrl, projectKey },
      demoFiles,
    },
    null,
    2,
  )}\n`,
)
console.log("ok    template.lock.json")

for (const script of [
  "scripts/bsi-sync.mjs",
  "scripts/generate-brand-assets.mjs",
]) {
  const result = spawnSync(process.execPath, [script], { stdio: "inherit" })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

console.log(`
Listo. Siguientes pasos (docs/guias/crear-sitio-nuevo.md):
  1. Reemplaza el logo en public/favicon.svg y corre \`pnpm brand:assets\`.
  2. Cambia los colores de marca en src/styles/global.css.
  3. Reescribe el contenido de src/content/ (o pídeselo a tu agente de IA).
  4. Revisa los textos legales con un profesional y quita el aviso de plantilla.
  5. En Vercel, agrega PUBLIC_SITE_URL=${siteUrl} en Environment Variables.
  6. Corre \`pnpm verify\`: \`check:placeholders\` te dirá qué datos demo faltan.
`)
