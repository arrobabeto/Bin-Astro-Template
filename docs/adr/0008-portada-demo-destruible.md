# 0008 — Portada demo destruible

**Estado:** Aceptada

## Contexto

El template traía una portada que simulaba el sitio de una agencia ficticia, con textos que
parecían reales. Al crear el sitio de un cliente, el agente o la persona tendían a adaptarla en
lugar de diseñar desde cero, y quedaban restos (frases, afirmaciones sin respaldo, estructura
genérica). Además, varias pruebas e2e dependían de sus ids y textos exactos, así que cualquier
home real las rompía.

## Decisión

- La portada del template es una bienvenida que se declara como relleno, muestra un par de
  bloques y explica las dos rutas de diseño: Figma (por `node-id`) o Hallmark.
- Se marca con `bin-astro-template:demo`, y sus imágenes empiezan con `demo-`.
- `pnpm demo:clear` la borra y deja una portada provisional válida
  (`bin-astro-template:home-pendiente`). Solo actúa sobre archivos con el marcador de demo.
- La skill `disenar-sitio` ejecuta el borrado cuando se pide crear el home y luego sigue la ruta
  elegida. Las reglas del repo para Hallmark viven en esa skill, porque `hallmark` es de
  terceros y no se edita.
- Tras `pnpm bootstrap`, `check:placeholders` falla si queda cualquiera de los dos marcadores.
- Las pruebas e2e que tocan la home no asumen su contenido: si un bloque (hero con ancla,
  preguntas, contacto, menú) no existe, la prueba se omite.

## Alternativas

- **Mantener un demo realista y pedir que se reescriba:** es lo que fallaba; el demo se
  convertía en el diseño por inercia.
- **Borrado manual guiado solo por la skill:** sin script, cada agente borraría cosas
  distintas y sin la protección del marcador.
- **Sin portada demo:** el template compilaría una página vacía y no enseñaría cómo se arma
  una página ni cómo empezar.

## Consecuencias

- Un sitio nuevo empieza su diseño desde cero, sin arrastrar textos de ejemplo.
- Las pruebas e2e de la home cubren menos en el template (ya no hay FAQ ni contacto en la
  portada). Esas secciones siguen cubiertas por las pruebas unitarias de schemas y por los
  casos de integración que crean páginas con ellas.
- Añadir contenido demo nuevo exige conservar el marcador para que `demo:clear` lo reconozca.
