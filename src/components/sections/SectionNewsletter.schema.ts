import { z } from "astro/zod"

import { sectionId, text } from "./fields"

/** Suscripción vía MailerLite. Solo se muestra si PUBLIC_NEWSLETTER_ENABLED=true. */
export const sectionNewsletterSchema = () =>
  z.object({
    type: z.literal("newsletter"),
    id: sectionId,
    heading: text,
    body: text.optional(),
  })
