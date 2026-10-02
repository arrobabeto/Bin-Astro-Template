/**
 * Copia temporal del repositorio para probar los scripts reales sin tocar el
 * proyecto. Los paquetes de `node_modules` se enlazan (no se copian) para que
 * sea rápido.
 */
import { spawnSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"

const ROOT = process.cwd()
const SKIP = new Set([
  ".git",
  ".astro",
  ".seo",
  ".vercel",
  "dist",
  "node_modules",
  "playwright-report",
  "test-results",
])

export type RunResult = { status: number; output: string }

export type Workspace = {
  dir: string
  file: (relative: string) => string
  read: (relative: string) => string
  write: (relative: string, content: string) => void
  edit: (relative: string, change: (content: string) => string) => void
  exists: (relative: string) => boolean
  run: (script: string, args?: string[]) => RunResult
  /** Build de Astro con un dominio de prueba (sin pasar por pnpm). */
  build: (env?: Record<string, string>) => RunResult
  remove: () => void
}

function node(
  cwd: string,
  args: string[],
  env: Record<string, string> = {},
): RunResult {
  const result = spawnSync(process.execPath, args, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, FORCE_COLOR: "0", NO_COLOR: "1", ...env },
    input: "",
  })
  return {
    status: result.status ?? 1,
    output: `${result.stdout ?? ""}${result.stderr ?? ""}`,
  }
}

export function createWorkspace(): Workspace {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bin-astro-template-"))
  fs.cpSync(ROOT, dir, {
    recursive: true,
    verbatimSymlinks: true,
    filter: (source) => !SKIP.has(path.basename(source)),
  })
  // Se enlaza cada paquete y no la carpeta entera: la caché de contenido de
  // Astro (node_modules/.astro) debe ser propia de cada copia, porque las
  // pruebas corren builds en paralelo.
  fs.mkdirSync(path.join(dir, "node_modules"))
  for (const entry of fs.readdirSync(path.join(ROOT, "node_modules"))) {
    if (entry === ".astro") continue
    fs.symlinkSync(
      path.join(ROOT, "node_modules", entry),
      path.join(dir, "node_modules", entry),
    )
  }

  const file = (relative: string) => path.join(dir, relative)
  return {
    dir,
    file,
    read: (relative) => fs.readFileSync(file(relative), "utf8"),
    write: (relative, content) => {
      fs.mkdirSync(path.dirname(file(relative)), { recursive: true })
      fs.writeFileSync(file(relative), content)
    },
    edit(relative, change) {
      this.write(relative, change(this.read(relative)))
    },
    exists: (relative) => fs.existsSync(file(relative)),
    run(script, args = []) {
      return node(dir, [script, ...args])
    },
    build(env = {}) {
      return node(dir, ["node_modules/astro/bin/astro.mjs", "build"], {
        PUBLIC_SITE_URL: "https://www.sitio-de-prueba.invalid",
        ...env,
      })
    },
    remove: () => fs.rmSync(dir, { recursive: true, force: true }),
  }
}
