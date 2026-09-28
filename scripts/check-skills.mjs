#!/usr/bin/env node
/**
 * Skills del proyecto (skills/):
 *  - .agents, .cursor, .claude y .codex apuntan a ../skills (symlink);
 *  - cada skill tiene SKILL.md con `name` igual a su carpeta y `description`;
 *  - skills/INVENTARIO.md tiene una fila y una ficha completa por skill, y
 *    ninguna ficha de una skill que ya no existe;
 *  - las skills de terceros (skills-lock.json) no se editaron localmente.
 *
 * Uso: pnpm check:skills            (pnpm check:skills --update-lock tras actualizar una skill de terceros)
 */
import { createHash } from "node:crypto"
import fs from "node:fs"
import path from "node:path"
import YAML from "yaml"

import { reporter, walk } from "./lib/output.mjs"

const SKILLS_DIR = "skills"
const LINKS = [
  ".agents/skills",
  ".cursor/skills",
  ".claude/skills",
  ".codex/skills",
]
const INVENTORY = "skills/INVENTARIO.md"
const LOCK = "skills-lock.json"
const FICHA_FIELDS = [
  "Invocación",
  "Función",
  "Casos de uso",
  "Cuándo no usarla",
  "Entradas",
  "Salidas",
  "Requisitos",
  "Origen",
  "Estado",
]

const r = reporter()

/** Hash estable del contenido de una skill (ignora LICENSE y .DS_Store). */
export function skillHash(dir) {
  const lines = walk(dir)
    .filter((file) => !/(^|\/)(LICENSE|\.DS_Store)$/.test(file))
    .map((file) => path.relative(dir, file).split(path.sep).join("/"))
    .sort()
    .map((rel) => {
      const hash = createHash("sha256")
        .update(fs.readFileSync(path.join(dir, rel)))
        .digest("hex")
      return `${hash}  ${rel}`
    })
  return createHash("sha256").update(lines.join("\n")).digest("hex")
}

// 1. Symlinks
for (const link of LINKS) {
  let target = null
  try {
    target = fs.readlinkSync(link)
  } catch {
    // no es symlink o no existe
  }
  if (target === "../skills") r.ok(`${link} → ../skills`)
  else {
    r.fail(
      `${link} debe ser un symlink a ../skills` +
        (fs.existsSync(link)
          ? " (en Windows: git config core.symlinks true y vuelve a clonar)"
          : ""),
    )
  }
}

// 2. Frontmatter
const skills = fs
  .readdirSync(SKILLS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !/^[_.]/.test(entry.name))
  .map((entry) => entry.name)
  .sort()

for (const name of skills) {
  const file = path.join(SKILLS_DIR, name, "SKILL.md")
  if (!fs.existsSync(file)) {
    r.fail(`${name}: falta SKILL.md`)
    continue
  }
  const match = fs.readFileSync(file, "utf8").match(/^---\n([\s\S]*?)\n---/)
  const meta = match ? YAML.parse(match[1]) : null
  if (!meta)
    r.fail(`${file}: falta el frontmatter (--- name / description ---)`)
  else {
    if (meta.name !== name)
      r.fail(`${file}: name "${meta.name}" debe ser "${name}"`)
    if (!meta.description || String(meta.description).trim().length < 40) {
      r.fail(
        `${file}: description vacía o demasiado corta (explica qué hace y cuándo usarla)`,
      )
    }
  }
}

// 3. Inventario
if (!fs.existsSync(INVENTORY)) {
  r.fail(`falta ${INVENTORY}`)
} else {
  const inventory = fs.readFileSync(INVENTORY, "utf8")
  const fichas = new Map()
  for (const block of inventory.split(/^### /m).slice(1)) {
    const heading = block.split("\n")[0]
    const name = heading.match(/`([^`]+)`/)?.[1]
    if (name) fichas.set(name, block)
  }
  const tableRows = new Set(
    [...inventory.matchAll(/^\|\s*\[?`([a-z0-9-]+)`/gm)].map(
      (match) => match[1],
    ),
  )

  for (const name of skills) {
    if (!tableRows.has(name))
      r.fail(`${INVENTORY}: falta la fila de \`${name}\` en la tabla resumen`)
    const ficha = fichas.get(name)
    if (!ficha) {
      r.fail(`${INVENTORY}: falta la ficha "### \`${name}\`"`)
      continue
    }
    const missing = FICHA_FIELDS.filter(
      (field) => !ficha.includes(`**${field}:**`),
    )
    if (missing.length > 0)
      r.fail(`${INVENTORY} › ${name}: faltan ${missing.join(", ")}`)
  }
  for (const name of new Set([...fichas.keys(), ...tableRows])) {
    if (!skills.includes(name))
      r.fail(`${INVENTORY}: \`${name}\` no existe en skills/`)
  }
  r.ok(`${skills.length} skills con ficha en el inventario`)
}

// 4. Skills de terceros
if (fs.existsSync(LOCK)) {
  const lock = JSON.parse(fs.readFileSync(LOCK, "utf8"))
  const update = process.argv.includes("--update-lock")
  for (const [name, entry] of Object.entries(lock.skills ?? {})) {
    const dir = path.join(SKILLS_DIR, name)
    if (!fs.existsSync(dir)) {
      r.fail(`${LOCK}: ${name} no existe en skills/`)
      continue
    }
    const hash = skillHash(dir)
    if (update) entry.computedHash = hash
    else if (hash !== entry.computedHash) {
      r.fail(
        `${name}: el contenido no coincide con ${LOCK} (no edites skills de terceros; si la actualizaste desde ${entry.source}, corre pnpm check:skills --update-lock)`,
      )
    } else
      r.ok(
        `${name}: igual a ${entry.source}@${String(entry.commit).slice(0, 7)}`,
      )
  }
  if (update) {
    fs.writeFileSync(LOCK, `${JSON.stringify(lock, null, 2)}\n`)
    r.ok(`${LOCK} actualizado`)
  }
}

r.done("skills en orden")
