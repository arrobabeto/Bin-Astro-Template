# 0009 — Un stack, no un sitio de ejemplo

**Estado:** Aceptada

## Contexto

La documentación y el contenido que traía el template se leían como si sugirieran una
estructura (hero → servicios → nosotros → preguntas → contacto) y unos textos que había que
adaptar. Cada sitio terminaba pareciéndose al template en lugar de partir de su propio diseño.

## Decisión

Bin Astro Template (BAT) es un **template de stack**. No trae estructura ni contenido
sugerido. Su valor está en la infraestructura:

- el modelo de páginas como secciones validadas (schema Zod, componente, registro y campos BSI);
- SEO técnico, BSI, i18n y formularios opcionales;
- las revisiones automáticas (`pnpm verify`) y CI.

La estructura y el contenido de cada sitio se construyen desde cero con prompts, skills
(`disenar-sitio`, `nueva-seccion`, `construir-desde-figma`, `editar-contenido`…) y Figma.

Lo que el template trae en `src/content/`, `src/assets/images/` y
`src/components/sections/` es **material de arranque**:

- Los ocho tipos de sección muestran el patrón completo de un bloque. No son un catálogo que
  haya que respetar: cada sitio los reutiliza si encajan con su diseño, los modifica, los
  borra o crea los suyos.
- La portada, `gracias.yaml`, los textos legales, los textos globales y las imágenes existen
  para que el build y las revisiones tengan algo que validar. Tras `pnpm bootstrap`,
  `check:placeholders` exige sustituirlos: falla con la portada demo o provisional, con los
  datos de ejemplo y con los legales sin revisar, y avisa de las páginas, legales, imágenes y
  logo que sigan igual que en el template.

## Alternativas

- **Template con un sitio de ejemplo completo:** arranca más rápido, pero empuja a todos los
  sitios hacia la misma estructura y deja textos de relleno en producción.
- **Template vacío, sin tipos ni contenido:** el build no tendría qué validar y nadie vería el
  patrón de una sección.

## Consecuencias

- La documentación describe los tipos de sección y los archivos de contenido como punto de
  partida, no como referencia obligatoria.
- Las pruebas del template no dependen del contenido de la portada
  (ver [ADR 0008](0008-portada-demo-destruible.md)).
- Actualizar un sitio desde el template trae infraestructura, nunca contenido
  (ver [Actualizar desde el template](../guias/actualizar-desde-template.md)).
