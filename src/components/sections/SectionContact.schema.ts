import { z } from "astro/zod"

import { sectionId, text } from "./fields"

/**
 * Formulario de contacto. El proveedor sale de PUBLIC_FORMS_PROVIDER; sin
 * configuración muestra un enlace mailto al correo de src/content/site/.
 */
export const sectionContactSchema = () =>
  z.object({
    type: z.literal("contact"),
    id: sectionId,
    heading: text,
    body: text.optional(),
  })
