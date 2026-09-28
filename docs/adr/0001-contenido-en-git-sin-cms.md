# 0001 — Contenido en Git con content collections, sin CMS

**Estado:** Aceptada

## Contexto

Los templates anteriores (basados en Orbitype) guardaban el contenido en un CMS externo. Eso
exige una cuenta y credenciales para compilar, una dependencia de disponibilidad en cada build,
y un modelo de contenido que vive fuera del repositorio. Las personas que editan los sitios, en
la práctica, piden los cambios a un agente de IA o a Binflow, no entran a un panel.

## Decisión

El contenido vive en el repositorio, en `src/content/`, con las content collections de Astro:
páginas en YAML, textos legales en Markdown y textos globales por idioma. Cada colección tiene
un schema Zod en `src/content.config.ts` con mensajes de error en español.

## Alternativas

- **CMS headless (Orbitype, Sanity, Contentful):** interfaz visual, pero agrega credenciales,
  costos y un punto de falla en el build.
- **CMS basado en Git (Decap, Keystatic):** mantiene el contenido en Git, pero agrega una
  interfaz que hay que mantener y que Binflow no necesita.

## Consecuencias

- El sitio compila sin ninguna credencial; CI no necesita secretos.
- Cada cambio de contenido tiene historial, revisión en pull request y se puede revertir.
- Los errores de contenido fallan el build con un mensaje claro, antes de publicar.
- No hay panel visual: la edición es con agentes de IA, Binflow o directamente en los archivos.
- Si un cliente exige un panel, se puede agregar un CMS basado en Git sobre las mismas
  colecciones sin cambiar los componentes.
