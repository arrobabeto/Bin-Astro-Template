/**
 * Reglas del consentimiento de cookies, sin dependencias del navegador ni de
 * Astro: las usan el banner (en el cliente) y las pruebas unitarias.
 */

export type ConsentMode = "opt-in" | "opt-out" | "off"

export type ConsentConfig = {
  mode: ConsentMode
  renewal: "session" | { days: number }
  rejectionDays: number
  version: number
}

/** Decisión guardada de la persona. */
export type ConsentChoice = {
  analytics: boolean
  marketing: boolean
  savedAt: number
  version: number
}

/** Estado de Google Consent Mode v2. */
export type GoogleConsent = {
  analytics_storage: "granted" | "denied"
  ad_storage: "granted" | "denied"
  ad_user_data: "granted" | "denied"
  ad_personalization: "granted" | "denied"
}

export const CONSENT_STORAGE_KEY = "consent-choice"
const DAY = 24 * 60 * 60 * 1000

/** Dónde se guarda la decisión según la periodicidad. */
export function storageKind(config: ConsentConfig): "session" | "local" {
  return config.renewal === "session" ? "session" : "local"
}

export const isRejection = (
  choice: Pick<ConsentChoice, "analytics" | "marketing">,
) => !choice.analytics && !choice.marketing

/** Lee una decisión guardada; cualquier valor corrupto cuenta como ninguna. */
export function parseChoice(raw: string | null): ConsentChoice | null {
  if (!raw) return null
  try {
    const data: unknown = JSON.parse(raw)
    if (
      data &&
      typeof data === "object" &&
      "analytics" in data &&
      "marketing" in data &&
      "savedAt" in data &&
      "version" in data &&
      typeof data.analytics === "boolean" &&
      typeof data.marketing === "boolean" &&
      typeof data.savedAt === "number" &&
      typeof data.version === "number"
    ) {
      return {
        analytics: data.analytics,
        marketing: data.marketing,
        savedAt: data.savedAt,
        version: data.version,
      }
    }
  } catch {
    // JSON inválido: se vuelve a preguntar.
  }
  return null
}

/**
 * ¿Sigue vigente la decisión? Vence al cambiar la versión de la política o al
 * pasar el plazo (el de rechazo si la persona rechazó todo). Con renewal
 * "session" vale mientras dure la sesión del navegador (sessionStorage).
 */
export function isChoiceValid(
  choice: ConsentChoice | null,
  config: ConsentConfig,
  now: number,
): choice is ConsentChoice {
  if (!choice || choice.version !== config.version) return false
  if (config.renewal === "session") return true
  const days = isRejection(choice) ? config.rejectionDays : config.renewal.days
  return now - choice.savedAt < days * DAY
}

/** Consent Mode inicial, antes de que la persona decida. */
export function defaultGoogleConsent(mode: ConsentMode): GoogleConsent {
  const value = mode === "opt-in" ? "denied" : "granted"
  return {
    analytics_storage: value,
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
  }
}

/** Consent Mode a partir de una decisión. */
export function googleConsentFor(
  choice: Pick<ConsentChoice, "analytics" | "marketing">,
): GoogleConsent {
  const ads = choice.marketing ? "granted" : "denied"
  return {
    analytics_storage: choice.analytics ? "granted" : "denied",
    ad_storage: ads,
    ad_user_data: ads,
    ad_personalization: ads,
  }
}
