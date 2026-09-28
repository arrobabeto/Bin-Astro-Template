#!/usr/bin/env node
/**
 * Falla si el valor de un secreto configurado aparece en el build, en los
 * reportes de pruebas o en archivos versionados. Solo reporta el nombre de
 * la variable y el archivo, nunca el valor.
 */
import { execSync } from "node:child_process"
import fs from "node:fs"

import { readEnv } from "./lib/env.mjs"
import { reporter, walk } from "./lib/output.mjs"

const SECRET_NAMES = [
  "SENDGRID_API_KEY",
  "MAILERLITE_API_KEY",
  "FIGMA_API_KEY",
  "VERCEL_TOKEN",
]

/** Formatos conocidos de llaves; solo se buscan en artefactos generados. */
const PREFIX_PATTERNS = [
  { name: "SendGrid", regex: /SG\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}/g },
  { name: "Figma", regex: /figd_[A-Za-z0-9_-]{20,}/g },
  { name: "JWT (MailerLite)", regex: /eyJ0eXAiOiJKV1Qi[A-Za-z0-9._-]{40,}/g },
]

const ARTEFACT_DIRS = [
  "dist",
  ".vercel/output",
  "playwright-report",
  "test-results",
]
const SKIP_EXT = /\.(png|jpe?g|gif|webp|avif|woff2?|ico|mp4|webm|pdf)$/i
const PLACEHOLDERS = new Set(["", "changeme", "tu-api-key", "your-api-key"])

const r = reporter()
const env = readEnv()

const secrets = SECRET_NAMES.map((name) => ({
  name,
  value: env[name]?.trim() ?? "",
})).filter(
  ({ value }) => value.length >= 8 && !PLACEHOLDERS.has(value.toLowerCase()),
)

function trackedFiles() {
  try {
    return execSync("git ls-files --cached --others --exclude-standard", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
      .split("\n")
      .filter(Boolean)
  } catch {
    return []
  }
}

const artefacts = ARTEFACT_DIRS.flatMap((dir) => walk(dir))
const files = new Set([...artefacts, ...trackedFiles()])
const artefactSet = new Set(artefacts)

for (const file of files) {
  if (SKIP_EXT.test(file) || /(^|\/)\.env$/.test(file)) continue
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) continue
  const content = fs.readFileSync(file, "utf8")

  for (const { name, value } of secrets) {
    if (content.includes(value))
      r.fail(`el valor de ${name} aparece en ${file}`)
  }
  if (!artefactSet.has(file)) continue
  for (const { name, regex } of PREFIX_PATTERNS) {
    regex.lastIndex = 0
    if (regex.test(content)) r.fail(`patrón de llave ${name} en ${file}`)
  }
}

if (secrets.length === 0)
  r.ok("sin secretos configurados: solo se buscaron patrones")
else r.ok(`${secrets.length} secreto(s) buscados por valor`)
r.ok(`${files.size} archivos revisados`)
r.done("sin fugas de secretos")
