import {
  PUBLIC_GA4_ID,
  PUBLIC_GOOGLE_ADS_ID,
  PUBLIC_GSC_VERIFICATION,
  PUBLIC_GTM_ID,
  PUBLIC_META_PIXEL_ID,
  PUBLIC_TIKTOK_PIXEL_ID,
} from "astro:env/client"

import { consent } from "~/config/consent"

import type { ConsentConfig } from "./consent"
import { indexableBuild } from "./seo"

/**
 * Medición y píxeles opcionales. Solo se cargan si hay un ID válido y el build
 * es indexable (los previews no ensucian los datos). Si hay GTM, GA4 y Google
 * Ads se configuran dentro de GTM para no contar doble. Todo pasa por el
 * consentimiento de src/config/consent.ts. Ver docs/guias/analytics.md
 */
const GTM_PATTERN = /^GTM-[A-Z0-9]{4,12}$/
const GA4_PATTERN = /^G-[A-Z0-9]{4,16}$/
const GOOGLE_ADS_PATTERN = /^AW-\d{6,14}$/
const META_PIXEL_PATTERN = /^\d{10,20}$/
const TIKTOK_PIXEL_PATTERN = /^[A-Z0-9]{15,25}$/

const valid = (pattern: RegExp, value: string) =>
  indexableBuild && pattern.test(value) ? value : ""

export const gtmId = valid(GTM_PATTERN, PUBLIC_GTM_ID)
export const ga4Id = gtmId ? "" : valid(GA4_PATTERN, PUBLIC_GA4_ID)
export const googleAdsId = gtmId
  ? ""
  : valid(GOOGLE_ADS_PATTERN, PUBLIC_GOOGLE_ADS_ID)
export const metaPixelId = valid(META_PIXEL_PATTERN, PUBLIC_META_PIXEL_ID)
export const tiktokPixelId = valid(TIKTOK_PIXEL_PATTERN, PUBLIC_TIKTOK_PIXEL_ID)

export const gscVerification = /^[A-Za-z0-9_-]{10,100}$/.test(
  PUBLIC_GSC_VERIFICATION,
)
  ? PUBLIC_GSC_VERIFICATION
  : ""

/** Lo que recibe el script del banner (todo público). */
export type TrackingConfig = {
  consent: ConsentConfig
  gtmId: string
  ga4Id: string
  googleAdsId: string
  metaPixelId: string
  tiktokPixelId: string
}

export const hasTrackers = Boolean(
  gtmId || ga4Id || googleAdsId || metaPixelId || tiktokPixelId,
)

/** Categorías del banner: solo se ofrecen las que el sitio usa. */
export const usesAnalytics = Boolean(gtmId || ga4Id)
export const usesMarketing = Boolean(
  gtmId || googleAdsId || metaPixelId || tiktokPixelId,
)

/** El banner aparece solo si hay rastreo y el modo lo pide. */
export const showConsentBanner = hasTrackers && consent.mode !== "off"

export const trackingConfig: TrackingConfig = {
  consent,
  gtmId,
  ga4Id,
  googleAdsId,
  metaPixelId,
  tiktokPixelId,
}
