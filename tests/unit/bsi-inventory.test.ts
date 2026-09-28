import { describe, expect, it } from "vitest"

import { generateSurfaces } from "../../scripts/lib/bsi.mjs"

type Surface = { bf_id: string; kind: string; locator: string; section: string }

const surfaces = generateSurfaces() as Surface[]

describe("inventario BSI generado", () => {
  it("tiene bf_id únicos", () => {
    const ids = surfaces.map((row) => row.bf_id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("nunca usa índices sections[n]", () => {
    for (const row of surfaces)
      expect(row.locator).not.toMatch(/sections\[\d+\]/)
  })

  it("cada sección de página tiene su contenedor", () => {
    const sections = new Set(
      surfaces
        .filter((row) => !row.bf_id.startsWith("chrome."))
        .map((row) => `${row.bf_id.split(".")[0]}.${row.section}`),
    )
    for (const key of sections) {
      expect(surfaces.some((row) => row.bf_id === `${key}.shell`)).toBe(true)
    }
  })

  it("incluye el chrome del footer", () => {
    expect(surfaces.some((row) => row.bf_id === "chrome.footer.tagline")).toBe(
      true,
    )
  })
})
