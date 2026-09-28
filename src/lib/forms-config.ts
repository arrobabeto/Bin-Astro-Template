/**
 * Reglas puras de configuración de formularios (sin astro:env, para poder
 * probarlas con Vitest). Ver docs/guias/formularios-y-email.md
 */
export type FormsProvider = "none" | "web3forms" | "sendgrid"

export const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit"
export const CONTACT_ENDPOINT = "/api/forms/contact"
export const NEWSLETTER_ENDPOINT = "/api/newsletter"

const PLACEHOLDER_KEYS = new Set([
  "TU_ACCESS_KEY_WEB3FORMS",
  "YOUR-WEB3FORMS-ACCESS-KEY",
  "YOUR_ACCESS_KEY_HERE",
  "YOUR_WEB3FORMS_ACCESS_KEY",
])

export function isValidWeb3FormsAccessKey(value: unknown): value is string {
  if (typeof value !== "string") return false
  const normalized = value.trim()
  return (
    normalized.length >= 20 &&
    !PLACEHOLDER_KEYS.has(normalized.toUpperCase()) &&
    /^[A-Za-z0-9-]+$/.test(normalized)
  )
}

/**
 * Decide qué proveedor usar. Una configuración incompleta nunca rompe el
 * build: cae a "none" y el sitio muestra el correo de contacto (mailto).
 */
export function resolveFormsProvider(
  requested: string | undefined,
  web3formsKey: string | undefined,
): FormsProvider {
  if (requested === "web3forms") {
    return isValidWeb3FormsAccessKey(web3formsKey) ? "web3forms" : "none"
  }
  if (requested === "sendgrid") return "sendgrid"
  return "none"
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export type ContactInput = {
  name: string
  email: string
  phone: string
  message: string
}

export type ValidationResult =
  { ok: true; data: ContactInput } | { ok: false; error: string }

function field(form: FormData, name: string, max: number): string {
  const value = form.get(name)
  return typeof value === "string" ? value.trim().slice(0, max) : ""
}

export function isEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value)
}

export function validateContact(form: FormData): ValidationResult {
  const data = {
    name: field(form, "name", 120),
    email: field(form, "email", 254),
    phone: field(form, "phone", 40),
    message: field(form, "message", 5000),
  }
  if (!data.name) return { ok: false, error: "name" }
  if (!isEmail(data.email)) return { ok: false, error: "email" }
  if (!data.message) return { ok: false, error: "message" }
  return { ok: true, data }
}

/** Honeypot: los bots llenan el campo oculto `botcheck`. */
export function isBot(form: FormData): boolean {
  const value = form.get("botcheck")
  return typeof value === "string" && value.length > 0
}

/** Solo permite redirigir a rutas del mismo sitio (evita open redirects). */
export function safeRedirectPath(value: unknown, fallback = "/"): string {
  if (typeof value !== "string") return fallback
  if (!value.startsWith("/") || value.startsWith("//")) return fallback
  return value
}
