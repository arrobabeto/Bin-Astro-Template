#!/usr/bin/env node
/**
 * Cliente mínimo de la API REST de Figma. Lee FIGMA_API_KEY y FIGMA_FILE_KEY
 * de process.env o del .env del proyecto. Nunca imprime la API key.
 *
 * Uso:
 *   node skills/figma-rest-design-reader/scripts/figma.mjs me
 *   node skills/figma-rest-design-reader/scripts/figma.mjs file
 *   node skills/figma-rest-design-reader/scripts/figma.mjs pages
 *   node skills/figma-rest-design-reader/scripts/figma.mjs nodes <nodeId> [nodeId...]
 *   node skills/figma-rest-design-reader/scripts/figma.mjs tree [pageNameOrId] [depth]
 *   node skills/figma-rest-design-reader/scripts/figma.mjs export <nodeId> [format=png] [scale=2]
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
)

function loadEnvFile() {
  const envPath = path.join(ROOT, ".env")
  if (!fs.existsSync(envPath)) return {}
  return Object.fromEntries(
    fs
      .readFileSync(envPath, "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const i = line.indexOf("=")
        if (i === -1) return null
        return [
          line.slice(0, i).trim(),
          line
            .slice(i + 1)
            .trim()
            .replace(/^["']|["']$/g, ""),
        ]
      })
      .filter(Boolean),
  )
}

const fileEnv = loadEnvFile()
const token = process.env.FIGMA_API_KEY || fileEnv.FIGMA_API_KEY
const fileKey = process.env.FIGMA_FILE_KEY || fileEnv.FIGMA_FILE_KEY

if (!token) {
  console.error("Falta FIGMA_API_KEY (en la terminal o en .env)")
  process.exit(1)
}
if (!fileKey && process.argv[2] !== "me") {
  console.error("Falta FIGMA_FILE_KEY (en la terminal o en .env)")
  process.exit(1)
}

async function figma(pathname, init = {}) {
  const response = await fetch(`https://api.figma.com/v1${pathname}`, {
    ...init,
    headers: {
      "X-Figma-Token": token,
      ...(init.headers || {}),
    },
  })
  const text = await response.text()
  let body
  try {
    body = JSON.parse(text)
  } catch {
    body = text
  }
  if (!response.ok) {
    console.error(
      typeof body === "string" ? body : JSON.stringify(body, null, 2),
    )
    process.exit(1)
  }
  return body
}

function summarizeNode(node, depth = 0, maxDepth = 2) {
  const row = {
    id: node.id,
    name: node.name,
    type: node.type,
  }
  if (node.absoluteBoundingBox) {
    row.w = Math.round(node.absoluteBoundingBox.width)
    row.h = Math.round(node.absoluteBoundingBox.height)
  }
  if (node.characters) row.characters = node.characters
  if (
    depth < maxDepth &&
    Array.isArray(node.children) &&
    node.children.length
  ) {
    row.children = node.children.map((child) =>
      summarizeNode(child, depth + 1, maxDepth),
    )
  } else if (Array.isArray(node.children)) {
    row.childCount = node.children.length
  }
  return row
}

const [cmd, ...args] = process.argv.slice(2)

switch (cmd) {
  case "me": {
    const me = await figma("/me")
    console.log(
      JSON.stringify(
        {
          email: me.email,
          handle: me.handle,
          id: me.id,
        },
        null,
        2,
      ),
    )
    break
  }
  case "file": {
    const file = await figma(`/files/${fileKey}?depth=1`)
    console.log(
      JSON.stringify(
        {
          name: file.name,
          lastModified: file.lastModified,
          version: file.version,
          role: file.role,
          pages: (file.document?.children || []).map((p) => ({
            id: p.id,
            name: p.name,
            type: p.type,
          })),
        },
        null,
        2,
      ),
    )
    break
  }
  case "pages": {
    const file = await figma(`/files/${fileKey}?depth=1`)
    for (const page of file.document?.children || []) {
      console.log(`${page.id}\t${page.name}`)
    }
    break
  }
  case "nodes": {
    if (!args.length) {
      console.error("Uso: figma.mjs nodes <nodeId> [nodeId...]")
      process.exit(1)
    }
    const ids = args.map((id) => id.replaceAll("-", ":")).join(",")
    const data = await figma(
      `/files/${fileKey}/nodes?ids=${encodeURIComponent(ids)}`,
    )
    const out = {}
    for (const [id, entry] of Object.entries(data.nodes || {})) {
      out[id] = entry?.document ? summarizeNode(entry.document, 0, 3) : entry
    }
    console.log(JSON.stringify(out, null, 2))
    break
  }
  case "tree": {
    const target = args[0]
    const depth = Number(args[1] ?? 2)
    const file = await figma(
      `/files/${fileKey}?depth=${Math.max(1, depth + 1)}`,
    )
    let page = file.document
    if (target) {
      const pages = file.document?.children || []
      page =
        pages.find(
          (p) => p.id === target || p.id === target.replaceAll("-", ":"),
        ) ||
        pages.find((p) => p.name.toLowerCase().includes(target.toLowerCase()))
      if (!page) {
        console.error(`Página no encontrada: ${target}`)
        process.exit(1)
      }
    }
    console.log(JSON.stringify(summarizeNode(page, 0, depth), null, 2))
    break
  }
  case "export": {
    const nodeId = (args[0] || "").replaceAll("-", ":")
    const format = (args[1] || "png").toLowerCase()
    const scale = args[2] || "2"
    if (!nodeId) {
      console.error("Uso: figma.mjs export <nodeId> [format=png] [scale=2]")
      process.exit(1)
    }
    const data = await figma(
      `/images/${fileKey}?ids=${encodeURIComponent(nodeId)}&format=${format}&scale=${scale}`,
    )
    console.log(
      JSON.stringify({ nodeId, format, scale, images: data.images }, null, 2),
    )
    break
  }
  default:
    console.error(`Comando desconocido: ${cmd || "(ninguno)"}`)
    console.error("Comandos: me | file | pages | nodes | tree | export")
    process.exit(1)
}
