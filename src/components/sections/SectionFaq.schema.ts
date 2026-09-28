import { z } from "astro/zod"

import { sectionId, text } from "./fields"

/** Genera también el JSON-LD `FAQPage` de la página. */
export const sectionFaqSchema = () =>
  z.object({
    type: z.literal("faq"),
    id: sectionId,
    heading: text,
    intro: text.optional(),
    items: z
      .array(z.object({ question: text, answer: text }))
      .min(1, "Agrega al menos una pregunta."),
  })
