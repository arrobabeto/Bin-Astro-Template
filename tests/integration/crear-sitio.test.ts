/**
 * Historia de usuario: "Como desarrollador, quiero convertir el template en
 * el sitio de un cliente con un solo comando, y que las revisiones me digan
 * qué datos de demostración faltan por reemplazar."
 */
import YAML from "yaml"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { createWorkspace, type Workspace } from "./workspace"

let ws: Workspace

beforeAll(() => {
  ws = createWorkspace()
})

afterAll(() => ws.remove())

describe("pnpm bootstrap", () => {
  it("antes del bootstrap, check:placeholders acepta los datos demo", () => {
    expect(ws.run("scripts/check-content-placeholders.mjs").status).toBe(0)
  })

  it("sin terminal, exige los datos obligatorios", () => {
    const result = ws.run("scripts/bootstrap.mjs")
    expect(result.status).not.toBe(0)
    expect(result.output).toMatch(/falta --nombre/)
    expect(ws.exists("template.lock.json")).toBe(false)
  })

  it("personaliza el proyecto con los datos del cliente", () => {
    const result = ws.run("scripts/bootstrap.mjs", [
      "--nombre",
      "Clínica Norte",
      "--dominio",
      "www.clinicanorte.mx",
      "--correo",
      "hola@clinicanorte.mx",
      "--telefono",
      "+52 81 1234 5678",
      "--direccion",
      "Monterrey, N.L.",
      "--project-key",
      "clinica-norte",
    ])
    expect(result.status, result.output).toBe(0)

    const pkg = JSON.parse(ws.read("package.json"))
    expect(pkg.name).toBe("clinica-norte")

    expect(ws.read("src/config/site.ts")).toContain('name: "Clínica Norte"')
    expect(ws.read("src/config/site.ts")).toContain(
      "mailto:seguridad@clinicanorte.mx",
    )

    const chrome = YAML.parse(ws.read("src/content/site/es.yaml"))
    expect(chrome.contact).toMatchObject({
      email: "hola@clinicanorte.mx",
      phone: "+52 81 1234 5678",
      address: "Monterrey, N.L.",
    })

    expect(ws.read(".env")).toMatch(
      /^PUBLIC_SITE_URL=https:\/\/www\.clinicanorte\.mx$/m,
    )
    expect(
      YAML.parse(ws.read("binflow/surface-inventory.yaml")).project_key,
    ).toBe("clinica-norte")
    expect(ws.exists("template.lock.json")).toBe(true)
  })

  it("el inventario de Binflow sigue sincronizado", () => {
    expect(ws.run("scripts/check-bsi.mjs").status).toBe(0)
  })

  it("check:placeholders pasa a modo estricto y señala lo pendiente", () => {
    const result = ws.run("scripts/check-content-placeholders.mjs")
    expect(result.status).not.toBe(0)
    expect(result.output).toMatch(
      /privacidad\.md.*aviso legal de plantilla sin revisar/,
    )
    expect(result.output).toMatch(
      /index\.yaml sigue igual que el contenido demo/,
    )
    expect(result.output).toMatch(
      /demo-hero\.jpg sigue igual que el contenido demo/,
    )
    expect(result.output).toMatch(/index\.yaml:1: portada demo del template/)
  })

  it("se niega a correr dos veces", () => {
    const result = ws.run("scripts/bootstrap.mjs", ["--nombre", "Otro"])
    expect(result.status).not.toBe(0)
    expect(result.output).toMatch(/ya pasó por bootstrap/)
    expect(JSON.parse(ws.read("package.json")).name).toBe("clinica-norte")
  })
})
