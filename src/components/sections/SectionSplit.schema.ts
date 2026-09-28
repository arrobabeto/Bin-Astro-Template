import type { SchemaContext } from "astro:content"
import { z } from "astro/zod"

import { imageWithAlt, link, sectionId, text } from "./fields"

export const sectionSplitSchema = (ctx: SchemaContext) =>
  z.object({
    type: z.literal("split"),
    id: sectionId,
    eyebrow: text.optional(),
    heading: text,
    /** Párrafos separados por una línea en blanco. */
    body: text,
    image: imageWithAlt(ctx),
    imagePosition: z.enum(["left", "right"]).default("right"),
    cta: link.optional(),
  })
