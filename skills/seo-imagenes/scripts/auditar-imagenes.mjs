#!/usr/bin/env node
/**
 * Inventario SEO de las imágenes del sitio: nombre de archivo, peso, medidas
 * y, por cada lugar donde se usa, su `alt` y `caption` con los problemas
 * detectados. No modifica nada.
 *
 * Uso:
 *   node skills/seo-imagenes/scripts/auditar-imagenes.mjs [carpeta|imagen]...
 *
 * Por defecto revisa src/assets y public. Los íconos con nombre fijo
 * (favicon, apple-touch-icon…) se omiten.
 */
import fs from "node:fs"
import sharp from "sharp"
import YAML from "yaml"

import {
  altIssues,
  findImageReferences,
  IMAGE_FILE,
  imageNameIssues,
} from "../../../scripts/lib/image-refs.mjs"
import { walk } from "../../../scripts/lib/output.mjs"

const FIXED_NAMES =
  /(^|\/)(favicon|apple-touch-icon|android-chrome|mstile|safari-pinned-tab|icon-\d+)[^/]*$/i
const NO_ALT_FIELDS = new Set(["ogImage"])

const inputs = process.argv.slice(2)
const images = (inputs.length > 0 ? inputs : ["src/assets", "public"])
  .flatMap((input) =>
    fs.existsSync(input) && fs.statSync(input).isDirectory()
      ? walk(input)
      : [input],
  )
  .filter((file) => IMAGE_FILE.test(file) && !FIXED_NAMES.test(file))

/** Busca en un árbol YAML el objeto que contiene `ref` y devuelve su contexto. */
function findInTree(node, ref, pointer = []) {
  if (Array.isArray(node)) {
    for (const [index, item] of node.entries()) {
      const found = findInTree(item, ref, [...pointer, item?.id ?? index])
      if (found) return found
    }
  } else if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      if (value === ref) {
        return key === "src"
          ? { pointer: pointer.join("."), alt: node.alt, caption: node.caption }
          : {
              pointer: [...pointer, key].join("."),
              alt: node[`${key}Alt`],
              caption: node[`${key}Caption`],
              altRequired: !NO_ALT_FIELDS.has(key),
            }
      }
      const found = findInTree(value, ref, [...pointer, key])
      if (found) return found
    }
  }
  return null
}

function usage(ref) {
  const text = fs.readFileSync(ref.file, "utf8")
  if (/\.ya?ml$/.test(ref.file)) {
    return findInTree(YAML.parse(text), ref.ref) ?? { pointer: "?" }
  }
  if (/\.mdx?$/.test(ref.file)) {
    const front = text.match(/^---\n([\s\S]*?)\n---/)
    const inFront = front && findInTree(YAML.parse(front[1]), ref.ref)
    if (inFront)
      return { ...inFront, pointer: `frontmatter.${inFront.pointer}` }
    const escaped = ref.ref.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const inline = text.match(new RegExp(`!\\[([^\\]]*)\\]\\(${escaped}`))
    if (inline) return { pointer: "cuerpo", alt: inline[1] }
  }
  return { pointer: "código", altRequired: false }
}

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`
let problems = 0

for (const image of images) {
  const { size } = fs.statSync(image)
  const meta = image.endsWith(".svg") ? {} : await sharp(image).metadata()
  const dims = meta.width ? `${meta.width}x${meta.height}` : "vectorial"
  console.log(`\n${image}  (${kb(size)}, ${dims})`)

  const nameIssues = imageNameIssues(image)
  for (const issue of nameIssues) console.log(`  ✗ nombre: ${issue}`)
  problems += nameIssues.length

  const refs = findImageReferences(image)
  if (refs.length === 0) {
    console.log("  ✗ ningún archivo la usa: bórrala o úsala")
    problems++
  }
  for (const ref of refs) {
    const found = usage(ref)
    console.log(`  · ${ref.file} → ${found.pointer}`)
    if (found.alt !== undefined) console.log(`      alt: ${found.alt}`)
    if (found.caption) console.log(`      caption: ${found.caption}`)
    if (found.altRequired !== false) {
      const issues = altIssues(found.alt, image)
      for (const issue of issues) console.log(`      ✗ alt: ${issue}`)
      problems += issues.length
    }
  }
}

console.log(
  `\n${images.length} imagen(es) revisadas, ${problems} problema(s) de SEO.`,
)
