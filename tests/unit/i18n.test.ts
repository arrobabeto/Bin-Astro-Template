import { describe, expect, it } from "vitest"

import { DEFAULT_LOCALE } from "~/config/locales"
import { localeFromPath, localePath, parseEntryId } from "~/lib/i18n"

describe("parseEntryId", () => {
  it("index es la raíz del idioma", () => {
    expect(parseEntryId("es/index")).toEqual({ locale: "es", slug: "" })
  })

  it("conserva subcarpetas", () => {
    expect(parseEntryId("en/servicios/web")).toEqual({
      locale: "en",
      slug: "servicios/web",
    })
  })

  it("exige carpeta de idioma", () => {
    expect(() => parseEntryId("servicios")).toThrow(/carpeta de idioma/)
  })
})

describe("localePath", () => {
  it("el idioma por defecto va sin prefijo", () => {
    expect(localePath(DEFAULT_LOCALE, "")).toBe("/")
    expect(localePath(DEFAULT_LOCALE, "/servicios/")).toBe("/servicios")
  })

  it("los demás idiomas llevan prefijo", () => {
    expect(localePath("en", "")).toBe("/en")
    expect(localePath("en", "services")).toBe("/en/services")
  })
})

describe("localeFromPath", () => {
  it("un idioma no activo cae al idioma por defecto", () => {
    expect(localeFromPath("/en/services")).toBe(DEFAULT_LOCALE)
    expect(localeFromPath("/servicios")).toBe(DEFAULT_LOCALE)
  })
})
