/**
 * Envío de correo transaccional con SendGrid (API HTTP, sin SDK).
 * Solo se usa desde endpoints en servidor (src/pages/api/**).
 * Ver docs/guias/formularios-y-email.md
 */
import {
  MAIL_FROM_EMAIL,
  MAIL_FROM_NAME,
  MAIL_TO_EMAIL,
  SENDGRID_API_KEY,
} from "astro:env/server"

import { diagnoseFormsEnv } from "./forms-config"

/**
 * Deja en los logs de Vercel por qué no se envió (solo nombres de variables,
 * nunca valores). Lo usan los endpoints cuando falta configuración.
 */
export function logEnvProblems(scope: string): void {
  const { errors, warnings } = diagnoseFormsEnv(process.env)
  const problems = [...errors, ...warnings]
  console.error(
    `[${scope}] Configuración incompleta.`,
    problems.length > 0
      ? problems.join(" ")
      : "Revisa las variables en Vercel (docs/guias/formularios-y-email.md).",
  )
}

export type EmailMessage = {
  replyTo?: string
  subject: string
  text: string
}

export function isEmailConfigured(): boolean {
  return Boolean(SENDGRID_API_KEY && MAIL_FROM_EMAIL && MAIL_TO_EMAIL)
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  if (!SENDGRID_API_KEY || !MAIL_FROM_EMAIL || !MAIL_TO_EMAIL) {
    throw new Error(
      "SendGrid no está configurado: define SENDGRID_API_KEY, MAIL_FROM_EMAIL y MAIL_TO_EMAIL.",
    )
  }

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: MAIL_TO_EMAIL }] }],
      from: {
        email: MAIL_FROM_EMAIL,
        ...(MAIL_FROM_NAME ? { name: MAIL_FROM_NAME } : {}),
      },
      ...(message.replyTo ? { reply_to: { email: message.replyTo } } : {}),
      subject: message.subject,
      content: [{ type: "text/plain", value: message.text }],
    }),
  })

  if (!response.ok) {
    console.error(`[email:sendgrid] ${response.status}`, await response.text())
    throw new Error(`SendGrid respondió ${response.status}`)
  }
}
