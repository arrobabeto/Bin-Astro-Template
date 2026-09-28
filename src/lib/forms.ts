import {
  PUBLIC_FORMS_PROVIDER,
  PUBLIC_NEWSLETTER_ENABLED,
  PUBLIC_WEB3FORMS_ACCESS_KEY,
} from "astro:env/client"

import { resolveFormsProvider } from "./forms-config"

export const formsProvider = resolveFormsProvider(
  PUBLIC_FORMS_PROVIDER,
  PUBLIC_WEB3FORMS_ACCESS_KEY,
)

export const web3formsAccessKey =
  formsProvider === "web3forms" ? PUBLIC_WEB3FORMS_ACCESS_KEY.trim() : ""

export const newsletterEnabled = PUBLIC_NEWSLETTER_ENABLED
