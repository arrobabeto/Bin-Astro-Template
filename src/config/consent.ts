import type { ConsentConfig } from "~/lib/consent"

/**
 * Consentimiento de cookies y rastreo. Solo aplica si el sitio tiene medición
 * o píxeles configurados (variables PUBLIC_*_ID); sin ellos no hay banner ni
 * JavaScript. La skill `textos-legales` ajusta estos valores según el país y
 * la entrevista con el cliente. Guía: docs/guias/textos-legales.md
 */
export const consent: ConsentConfig = {
  /**
   * - "opt-in": nada se carga hasta que la persona acepta (RGPD y similares).
   * - "opt-out": se carga y se avisa; la persona puede rechazar.
   * - "off": se carga sin banner (solo si la ley del país no lo exige).
   */
  mode: "opt-in",
  /** Cada cuánto se vuelve a preguntar: "session" o { days: N }. */
  renewal: { days: 180 },
  /** Días que se recuerda un rechazo total (con renewal "session" no aplica). */
  rejectionDays: 180,
  /** Súbela al cambiar la política de cookies: vuelve a preguntar a todos. */
  version: 1,
}
