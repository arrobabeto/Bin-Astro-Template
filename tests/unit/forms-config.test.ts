import { describe, expect, it } from "vitest"

import {
  diagnoseFormsEnv,
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

describe("diagnoseFormsEnv: variables de formularios", () => {
  const SENDGRID = {
    PUBLIC_FORMS_PROVIDER: "sendgrid",
    SENDGRID_API_KEY: "SG.clave",
    MAIL_FROM_EMAIL: "web@ejemplo.mx",
    MAIL_TO_EMAIL: "hola@ejemplo.mx",
  }

  it("sin variables, o con SendGrid completo, no hay problemas", () => {
    expect(diagnoseFormsEnv({})).toEqual({ errors: [], warnings: [] })
    expect(diagnoseFormsEnv(SENDGRID)).toEqual({ errors: [], warnings: [] })
  })

  it("detecta los nombres SENDGRID_* que el sitio no lee y dice a cuál renombrar", () => {
    const { errors } = diagnoseFormsEnv({
      PUBLIC_FORMS_PROVIDER: "sendgrid",
      SENDGRID_API_KEY: "SG.clave",
      SENDGRID_FROM_EMAIL: "web@ejemplo.mx",
      SENDGRID_TO_EMAIL: "hola@ejemplo.mx",
    })
    expect(errors).toEqual([
      "SENDGRID_FROM_EMAIL no la lee el sitio: renómbrala a MAIL_FROM_EMAIL.",
      "SENDGRID_TO_EMAIL no la lee el sitio: renómbrala a MAIL_TO_EMAIL.",
      "PUBLIC_FORMS_PROVIDER=sendgrid pero falta MAIL_FROM_EMAIL, MAIL_TO_EMAIL: el formulario de contacto no enviará correos.",
    ])
  })

  it("nunca incluye valores en los mensajes", () => {
    const { errors, warnings } = diagnoseFormsEnv({
      SENDGRID_FROM_EMAIL: "secreto@ejemplo.mx",
      MAIL_SECRET_THING: "valor-secreto",
    })
    expect([...errors, ...warnings].join(" ")).not.toMatch(/secreto/)
  })

  it("si el nombre correcto ya existe, el alias no es un error", () => {
    const { errors } = diagnoseFormsEnv({
      ...SENDGRID,
      SENDGRID_FROM_EMAIL: "otro@ejemplo.mx",
    })
    expect(errors).toEqual([])
  })

  it("variables vacías o ajenas a formularios se ignoran", () => {
    expect(
      diagnoseFormsEnv({
        SENDGRID_FROM_EMAIL: "",
        HOME: "/Users/x",
        PATH: "/bin",
      }),
    ).toEqual({ errors: [], warnings: [] })
  })

  it("avisa de variables de correo desconocidas", () => {
    const { warnings } = diagnoseFormsEnv({ MAIL_REPLY_TO: "a@b.mx" })
    expect(warnings[0]).toMatch(/^MAIL_REPLY_TO no la lee el sitio/)
  })

  it("SendGrid configurado pero proveedor apagado: avisa que no se usa", () => {
    const { warnings } = diagnoseFormsEnv({
      ...SENDGRID,
      PUBLIC_FORMS_PROVIDER: "none",
    })
    expect(warnings).toEqual([
      'Hay variables de SendGrid pero PUBLIC_FORMS_PROVIDER es "none": el formulario no las usa.',
    ])
  })

  it("web3forms sin access key válida cae a mailto y lo dice", () => {
    const { errors } = diagnoseFormsEnv({ PUBLIC_FORMS_PROVIDER: "web3forms" })
    expect(errors[0]).toMatch(
      /PUBLIC_WEB3FORMS_ACCESS_KEY falta o no es válida/,
    )
    expect(
      diagnoseFormsEnv({
        PUBLIC_FORMS_PROVIDER: "web3forms",
        PUBLIC_WEB3FORMS_ACCESS_KEY: VALID_KEY,
      }).errors,
    ).toEqual([])
  })

  it("newsletter activado sin MailerLite es un error; la clave sin activar, un aviso", () => {
    expect(
      diagnoseFormsEnv({ PUBLIC_NEWSLETTER_ENABLED: "true" }).errors[0],
    ).toMatch(/falta MAILERLITE_API_KEY/)
    expect(
      diagnoseFormsEnv({ MAILERLITE_API_KEY: "ml-clave" }).warnings[0],
    ).toMatch(/newsletter está apagado/)
  })
})
