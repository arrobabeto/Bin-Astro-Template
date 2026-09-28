/**
 * Marcadores BSI (Binflow Surface Inventory v1). Solo genera atributos: no
 * carga ni descubre el inventario en el cliente.
 * Ver docs/guias/binflow.md y binflow/surface-inventory.yaml
 */
import type { BfKind } from "./bsi-fields.ts"

export type BfAttrs = {
  "data-bf-id": string
  "data-bf-kind": BfKind
  "data-bf-section": string
  "data-bf-presentation"?: "img" | "background" | "picture"
}

/** `bf_id` estable: `{area}.{sección}.{campo}`. */
export function bfId(area: string, section: string, field: string): string {
  return `${area}.${section}.${field}`
}

export function bf(
  area: string,
  section: string,
  field: string,
  kind: BfKind,
  options?: { presentation?: "img" | "background" | "picture" },
): BfAttrs {
  const attrs: BfAttrs = {
    "data-bf-id": bfId(area, section, field),
    "data-bf-kind": kind,
    "data-bf-section": section,
  }
  if (options?.presentation) {
    attrs["data-bf-presentation"] = options.presentation
  }
  return attrs
}

/** Área BSI a partir del slug de la página: "" → "home", "a/b" → "a-b". */
export function bfArea(slug: string): string {
  return slug === "" ? "home" : slug.replaceAll("/", "-")
}
