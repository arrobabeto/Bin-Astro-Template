#!/usr/bin/env node
/**
 * Primer arranque local: crea .env desde .env.example si no existe.
 * `pnpm setup` además corre `astro sync` (tipos) y `husky` (hook de commit).
 */
import fs from "node:fs"

const major = Number(process.versions.node.split(".")[0])
if (major !== 24) {
  console.warn(
    `warn  estás usando Node ${process.versions.node}; este proyecto usa Node 24 (nvm use)`,
  )
}

if (fs.existsSync(".env")) {
  console.log("ok    .env ya existe (no se modificó)")
} else {
  fs.copyFileSync(".env.example", ".env")
  console.log(
    "ok    .env creado desde .env.example (todas las variables son opcionales)",
  )
}

if (!fs.existsSync("template.lock.json")) {
  console.log(
    "\n¿Vas a crear un sitio nuevo con este template? Corre `pnpm bootstrap`.",
  )
}
console.log("Siguiente paso: `pnpm dev` y abre http://localhost:4321")
