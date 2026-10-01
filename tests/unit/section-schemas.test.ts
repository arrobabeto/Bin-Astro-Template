/**
 * Reglas del contenido de las páginas: lo que un editor (persona, agente o
 * Binflow) puede y no puede escribir en `sections`.
 */
import type { SchemaContext } from "astro:content"
import { z } from "astro/zod"
import { describe, expect, it } from "vitest"

import { sectionsSchema } from "~/components/sections/registry"
import { SECTION_BSI_FIELDS } from "~/lib/bsi-fields"

const ctx = { image: () => z.string() } as unknown as SchemaContext
const schema = sectionsSchema(ctx)

function errors(sections: unknown[]): string[] {
  const result = schema.safeParse(sections)
  return result.success ? [] : result.error.issues.map((issue) => issue.message)
}

const hero = {
  type: "hero",
  id: "hero",
  heading: "Sitios web listos para crecer",
}

describe("sections", () => {
  it("acepta una página válida con todos los tipos", () => {
    const page = [
      {
        ...hero,
        image: { src: "hero.jpg", alt: "Portada" },
        cta: { label: "Contacto", href: "#contacto" },
      },
      {
        type: "features",
        id: "servicios",
        heading: "Servicios",
        items: [{ title: "Diseño", body: "A la medida" }],
      },
      {
        type: "split",
        id: "nosotros",
        heading: "Nosotros",
        body: "Texto",
        image: { src: "equipo.jpg", alt: "El equipo" },
      },
      {
        type: "faq",
        id: "preguntas",
        heading: "Preguntas",
        items: [{ question: "¿Qué?", answer: "Esto." }],
      },
      { type: "prose", id: "texto", body: "Un párrafo." },
      {
        type: "cta",
        id: "cta",
        heading: "¿Listo?",
        cta: { label: "Escríbenos", href: "mailto:hola@ejemplo.mx" },
      },
      { type: "contact", id: "contacto", heading: "Contáctanos" },
      { type: "newsletter", id: "boletin", heading: "Suscríbete" },
    ]
    expect(errors(page)).toEqual([])
  })

  it("el registro cubre exactamente los tipos con campos BSI", () => {
    const types = schema.element.options.map(
      (option) => option.shape.type.value,
    )
    expect(types.sort()).toEqual(Object.keys(SECTION_BSI_FIELDS).sort())
  })

  it("una página necesita al menos una sección", () => {
    expect(errors([])).toContain("La página necesita al menos una sección.")
  })

  it("el id debe ser kebab-case", () => {
    expect(errors([{ ...hero, id: "Mi Hero" }])[0]).toMatch(/kebab-case/)
  })

  it("no permite ids repetidos en la misma página", () => {
    expect(errors([hero, { ...hero }])[0]).toMatch(/repetido/)
  })

  it("toda imagen necesita alt", () => {
    expect(
      errors([{ ...hero, image: { src: "hero.jpg", alt: " " } }])[0],
    ).toMatch(/alt/)
  })

  it("el pie de foto es opcional pero no puede ir vacío", () => {
    const image = { src: "hero.jpg", alt: "Portada del sitio" }
    expect(
      errors([{ ...hero, image: { ...image, caption: "Foto: Ana Ruiz." } }]),
    ).toEqual([])
    expect(errors([{ ...hero, image: { ...image, caption: " " } }])[0]).toMatch(
      /vacío/,
    )
  })

  it("los enlaces solo aceptan rutas, anclas, https, mailto o tel", () => {
    expect(
      errors([
        { ...hero, cta: { label: "X", href: "javascript:alert(1)" } },
      ])[0],
    ).toMatch(/El enlace debe empezar/)
    expect(
      errors([{ ...hero, cta: { label: "X", href: "tel:+528112345678" } }]),
    ).toEqual([])
  })

  it("los textos no pueden ir vacíos", () => {
    expect(errors([{ ...hero, heading: "   " }])[0]).toMatch(/vacío/)
  })

  it("las listas necesitan al menos un elemento", () => {
    expect(
      errors([{ type: "faq", id: "faq", heading: "Preguntas", items: [] }])[0],
    ).toMatch(/al menos una pregunta/)
  })

  it("rechaza un tipo de sección desconocido", () => {
    expect(errors([{ type: "precios", id: "precios" }])).not.toEqual([])
  })

  it("imagePosition de split vale right por defecto", () => {
    const result = schema.parse([
      {
        type: "split",
        id: "nosotros",
        heading: "Nosotros",
        body: "Texto",
        image: { src: "x.jpg", alt: "X" },
      },
    ])
    expect(result[0]).toMatchObject({ imagePosition: "right" })
  })
})
