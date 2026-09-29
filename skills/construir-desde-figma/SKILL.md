---
name: construir-desde-figma
description: >-
  Flujo completo para implementar un diseño de Figma en el template: leer el
  frame, mapear a secciones existentes o crear nuevas, escribir el contenido
  en YAML, sincronizar Binflow y verificar. Úsala cuando pidan "implementa
  este diseño de Figma", "construye esta página desde Figma" o compartan un
  link de figma.com para convertirlo en página.
---

# Construir desde Figma

Orquesta `figma-rest-design-reader` (o el MCP de Figma si está conectado), `nueva-seccion` y
`editar-contenido`. Checklist de avance: [references/checklist.md](references/checklist.md).

## Estados (en orden, sin saltos)

```
DISEÑO_LEÍDO → MAPEO_APROBADO → SECCIONES_LISTAS → CONTENIDO_EN_YAML → BSI_SINCRONIZADO → VERIFICADO → LISTO
```

Un prototipo con textos escritos dentro de componentes **nunca** es `LISTO`: el contenido
editorial vive en `src/content/`.

## 1. DISEÑO_LEÍDO

- Obtén el `fileKey` y `node-id` del link (`figma.com/design/<fileKey>/...?node-id=7-2`).
- Con REST: `node skills/figma-rest-design-reader/scripts/figma.mjs tree "<página>" 2` y
  `nodes <id>`; exporta los frames para verlos (`export <id> png 2`).
- Anota: secciones en orden, textos, imágenes, colores, tipografías, espaciados,
  comportamiento móvil (frame móvil si existe).
- Textos marcados como pendientes o lorem ipsum no son contenido aprobado.

## 2. MAPEO_APROBADO

Presenta una tabla y pide aprobación antes de programar:

| Frame de Figma | Sección del template | Nueva? | Notas |
| -------------- | -------------------- | ------ | ----- |

Los bloques salen del frame, no de los tipos que ya tiene el proyecto: los de arranque no son
un catálogo. Reutiliza un tipo existente solo si reproduce el bloque sin forzar el diseño; si
no, marca "Nueva" y créalo con `nueva-seccion` (o propón modificar el existente).

## 3. SECCIONES_LISTAS

- Tokens primero: colores y fuentes del diseño → `src/styles/global.css`
  ([docs/guias/diseno-y-marca.md](../../docs/guias/diseno-y-marca.md)). Fuentes self-hosted con
  `@fontsource` (nada de Google Fonts por CDN).
- Tipos nuevos con la skill `nueva-seccion` (schema + componente + registro + BSI).
- Ajustes a secciones existentes: conserva sus props y marcadores `bf()`.

## 4. CONTENIDO_EN_YAML

- Página nueva: `src/content/pages/es/<slug>.yaml` con `title`, `description` y `sections`.
- Imágenes exportadas de Figma → `src/assets/images/` (nunca URLs de la API de Figma, caducan).
- Enlaza la página desde la navegación (`src/content/site/es.yaml`) o desde otra página.

## 5. BSI_SINCRONIZADO

`pnpm bsi:sync` y revisa el diff del inventario.

## 6. VERIFICADO

```bash
pnpm dev        # compara contra el frame a 375 px, 768 px y 1280 px
pnpm verify
```

Compara visualmente con el export de Figma (captura del navegador vs PNG del frame) y lista
las diferencias intencionales (por ejemplo, accesibilidad o rendimiento).

## 7. LISTO

Solo cuando todo el texto está en YAML, `pnpm verify` pasa y la persona aprobó el resultado
en el preview.
