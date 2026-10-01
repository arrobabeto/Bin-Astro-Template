/**
 * Casos de uso de la medición opcional: qué etiquetas se cargan según las
 * variables de entorno y el tipo de build.
 */
import { afterEach, describe, expect, it, vi } from "vitest"

type ClientEnv = {
  PUBLIC_GTM_ID?: string
  PUBLIC_GA4_ID?: string
  PUBLIC_GSC_VERIFICATION?: string
  PUBLIC_GOOGLE_ADS_ID?: string
  PUBLIC_META_PIXEL_ID?: string
  PUBLIC_TIKTOK_PIXEL_ID?: string
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
    PUBLIC_GOOGLE_ADS_ID: "",
    PUBLIC_META_PIXEL_ID: "",
    PUBLIC_TIKTOK_PIXEL_ID: "",
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

describe("Caso de uso: activar píxeles de publicidad", () => {
  it("sin medición ni píxeles no hay banner de cookies", async () => {
    const analytics = await loadAnalytics({
      PUBLIC_GSC_VERIFICATION: "abcDEF123_-xyz",
    })
    expect(analytics.hasTrackers).toBe(false)
    expect(analytics.showConsentBanner).toBe(false)
  })

  it("los píxeles de Meta y TikTok activan el banner con la categoría de publicidad", async () => {
    const analytics = await loadAnalytics({
      PUBLIC_META_PIXEL_ID: "123456789012345",
      PUBLIC_TIKTOK_PIXEL_ID: "C4ABCDEFGHIJ1234567K",
    })
    expect(analytics.metaPixelId).toBe("123456789012345")
    expect(analytics.tiktokPixelId).toBe("C4ABCDEFGHIJ1234567K")
    expect(analytics.showConsentBanner).toBe(true)
    expect(analytics.usesMarketing).toBe(true)
    expect(analytics.usesAnalytics).toBe(false)
  })

  it("con Tag Manager, Google Ads se configura dentro de GTM", async () => {
    const soloAds = await loadAnalytics({
      PUBLIC_GOOGLE_ADS_ID: "AW-123456789",
    })
    expect(soloAds.googleAdsId).toBe("AW-123456789")

    const conGtm = await loadAnalytics({
      PUBLIC_GTM_ID: "GTM-ABC1234",
      PUBLIC_GOOGLE_ADS_ID: "AW-123456789",
    })
    expect(conGtm.googleAdsId).toBe("")
    expect(conGtm.usesAnalytics).toBe(true)
    expect(conGtm.usesMarketing).toBe(true)
  })

  it("IDs de píxel mal copiados se ignoran", async () => {
    const analytics = await loadAnalytics({
      PUBLIC_GOOGLE_ADS_ID: "123456789",
      PUBLIC_META_PIXEL_ID: "fbq('init')",
      PUBLIC_TIKTOK_PIXEL_ID: "abc",
    })
    expect(analytics.googleAdsId).toBe("")
    expect(analytics.metaPixelId).toBe("")
    expect(analytics.tiktokPixelId).toBe("")
    expect(analytics.hasTrackers).toBe(false)
  })

  it("en previews tampoco se cargan los píxeles", async () => {
    const analytics = await loadAnalytics(
      { PUBLIC_META_PIXEL_ID: "123456789012345" },
      { VERCEL_ENV: "preview" },
    )
    expect(analytics.metaPixelId).toBe("")
    expect(analytics.showConsentBanner).toBe(false)
  })
})
