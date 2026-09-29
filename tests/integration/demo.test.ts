/**
 * Historia de usuario: "Como desarrollador, cuando empiezo a diseñar el sitio
 * quiero borrar la portada demo del template con un comando, y que el sitio
 * siga compilando y pasando las revisiones."
 */
import YAML from "yaml"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { createWorkspace, type Workspace } from "./workspace"

const HOME = "src/content/pages/es/index.yaml"

describe("pnpm demo:clear", () => {
  let ws: Workspace

  beforeAll(() => {
    ws = createWorkspace()
  })

  afterAll(() => ws.remove())

  it("--dry-run lista lo que haría sin tocar nada", () => {
    const before = ws.read(HOME)
    const result = ws.run("scripts/demo-clear.mjs", ["--dry-run"])
    expect(result.status, result.output).toBe(0)
    expect(result.output).toMatch(/demo-hero\.jpg/)
    expect(ws.read(HOME)).toBe(before)
    expect(ws.exists("src/assets/images/demo-hero.jpg")).toBe(true)
  })

  it("borra la portada demo, sus imágenes y el menú que apuntaba a ella", () => {
    const result = ws.run("scripts/demo-clear.mjs")
    expect(result.status, result.output).toBe(0)

    const home = ws.read(HOME)
    expect(home).not.toContain("bin-astro-template:demo")
    expect(home).toContain("bin-astro-template:home-pendiente")
    expect(ws.exists("src/assets/images/demo-hero.jpg")).toBe(false)

    const chrome = YAML.parse(ws.read("src/content/site/es.yaml"))
    expect(chrome.nav).toEqual([])
    expect(chrome.headerCta).toBeUndefined()
    expect(ws.read("src/content/site/es.yaml")).not.toContain(
      "bin-astro-template:demo",
    )

    const ids = YAML.parse(
      ws.read("binflow/surface-inventory.yaml"),
    ).surfaces.map((row: { bf_id: string }) => row.bf_id)
    expect(ids).toContain("home.inicio.heading")
    expect(ids).not.toContain("home.hero.heading")
  })

  it("se niega a borrar una portada que ya no es demo", () => {
    ws.write(HOME, ws.read(HOME).replace(/^#.*\n/gm, ""))
    const result = ws.run("scripts/demo-clear.mjs")
    expect(result.status).not.toBe(0)
    expect(result.output).toMatch(/no hay portada demo/)
  })

  it("el sitio sin demo pasa las revisiones de código y del sitio publicado", () => {
    for (const script of [
      "scripts/check-content-placeholders.mjs",
      "scripts/check-doc-references.mjs",
      "scripts/check-i18n.mjs",
    ]) {
      const result = ws.run(script)
      expect(result.status, `${script}\n${result.output}`).toBe(0)
    }

    const build = ws.build()
    expect(build.status, build.output).toBe(0)
    for (const script of [
      "scripts/check-bsi.mjs",
      "scripts/check-seo.mjs",
      "scripts/check-redirects.mjs",
      "scripts/check-no-localhost.mjs",
    ]) {
      const result = ws.run(script)
      expect(result.status, `${script}\n${result.output}`).toBe(0)
    }
  })

  it("tras el bootstrap, la portada provisional no puede publicarse", () => {
    ws.write("template.lock.json", JSON.stringify({ demoFiles: {} }))
    ws.write(HOME, `# bin-astro-template:home-pendiente\n${ws.read(HOME)}`)
    const result = ws.run("scripts/check-content-placeholders.mjs")
    expect(result.status).not.toBe(0)
    expect(result.output).toMatch(/portada provisional sin diseñar/)
  })
})
