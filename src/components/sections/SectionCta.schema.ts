import { z } from "astro/zod"

import { link, sectionId, text } from "./fields"

export const sectionCtaSchema = () =>
  z.object({
    type: z.literal("cta"),
    id: sectionId,
    heading: text,
    body: text.optional(),
    cta: link,
  })
