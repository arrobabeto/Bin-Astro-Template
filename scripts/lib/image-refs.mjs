/**
 * Referencias a imágenes del proyecto: encuentra qué archivos citan una imagen
 * y las actualiza al renombrarla o convertirla de formato. Lo usan las skills
 * `optimizar-imagenes` y `seo-imagenes`.
 *
 * Formas de citar que reconoce (todas resueltas contra la imagen real):
 *   ../../../assets/images/foto.jpg   relativa al archivo (YAML, Markdown)
 *   ~/assets/images/foto.jpg          alias de src/ (componentes)
 *   /src/assets/images/foto.jpg       desde la raíz del proyecto
 *   /images/foto.webp                 URL pública de un archivo de public/
 */
import fs from "node:fs"
import path from "node:path"

import { walk } from "./output.mjs"

export const IMAGE_FILE = /\.(avif|webp|jpe?g|png|gif|svg)$/i
const TEXT_FILE = /\.(ya?ml|md|mdx|astro|ts|tsx|mjs|js|json|webmanifest|css)$/i
const SEARCH_ROOTS = ["src", "public"]

const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
const normalize = (file) => path.normalize(file).split(path.sep).join("/")
const toPosix = (file) => file.split(path.sep).join("/")

/** Ruta del proyecto a la que apunta `ref` escrito dentro de `file`. */
function resolveRef(ref, file) {
  if (ref.startsWith("~/")) return normalize(path.join("src", ref.slice(2)))
  if (ref.startsWith("/src/")) return normalize(ref.slice(1))
  if (ref.startsWith("/")) return normalize(path.join("public", ref))
  return normalize(path.join(path.dirname(file), ref))
}

/** Escribe la ruta de `target` con el mismo estilo que tenía `ref`. */
function formatRef(ref, file, target) {
  if (ref.startsWith("~/")) return `~/${toPosix(path.relative("src", target))}`
  if (ref.startsWith("/src/")) return `/${toPosix(target)}`
  if (ref.startsWith("/")) return `/${toPosix(path.relative("public", target))}`
  const relative = toPosix(path.relative(path.dirname(file), target))
  return ref.startsWith(".") && !relative.startsWith(".")
    ? `./${relative}`
    : relative
}

/**
 * Lista las citas a `image` (ruta relativa a la raíz del proyecto) en los
 * archivos de texto de src/ y public/.
 * @returns {{ file: string, index: number, ref: string }[]}
 */
export function findImageReferences(image) {
  const target = normalize(image)
  const name = escape(path.basename(target))
  const pattern = new RegExp(`[\\w./~@-]*${name}(?![\\w.-])`, "g")
  const refs = []
  for (const root of SEARCH_ROOTS) {
    for (const file of walk(root)) {
      if (!TEXT_FILE.test(file)) continue
      const text = fs.readFileSync(file, "utf8")
      for (const match of text.matchAll(pattern)) {
        if (resolveRef(match[0], file) === target) {
          refs.push({
            file: normalize(file),
            index: match.index,
            ref: match[0],
          })
        }
      }
    }
  }
  return refs
}

/** Palabras que no describen nada: delatan nombres de cámara o de trabajo. */
const GENERIC_WORDS = new Set([
  "img",
  "image",
  "imagen",
  "foto",
  "photo",
  "pic",
  "picture",
  "banner",
  "screenshot",
  "captura",
  "pantalla",
  "dsc",
  "dscn",
  "dcim",
  "pxl",
  "whatsapp",
  "final",
  "copia",
  "copy",
  "nuevo",
  "nueva",
  "new",
  "edit",
  "editado",
  "untitled",
  "sin",
  "titulo",
  "download",
  "descarga",
  "file",
  "archivo",
  "test",
  "prueba",
])
const MAX_NAME = 60

/**
 * Nombre de archivo SEO a partir de un texto libre: minúsculas, sin acentos,
 * palabras separadas por guiones y como máximo 60 caracteres (sin cortar
 * palabras).
 */
export function seoSlug(text) {
  const slug = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  if (slug.length <= MAX_NAME) return slug
  return slug.slice(0, MAX_NAME + 1).replace(/-[^-]*$/, "")
}

/** Problemas del nombre de un archivo de imagen (sin extensión) para SEO. */
export function imageNameIssues(file) {
  const name = path.parse(file).name
  const issues = []
  if (name !== seoSlug(name)) {
    issues.push(
      "usa minúsculas, sin acentos ni espacios, y guiones entre palabras",
    )
  }
  const words = seoSlug(name).split("-").filter(Boolean)
  const meaningful = words.filter(
    (word) => !GENERIC_WORDS.has(word) && !/^\d+$/.test(word),
  )
  if (meaningful.length < 2) {
    issues.push(
      "describe el contenido con al menos dos palabras significativas",
    )
  }
  if (words.some((word) => /^\d{3,}$/.test(word) || /\d{4,}/.test(word))) {
    issues.push("quita números de cámara, fechas o contadores")
  }
  if (name.length > MAX_NAME) issues.push(`máximo ${MAX_NAME} caracteres`)
  return issues
}

/** Problemas de un texto alternativo para accesibilidad y SEO. */
export function altIssues(alt, file) {
  const text = (alt ?? "").trim()
  if (!text) return ["falta el alt"]
  const issues = []
  if (text.length < 15)
    issues.push("es demasiado corto para describir la imagen")
  if (text.length > 150)
    issues.push("pasa de 150 caracteres: muévelo al caption")
  if (
    /^(imagen|foto|fotograf[ií]a|image|picture|photo)\s+(de|del|of)\b/i.test(
      text,
    )
  ) {
    issues.push('no empieces con "imagen de" o "foto de"')
  }
  if (file && seoSlug(text) === seoSlug(path.parse(file).name)) {
    issues.push("repite el nombre del archivo en vez de describir la imagen")
  }
  return issues
}

/**
 * Mueve una imagen y actualiza todas sus citas. Con `dryRun` solo reporta.
 * @returns {{ file: string, ref: string, next: string }[]} citas actualizadas
 */
export function moveImage(from, to, { dryRun = false } = {}) {
  const source = normalize(from)
  const target = normalize(to)
  if (!fs.existsSync(source)) throw new Error(`No existe ${source}.`)
  if (source === target) throw new Error("El origen y el destino son iguales.")
  if (fs.existsSync(target)) throw new Error(`Ya existe ${target}.`)

  const refs = findImageReferences(source).map((ref) => ({
    ...ref,
    next: formatRef(ref.ref, ref.file, target),
  }))
  if (dryRun) return refs

  const byFile = Map.groupBy(refs, (ref) => ref.file)
  for (const [file, fileRefs] of byFile) {
    let text = fs.readFileSync(file, "utf8")
    for (const ref of fileRefs.toSorted((a, b) => b.index - a.index)) {
      text =
        text.slice(0, ref.index) +
        ref.next +
        text.slice(ref.index + ref.ref.length)
    }
    fs.writeFileSync(file, text)
  }
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.renameSync(source, target)
  return refs
}
