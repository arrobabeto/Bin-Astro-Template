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

export type EnvMap = Record<string, string | undefined>

export const SENDGRID_REQUIRED_ENV = [
  "SENDGRID_API_KEY",
  "MAIL_FROM_EMAIL",
  "MAIL_TO_EMAIL",
] as const

/** Variables de formularios y correo que el sitio sí lee (astro.config.ts). */
const FORMS_ENV = new Set([
  "PUBLIC_FORMS_PROVIDER",
  "PUBLIC_WEB3FORMS_ACCESS_KEY",
  "PUBLIC_NEWSLETTER_ENABLED",
  ...SENDGRID_REQUIRED_ENV,
  "MAIL_FROM_NAME",
  "MAILERLITE_API_KEY",
  "MAILERLITE_GROUP_ID",
])

/** Nombres que se usan en otros proyectos y este sitio no lee. */
const ENV_ALIASES: Record<string, string> = {
  SENDGRID_KEY: "SENDGRID_API_KEY",
  SENDGRID_TOKEN: "SENDGRID_API_KEY",
  SENDGRID_FROM: "MAIL_FROM_EMAIL",
  SENDGRID_FROM_EMAIL: "MAIL_FROM_EMAIL",
  SENDGRID_SENDER: "MAIL_FROM_EMAIL",
  SENDGRID_SENDER_EMAIL: "MAIL_FROM_EMAIL",
  SENDGRID_FROM_NAME: "MAIL_FROM_NAME",
  SENDGRID_SENDER_NAME: "MAIL_FROM_NAME",
  SENDGRID_TO: "MAIL_TO_EMAIL",
  SENDGRID_TO_EMAIL: "MAIL_TO_EMAIL",
  MAIL_FROM: "MAIL_FROM_EMAIL",
  MAIL_TO: "MAIL_TO_EMAIL",
  EMAIL_FROM: "MAIL_FROM_EMAIL",
  EMAIL_TO: "MAIL_TO_EMAIL",
  CONTACT_EMAIL: "MAIL_TO_EMAIL",
  CONTACT_TO_EMAIL: "MAIL_TO_EMAIL",
  MAILERLITE_KEY: "MAILERLITE_API_KEY",
  MAILERLITE_TOKEN: "MAILERLITE_API_KEY",
  MAILERLITE_GROUP: "MAILERLITE_GROUP_ID",
  WEB3FORMS_KEY: "PUBLIC_WEB3FORMS_ACCESS_KEY",
  WEB3FORMS_ACCESS_KEY: "PUBLIC_WEB3FORMS_ACCESS_KEY",
  FORMS_PROVIDER: "PUBLIC_FORMS_PROVIDER",
  NEWSLETTER_ENABLED: "PUBLIC_NEWSLETTER_ENABLED",
}

const FORMS_ENV_PREFIX =
  /^(PUBLIC_)?(SENDGRID|MAIL|MAILERLITE|WEB3FORMS|EMAIL|CONTACT|FORMS|NEWSLETTER)_/

export type EnvDiagnosis = {
  /** Configuración que no funciona: hay que corregirla. */
  errors: string[]
  /** Configuración incompleta o que no se usa. */
  warnings: string[]
}

/**
 * Revisa las variables de formularios y correo sin exponer valores: detecta
 * nombres que el sitio no lee (por ejemplo SENDGRID_FROM_EMAIL en lugar de
 * MAIL_FROM_EMAIL) y proveedores activados con variables faltantes. Sin este
 * aviso, el formulario solo responde "no configurado" y nadie ve la causa.
 */
export function diagnoseFormsEnv(env: EnvMap): EnvDiagnosis {
  const has = (key: string) => Boolean(env[key]?.trim())
  const errors: string[] = []
  const warnings: string[] = []

  for (const key of Object.keys(env).sort()) {
    if (FORMS_ENV.has(key) || !has(key) || !FORMS_ENV_PREFIX.test(key)) continue
    const alias = ENV_ALIASES[key]
    if (alias && !has(alias)) {
      errors.push(`${key} no la lee el sitio: renómbrala a ${alias}.`)
    } else if (!alias) {
      warnings.push(
        `${key} no la lee el sitio. Variables de formularios válidas: ${[...FORMS_ENV].join(", ")}.`,
      )
    }
  }

  const provider = env["PUBLIC_FORMS_PROVIDER"]?.trim() || "none"
  const missing = SENDGRID_REQUIRED_ENV.filter((key) => !has(key))
  if (provider === "sendgrid" && missing.length > 0) {
    errors.push(
      `PUBLIC_FORMS_PROVIDER=sendgrid pero falta ${missing.join(", ")}: el formulario de contacto no enviará correos.`,
    )
  }
  if (
    provider !== "sendgrid" &&
    missing.length < SENDGRID_REQUIRED_ENV.length
  ) {
    warnings.push(
      `Hay variables de SendGrid pero PUBLIC_FORMS_PROVIDER es "${provider}": el formulario no las usa.`,
    )
  }
  if (
    provider === "web3forms" &&
    !isValidWeb3FormsAccessKey(env["PUBLIC_WEB3FORMS_ACCESS_KEY"])
  ) {
    errors.push(
      "PUBLIC_FORMS_PROVIDER=web3forms pero PUBLIC_WEB3FORMS_ACCESS_KEY falta o no es válida: el sitio muestra el correo (mailto) en lugar del formulario.",
    )
  }

  const newsletter = env["PUBLIC_NEWSLETTER_ENABLED"]?.trim() === "true"
  if (newsletter && !has("MAILERLITE_API_KEY")) {
    errors.push(
      "PUBLIC_NEWSLETTER_ENABLED=true pero falta MAILERLITE_API_KEY: las suscripciones fallarán.",
    )
  }
  if (!newsletter && has("MAILERLITE_API_KEY")) {
    warnings.push(
      "Hay MAILERLITE_API_KEY pero PUBLIC_NEWSLETTER_ENABLED no es true: el newsletter está apagado.",
    )
  }

  return { errors, warnings }
}

/** Solo permite redirigir a rutas del mismo sitio (evita open redirects). */
export function safeRedirectPath(value: unknown, fallback = "/"): string {
  if (typeof value !== "string") return fallback
  if (!value.startsWith("/") || value.startsWith("//")) return fallback
  return value
}
