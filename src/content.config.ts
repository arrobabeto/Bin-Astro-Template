import { defineCollection } from "astro:content"
import { glob } from "astro/loaders"
import { z } from "astro/zod"

import { sectionsSchema } from "~/components/sections/registry"

/**
 * Capa de contenido (reemplaza al CMS). Todo vive en Git y se valida con Zod:
 * si falta un campo obligatorio, el build falla con un mensaje claro.
 *
 * Convención de rutas: src/content/<colección>/<idioma>/<slug>.<ext>
 *   pages/es/index.yaml       → /
 *   pages/es/servicios.yaml   → /servicios
 *   legal/es/privacidad.md    → /privacidad
 * Ver docs/guias/contenido.md
 */

const idFromPath = ({ entry }: { entry: string }) =>
  entry.replace(/\.(ya?ml|md)$/, "")

const seoSchema = z
  .object({
    /** Título SEO si debe ser distinto del título visible. */
    title: z.string().trim().min(1).optional(),
    noindex: z.boolean().default(false),
    /** URL canónica absoluta, solo si la página es copia de otra. */
    canonical: z.url().optional(),
  })
  .default({ noindex: false })

const pages = defineCollection({
  loader: glob({
    pattern: "**/*.{yaml,yml}",
    base: "./src/content/pages",
    generateId: idFromPath,
  }),
  schema: (ctx) =>
    z.object({
      title: z.string().trim().min(1, "La página necesita `title`."),
      description: z
        .string()
        .trim()
        .min(1, "La página necesita `description` (meta description)."),
      /** Agrupa traducciones con slugs distintos (ej. privacidad ↔ privacy). */
      translationKey: z.string().optional(),
      updatedAt: z.coerce.date().optional(),
      ogImage: ctx
        .image()
        .optional()
        .describe("Imagen para redes sociales; si falta se usa la del sitio."),
      seo: seoSchema,
      sections: sectionsSchema(ctx),
    }),
})

const legal = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/legal",
    generateId: idFromPath,
  }),
  schema: z.object({
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    translationKey: z.string().optional(),
    updatedAt: z.coerce.date(),
    seo: seoSchema,
  }),
})

const linkSchema = z.object({ label: z.string().min(1), href: z.string() })

const siteChrome = defineCollection({
  loader: glob({
    pattern: "*.{yaml,yml}",
    base: "./src/content/site",
    generateId: idFromPath,
  }),
  schema: ({ image }) =>
    z.object({
      tagline: z.string().min(1),
      /** Descripción por defecto del sitio (llms.txt, JSON-LD). */
      description: z.string().min(1),
      ogImage: image(),
      ogImageAlt: z.string().min(1),
      nav: z.array(linkSchema),
      headerCta: linkSchema.optional(),
      footer: z.object({
        tagline: z.string().min(1),
        links: z.array(linkSchema),
        copyright: z.string().min(1),
      }),
      contact: z.object({
        email: z.email(),
        phone: z.string().optional(),
        address: z.string().optional(),
      }),
      social: z.array(linkSchema).default([]),
      /** Ruta del aviso de privacidad (se enlaza desde los formularios). */
      privacyHref: z.string().startsWith("/"),
      /** Página de agradecimiento tras enviar un formulario sin JavaScript. */
      thankYouHref: z.string().startsWith("/"),
    }),
})

export const collections = { pages, legal, site: siteChrome }
