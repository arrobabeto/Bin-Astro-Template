/**
 * Historias de punta a punta con build real: el contenido editado termina
 * publicado con su SEO, su inventario BSI y sus redirecciones correctos.
 */
import YAML from "yaml"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { createWorkspace, type Workspace } from "./workspace"

const OUT = ".vercel/output/static"

describe("Historia: como editor creo una página nueva y retiro una URL vieja", () => {
  let ws: Workspace

  beforeAll(() => {
    ws = createWorkspace()
    ws.write(
      "src/content/pages/es/servicios.yaml",
      `title: Servicios de diseño y desarrollo web
description: >-
  Diseñamos, desarrollamos y mantenemos sitios web rápidos y optimizados para
  Google. Conoce cómo trabajamos y agenda una llamada.
sections:
  - type: hero
    id: hero
    heading: Servicios para que tu sitio trabaje por ti
    body: Diseño, desarrollo y mantenimiento con procesos claros y medibles.
  - type: faq
    id: preguntas
    heading: Preguntas sobre nuestros servicios
    items:
      - question: ¿Incluyen el mantenimiento del sitio?
        answer: Sí, ofrecemos planes mensuales de mantenimiento y soporte.
`,
    )
    ws.edit("src/config/redirects.ts", (ts) =>
      ts.replace(
        '"/home": "/",',
        '"/home": "/",\n  "/nuestros-servicios": "/servicios",',
      ),
    )
    ws.run("scripts/bsi-sync.mjs")
    const build = ws.build()
    if (build.status !== 0) throw new Error(build.output)
  })

  afterAll(() => ws.remove())

  it("la página se publica con su título, H1 y canonical", () => {
    const html = ws.read(`${OUT}/servicios/index.html`)
    expect(html).toContain(
      "<title>Servicios de diseño y desarrollo web | Bin Astro Template</title>",
    )
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1)
    expect(html).toContain(
      '<link rel="canonical" href="https://www.sitio-de-prueba.invalid/servicios"',
    )
    expect(html).toContain('"@type":"FAQPage"')
  })

  it("aparece en el sitemap y en llms.txt", () => {
    expect(ws.read(`${OUT}/sitemap.xml`)).toContain(
      "<loc>https://www.sitio-de-prueba.invalid/servicios</loc>",
    )
    expect(ws.read(`${OUT}/llms.txt`)).toContain(
      "(https://www.sitio-de-prueba.invalid/servicios)",
    )
  })

  it("la URL vieja redirige con 301 real", () => {
    const config = JSON.parse(ws.read(".vercel/output/config.json"))
    const route = config.routes.find(
      (item: { src?: string }) => item.src === "^/nuestros-servicios$",
    )
    expect(route).toMatchObject({
      status: 301,
      headers: { Location: "/servicios" },
    })
    expect(ws.run("scripts/check-redirects.mjs").status).toBe(0)
  })

  it("Binflow puede editar la página nueva", () => {
    const ids = YAML.parse(
      ws.read("binflow/surface-inventory.yaml"),
    ).surfaces.map((row: { bf_id: string }) => row.bf_id)
    expect(ids).toEqual(
      expect.arrayContaining([
        "servicios.hero.heading",
        "servicios.hero.body",
        "servicios.preguntas.heading",
      ]),
    )
    const result = ws.run("scripts/check-bsi.mjs")
    expect(result.status, result.output).toBe(0)
  })

  it("todas las revisiones del sitio publicado pasan", () => {
    for (const script of [
      "scripts/check-seo.mjs",
      "scripts/check-no-localhost.mjs",
    ]) {
      const result = ws.run(script)
      expect(result.status, `${script}\n${result.output}`).toBe(0)
    }
  })
})

describe("Historia: como dueño del sitio quiero una versión en inglés", () => {
  let ws: Workspace

  beforeAll(() => {
    ws = createWorkspace()
    ws.edit("src/config/locales.ts", (ts) =>
      ts.replace(
        'ENABLED_LOCALES: readonly Locale[] = ["es"]',
        'ENABLED_LOCALES: readonly Locale[] = ["es", "en"]',
      ),
    )
    ws.write(
      "src/content/site/en.yaml",
      ws
        .read("src/content/site/es.yaml")
        .replace(/^tagline: .*$/m, "tagline: Fast websites ready to grow")
        .replace("/privacidad", "/en/privacy")
        .replace("/terminos", "/en/terms")
        .replace("privacyHref: /privacidad", "privacyHref: /en/privacy")
        .replace("thankYouHref: /gracias", "thankYouHref: /en"),
    )
    ws.write(
      "src/content/pages/en/index.yaml",
      `title: Websites built to grow your business
description: >-
  We design and build fast websites optimized for Google and easy to maintain.
  Explore our services and get in touch with our team today.
sections:
  - type: hero
    id: hero
    heading: Professional websites ready to grow with you
  - type: contact
    id: contacto
    heading: Tell us about your project
`,
    )
    for (const [file, key, title] of [
      ["privacy", "privacidad", "Privacy policy"],
      ["terms", "terminos", "Terms and conditions"],
    ] as const) {
      ws.write(
        `src/content/legal/en/${file}.md`,
        `---
title: ${title}
description: ${title} for this website, explained in plain and simple language.
translationKey: ${key}
updatedAt: 2026-09-28
---

## Overview

This page explains the ${title.toLowerCase()} of this website.
`,
      )
    }
    ws.run("scripts/bsi-sync.mjs")
    const build = ws.build()
    if (build.status !== 0) throw new Error(build.output)
  })

  afterAll(() => ws.remove())

  it("check:i18n confirma la paridad de contenido", () => {
    const result = ws.run("scripts/check-i18n.mjs")
    expect(result.status, result.output).toBe(0)
  })

  it("las traducciones se enlazan con hreflang recíproco y x-default", () => {
    const es = ws.read(`${OUT}/privacidad/index.html`)
    const en = ws.read(`${OUT}/en/privacy/index.html`)
    for (const html of [es, en]) {
      expect(html).toContain(
        'hreflang="en" href="https://www.sitio-de-prueba.invalid/en/privacy"',
      )
      expect(html).toContain(
        'hreflang="es-MX" href="https://www.sitio-de-prueba.invalid/privacidad"',
      )
      expect(html).toContain(
        'hreflang="x-default" href="https://www.sitio-de-prueba.invalid/privacidad"',
      )
    }
    expect(en).toContain('<html lang="en"')
  })

  it("el encabezado ofrece el cambio de idioma a la página equivalente", () => {
    expect(ws.read(`${OUT}/privacidad/index.html`)).toMatch(
      /<a href="\/en\/privacy" hreflang="en"/,
    )
  })

  it("la home compartida usa los mismos bf_id en ambos idiomas", () => {
    const row = YAML.parse(
      ws.read("binflow/surface-inventory.yaml"),
    ).surfaces.find(
      (item: { bf_id: string }) => item.bf_id === "home.hero.heading",
    )
    expect(row.locales).toEqual(["es", "en"])
    expect(row.path).toBe("src/content/pages/{locale}/index.yaml")
  })

  it("SEO y BSI pasan con dos idiomas", () => {
    for (const script of ["scripts/check-seo.mjs", "scripts/check-bsi.mjs"]) {
      const result = ws.run(script)
      expect(result.status, `${script}\n${result.output}`).toBe(0)
    }
  })
})
