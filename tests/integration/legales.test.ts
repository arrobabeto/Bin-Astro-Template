/**
 * Historias de la skill textos-legales: el inventario detecta lo que el sitio
 * usa, el banner de cookies solo aparece con rastreo y los textos con revisión
 * pendiente se señalan.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { createWorkspace, type Workspace } from "./workspace"

const OUT = ".vercel/output/static"
const META_PIXEL = "123456789012345"
const GA4 = "G-ABC123XYZ9"

/** La copia arrastra el .env local; se reemplaza para no depender de él. */
const NO_TRACKERS = {
  PUBLIC_GTM_ID: "",
  PUBLIC_GA4_ID: "",
  PUBLIC_GOOGLE_ADS_ID: "",
  PUBLIC_META_PIXEL_ID: "",
  PUBLIC_TIKTOK_PIXEL_ID: "",
  VERCEL_ENV: "",
  NOINDEX: "",
}

describe("Historia: el agente revisa qué datos recaba el sitio", () => {
  let ws: Workspace

  beforeAll(() => {
    ws = createWorkspace()
  })

  afterAll(() => ws.remove())

  it("el inventario detecta formularios, medición y píxeles configurados", () => {
    ws.write(
      ".env",
      [
        "PUBLIC_FORMS_PROVIDER=web3forms",
        `PUBLIC_GA4_ID=${GA4}`,
        `PUBLIC_META_PIXEL_ID=${META_PIXEL}`,
      ].join("\n"),
    )
    const result = ws.run(
      "skills/textos-legales/scripts/inventario-datos.mjs",
      ["--json"],
    )
    expect(result.status, result.output).toBe(0)
    const report = JSON.parse(result.output)
    expect(report.formularioContacto.activo).toBe(true)
    expect(report.formularioContacto.campos).toEqual(
      expect.arrayContaining(["name", "email", "message"]),
    )
    expect(
      report.rastreo.map((item: { variable: string }) => item.variable),
    ).toEqual(expect.arrayContaining(["PUBLIC_GA4_ID", "PUBLIC_META_PIXEL_ID"]))
    expect(report.consentimiento.mode).toBe("opt-in")
    expect(report.textosLegales.length).toBeGreaterThan(0)
  })

  it("check:placeholders avisa de los textos legales pendientes de revisión", () => {
    ws.edit("src/content/legal/es/privacidad.md", (md) =>
      md.replace(
        /^---\n([\s\S]*?)\n---\n/,
        "---\n$1\n---\n\n<!-- bin-astro-template:legal-revision-pendiente -->\n",
      ),
    )
    ws.write("template.lock.json", "{}")
    const result = ws.run("scripts/check-content-placeholders.mjs")
    expect(result.output).toMatch(
      /privacidad\.md:\d+: texto legal pendiente de revisión profesional/,
    )
  })
})

describe("Historia: el cliente activa el píxel de Meta", () => {
  let ws: Workspace

  beforeAll(() => {
    ws = createWorkspace()
    ws.write(".env", "")
    const build = ws.build({
      ...NO_TRACKERS,
      PUBLIC_GA4_ID: GA4,
      PUBLIC_META_PIXEL_ID: META_PIXEL,
    })
    if (build.status !== 0) throw new Error(build.output)
  })

  afterAll(() => ws.remove())

  it("el sitio muestra el banner y no carga el píxel antes de aceptar", () => {
    const html = ws.read(`${OUT}/index.html`)
    expect(html).toContain("data-consent-banner")
    expect(html).toContain("data-consent-config")
    expect(html).toContain(META_PIXEL)
    expect(html).toContain('id="consent-analytics"')
    expect(html).toContain('id="consent-marketing"')
    expect(html).toContain("data-consent-open")
    expect(html).not.toMatch(/<script[^>]+src="[^"]*fbevents\.js/)
    expect(html).not.toMatch(/<script[^>]+src="[^"]*googletagmanager/)
  })

  it("las revisiones del sitio publicado siguen pasando", () => {
    for (const script of [
      "scripts/check-bsi.mjs",
      "scripts/check-seo.mjs",
      "scripts/check-headers.mjs",
    ]) {
      const result = ws.run(script)
      expect(result.status, `${script}\n${result.output}`).toBe(0)
    }
  })
})

describe("Historia: un sitio sin medición no tiene banner", () => {
  let ws: Workspace

  beforeAll(() => {
    ws = createWorkspace()
    ws.write(".env", "")
    const build = ws.build(NO_TRACKERS)
    if (build.status !== 0) throw new Error(build.output)
  })

  afterAll(() => ws.remove())

  it("no hay banner, ni configuración, ni enlace para configurar cookies", () => {
    const html = ws.read(`${OUT}/index.html`)
    expect(html).not.toContain("data-consent-banner")
    expect(html).not.toContain("data-consent-config")
    expect(html).not.toContain("data-consent-open")
  })
})
