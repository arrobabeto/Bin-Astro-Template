import type { SchemaContext } from "astro:content"
import { z } from "astro/zod"

import type { Locale } from "~/config/locales"
import type { SectionType } from "~/lib/bsi-fields"

import { sectionContactSchema } from "./SectionContact.schema"
import { sectionCtaSchema } from "./SectionCta.schema"
import { sectionFaqSchema } from "./SectionFaq.schema"
import { sectionFeaturesSchema } from "./SectionFeatures.schema"
import { sectionHeroSchema } from "./SectionHero.schema"
import { sectionNewsletterSchema } from "./SectionNewsletter.schema"
import { sectionProseSchema } from "./SectionProse.schema"
import { sectionSplitSchema } from "./SectionSplit.schema"

/**
 * Registro de secciones. Cada `type` del YAML apunta a un schema aquí y a un
 * componente en AnySection.astro; `pnpm check:sections` verifica que los tres
 * (schema, componente, campos BSI) estén sincronizados.
 */
export const sectionsSchema = (ctx: SchemaContext) =>
  z
    .array(
      z.discriminatedUnion("type", [
        sectionHeroSchema(ctx),
        sectionFeaturesSchema(),
        sectionSplitSchema(ctx),
        sectionCtaSchema(),
        sectionFaqSchema(),
        sectionProseSchema(),
        sectionContactSchema(),
        sectionNewsletterSchema(),
      ]),
    )
    .min(1, "La página necesita al menos una sección.")
    .superRefine((sections, issue) => {
      const seen = new Set<string>()
      sections.forEach((section, index) => {
        if (seen.has(section.id)) {
          issue.addIssue({
            code: "custom",
            path: [index, "id"],
            message: `El id de sección "${section.id}" está repetido en esta página.`,
          })
        }
        seen.add(section.id)
      })
    })

export type SectionData = z.infer<ReturnType<typeof sectionsSchema>>[number]

/** Props que recibe cada componente Section*.astro. */
export type SectionProps<T extends SectionType> = Extract<
  SectionData,
  { type: T }
> & {
  /** Área BSI de la página (ver bfArea). */
  area: string
  locale: Locale
  /** true solo para la primera sección de la página (LCP, h1). */
  isFirst: boolean
}
