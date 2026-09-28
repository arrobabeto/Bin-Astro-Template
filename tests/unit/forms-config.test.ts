import { describe, expect, it } from "vitest"

import {
  isBot,
  isEmail,
  isValidWeb3FormsAccessKey,
  resolveFormsProvider,
  safeRedirectPath,
  validateContact,
} from "~/lib/forms-config"

const VALID_KEY = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"

function formData(entries: Record<string, string>): FormData {
  const form = new FormData()
  for (const [key, value] of Object.entries(entries)) form.set(key, value)
  return form
}

describe("resolveFormsProvider", () => {
  it("sin configuración usa mailto (none)", () => {
    expect(resolveFormsProvider(undefined, undefined)).toBe("none")
    expect(resolveFormsProvider("none", VALID_KEY)).toBe("none")
  })

  it("web3forms solo con una access key válida", () => {
    expect(resolveFormsProvider("web3forms", VALID_KEY)).toBe("web3forms")
    expect(resolveFormsProvider("web3forms", "")).toBe("none")
    expect(resolveFormsProvider("web3forms", "YOUR_ACCESS_KEY_HERE")).toBe(
      "none",
    )
  })

  it("sendgrid se respeta (el endpoint valida los secretos)", () => {
    expect(resolveFormsProvider("sendgrid", undefined)).toBe("sendgrid")
  })

  it("un valor desconocido cae a none", () => {
    expect(resolveFormsProvider("formspree", VALID_KEY)).toBe("none")
  })
})

describe("isValidWeb3FormsAccessKey", () => {
  it("rechaza placeholders, valores cortos y caracteres raros", () => {
    expect(isValidWeb3FormsAccessKey(VALID_KEY)).toBe(true)
    expect(isValidWeb3FormsAccessKey("TU_ACCESS_KEY_WEB3FORMS")).toBe(false)
    expect(isValidWeb3FormsAccessKey("corta")).toBe(false)
    expect(isValidWeb3FormsAccessKey("a1b2c3d4 e5f6 7890 abcd ef12")).toBe(
      false,
    )
    expect(isValidWeb3FormsAccessKey(undefined)).toBe(false)
  })
})

describe("validateContact", () => {
  it("acepta un mensaje completo y recorta espacios", () => {
    const result = validateContact(
      formData({ name: "  Ana ", email: "ana@ejemplo.mx", message: "Hola" }),
    )
    expect(result).toEqual({
      ok: true,
      data: {
        name: "Ana",
        email: "ana@ejemplo.mx",
        phone: "",
        message: "Hola",
      },
    })
  })

  it("reporta el primer campo inválido", () => {
    expect(
      validateContact(formData({ email: "a@b.mx", message: "x" })),
    ).toEqual({
      ok: false,
      error: "name",
    })
    expect(
      validateContact(
        formData({ name: "Ana", email: "no-es-correo", message: "x" }),
      ),
    ).toEqual({ ok: false, error: "email" })
    expect(validateContact(formData({ name: "Ana", email: "a@b.mx" }))).toEqual(
      {
        ok: false,
        error: "message",
      },
    )
  })

  it("limita la longitud de cada campo", () => {
    const result = validateContact(
      formData({ name: "x".repeat(500), email: "a@b.mx", message: "hola" }),
    )
    expect(result.ok && result.data.name.length).toBe(120)
  })
})

describe("isEmail / isBot / safeRedirectPath", () => {
  it("valida correos básicos", () => {
    expect(isEmail("hola@dominio.mx")).toBe(true)
    expect(isEmail("hola@dominio")).toBe(false)
  })

  it("detecta el honeypot", () => {
    expect(isBot(formData({ botcheck: "" }))).toBe(false)
    expect(isBot(formData({ botcheck: "spam" }))).toBe(true)
  })

  it("solo redirige dentro del sitio", () => {
    expect(safeRedirectPath("/gracias")).toBe("/gracias")
    expect(safeRedirectPath("https://malo.com")).toBe("/")
    expect(safeRedirectPath("//malo.com")).toBe("/")
    expect(safeRedirectPath(undefined, "/contacto")).toBe("/contacto")
  })
})
