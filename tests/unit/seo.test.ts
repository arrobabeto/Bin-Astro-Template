import { describe, expect, it } from "vitest"

import { site } from "~/config/site"
import {
  breadcrumbJsonLd,
  faqJsonLd,
  graph,
  organizationJsonLd,
  webPageJsonLd,
  websiteJsonLd,
} from "~/lib/jsonld"
import type { SiteChrome } from "~/lib/routes"
import { absoluteUrl, buildTitle, escapeXml, serializeJsonLd } from "~/lib/seo"

const ORIGIN = "https://www.ejemplo.mx"

const chrome = {
  description: "Sitio de ejemplo",
  contact: { email: "hola@ejemplo.mx", phone: "+52 81 1234 5678" },
  social: [{ label: "LinkedIn", href: "https://www.linkedin.com/company/x" }],
} as unknown as SiteChrome

describe("buildTitle", () => {
  it("agrega el nombre del sitio con el separador", () => {
    expect(buildTitle("Servicios")).toBe(
      `Servicios${site.titleSeparator}${site.name}`,
    )
  })

  it("no duplica el nombre si ya está en el título", () => {
    expect(buildTitle(`Bienvenido a ${site.name}`)).toBe(
      `Bienvenido a ${site.name}`,
    )
  })
})

describe("absoluteUrl", () => {
  it("resuelve rutas contra el dominio", () => {
    expect(absoluteUrl("/servicios", ORIGIN)).toBe(`${ORIGIN}/servicios`)
    expect(absoluteUrl("https://otro.mx/x", ORIGIN)).toBe("https://otro.mx/x")
  })
})

describe("serializeJsonLd", () => {
  it("no permite cerrar la etiqueta <script> desde el contenido", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>" })
    expect(out).not.toContain("</script>")
    expect(JSON.parse(out).name).toBe("</script><script>alert(1)</script>")
  })
})

describe("escapeXml", () => {
  it("escapa los cinco caracteres especiales", () => {
    expect(escapeXml(`<a href="x">'&'</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;&apos;&amp;&apos;&lt;/a&gt;",
    )
  })
})

describe("JSON-LD", () => {
  it("forma un grafo enlazado por @id: Organization ← WebSite ← WebPage", () => {
    const org = organizationJsonLd(ORIGIN, chrome)
    const website = websiteJsonLd(ORIGIN, chrome, "es")
    const page = webPageJsonLd({
      origin: ORIGIN,
      url: `${ORIGIN}/servicios`,
      title: "Servicios",
      description: "Qué hacemos",
      locale: "es",
      updatedAt: new Date("2026-09-28"),
    })

    expect(website["publisher"]).toEqual({ "@id": org["@id"] })
    expect(page["isPartOf"]).toEqual({ "@id": website["@id"] })
    expect(page["inLanguage"]).toBe("es-MX")
    expect(page["dateModified"]).toBe("2026-09-28T00:00:00.000Z")
  })

  it("la organización incluye contacto, logo absoluto y redes", () => {
    const org = organizationJsonLd(ORIGIN, chrome)
    expect(org).toMatchObject({
      "@type": site.organizationType,
      email: "hola@ejemplo.mx",
      telephone: "+52 81 1234 5678",
      logo: `${ORIGIN}${site.logoPath}`,
      sameAs: ["https://www.linkedin.com/company/x"],
    })
  })

  it("omite teléfono y redes cuando no existen", () => {
    const org = organizationJsonLd(ORIGIN, {
      ...chrome,
      contact: { email: "hola@ejemplo.mx" },
      social: [],
    } as unknown as SiteChrome)
    expect(org).not.toHaveProperty("telephone")
    expect(org).not.toHaveProperty("sameAs")
  })

  it("breadcrumbs numera las posiciones desde 1", () => {
    const list = breadcrumbJsonLd([
      { name: "Inicio", url: `${ORIGIN}/` },
      { name: "Privacidad", url: `${ORIGIN}/privacidad` },
    ])
    expect(list["itemListElement"]).toMatchObject([
      { position: 1, name: "Inicio" },
      { position: 2, name: "Privacidad" },
    ])
  })

  it("FAQPage convierte cada pregunta en Question/Answer", () => {
    const faq = faqJsonLd([
      { question: "¿Cuánto tarda?", answer: "Dos semanas." },
    ])
    expect(faq["mainEntity"]).toEqual([
      {
        "@type": "Question",
        name: "¿Cuánto tarda?",
        acceptedAnswer: { "@type": "Answer", text: "Dos semanas." },
      },
    ])
  })

  it("graph declara el contexto de schema.org", () => {
    expect(graph([])).toEqual({
      "@context": "https://schema.org",
      "@graph": [],
    })
  })
})
