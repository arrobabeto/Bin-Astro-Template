#!/usr/bin/env node
/**
 * Copia PNG temporal (máx. 1200 px) de una imagen para poder verla con
 * herramientas que no abren AVIF. No modifica el original.
 *
 * Uso:
 *   node skills/seo-imagenes/scripts/vista-previa.mjs <imagen>
 */
import os from "node:os"
import path from "node:path"
import sharp from "sharp"

const [image] = process.argv.slice(2)
if (!image) {
  console.error("Uso: vista-previa.mjs <imagen>")
  process.exit(1)
}

const output = path.join(os.tmpdir(), `vista-${path.parse(image).name}.png`)
await sharp(image)
  .rotate()
  .resize({ width: 1200, withoutEnlargement: true })
  .png()
  .toFile(output)
console.log(output)
