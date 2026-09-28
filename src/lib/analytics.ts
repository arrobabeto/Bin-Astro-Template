import {
  PUBLIC_GA4_ID,
  PUBLIC_GSC_VERIFICATION,
  PUBLIC_GTM_ID,
} from "astro:env/client"

import { indexableBuild } from "./seo"

/**
 * Analytics opcional. Solo se carga si hay un ID válido y el build es
 * indexable (los previews no ensucian los datos). Si hay GTM, GA4 se
 * configura dentro de GTM para no contar doble. Ver docs/guias/analytics.md
 */
const GTM_PATTERN = /^GTM-[A-Z0-9]{4,12}$/
const GA4_PATTERN = /^G-[A-Z0-9]{4,16}$/

export const gtmId =
  indexableBuild && GTM_PATTERN.test(PUBLIC_GTM_ID) ? PUBLIC_GTM_ID : ""

export const ga4Id =
  indexableBuild && !gtmId && GA4_PATTERN.test(PUBLIC_GA4_ID)
    ? PUBLIC_GA4_ID
    : ""

export const gscVerification = /^[A-Za-z0-9_-]{10,100}$/.test(
  PUBLIC_GSC_VERIFICATION,
)
  ? PUBLIC_GSC_VERIFICATION
  : ""
