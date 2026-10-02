#!/usr/bin/env node
/**
 * Optimiza imágenes para web sin pérdida visible: corrige la orientación,
 * limita el ancho (nunca agranda), quita metadatos (GPS, cámara) y busca la
 * calidad más baja cuyo resultado sigue siendo visualmente igual al original
 * (SSIM ≥ --min-ssim, 1 = idéntica).
 *
 * Uso:
 *   node skills/optimizar-imagenes/scripts/optimizar-imagen.mjs <archivo|carpeta>... \
 *     [--format avif|webp|jpg] [--max-width <px>] [--min-width 1200] \
 *     [--min-ssim <0-1>] [--lossless] [--preview] [--replace] [--dry-run]
 *
 * Valores por defecto según dónde vive la imagen (ver
 * docs/adr/0010-formatos-de-imagen.md):
 *   src/assets/…   AVIF, máx. 2400 px, SSIM ≥ 0.98: es el original del que
 *                  Astro genera los WebP publicados, así que guarda margen.
 *   public/…       WebP, máx. 1600 px, SSIM ≥ 0.975: se sirve tal cual.
 *   og-*.…         JPG, máx. 1200 px: las redes sociales no leen AVIF de forma
 *                  fiable.
 *
 * --preview guarda un recorte al 100 % (original | optimizada) en la carpeta
 * temporal del sistema para revisar a ojo que no haya pixelado ni bandas.
 *
 * Sin --replace escribe el archivo nuevo junto al original. Con --replace
 * actualiza las citas en src/ y public/ y borra el original.
 */
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { parseArgs } from "node:util"
import sharp from "sharp"

import { moveImage } from "../../../scripts/lib/image-refs.mjs"

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    format: { type: "string" },
    "max-width": { type: "string" },
    "min-width": { type: "string", default: "1200" },
    "min-ssim": { type: "string" },
    lossless: { type: "boolean", default: false },
    preview: { type: "boolean", default: false },
    replace: { type: "boolean", default: false },
    "dry-run": { type: "boolean", default: false },
  },
})

const FORMATS = {
  avif: {
    ext: ".avif",
    range: [30, 90],
    encode: (s, q) => s.avif({ quality: q, effort: 4 }),
  },
  webp: {
    ext: ".webp",
    range: [50, 95],
    encode: (s, q) => s.webp({ quality: q, effort: 5, smartSubsample: true }),
  },
  jpg: {
    ext: ".jpg",
    range: [55, 95],
    encode: (s, q) => s.jpeg({ quality: q, mozjpeg: true }),
  },
}
const LOSSLESS = {
  avif: (s) => s.avif({ lossless: true, effort: 5 }),
  webp: (s) => s.webp({ lossless: true, effort: 6 }),
}

const minWidth = Number(values["min-width"])
const MIN_RECOMPRESS_GAIN = 0.2

if (positionals.length === 0) {
  console.error(
    "Uso: optimizar-imagen.mjs <archivo|carpeta>... [--format avif|webp|jpg] [--replace]",
  )
  process.exit(1)
}
if (values.format && !FORMATS[values.format]) {
  console.error(`Formato no soportado: ${values.format}. Usa avif, webp o jpg.`)
  process.exit(1)
}
if (values.lossless && values.format === "jpg") {
  console.error("JPG no tiene modo sin pérdida: usa --format webp o avif.")
  process.exit(1)
}

/** Imágenes de mapa de bits a procesar (SVG, GIF e ICO se dejan igual). */
function collect(inputs) {
  const files = []
  for (const input of inputs) {
    if (!fs.existsSync(input)) {
      console.error(`FAIL  no existe ${input}`)
      process.exit(1)
    }
    const list = fs.statSync(input).isDirectory()
      ? fs
          .readdirSync(input, { recursive: true })
          .map((name) => path.join(input, name))
      : [input]
    files.push(
      ...list.filter((file) =>
        /\.(avif|webp|jpe?g|png|tiff?|heic|heif)$/i.test(file),
      ),
    )
  }
  return files
}

function defaults(file) {
  const isPublic = path.normalize(file).split(path.sep)[0] === "public"
  const isSocial = /(^|[-_])og[-_.]/i.test(path.basename(file))
  return {
    format: isSocial ? "jpg" : isPublic ? "webp" : "avif",
    maxWidth: isSocial ? 1200 : isPublic ? 1600 : 2400,
    minSsim: isPublic ? 0.975 : 0.98,
  }
}

/** SSIM de luminancia en bloques de 8x8 (1 = idénticas). */
function ssim(a, b, width, height) {
  const C1 = (0.01 * 255) ** 2
  const C2 = (0.03 * 255) ** 2
  let total = 0
  let blocks = 0
  for (let y = 0; y + 8 <= height; y += 8) {
    for (let x = 0; x + 8 <= width; x += 8) {
      let sa = 0,
        sb = 0,
        saa = 0,
        sbb = 0,
        sab = 0
      for (let dy = 0; dy < 8; dy++) {
        for (let dx = 0; dx < 8; dx++) {
          const i = (y + dy) * width + x + dx
          sa += a[i]
          sb += b[i]
          saa += a[i] * a[i]
          sbb += b[i] * b[i]
          sab += a[i] * b[i]
        }
      }
      const ma = sa / 64,
        mb = sb / 64
      const va = saa / 64 - ma * ma,
        vb = sbb / 64 - mb * mb
      const cov = sab / 64 - ma * mb
      total +=
        ((2 * ma * mb + C1) * (2 * cov + C2)) /
        ((ma * ma + mb * mb + C1) * (va + vb + C2))
      blocks++
    }
  }
  return blocks === 0 ? 1 : total / blocks
}

const luma = (input, raw) =>
  sharp(input, raw ? { raw } : undefined)
    .flatten({ background: "#ffffff" })
    .greyscale()
    .raw()
    .toBuffer()

async function optimize(file) {
  const auto = defaults(file)
  const format = values.format ?? auto.format
  const maxWidth = Number(values["max-width"] ?? auto.maxWidth)
  const minSsim = Number(values["min-ssim"] ?? auto.minSsim)
  const spec = FORMATS[format]
  const output = path.join(path.dirname(file), path.parse(file).name + spec.ext)
  const original = fs.statSync(file).size
  const source = await sharp(file).metadata()

  const { data, info } = await sharp(file)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .toColourspace("srgb")
    .raw()
    .toBuffer({ resolveWithObject: true })
  const raw = {
    width: info.width,
    height: info.height,
    channels: info.channels,
  }
  const reference = await luma(data, raw)
  const fromRaw = () => sharp(data, { raw })

  const measure = async (buffer) =>
    ssim(reference, await luma(buffer), info.width, info.height)

  let best
  if (values.lossless) {
    const buffer = await LOSSLESS[format](fromRaw()).toBuffer()
    best = { buffer, quality: "sin pérdida", score: 1 }
  } else {
    let [low, high] = spec.range
    const top = await spec.encode(fromRaw(), high).toBuffer()
    best = { buffer: top, quality: high, score: await measure(top) }
    while (high - low > 2) {
      const quality = Math.round((low + high) / 2)
      const buffer = await spec.encode(fromRaw(), quality).toBuffer()
      const score = await measure(buffer)
      if (score >= minSsim) {
        best = { buffer, quality, score }
        high = quality
      } else low = quality
    }
  }

  if (values.preview) {
    const crop = {
      left: Math.max(0, Math.round(info.width / 2 - 400)),
      top: Math.max(0, Math.round(info.height / 2 - 300)),
      width: Math.min(800, info.width),
      height: Math.min(600, info.height),
    }
    const [before, after] = await Promise.all([
      fromRaw().extract(crop).png().toBuffer(),
      sharp(best.buffer).extract(crop).png().toBuffer(),
    ])
    const preview = path.join(
      os.tmpdir(),
      `preview-${path.parse(file).name}-${format}.png`,
    )
    await sharp({
      create: {
        width: crop.width * 2 + 16,
        height: crop.height,
        channels: 3,
        background: "#ffffff",
      },
    })
      .composite([
        { input: before, left: 0, top: 0 },
        { input: after, left: crop.width + 16, top: 0 },
      ])
      .png()
      .toFile(preview)
    console.log(
      `      vista previa al 100 % (original | optimizada): ${preview}`,
    )
  }

  const warnings = []
  if ((source.autoOrient?.width ?? source.width) < minWidth) {
    warnings.push(
      `mide ${source.width} px de ancho (< ${minWidth}): se verá pixelada si se muestra más grande; pide un original de mayor resolución`,
    )
  }
  if (best.score < minSsim) {
    warnings.push(
      `ni con calidad ${best.quality} llega a SSIM ${minSsim}; revisa la imagen a ojo o usa --lossless`,
    )
  }

  const sameFile = path.resolve(output) === path.resolve(file)
  const kb = (bytes) => `${Math.round(bytes / 1024)} KB`
  const summary = `${file} → ${output}: ${kb(original)} → ${kb(best.buffer.length)} (${Math.round((1 - best.buffer.length / original) * 100)}% menos), ${info.width}x${info.height}, ${format} calidad ${best.quality}, SSIM ${best.score.toFixed(4)}`

  // Recomprimir un archivo que ya está en su formato final suma pérdida:
  // solo vale la pena si el ahorro es grande.
  if (sameFile && best.buffer.length > original * (1 - MIN_RECOMPRESS_GAIN)) {
    console.log(
      `ok    ${file}: ya estaba optimizada (${kb(original)}); se deja igual`,
    )
    return warnings.forEach((warning) =>
      console.warn(`warn  ${file}: ${warning}`),
    )
  }

  if (values["dry-run"]) {
    console.log(`plan  ${summary}`)
  } else if (sameFile) {
    if (!values.replace) {
      console.log(
        `plan  ${summary}\n      repite con --replace para sobrescribir el original`,
      )
    } else {
      fs.writeFileSync(file, best.buffer)
      console.log(`ok    ${summary}`)
    }
  } else if (values.replace) {
    const refs = moveImage(file, output)
    fs.writeFileSync(output, best.buffer)
    console.log(`ok    ${summary}`)
    for (const ref of refs)
      console.log(`      cita actualizada en ${ref.file}: ${ref.next}`)
    if (refs.length === 0) console.log("      ningún archivo citaba la imagen")
  } else {
    if (fs.existsSync(output)) {
      console.error(`FAIL  ya existe ${output}; bórralo o usa otro formato`)
      process.exitCode = 1
      return
    }
    fs.writeFileSync(output, best.buffer)
    console.log(
      `ok    ${summary}\n      el original sigue en su lugar; con --replace se actualizan las citas y se borra`,
    )
  }
  for (const warning of warnings) console.warn(`warn  ${file}: ${warning}`)
}

const files = collect(positionals)
if (files.length === 0) console.log("ok    no hay imágenes que optimizar")
for (const file of files) await optimize(file)
