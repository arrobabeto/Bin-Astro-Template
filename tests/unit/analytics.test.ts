/**
 * Casos de uso de la medición opcional: qué etiquetas se cargan según las
 * variables de entorno y el tipo de build.
 */
import { afterEach, describe, expect, it, vi } from "vitest"

type ClientEnv = {
  PUBLIC_GTM_ID?: string
  PUBLIC_GA4_ID?: string
  PUBLIC_GSC_VERIFICATION?: string
}

async function loadAnalytics(
  client: ClientEnv,
  build: Record<string, string> = {},
) {
  vi.resetModules()
  for (const [key, value] of Object.entries(build)) vi.stubEnv(key, value)
  vi.doMock("astro:env/client", () => ({
    PUBLIC_GTM_ID: "",
    PUBLIC_GA4_ID: "",
    PUBLIC_GSC_VERIFICATION: "",
    ...client,
  }))
  return import("~/lib/analytics")
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.doUnmock("astro:env/client")
})

describe("Caso de uso: activar la medición", () => {
  it("sin variables no se carga nada", async () => {
    const analytics = await loadAnalytics({})
    expect(analytics.gtmId).toBe("")
    expect(analytics.ga4Id).toBe("")
    expect(analytics.gscVerification).toBe("")
  })

  it("GA4 solo se carga directo si no hay Tag Manager", async () => {
    const soloGa4 = await loadAnalytics({ PUBLIC_GA4_ID: "G-ABC123XYZ9" })
    expect(soloGa4.ga4Id).toBe("G-ABC123XYZ9")

    const ambos = await loadAnalytics({
      PUBLIC_GTM_ID: "GTM-ABC1234",
      PUBLIC_GA4_ID: "G-ABC123XYZ9",
    })
    expect(ambos.gtmId).toBe("GTM-ABC1234")
    expect(ambos.ga4Id).toBe("")
  })

  it("un ID mal copiado se ignora en lugar de romper la página", async () => {
    const analytics = await loadAnalytics({
      PUBLIC_GTM_ID: "gtm-123",
      PUBLIC_GA4_ID: "UA-12345-1",
      PUBLIC_GSC_VERIFICATION: '<meta name="google-site-verification">',
    })
    expect(analytics.gtmId).toBe("")
    expect(analytics.ga4Id).toBe("")
    expect(analytics.gscVerification).toBe("")
  })

  it("en previews de Vercel no se carga la medición", async () => {
    const analytics = await loadAnalytics(
      { PUBLIC_GTM_ID: "GTM-ABC1234" },
      { VERCEL_ENV: "preview" },
    )
    expect(analytics.gtmId).toBe("")
  })

  it("con NOINDEX=true tampoco se carga", async () => {
    const analytics = await loadAnalytics(
      { PUBLIC_GA4_ID: "G-ABC123XYZ9" },
      { NOINDEX: "true" },
    )
    expect(analytics.ga4Id).toBe("")
  })

  it("la verificación de Search Console no depende del tipo de build", async () => {
    const analytics = await loadAnalytics(
      { PUBLIC_GSC_VERIFICATION: "abcDEF123_-xyz" },
      { VERCEL_ENV: "preview" },
    )
    expect(analytics.gscVerification).toBe("abcDEF123_-xyz")
  })
})
