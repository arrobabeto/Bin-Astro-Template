/**
 * Casos de uso de los endpoints de formularios (Vercel Functions):
 * contacto con SendGrid y alta de newsletter en MailerLite.
 */
import type { APIContext } from "astro"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const env = vi.hoisted(() => ({
  SENDGRID_API_KEY: undefined as string | undefined,
  MAIL_FROM_EMAIL: undefined as string | undefined,
  MAIL_FROM_NAME: undefined as string | undefined,
  MAIL_TO_EMAIL: undefined as string | undefined,
  MAILERLITE_API_KEY: undefined as string | undefined,
  MAILERLITE_GROUP_ID: undefined as string | undefined,
}))
vi.mock("astro:env/server", () => env)

const { POST: contact } = await import("~/pages/api/forms/contact")
const { POST: newsletter } = await import("~/pages/api/newsletter")

const fetchMock = vi.fn<typeof fetch>()

function post(
  fields: Record<string, string>,
  { json = true }: { json?: boolean } = {},
): APIContext {
  const body = new FormData()
  for (const [key, value] of Object.entries(fields)) body.set(key, value)
  const request = new Request("https://www.ejemplo.mx/api", {
    method: "POST",
    headers: json ? { Accept: "application/json" } : {},
    body,
  })
  return { request } as APIContext
}

async function json(response: Response) {
  return (await response.json()) as { success: boolean; message?: string }
}

const VALID = {
  name: "Ana López",
  email: "ana@ejemplo.mx",
  phone: "+52 81 1234 5678",
  message: "Quiero una cotización para mi sitio.",
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock)
  vi.spyOn(console, "error").mockImplementation(() => {})
  Object.assign(env, {
    SENDGRID_API_KEY: "SG.clave-de-prueba",
    MAIL_FROM_EMAIL: "web@ejemplo.mx",
    MAIL_FROM_NAME: "Sitio Ejemplo",
    MAIL_TO_EMAIL: "hola@ejemplo.mx",
    MAILERLITE_API_KEY: "ml-clave-de-prueba",
    MAILERLITE_GROUP_ID: "12345",
  })
})

afterEach(() => {
  fetchMock.mockReset()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("Caso de uso: un visitante envía el formulario de contacto (SendGrid)", () => {
  it("el correo llega al destinatario con 'Responder a' del visitante", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 202 }))

    const response = await contact(post(VALID))

    expect(response.status).toBe(200)
    expect(await json(response)).toEqual({ success: true })
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe("https://api.sendgrid.com/v3/mail/send")
    expect(new Headers(init?.headers).get("Authorization")).toBe(
      "Bearer SG.clave-de-prueba",
    )
    const payload = JSON.parse(String(init?.body))
    expect(payload.personalizations[0].to[0].email).toBe("hola@ejemplo.mx")
    expect(payload.from).toEqual({
      email: "web@ejemplo.mx",
      name: "Sitio Ejemplo",
    })
    expect(payload.reply_to).toEqual({ email: "ana@ejemplo.mx" })
    expect(payload.subject).toContain("Ana López")
    expect(payload.content[0].value).toContain("+52 81 1234 5678")
    expect(payload.content[0].value).toContain("Quiero una cotización")
  })

  it("sin JavaScript, redirige (303) a la página de agradecimiento", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 202 }))

    const response = await contact(
      post({ ...VALID, redirect: "/gracias" }, { json: false }),
    )

    expect(response.status).toBe(303)
    expect(response.headers.get("Location")).toBe("/gracias")
  })

  it("no permite redirigir fuera del sitio", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 202 }))

    const response = await contact(
      post(
        { ...VALID, redirect: "https://malicioso.example" },
        { json: false },
      ),
    )

    expect(response.headers.get("Location")).toBe("/")
  })

  it("a un bot (honeypot lleno) le responde éxito sin enviar nada", async () => {
    const response = await contact(post({ ...VALID, botcheck: "on" }))

    expect(await json(response)).toEqual({ success: true })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("rechaza datos inválidos con 400 y dice qué campo falló", async () => {
    const response = await contact(post({ ...VALID, email: "no-es-correo" }))

    expect(response.status).toBe(400)
    expect(await json(response)).toEqual({
      success: false,
      message: "invalid:email",
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("sin SendGrid configurado responde 503 en lugar de fallar en silencio", async () => {
    env.SENDGRID_API_KEY = undefined

    const response = await contact(post(VALID))

    expect(response.status).toBe(503)
    expect((await json(response)).message).toBe("email-not-configured")
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("si SendGrid falla responde 502", async () => {
    fetchMock.mockResolvedValue(new Response("error", { status: 401 }))

    const response = await contact(post(VALID))

    expect(response.status).toBe(502)
    expect((await json(response)).message).toBe("send-failed")
  })

  it("las respuestas nunca se guardan en caché", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 202 }))

    const response = await contact(post(VALID))

    expect(response.headers.get("Cache-Control")).toBe("no-store")
  })
})

describe("Caso de uso: un visitante se suscribe a la newsletter (MailerLite)", () => {
  it("da de alta el correo en el grupo configurado", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 201 }))

    const response = await newsletter(post({ email: "ana@ejemplo.mx" }))

    expect(await json(response)).toEqual({ success: true })
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe("https://connect.mailerlite.com/api/subscribers")
    expect(JSON.parse(String(init?.body))).toEqual({
      email: "ana@ejemplo.mx",
      groups: ["12345"],
    })
  })

  it("sin grupo, da de alta sin asignar grupo", async () => {
    env.MAILERLITE_GROUP_ID = undefined
    fetchMock.mockResolvedValue(new Response("{}", { status: 201 }))

    await newsletter(post({ email: "ana@ejemplo.mx" }))

    expect(JSON.parse(String(fetchMock.mock.calls[0]![1]?.body))).toEqual({
      email: "ana@ejemplo.mx",
    })
  })

  it("rechaza un correo inválido", async () => {
    const response = await newsletter(post({ email: "ana" }))

    expect(response.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("sin MailerLite configurado responde 503", async () => {
    env.MAILERLITE_API_KEY = undefined

    const response = await newsletter(post({ email: "ana@ejemplo.mx" }))

    expect(response.status).toBe(503)
  })

  it("si MailerLite falla responde 502", async () => {
    fetchMock.mockResolvedValue(new Response("error", { status: 500 }))

    const response = await newsletter(post({ email: "ana@ejemplo.mx" }))

    expect(response.status).toBe(502)
  })
})
