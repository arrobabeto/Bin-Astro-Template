import type { APIRoute } from "astro"

import { formResponse } from "~/lib/api-response"
import { isEmailConfigured, sendEmail } from "~/lib/email"
import { isBot, validateContact } from "~/lib/forms-config"

/** Vercel Function: solo se usa con PUBLIC_FORMS_PROVIDER=sendgrid. */
export const prerender = false

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData().catch(() => new FormData())

  // A los bots se les responde "éxito" para no darles señal.
  if (isBot(form)) return formResponse(request, form, { success: true })

  const validation = validateContact(form)
  if (!validation.ok) {
    return formResponse(request, form, {
      success: false,
      message: `invalid:${validation.error}`,
    })
  }

  if (!isEmailConfigured()) {
    return formResponse(request, form, {
      success: false,
      status: 503,
      message: "email-not-configured",
    })
  }

  const { name, email, phone, message } = validation.data
  try {
    await sendEmail({
      replyTo: email,
      subject: `Contacto web: ${name}`,
      text: [
        `Nombre: ${name}`,
        `Correo: ${email}`,
        ...(phone ? [`Teléfono: ${phone}`] : []),
        "",
        message,
      ].join("\n"),
    })
    return formResponse(request, form, { success: true })
  } catch {
    return formResponse(request, form, {
      success: false,
      status: 502,
      message: "send-failed",
    })
  }
}
