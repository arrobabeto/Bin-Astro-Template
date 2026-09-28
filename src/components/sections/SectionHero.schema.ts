import type { SchemaContext } from "astro:content"
import { z } from "astro/zod"

import { imageWithAlt, link, sectionId, text } from "./fields"

export const sectionHeroSchema = (ctx: SchemaContext) =>
  z.object({
    type: z.literal("hero"),
    id: sectionId,
    eyebrow: text.optional(),
    heading: text,
    body: text.optional(),
    image: imageWithAlt(ctx).optional(),
    cta: link.optional(),
    secondaryCta: link.optional(),
  })
