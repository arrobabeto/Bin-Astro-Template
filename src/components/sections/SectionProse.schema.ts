import { z } from "astro/zod"

import { sectionId, text } from "./fields"

export const sectionProseSchema = () =>
  z.object({
    type: z.literal("prose"),
    id: sectionId,
    heading: text.optional(),
    /** Párrafos separados por una línea en blanco. */
    body: text,
  })
