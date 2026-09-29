---
name: disenar-sitio
description: >-
  Arranca el diseño real del sitio: borra la portada demo del template con
  `pnpm demo:clear` y construye el home (y luego las demás páginas) por una de
  dos rutas: desde Figma (token + file key, página por página según el
  node-id) o con Hallmark desde el agente del IDE. Úsala cuando pidan "crea el
  home", "diseña el sitio", "empecemos el diseño", "reemplaza la página de
  ejemplo" o justo después de `nuevo-sitio`.
---

# Diseñar el sitio

Resultado: la portada demo desaparece y en su lugar queda el home real, con el copy en YAML,
los tokens en `src/styles/global.css` y `pnpm verify` en verde.

Guía para personas: [docs/guias/disenar-el-sitio.md](../../docs/guias/disenar-el-sitio.md).

## Input

- **Obligatorio:** la ruta de diseño.
  - **Figma:** `FIGMA_API_KEY` y `FIGMA_FILE_KEY` en `.env`, y el `node-id` del frame de cada
    página (empezando por el home).
  - **Hallmark:** audiencia, acción principal y tono (Hallmark los pregunta; se puede responder
    "decide tú").
- **Recomendado:** el contenido real (textos, servicios, fotos). Sin él, las secciones que
  dependan de datos se dejan fuera; nunca se inventan.

Si falta la ruta, pregunta solo eso: "¿Diseñamos desde Figma o con Hallmark?".

## Preflight

1. `git status -sb`: trabaja en una rama `feature/*` y no mezcles cambios ajenos.
2. ¿Sigue la portada demo? Busca el marcador `bin-astro-template:demo` en
   `src/content/pages/*/index.yaml`.
   - **Sí:** continúa con el paso 1.
   - **No, y tiene `bin-astro-template:home-pendiente`:** el demo ya se borró; salta al paso 2.
   - **No hay ningún marcador:** el home ya es real. No lo borres: usa `editar-contenido` o
     `hallmark redesign`.
3. Lee `src/styles/global.css` (tokens) y `docs/guias/secciones.md` (el patrón de un bloque y
   los tipos de arranque, que no son un catálogo a respetar).

## Pasos

### 1. Borrar el demo (con confirmación)

```bash
pnpm demo:clear --dry-run
```

Muestra a la persona la lista de archivos que se borrarán o reescribirán y pide confirmación
explícita. Con el sí:

```bash
pnpm demo:clear
```

El script deja una portada provisional válida (`bin-astro-template:home-pendiente`), borra
`src/assets/images/demo-*`, vacía el menú y regenera el inventario de Binflow. Tras
`pnpm bootstrap`, `check:placeholders` falla mientras quede el marcador provisional, así que
el sitio no puede publicarse a medias.

### 2A. Ruta Figma

1. Verifica el acceso: `node skills/figma-rest-design-reader/scripts/figma.mjs me` y `file`.
   Si falla, pide el token (Figma → Settings → Security → Personal access tokens, solo
   lectura) y la file key (`figma.com/design/<FILE_KEY>/...`) para `.env`. Nunca los imprimas
   ni los subas.
2. Lista las páginas y frames (`pages`, `tree "<página>" 2`) y acuerda con la persona el
   `node-id` de cada página del sitio: primero el home (`index`), después las demás.
3. Por cada página, sigue `construir-desde-figma` con ese `node-id`, una página a la vez:
   lectura → mapeo aprobado → secciones → YAML → `pnpm bsi:sync` → verificación visual.
4. El home reescribe `src/content/pages/es/index.yaml` completo y sin marcadores. Las páginas
   nuevas van en `src/content/pages/es/<slug>.yaml`.

### 2B. Ruta Hallmark

Ejecuta el flujo por defecto de la skill `hallmark` (preflight, preguntas de contexto,
macroestructura, tema, preview) **con estas reglas del repo, que mandan sobre las de
Hallmark**:

- **Tokens:** van en el bloque `@theme` de `src/styles/global.css` (append, sin borrar lo que
  existe). No crees `tokens.css` en la raíz; el sello de Hallmark va como comentario al inicio
  del bloque de tokens.
- **Fuentes:** self-hosted con `@fontsource/*` (sin Google Fonts por CDN).
- **Estructura:** la macroestructura de Hallmark manda, no los tipos de arranque. Cada bloque
  del diseño es un tipo de sección: reutiliza uno existente solo si encaja sin forzar el
  diseño; si no, créalo con `nueva-seccion` (schema, componente, registro, BSI). Nada de
  páginas `.astro` sueltas con el copy dentro.
- **Copy:** todo texto editorial va en `src/content/pages/es/index.yaml` y
  `src/content/site/es.yaml`; los textos de interfaz, en `src/i18n/ui.ts`.
- **Sin JavaScript de cliente** salvo necesidad real; los estados interactivos, con CSS.
- **Sin datos inventados:** cifras, clientes y testimonios solo si la persona los dio; si no,
  otra macroestructura o la sección fuera.
- **Borrados:** fuera del paso 1, no borres componentes ni rutas sin una lista aprobada.

Muestra el preview de Hallmark y espera aprobación antes de escribir código.

### 3. Menú y enlaces

Vuelve a llenar `nav` (y `headerCta` si aplica) en `src/content/site/es.yaml` con anclas o
páginas que existan. Actualiza `tagline`, `description` y `footer.tagline` con textos del
cliente.

## Reglas

- El contenido editorial se edita en `src/content/`, nunca dentro de componentes.
- No inventes datos (cifras, clientes, testimonios).
- Los `id` de sección nuevos son estables desde que se publican; `pnpm bsi:sync` después de
  crear o quitar secciones.
- Toda imagen va en `src/assets/images/` con `alt` descriptivo (nunca URLs de Figma).
- No edites `skills/hallmark/` (skill de terceros).

## Verificar

```bash
pnpm dev      # compara a 375, 768 y 1280 px contra el frame o el preview aprobado
pnpm verify
```

## Entrega

Ruta usada, archivos creados o cambiados (contenido, secciones nuevas, tokens), páginas
pendientes con su `node-id` (ruta Figma) y resultado de `pnpm verify`.
