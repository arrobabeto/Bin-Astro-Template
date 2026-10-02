import type { APIRoute } from "astro"

import { formResponse } from "~/lib/api-response"
import { logEnvProblems } from "~/lib/email"
import { isBot, isEmail } from "~/lib/forms-config"
import { isNewsletterConfigured, subscribe } from "~/lib/mailerlite"

/** Vercel Function: alta en MailerLite (PUBLIC_NEWSLETTER_ENABLED=true). */
export const prerender = false

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData().catch(() => new FormData())
  if (isBot(form)) return formResponse(request, form, { success: true })

  const email = String(form.get("email") ?? "").trim()
  if (!isEmail(email)) {
    return formResponse(request, form, {
      success: false,
      message: "invalid:email",
    })
  }

  if (!isNewsletterConfigured()) {
    logEnvProblems("newsletter")
    return formResponse(request, form, {
      success: false,
      status: 503,
      message: "newsletter-not-configured",
    })
  }

  try {
    await subscribe(email)
    return formResponse(request, form, { success: true })
  } catch {
    return formResponse(request, form, {
      success: false,
      status: 502,
      message: "subscribe-failed",
    })
  }
}
