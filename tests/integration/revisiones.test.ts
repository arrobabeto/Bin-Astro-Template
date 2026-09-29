/**
 * Cada revisión automática detecta el error que promete detectar, y deja
 * pasar el caso correcto. Se prueban sobre una copia temporal del repo.
 */
import YAML from "yaml"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { createWorkspace, type Workspace } from "./workspace"

let ws: Workspace

beforeEach(() => {
  ws = createWorkspace()
})

afterEach(() => ws.remove())

const FAQ_SECTION = `
  - type: faq
    id: precios
    heading: Preguntas sobre precios
    items:
      - question: ¿Cuánto cuesta un sitio de cinco páginas?
        answer: Depende del contenido; te enviamos una propuesta sin costo.
`

describe("Historia: como editor agrego una sección y Binflow se entera", () => {
  it("check:bsi detecta el inventario desactualizado y bsi:sync lo corrige", () => {
    ws.edit("src/content/pages/es/index.yaml", (yaml) => yaml + FAQ_SECTION)

    const before = ws.run("scripts/check-bsi.mjs")
    expect(before.status).not.toBe(0)
    expect(before.output).toMatch(/home\.precios/)

    expect(ws.run("scripts/bsi-sync.mjs").status).toBe(0)
    const ids = YAML.parse(
      ws.read("binflow/surface-inventory.yaml"),
    ).surfaces.map((row: { bf_id: string }) => row.bf_id)
    expect(ids).toEqual(
      expect.arrayContaining(["home.precios.shell", "home.precios.heading"]),
    )
    // Los campos opcionales ausentes no generan filas.
    expect(ids).not.toContain("home.precios.intro")
    expect(ws.run("scripts/check-bsi.mjs").status).toBe(0)
  })

  it("renombrar el id de una sección sin sincronizar rompe check:bsi", () => {
    ws.edit("src/content/pages/es/index.yaml", (yaml) =>
      yaml.replace("id: como-disenar", "id: lo-que-hacemos"),
    )
    expect(ws.run("scripts/check-bsi.mjs").status).not.toBe(0)
  })

  it("bsi:sync conserva las notas escritas a mano", () => {
    ws.edit("binflow/surface-inventory.yaml", (yaml) => {
      const doc = YAML.parse(yaml)
      const row = doc.surfaces.find(
        (item: { bf_id: string }) => item.bf_id === "home.hero.heading",
      )
      row.notes = "Nota manual: revisar con el cliente"
      return YAML.stringify(doc)
    })
    ws.run("scripts/bsi-sync.mjs")
    expect(ws.read("binflow/surface-inventory.yaml")).toContain(
      "Nota manual: revisar con el cliente",
    )
  })
})

describe("Protecciones del contenido", () => {
  it("check:placeholders bloquea texto de relleno", () => {
    ws.edit("src/content/pages/es/index.yaml", (yaml) =>
      yaml.replace(
        "heading: Dos formas de diseñar tu sitio",
        "heading: Lorem ipsum dolor sit amet",
      ),
    )
    const result = ws.run("scripts/check-content-placeholders.mjs")
    expect(result.status).not.toBe(0)
    expect(result.output).toMatch(/index\.yaml/)
  })

  it("check:i18n exige contenido para cada idioma activo", () => {
    ws.edit("src/config/locales.ts", (ts) =>
      ts.replace(
        'ENABLED_LOCALES: readonly Locale[] = ["es"]',
        'ENABLED_LOCALES: readonly Locale[] = ["es", "en"]',
      ),
    )
    const result = ws.run("scripts/check-i18n.mjs")
    expect(result.status).not.toBe(0)
    expect(result.output).toMatch(/src\/content\/site\/en\.yaml/)
  })

  it("check:assets rechaza una imagen demasiado pesada en public/", () => {
    ws.write("public/foto-enorme.jpg", "x".repeat(500 * 1024))
    const result = ws.run("scripts/check-asset-budget.mjs")
    expect(result.status).not.toBe(0)
    expect(result.output).toMatch(/foto-enorme\.jpg/)
  })
})

describe("Protecciones del código", () => {
  it("check:sections detecta un campo sin marcador BSI", () => {
    ws.edit("src/components/sections/SectionCta.astro", (astro) =>
      astro.replace('{...bf(area, id, "body", "copy")}', ""),
    )
    const result = ws.run("scripts/check-section-contracts.mjs")
    expect(result.status).not.toBe(0)
    expect(result.output).toMatch(/SectionCta/)
  })

  it("check:sections detecta un kind distinto al declarado", () => {
    ws.edit("src/components/sections/SectionCta.astro", (astro) =>
      astro.replace('"body", "copy"', '"body", "style_target"'),
    )
    expect(ws.run("scripts/check-section-contracts.mjs").status).not.toBe(0)
  })

  it("check:headers exige las cabeceras de seguridad", () => {
    ws.edit("vercel.json", (json) =>
      json.replace('"Strict-Transport-Security"', '"X-Otra-Cabecera"'),
    )
    const result = ws.run("scripts/check-headers.mjs")
    expect(result.status).not.toBe(0)
    expect(result.output).toMatch(/falta strict-transport-security/i)
  })

  it("check:node detecta versiones de Node desalineadas", () => {
    ws.write(".nvmrc", "22\n")
    expect(ws.run("scripts/check-node-pin.mjs").status).not.toBe(0)
  })
})

describe("Protecciones de documentación y skills", () => {
  it("check:docs detecta una ruta citada que no existe", () => {
    ws.edit(
      "docs/guias/contenido.md",
      (md) => `${md}\nVer \`src/lib/no-existe.ts\`.\n`,
    )
    const result = ws.run("scripts/check-doc-references.mjs")
    expect(result.status).not.toBe(0)
    expect(result.output).toMatch(/src\/lib\/no-existe\.ts/)
  })

  it("check:docs acepta rutas declaradas como ejemplo", () => {
    ws.edit(
      "docs/guias/contenido.md",
      (md) =>
        `${md}\n<!-- check:docs ejemplos: src/lib/ejemplo.ts -->\nVer \`src/lib/ejemplo.ts\`.\n`,
    )
    expect(ws.run("scripts/check-doc-references.mjs").status).toBe(0)
  })

  it("check:skills exige registrar una skill nueva en el inventario", () => {
    ws.write(
      "skills/mi-skill/SKILL.md",
      "---\nname: mi-skill\ndescription: Skill de prueba para verificar que el inventario sea obligatorio.\n---\n\n# Mi skill\n",
    )
    const result = ws.run("scripts/check-skills.mjs")
    expect(result.status).not.toBe(0)
    expect(result.output).toMatch(/mi-skill/)
  })

  it("check:skills detecta cambios en una skill de terceros", () => {
    ws.edit("skills/hallmark/SKILL.md", (md) => `${md}\n<!-- editado -->\n`)
    const result = ws.run("scripts/check-skills.mjs")
    expect(result.status).not.toBe(0)
    expect(result.output).toMatch(/hallmark/)
  })
})
