/**
 * Campos BSI de cada tipo de sección: qué campo del YAML se marca en el HTML
 * y con qué `kind`. Lo usan los componentes (vía bf()) y `pnpm bsi:sync`,
 * que genera binflow/surface-inventory.yaml a partir del contenido.
 *
 * Este archivo lo importa Node directamente (type stripping), así que no
 * debe importar nada ni usar sintaxis TypeScript no borrable.
 *
 * Al crear una sección nueva, agrega aquí su entrada (skill `nueva-seccion`).
 */
export type BfKind =
  | "copy"
  | "style_target"
  | "image"
  | "chrome_denied"
  | "catalog_bound"
  | "video"
  | "overlay"
  | "container"

/**
 * `shell` es el contenedor de la sección; siempre existe. Los títulos son
 * `style_target` (Binflow puede aplicarles estilos tipográficos) y los textos
 * corridos `copy` (Binflow los reemplaza completos con edit_text).
 */
export const SECTION_BSI_FIELDS = {
  hero: {
    shell: "container",
    eyebrow: "copy",
    heading: "style_target",
    body: "copy",
    image: "image",
    cta: "chrome_denied",
    secondaryCta: "chrome_denied",
  },
  features: {
    shell: "container",
    eyebrow: "copy",
    heading: "style_target",
    body: "copy",
  },
  split: {
    shell: "container",
    eyebrow: "copy",
    heading: "style_target",
    body: "copy",
    image: "image",
    cta: "chrome_denied",
  },
  cta: {
    shell: "container",
    heading: "style_target",
    body: "copy",
    cta: "chrome_denied",
  },
  faq: {
    shell: "container",
    heading: "style_target",
    intro: "copy",
  },
  prose: {
    shell: "container",
    heading: "style_target",
    body: "copy",
  },
  contact: {
    shell: "container",
    heading: "style_target",
    body: "copy",
  },
  newsletter: {
    shell: "container",
    heading: "style_target",
    body: "copy",
  },
} as const satisfies Record<string, Record<string, BfKind>>

export type SectionType = keyof typeof SECTION_BSI_FIELDS
