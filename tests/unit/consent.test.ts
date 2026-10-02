/**
 * Casos de uso del banner de cookies: cuándo se vuelve a preguntar y qué
 * recibe Google Consent Mode.
 */
import { describe, expect, it } from "vitest"

import type { ConsentChoice, ConsentConfig } from "~/lib/consent"
import {
  defaultGoogleConsent,
  googleConsentFor,
  isChoiceValid,
  parseChoice,
  storageKind,
} from "~/lib/consent"

const DAY = 24 * 60 * 60 * 1000
const NOW = Date.UTC(2026, 9, 1)

const config: ConsentConfig = {
  mode: "opt-in",
  renewal: { days: 180 },
  rejectionDays: 30,
  version: 2,
}

const choice = (overrides: Partial<ConsentChoice> = {}): ConsentChoice => ({
  analytics: true,
  marketing: false,
  savedAt: NOW,
  version: 2,
  ...overrides,
})

describe("Caso de uso: cada cuánto se vuelve a preguntar", () => {
  it("una aceptación vale los días de renewal", () => {
    expect(
      isChoiceValid(choice({ savedAt: NOW - 179 * DAY }), config, NOW),
    ).toBe(true)
    expect(
      isChoiceValid(choice({ savedAt: NOW - 180 * DAY }), config, NOW),
    ).toBe(false)
  })

  it("un rechazo total se recuerda rejectionDays", () => {
    const rechazo = { analytics: false, marketing: false }
    expect(
      isChoiceValid(
        choice({ ...rechazo, savedAt: NOW - 29 * DAY }),
        config,
        NOW,
      ),
    ).toBe(true)
    expect(
      isChoiceValid(
        choice({ ...rechazo, savedAt: NOW - 31 * DAY }),
        config,
        NOW,
      ),
    ).toBe(false)
  })

  it("al subir la versión de la política se vuelve a preguntar a todos", () => {
    expect(isChoiceValid(choice({ version: 1 }), config, NOW)).toBe(false)
  })

  it("por sesión: vale mientras dure la sesión y se guarda en sessionStorage", () => {
    const porSesion: ConsentConfig = { ...config, renewal: "session" }
    expect(storageKind(porSesion)).toBe("session")
    expect(storageKind(config)).toBe("local")
    expect(
      isChoiceValid(choice({ savedAt: NOW - 400 * DAY }), porSesion, NOW),
    ).toBe(true)
  })

  it("sin decisión o con datos corruptos se pregunta", () => {
    expect(isChoiceValid(null, config, NOW)).toBe(false)
    expect(parseChoice(null)).toBeNull()
    expect(parseChoice("{no es json")).toBeNull()
    expect(parseChoice(JSON.stringify({ analytics: "sí" }))).toBeNull()
    expect(parseChoice(JSON.stringify(choice()))).toEqual(choice())
  })
})

describe("Caso de uso: Google Consent Mode v2", () => {
  it("en opt-in todo empieza denegado; en opt-out, concedido", () => {
    expect(Object.values(defaultGoogleConsent("opt-in"))).toEqual(
      Array(4).fill("denied"),
    )
    expect(Object.values(defaultGoogleConsent("opt-out"))).toEqual(
      Array(4).fill("granted"),
    )
  })

  it("medición y publicidad se conceden por separado", () => {
    expect(googleConsentFor({ analytics: true, marketing: false })).toEqual({
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    })
    expect(googleConsentFor({ analytics: false, marketing: true })).toEqual({
      analytics_storage: "denied",
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
    })
  })
})
