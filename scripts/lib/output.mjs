import { createHash } from "node:crypto"
import fs from "node:fs"
import path from "node:path"

export function sha256(file) {
  return createHash("sha256").update(fs.readFileSync(file)).digest("hex")
}

/** Lo que Vercel publica: la salida estática del adaptador. */
export const OUT_DIR = ".vercel/output/static"
export const VERCEL_CONFIG = ".vercel/output/config.json"

export function requireBuild() {
  if (!fs.existsSync(path.join(OUT_DIR, "index.html"))) {
    console.error(
      `FAIL  no existe ${OUT_DIR}/index.html. Corre primero \`pnpm build:ci\`.`,
    )
    process.exit(1)
  }
}

export function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, files)
    else files.push(full)
  }
  return files
}

/** Páginas HTML publicadas, con su ruta pública ("/", "/privacidad", …). */
export function listPages() {
  return walk(OUT_DIR)
    .filter((file) => file.endsWith(".html"))
    .map((file) => {
      const rel = path.relative(OUT_DIR, file).split(path.sep).join("/")
      const route =
        rel === "index.html"
          ? "/"
          : `/${rel.replace(/\/index\.html$/, "").replace(/\.html$/, "")}`
      return { file, route, html: fs.readFileSync(file, "utf8") }
    })
}

export function reporter() {
  let failures = 0
  return {
    ok: (message) => console.log(`ok    ${message}`),
    fail: (message) => {
      console.error(`FAIL  ${message}`)
      failures += 1
    },
    warn: (message) => console.warn(`warn  ${message}`),
    done: (summary) => {
      if (failures > 0) {
        console.error(`\n${failures} problema(s) encontrados.`)
        process.exit(1)
      }
      if (summary) console.log(`\nok    ${summary}`)
    },
  }
}
