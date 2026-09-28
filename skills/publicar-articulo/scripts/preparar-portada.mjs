#!/usr/bin/env node
/**
 * Convierte una portada a AVIF 1600x1000 (16:10) y la compara con las
 * portadas existentes para evitar imágenes casi iguales.
 *
 * Uso:
 *   node skills/publicar-articulo/scripts/preparar-portada.mjs \
 *     --input <imagen> --output src/assets/articulos/<slug>.avif \
 *     [--compare-dir src/assets/articulos] [--threshold 0.9]
 *
 * Similitud: hash de diferencias (dHash 16x16) combinado con un histograma de
 * color. 1 = idénticas. Falla si alguna supera el umbral (0.9 por defecto).
 */
import fs from "node:fs"
import path from "node:path"
import { parseArgs } from "node:util"
import sharp from "sharp"

const { values } = parseArgs({
  options: {
    input: { type: "string" },
    output: { type: "string" },
    "compare-dir": { type: "string" },
    threshold: { type: "string", default: "0.9" },
    width: { type: "string", default: "1600" },
  },
})

if (!values.input || !values.output) {
  console.error(
    "Uso: --input <imagen> --output <destino.avif> [--compare-dir <carpeta>]",
  )
  process.exit(1)
}
if (!values.output.endsWith(".avif")) {
  console.error("El destino debe terminar en .avif")
  process.exit(1)
}
if (path.resolve(values.input) === path.resolve(values.output)) {
  console.error("No sobrescribas el original: usa otro destino.")
  process.exit(1)
}

const width = Number(values.width)
const height = Math.round((width * 10) / 16)
const threshold = Number(values.threshold)

async function dHash(file) {
  const { data } = await sharp(file)
    .grayscale()
    .resize(17, 16, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true })
  const bits = []
  for (let row = 0; row < 16; row++) {
    for (let col = 0; col < 16; col++) {
      bits.push(data[row * 17 + col] > data[row * 17 + col + 1])
    }
  }
  return bits
}

async function histogram(file) {
  const { data } = await sharp(file)
    .removeAlpha()
    .resize(32, 32, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true })
  const bins = new Array(64).fill(0)
  for (let i = 0; i < data.length; i += 3) {
    bins[(data[i] >> 6) * 16 + (data[i + 1] >> 6) * 4 + (data[i + 2] >> 6)] += 1
  }
  const total = data.length / 3
  return bins.map((count) => count / total)
}

async function fingerprint(file) {
  return { hash: await dHash(file), hist: await histogram(file) }
}

function similarity(a, b) {
  const same =
    a.hash.filter((bit, i) => bit === b.hash[i]).length / a.hash.length
  const overlap = a.hist.reduce(
    (sum, value, i) => sum + Math.min(value, b.hist[i]),
    0,
  )
  return 0.7 * same + 0.3 * overlap
}

fs.mkdirSync(path.dirname(values.output), { recursive: true })
await sharp(values.input)
  .rotate()
  .resize(width, height, { fit: "cover", position: "attention" })
  .avif({ quality: 55, effort: 6 })
  .toFile(values.output)

const { size } = fs.statSync(values.output)
const meta = await sharp(values.output).metadata()
console.log(
  // sharp reporta AVIF como "heif" (es el contenedor).
  `ok    ${values.output}: ${meta.width}x${meta.height} ${meta.format === "heif" ? "avif" : meta.format}, ${Math.round(size / 1024)} KB`,
)
if (size > 250 * 1024)
  console.warn(
    "warn  la portada pesa más de 250 KB; baja la calidad o simplifica la imagen",
  )

const dir = values["compare-dir"]
if (dir && fs.existsSync(dir)) {
  const candidate = await fingerprint(values.output)
  const others = fs
    .readdirSync(dir)
    .filter((name) => /\.(avif|webp|jpe?g|png)$/i.test(name))
    .map((name) => path.join(dir, name))
    .filter((file) => path.resolve(file) !== path.resolve(values.output))

  if (others.length === 0) {
    console.log("ok    no hay portadas previas con qué comparar")
    process.exit(0)
  }

  const ranked = []
  for (const file of others) {
    ranked.push({ file, score: similarity(candidate, await fingerprint(file)) })
  }
  ranked.sort((a, b) => b.score - a.score)

  console.log("\nSimilitud con portadas existentes (1 = idéntica):")
  for (const { file, score } of ranked.slice(0, 5)) {
    console.log(`  ${score.toFixed(3)}  ${file}`)
  }
  const tooClose = ranked.filter(({ score }) => score >= threshold)
  if (tooClose.length > 0) {
    console.error(
      `\nFAIL  la portada se parece demasiado a ${tooClose[0].file} (${tooClose[0].score.toFixed(3)} ≥ ${threshold}). Genera otra con una dirección visual distinta.`,
    )
    fs.rmSync(values.output)
    process.exit(1)
  }
  console.log("\nok    portada suficientemente distinta")
}
