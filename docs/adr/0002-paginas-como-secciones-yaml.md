# 0002 — Páginas como listas de secciones en YAML

**Estado:** Aceptada

## Contexto

Había dos formas de componer páginas: escribir cada página como un archivo `.astro` o MDX que
coloca componentes a mano, o describir cada página como datos (una lista de secciones tipadas)
que un solo componente de ruta dibuja.

En rendimiento y SEO **no hay diferencia**: ambas generan el mismo HTML estático, sin
JavaScript. La diferencia está en quién y cómo edita. En este template editan agentes de IA y
Binflow, no personas escribiendo código.

## Decisión

Cada página es un archivo YAML en `src/content/pages/<idioma>/` con `title`, `description` y
una lista `sections`. Cada sección tiene `type`, un `id` estable y sus campos, validados por un
schema por tipo (`src/components/sections/*.schema.ts`) unido en `registry.ts`.

## Alternativas

- **Páginas `.astro` o MDX:** más libertad de maquetación por página, pero el contenido queda
  mezclado con el código, no se valida con un schema y los editores automáticos tendrían que
  modificar código.

## Consecuencias

- Un agente o Binflow cambia un texto editando un campo de datos, sin tocar código ni diseño.
- Los errores (campo faltante, imagen sin `alt`, enlace mal formado) fallan el build.
- Los `id` de sección dan identificadores estables a BSI (`home.hero.heading`) y anclas
  (`/#servicios`), independientes del orden de las secciones.
- El H1 único por página y el JSON-LD `FAQPage` salen solos de la estructura.
- Un diseño que no encaja en las secciones existentes requiere crear un tipo nuevo
  (skill `nueva-seccion`); `pnpm check:sections` mantiene cada tipo completo.
