/**
 * Alta de suscriptores en MailerLite (API v2 "connect"). Solo en servidor.
 * Ver docs/guias/formularios-y-email.md
 */
import { MAILERLITE_API_KEY, MAILERLITE_GROUP_ID } from "astro:env/server"

export function isNewsletterConfigured(): boolean {
  return Boolean(MAILERLITE_API_KEY)
}

export async function subscribe(email: string): Promise<void> {
  if (!MAILERLITE_API_KEY) {
    throw new Error(
      "MailerLite no está configurado: define MAILERLITE_API_KEY.",
    )
  }

  const response = await fetch(
    "https://connect.mailerlite.com/api/subscribers",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MAILERLITE_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email,
        ...(MAILERLITE_GROUP_ID ? { groups: [MAILERLITE_GROUP_ID] } : {}),
      }),
    },
  )

  if (!response.ok) {
    console.error(`[mailerlite] ${response.status}`, await response.text())
    throw new Error(`MailerLite respondió ${response.status}`)
  }
}
