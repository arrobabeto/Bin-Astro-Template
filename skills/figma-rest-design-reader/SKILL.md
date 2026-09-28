---
name: figma-rest-design-reader
description: >-
  Lee un archivo de Figma con la API REST usando FIGMA_API_KEY y FIGMA_FILE_KEY
  (no requiere el MCP de Figma). Úsala para inspeccionar diseños, listar
  páginas y frames, exportar imágenes de nodos o extraer tipografía, colores y
  medidas antes de implementar un diseño en Astro.
---

# Lector de Figma por REST

No supongas que el MCP de Figma está disponible. Esta skill usa
`FIGMA_API_KEY` y `FIGMA_FILE_KEY` desde la terminal o desde `.env`.
Si el MCP de Figma sí está conectado, puedes usarlo en su lugar.

## Requisitos

En `.env` (nunca en Git):

```bash
FIGMA_API_KEY=figd_...   # Figma → Settings → Security → Personal access tokens (solo lectura)
FIGMA_FILE_KEY=...       # figma.com/design/<FILE_KEY>/...
```

Comprueba el acceso:

```bash
node skills/figma-rest-design-reader/scripts/figma.mjs me
node skills/figma-rest-design-reader/scripts/figma.mjs file
```

## Comandos

```bash
node skills/figma-rest-design-reader/scripts/figma.mjs me                    # cuenta conectada
node skills/figma-rest-design-reader/scripts/figma.mjs file                  # nombre, versión y páginas
node skills/figma-rest-design-reader/scripts/figma.mjs pages                 # id y nombre de cada página
node skills/figma-rest-design-reader/scripts/figma.mjs tree "<página>" 2     # árbol de frames
node skills/figma-rest-design-reader/scripts/figma.mjs nodes 7:2 7:3         # detalle de nodos
node skills/figma-rest-design-reader/scripts/figma.mjs export 7:2 png 2      # URL temporal de imagen
```

Los ids de la URL (`node-id=7-2`) se convierten solos a `7:2`.
Detalle de endpoints: [references/api.md](references/api.md).

## Reglas

- Nunca imprimas ni subas `FIGMA_API_KEY`.
- Las URLs de `/v1/images` caducan: descarga la imagen y guárdala en
  `src/assets/` (nunca uses la URL de Figma en producción).
- Traduce colores y tipografía a tokens de `src/styles/global.css`; los
  componentes no llevan colores escritos a mano (el lint lo bloquea).
- Reutiliza las secciones de `src/components/sections/` antes de crear una
  nueva. Si hace falta una nueva, usa la skill `nueva-seccion`.
- Los frames o páginas con nombres como "Contenido pendiente" o "Draft" no son
  texto aprobado: no lo publiques como definitivo.

## Siguiente paso

Para implementar el diseño completo usa la skill `construir-desde-figma`.
