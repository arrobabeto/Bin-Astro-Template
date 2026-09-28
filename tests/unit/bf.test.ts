import { describe, expect, it } from "vitest"

import { bf, bfArea, bfId } from "~/lib/bf"
import { SECTION_BSI_FIELDS } from "~/lib/bsi-fields"

describe("bf()", () => {
  it("genera los atributos BSI v1", () => {
    expect(bf("home", "hero", "heading", "style_target")).toEqual({
      "data-bf-id": "home.hero.heading",
      "data-bf-kind": "style_target",
      "data-bf-section": "hero",
    })
  })

  it("agrega presentation solo cuando se pide", () => {
    expect(
      bf("home", "hero", "image", "image", { presentation: "img" }),
    ).toMatchObject({ "data-bf-presentation": "img" })
  })

  it("bfId usa {área}.{sección}.{campo}", () => {
    expect(bfId("servicios", "precios", "shell")).toBe(
      "servicios.precios.shell",
    )
  })
})

describe("bfArea()", () => {
  it("la raíz es home y las subrutas usan guiones", () => {
    expect(bfArea("")).toBe("home")
    expect(bfArea("servicios")).toBe("servicios")
    expect(bfArea("servicios/web")).toBe("servicios-web")
  })
})

describe("SECTION_BSI_FIELDS", () => {
  it("toda sección tiene un contenedor shell", () => {
    for (const [type, fields] of Object.entries(SECTION_BSI_FIELDS)) {
      expect(fields.shell, type).toBe("container")
    }
  })
})
