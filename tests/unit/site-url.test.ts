import { describe, expect, it } from "vitest"

import {
  isIndexableBuild,
  LOCAL_SITE_URL,
  productionSiteUrlError,
  resolveSiteUrl,
} from "~/config/site-url"

describe("resolveSiteUrl", () => {
  it("prioriza PUBLIC_SITE_URL, luego Vercel, luego localhost", () => {
    expect(
      resolveSiteUrl({
        PUBLIC_SITE_URL: "https://www.ejemplo.mx/",
        VERCEL_PROJECT_PRODUCTION_URL: "otro.vercel.app",
      }),
    ).toBe("https://www.ejemplo.mx")
    expect(
      resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "ejemplo.mx" }),
    ).toBe("https://ejemplo.mx")
    expect(resolveSiteUrl({ PUBLIC_SITE_URL: "  " })).toBe(LOCAL_SITE_URL)
  })
})

describe("productionSiteUrlError", () => {
  it("solo aplica en producción", () => {
    expect(productionSiteUrlError(LOCAL_SITE_URL, "preview")).toBeNull()
    expect(productionSiteUrlError(LOCAL_SITE_URL, "production")).toMatch(
      /localhost/,
    )
  })

  it("exige https, origen limpio y dominio real", () => {
    expect(productionSiteUrlError("http://ejemplo.mx", "production")).toMatch(
      /https/,
    )
    expect(
      productionSiteUrlError("https://ejemplo.mx/es", "production"),
    ).toMatch(/origen/)
    expect(productionSiteUrlError("https://x.invalid", "production")).toMatch(
      /invalid/,
    )
    expect(
      productionSiteUrlError("https://ejemplo.mx", "production"),
    ).toBeNull()
  })
})

describe("isIndexableBuild", () => {
  it("previews y NOINDEX=true no se indexan", () => {
    expect(isIndexableBuild({})).toBe(true)
    expect(isIndexableBuild({ VERCEL_ENV: "production" })).toBe(true)
    expect(isIndexableBuild({ VERCEL_ENV: "preview" })).toBe(false)
    expect(
      isIndexableBuild({ VERCEL_ENV: "production", NOINDEX: "true" }),
    ).toBe(false)
  })
})
