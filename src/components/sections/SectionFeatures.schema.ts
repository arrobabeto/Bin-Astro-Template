import { z } from "astro/zod"

import { sectionId, text } from "./fields"

export const sectionFeaturesSchema = () =>
  z.object({
    type: z.literal("features"),
    id: sectionId,
    eyebrow: text.optional(),
    heading: text,
    body: text.optional(),
    items: z
      .array(z.object({ title: text, body: text }))
      .min(1, "Agrega al menos un elemento."),
  })
