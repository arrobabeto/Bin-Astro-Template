#!/usr/bin/env node
/**
 * Node 24 fijado en todos lados: .nvmrc, .node-version, package.json#engines
 * y CI. Vercel lee engines.node; nvm/fnm/asdf leen los otros archivos.
 */
import fs from "node:fs"

import { reporter } from "./lib/output.mjs"

const MAJOR = "24"
const r = reporter()

for (const file of [".nvmrc", ".node-version"]) {
  const value = fs.existsSync(file) ? fs.readFileSync(file, "utf8").trim() : ""
  if (value.replace(/^v/, "").split(".")[0] === MAJOR) r.ok(`${file}: ${value}`)
  else r.fail(`${file} debe fijar Node ${MAJOR} (tiene "${value}")`)
}

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"))
if (pkg.engines?.node === `${MAJOR}.x`)
  r.ok(`engines.node: ${pkg.engines.node}`)
else r.fail(`package.json#engines.node debe ser "${MAJOR}.x"`)

if (/^pnpm@\d+\.\d+\.\d+$/.test(pkg.packageManager ?? "")) {
  r.ok(`packageManager: ${pkg.packageManager}`)
} else {
  r.fail('package.json#packageManager debe fijar pnpm exacto ("pnpm@x.y.z")')
}

const workflow = ".github/workflows/ci.yml"
if (fs.existsSync(workflow)) {
  const content = fs.readFileSync(workflow, "utf8")
  if (/node-version-file:\s*\.nvmrc/.test(content))
    r.ok(`${workflow} usa .nvmrc`)
  else r.fail(`${workflow} debe usar node-version-file: .nvmrc`)
}

const running = process.versions.node.split(".")[0]
if (running !== MAJOR) {
  r.warn(
    `estás corriendo Node ${process.versions.node}; usa Node ${MAJOR} (nvm use)`,
  )
}

r.done(`Node ${MAJOR} fijado`)
