/**
 * Reglas SEO de las skills de imágenes: cómo se forma un nombre de archivo y
 * qué se considera un mal nombre o un mal texto alternativo.
 */
import { describe, expect, it } from "vitest"

import {
  altIssues,
  imageNameIssues,
  seoSlug,
} from "../../scripts/lib/image-refs.mjs"

describe("seoSlug", () => {
  it("convierte una frase en un nombre de archivo", () => {
    expect(seoSlug("Niño jugando en el Parque Fundidora")).toBe(
      "nino-jugando-en-el-parque-fundidora",
    )
    expect(seoSlug("  Café_de especialidad (prensa)  ")).toBe(
      "cafe-de-especialidad-prensa",
    )
  })

  it("no pasa de 60 caracteres y no corta palabras", () => {
    const slug = seoSlug(
      "Equipo de diseño revisando en una pantalla grande el prototipo del nuevo sitio web",
    )
    expect(slug.length).toBeLessThanOrEqual(60)
    expect(slug).toBe("equipo-de-diseno-revisando-en-una-pantalla-grande-el")
  })
})

describe("imageNameIssues", () => {
  it("acepta nombres descriptivos", () => {
    expect(
      imageNameIssues("src/assets/images/terraza-con-vista-al-mar.avif"),
    ).toEqual([])
    expect(imageNameIssues("public/og-default.jpg")).toEqual([])
  })

  it.each([
    ["IMG_2041.jpg", /minúsculas/],
    ["img-2041.jpg", /dos palabras/],
    ["foto-final.jpg", /dos palabras/],
    ["fachada-clinica-20260914.jpg", /números de cámara/],
    ["WhatsApp Image 2026-09-01.jpeg", /minúsculas/],
  ])("rechaza %s", (name, issue) => {
    expect(imageNameIssues(`src/assets/images/${name}`).join(" ")).toMatch(
      issue,
    )
  })
})

describe("altIssues", () => {
  const file = "src/assets/images/equipo-oficina.avif"

  it("acepta un alt que describe la imagen", () => {
    expect(
      altIssues(
        "Cinco integrantes del equipo conversando alrededor de una mesa",
        file,
      ),
    ).toEqual([])
  })

  it.each([
    ["", /falta/],
    ["Equipo", /corto/],
    ["Foto de el equipo trabajando en la oficina", /imagen de/],
    ["equipo oficina", /corto/],
    ["x".repeat(151), /caption/],
  ])("detecta problemas en %j", (alt, issue) => {
    expect(altIssues(alt, file).join(" ")).toMatch(issue)
  })

  it("detecta un alt que solo repite el nombre del archivo", () => {
    expect(
      altIssues(
        "Fachada de la clínica dental",
        "fachada-de-la-clinica-dental.avif",
      ).join(" "),
    ).toMatch(/nombre del archivo/)
  })
})
