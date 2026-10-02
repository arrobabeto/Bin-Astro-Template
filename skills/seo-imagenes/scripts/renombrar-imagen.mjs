#!/usr/bin/env node
/**
 * Renombra una imagen con un nombre SEO y actualiza todas sus citas en src/ y
 * public/ (YAML, Markdown, componentes, webmanifest). Conserva la extensión y
 * la carpeta.
 *
 * Uso:
 *   node skills/seo-imagenes/scripts/renombrar-imagen.mjs <imagen> "<nombre o descripción>" [--dry-run]
 *
 * El nombre puede escribirse como texto libre ("Dentista revisando una
 * radiografía"): se convierte a `dentista-revisando-una-radiografia`.
 */
import path from "node:path"
import { parseArgs } from "node:util"

import {
  imageNameIssues,
  moveImage,
  seoSlug,
} from "../../../scripts/lib/image-refs.mjs"

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { "dry-run": { type: "boolean", default: false } },
})

const [image, wanted] = positionals
if (!image || !wanted) {
  console.error(
    'Uso: renombrar-imagen.mjs <imagen> "<nombre o descripción>" [--dry-run]',
  )
  process.exit(1)
}

const { dir, ext } = path.parse(image)
const name = seoSlug(path.parse(wanted).name)
const target = path.join(dir, `${name}${ext.toLowerCase()}`)

const issues = imageNameIssues(target)
if (issues.length > 0) {
  console.error(`FAIL  "${name}" no es un buen nombre: ${issues.join("; ")}`)
  process.exit(1)
}

try {
  const refs = moveImage(image, target, { dryRun: values["dry-run"] })
  const verb = values["dry-run"] ? "plan " : "ok   "
  console.log(`${verb} ${image} → ${target}`)
  for (const ref of refs)
    console.log(`      ${ref.file}: ${ref.ref} → ${ref.next}`)
  if (refs.length === 0) console.log("      ningún archivo citaba la imagen")
  if (!values["dry-run"] && path.normalize(image).startsWith("public")) {
    console.log(
      "      la URL pública cambió: si ya estaba publicada, agrega una redirección 301 (skill agregar-redireccion)",
    )
  }
} catch (error) {
  console.error(`FAIL  ${error.message}`)
  process.exit(1)
}
