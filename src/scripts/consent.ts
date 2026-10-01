/**
 * Banner de consentimiento y carga de etiquetas (GTM, GA4, Google Ads, Meta,
 * TikTok). Solo se incluye en la página si hay rastreo configurado. Lee la
 * configuración del atributo data-config del banner.
 */
import type { TrackingConfig } from "~/lib/analytics"
import {
  CONSENT_STORAGE_KEY,
  type ConsentChoice,
  defaultGoogleConsent,
  googleConsentFor,
  isChoiceValid,
  isRejection,
  parseChoice,
  storageKind,
} from "~/lib/consent"

type Categories = Pick<ConsentChoice, "analytics" | "marketing">
type Queue = unknown[] & { [key: string]: unknown }

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[] }
    _fbq?: unknown
    ttq?: Queue
    TiktokAnalyticsObject?: string
  }
}

const banner = document.querySelector<HTMLElement>("[data-consent-banner]")
const config = JSON.parse(
  document.querySelector<HTMLElement>("[data-consent-config]")?.dataset[
    "consentConfig"
  ] ?? "null",
) as TrackingConfig | null

const loaded = new Set<string>()

function loadScript(src: string) {
  const script = document.createElement("script")
  script.async = true
  script.src = src
  document.head.appendChild(script)
}

function once(key: string, load: () => void) {
  if (loaded.has(key)) return
  loaded.add(key)
  load()
}

function setupGtag() {
  window.dataLayer = window.dataLayer || []
  // gtag.js solo reconoce objetos `arguments`, no arrays.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments)
  }
}

function loadGoogle(cfg: TrackingConfig, choice: Categories) {
  if (cfg.gtmId && (choice.analytics || choice.marketing)) {
    once("gtm", () => {
      window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" })
      loadScript(`https://www.googletagmanager.com/gtm.js?id=${cfg.gtmId}`)
    })
  }
  const tags = [
    choice.analytics && cfg.ga4Id,
    choice.marketing && cfg.googleAdsId,
  ].filter((id): id is string => Boolean(id))
  if (tags.length === 0) return
  once("gtag", () => {
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${tags[0]}`)
    window.gtag("js", new Date())
  })
  for (const id of tags) once(id, () => window.gtag("config", id))
}

function loadMeta(id: string) {
  once("meta", () => {
    const fbq = function (...args: unknown[]) {
      fbq.queue.push(args)
    } as ((...args: unknown[]) => void) & {
      queue: unknown[]
      loaded: boolean
      version: string
      push: unknown
    }
    fbq.queue = []
    fbq.loaded = true
    fbq.version = "2.0"
    fbq.push = fbq
    window.fbq = fbq
    window._fbq = fbq
    loadScript("https://connect.facebook.net/en_US/fbevents.js")
    fbq("init", id)
    fbq("track", "PageView")
  })
}

function loadTikTok(id: string) {
  once("tiktok", () => {
    window.TiktokAnalyticsObject = "ttq"
    const ttq = (window.ttq = window.ttq || ([] as unknown as Queue))
    const methods = ["page", "track", "identify", "instances", "debug", "on"]
    for (const method of methods) {
      ttq[method] = (...args: unknown[]) => ttq.push([method, ...args])
    }
    ttq["_i"] = { [id]: [] }
    ttq["_t"] = { [id]: Date.now() }
    ttq["_o"] = { [id]: {} }
    loadScript(
      `https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${id}&lib=ttq`,
    )
    ;(ttq["page"] as () => void)()
  })
}

function apply(cfg: TrackingConfig, choice: Categories) {
  window.gtag("consent", "update", googleConsentFor(choice))
  loadGoogle(cfg, choice)
  if (choice.marketing && cfg.metaPixelId) loadMeta(cfg.metaPixelId)
  if (choice.marketing && cfg.tiktokPixelId) loadTikTok(cfg.tiktokPixelId)
}

function storage(cfg: TrackingConfig) {
  return storageKind(cfg.consent) === "session" ? sessionStorage : localStorage
}

function save(cfg: TrackingConfig, choice: Categories) {
  const stored: ConsentChoice = {
    ...choice,
    savedAt: Date.now(),
    version: cfg.consent.version,
  }
  storage(cfg).setItem(CONSENT_STORAGE_KEY, JSON.stringify(stored))
}

function init(cfg: TrackingConfig) {
  setupGtag()
  window.gtag("consent", "default", defaultGoogleConsent(cfg.consent.mode))

  if (cfg.consent.mode === "off" || !banner) {
    apply(cfg, { analytics: true, marketing: true })
    return
  }

  const stored = parseChoice(storage(cfg).getItem(CONSENT_STORAGE_KEY))
  const current = isChoiceValid(stored, cfg.consent, Date.now()) ? stored : null
  const analyticsBox = banner.querySelector<HTMLInputElement>(
    '[name="consent-analytics"]',
  )
  const marketingBox = banner.querySelector<HTMLInputElement>(
    '[name="consent-marketing"]',
  )

  // En opt-out las etiquetas se cargan desde el inicio hasta que se rechacen.
  const active =
    current ??
    (cfg.consent.mode === "opt-out"
      ? { analytics: true, marketing: true }
      : null)
  if (active) apply(cfg, active)

  const show = () => {
    if (analyticsBox) analyticsBox.checked = active?.analytics ?? false
    if (marketingBox) marketingBox.checked = active?.marketing ?? false
    banner.hidden = false
  }
  if (!current) show()

  const decide = (choice: Categories) => {
    save(cfg, choice)
    banner.hidden = true
    const revoked =
      (active?.analytics && !choice.analytics) ||
      (active?.marketing && !choice.marketing)
    // Las etiquetas ya cargadas no se pueden descargar: se recarga la página.
    if (revoked) location.reload()
    else if (!isRejection(choice)) apply(cfg, choice)
  }

  banner.addEventListener("click", (event) => {
    const action = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-consent-action]",
    )?.dataset["consentAction"]
    if (action === "accept") decide({ analytics: true, marketing: true })
    if (action === "reject") decide({ analytics: false, marketing: false })
    if (action === "save") {
      decide({
        analytics: analyticsBox?.checked ?? false,
        marketing: marketingBox?.checked ?? false,
      })
    }
  })
  for (const opener of document.querySelectorAll("[data-consent-open]")) {
    opener.addEventListener("click", show)
  }
}

if (config) init(config)
