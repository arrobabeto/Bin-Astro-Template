/**
 * Historias de usuario de las skills `optimizar-imagenes` y `seo-imagenes`:
 *   - "Subí una foto pesada con nombre de cámara; quiero que quede ligera, con
 *     un nombre descriptivo y que el sitio siga compilando."
 *   - "Quiero agregar un pie de foto y que Binflow pueda editarlo."
 */
import fs from "node:fs"
import sharp from "sharp"
import YAML from "yaml"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { createWorkspace, type Workspace } from "./workspace"

const HOME = "src/content/pages/es/index.yaml"
const OPTIMIZE = "skills/optimizar-imagenes/scripts/optimizar-imagen.mjs"
const RENAME = "skills/seo-imagenes/scripts/renombrar-imagen.mjs"
const AUDIT = "skills/seo-imagenes/scripts/auditar-imagenes.mjs"

/** Foto sintética del tamaño de una cámara: degradados, formas y textura suave. */
async function cameraPhoto(file: string) {
  const width = 3000
  const height = 2000
  const pixels = Buffer.alloc(width * height * 3)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 3
      const texture = Math.sin(x / 9) * Math.cos(y / 13) * 6
      const sun = Math.hypot(x - 2100, y - 600) < 300 ? 70 : 0
      pixels[i] = Math.min(255, (x / width) * 160 + 40 + texture + sun)
      pixels[i + 1] = Math.min(255, (y / height) * 140 + 50 + texture + sun)
      pixels[i + 2] = Math.min(255, 150 + Math.sin(x / 120) * 50 + texture)
    }
  }
  await sharp(pixels, { raw: { width, height, channels: 3 } })
    .jpeg({ quality: 95 })
    .toFile(file)
}

describe("imágenes: optimizar, renombrar y pie de foto", () => {
  let ws: Workspace

  beforeAll(async () => {
    ws = createWorkspace()
    await cameraPhoto(ws.file("src/assets/images/IMG_2041.jpg"))
    ws.edit(HOME, (yaml) =>
      yaml.replace("assets/images/demo-hero.jpg", "assets/images/IMG_2041.jpg"),
    )
  })

  afterAll(() => ws.remove())

  it("la auditoría detecta el nombre de cámara", () => {
    const result = ws.run(AUDIT)
    expect(result.status, result.output).toBe(0)
    expect(result.output).toMatch(/IMG_2041\.jpg[\s\S]*✗ nombre/)
    expect(result.output).toMatch(/demo-hero\.jpg[\s\S]*ningún archivo la usa/)
  })

  it("optimiza a AVIF sin agrandar, sin pérdida visible y actualiza la cita", async () => {
    const before = fs.statSync(ws.file("src/assets/images/IMG_2041.jpg")).size
    const result = ws.run(OPTIMIZE, [
      "src/assets/images/IMG_2041.jpg",
      "--replace",
    ])
    expect(result.status, result.output).toBe(0)
    expect(result.output).toMatch(/SSIM 0\.9[89]/)

    expect(ws.exists("src/assets/images/IMG_2041.jpg")).toBe(false)
    const avif = ws.file("src/assets/images/IMG_2041.avif")
    const meta = await sharp(avif).metadata()
    expect(meta.width).toBe(2400)
    expect(fs.statSync(avif).size).toBeLessThan(before / 3)
    expect(ws.read(HOME)).toContain("../../../assets/images/IMG_2041.avif")
  })

  it("no vuelve a comprimir una imagen ya optimizada", () => {
    const result = ws.run(OPTIMIZE, [
      "src/assets/images/IMG_2041.avif",
      "--replace",
    ])
    expect(result.status, result.output).toBe(0)
    expect(result.output).toMatch(/ya estaba optimizada/)
  })

  it("avisa si el original es pequeño en vez de agrandarlo", async () => {
    await sharp({
      create: { width: 640, height: 480, channels: 3, background: "#336699" },
    })
      .jpeg()
      .toFile(ws.file("src/assets/images/miniatura-pequena.jpg"))
    const result = ws.run(OPTIMIZE, ["src/assets/images/miniatura-pequena.jpg"])
    expect(result.output).toMatch(/640x480/)
    expect(result.output).toMatch(/se verá pixelada/)
    fs.rmSync(ws.file("src/assets/images/miniatura-pequena.jpg"))
    fs.rmSync(ws.file("src/assets/images/miniatura-pequena.avif"))
  })

  it("rechaza un nombre que no describe la imagen", () => {
    const result = ws.run(RENAME, [
      "src/assets/images/IMG_2041.avif",
      "foto final",
    ])
    expect(result.status).toBe(1)
    expect(result.output).toMatch(/no es un buen nombre/)
  })

  it("renombra con un nombre SEO y corrige la cita", () => {
    const result = ws.run(RENAME, [
      "src/assets/images/IMG_2041.avif",
      "Degradado de colores cálidos sobre fondo azul",
    ])
    expect(result.status, result.output).toBe(0)
    const name = "degradado-de-colores-calidos-sobre-fondo-azul.avif"
    expect(ws.exists(`src/assets/images/${name}`)).toBe(true)
    expect(ws.read(HOME)).toContain(`../../../assets/images/${name}`)
  })

  it("el pie de foto se publica y Binflow lo puede editar", () => {
    ws.edit(HOME, (yaml) => {
      const page = YAML.parseDocument(yaml)
      page.setIn(
        ["sections", 0, "image", "caption"],
        "Foto: archivo del estudio.",
      )
      return page.toString()
    })
    expect(ws.run("scripts/bsi-sync.mjs").status).toBe(0)
    const inventory = YAML.parse(ws.read("binflow/surface-inventory.yaml"))
    const caption = inventory.surfaces.find(
      (row: { bf_id: string }) => row.bf_id === "home.hero.caption",
    )
    expect(caption).toMatchObject({
      kind: "copy",
      locator: `github:${HOME}#sections.hero.image.caption`,
      sample: "Foto: archivo del estudio.",
    })

    const build = ws.build()
    expect(build.status, build.output).toBe(0)
    const html = ws.read(".vercel/output/static/index.html")
    expect(html).toMatch(
      /<figcaption[^>]*data-bf-id="home\.hero\.caption"[^>]*>\s*Foto: archivo del estudio\.\s*<\/figcaption>/,
    )
    expect(html).toMatch(
      /degradado-de-colores-calidos-sobre-fondo-azul\.[\w-]+\.webp/,
    )

    for (const check of [
      "scripts/check-bsi.mjs",
      "scripts/check-asset-budget.mjs",
    ]) {
      const result = ws.run(check)
      expect(result.status, `${check}\n${result.output}`).toBe(0)
    }
  })
})
