---
name: nueva-seccion
description: >-
  Crea un tipo de sección nuevo (componente Astro + schema Zod + registro +
  campos BSI de Binflow) cuando ninguno de los existentes sirve. Úsala cuando
  pidan "necesito una sección de precios/testimonios/logos/equipo…", "crea un
  bloque nuevo" o al implementar un diseño que no encaja en las secciones
  actuales.
---

# Nueva sección

<!-- check:docs ejemplos: src/components/sections/SectionPrecios.schema.ts src/components/sections/SectionPrecios.astro -->

Un tipo de sección son cinco piezas que `pnpm check:sections` exige sincronizadas. Antes de
crear una, confirma que no sirve una existente (`hero`, `features`, `split`, `cta`, `faq`,
`prose`, `contact`, `newsletter`); ver [docs/guias/secciones.md](../../docs/guias/secciones.md).

En los ejemplos el tipo nuevo es `precios` → componente `SectionPrecios`.

## 1. Campos BSI — `src/lib/bsi-fields.ts`

Agrega la entrada. `shell` es obligatorio. Títulos (`heading`, `title`) → `style_target`;
textos corridos (`eyebrow`, `body`, `intro`, `description`) → `copy`; imágenes → `image`;
botones y enlaces → `chrome_denied`. Las listas repetidas (items) no llevan
marcador por elemento.

```ts
precios: {
  shell: "container",
  heading: "style_target",
  body: "copy",
  cta: "chrome_denied",
},
```

## 2. Schema — `src/components/sections/SectionPrecios.schema.ts`

Usa los campos compartidos de `fields.ts` (`sectionId`, `text`, `link`, `imageWithAlt`).
Si lleva imagen, la función recibe `ctx: SchemaContext`.

```ts
import { z } from "astro/zod"

import { link, sectionId, text } from "./fields"

export const sectionPreciosSchema = () =>
  z.object({
    type: z.literal("precios"),
    id: sectionId,
    heading: text,
    body: text.optional(),
    plans: z
      .array(
        z.object({ name: text, price: text, features: z.array(text).min(1) }),
      )
      .min(1)
      .max(4),
    cta: link.optional(),
  })
```

## 3. Registro — `src/components/sections/registry.ts`

Importa el schema y agrégalo a la unión `z.discriminatedUnion("type", [...])`
(`sectionPreciosSchema()` o `sectionPreciosSchema(ctx)`).

## 4. Componente — `src/components/sections/SectionPrecios.astro`

Copia la estructura de una sección parecida (`SectionCta.astro`, `SectionFeatures.astro`).
Obligatorio:

- `type Props = SectionProps<"precios">`.
- `<section id={id} {...bf(area, id, "shell", "container")}>`.
- Cada campo de `bsi-fields.ts` marcado con `bf(area, id, "<campo>", "<kind>")`, exactamente.
- Títulos con `<Heading isFirst={isFirst}>` (h1 si es la primera sección, si no h2).
- Solo tokens de color de `src/styles/global.css` (nada de `#hex`: el lint falla).
- Imágenes con `<Image>` de `astro:assets`, `alt` desde el contenido, `priority={isFirst}`.
- Sin JavaScript de cliente salvo que sea imprescindible.
- Ningún texto fijo en el componente: todo viene del YAML (o de `src/i18n/ui.ts` si es un
  texto de interfaz como "Leer más").

## 5. Mapa — `src/components/sections/AnySection.astro`

Importa `SectionPrecios` y agrégalo al objeto `components` (`precios: SectionPrecios`).

## 6. Texto para IA — `src/lib/llms.ts`

Agrega un `case "precios":` en `sectionToText` para que `llms-full.txt` incluya su texto.

## 7. Usarla y documentarla

1. Agrégala a una página en `src/content/pages/<idioma>/*.yaml`.
2. `pnpm bsi:sync` (agrega sus filas al inventario de Binflow).
3. Documenta sus campos en [docs/guias/secciones.md](../../docs/guias/secciones.md).
4. `pnpm check:sections && pnpm verify`.
5. Revisa en `pnpm dev` a 375 px y a escritorio.

## Si viene de Figma o de una referencia visual

Lee el diseño primero (skill `figma-rest-design-reader` o `construir-desde-figma`). Para
evitar un diseño genérico, puedes apoyarte en la skill `hallmark`, respetando los tokens del
sitio.
