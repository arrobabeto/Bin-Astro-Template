import type { SchemaContext } from "astro:content"
import { z } from "astro/zod"

/**
 * Campos reutilizables por los schemas de sección. Los mensajes de error
 * están en español porque los lee quien edita el contenido.
 */

/** Id estable de la sección: se usa en anclas (#id) y en los `bf_id` de BSI. */
export const sectionId = z
  .string()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "El id de la sección debe ser kebab-case (ej. `nuestros-servicios`).",
  )

export const text = z.string().trim().min(1, "Este texto no puede ir vacío.")

export const link = z.object({
  label: text,
  href: z
    .string()
    .trim()
    .regex(
      /^(\/|#|https?:\/\/|mailto:|tel:)/,
      "El enlace debe empezar con /, #, https://, mailto: o tel:.",
    ),
})

/**
 * Imagen local optimizada por astro:assets. El `alt` es obligatorio (SEO y
 * accesibilidad); el `caption` es opcional y se muestra como pie de foto.
 */
export const imageWithAlt = ({ image }: SchemaContext) =>
  z.object({
    src: image(),
    alt: z
      .string()
      .trim()
      .min(1, "Toda imagen necesita un `alt` que describa su contenido."),
    caption: text.optional(),
  })
