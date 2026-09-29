# Diseñar el sitio

El template es un stack, no un sitio de ejemplo: la estructura y el contenido de cada sitio se
diseñan desde cero (ver [ADR 0009](../adr/0009-stack-no-contenido.md)). La portada que trae
(`/`) es **relleno**. Muestra un par de bloques y explica cómo empezar, pero no está pensada
para convertirse en el sitio real: se borra en cuanto empieza el diseño.

Con un agente de IA basta con pedir _"crea el home"_ (skill `/disenar-sitio`). El agente
pregunta la ruta, borra la portada demo y construye la real contigo.

## Qué se borra, qué se sustituye y qué se conserva

La portada demo se reconoce por el marcador `bin-astro-template:demo` en la primera línea de
`src/content/pages/es/index.yaml`.

- **Lo borra `pnpm demo:clear`:** la portada, sus imágenes (`src/assets/images/demo-*`) y el
  menú y botón del encabezado de `src/content/site/es.yaml`, que apuntaban a ella.
- **Material de arranque que sustituyes durante el diseño:** los tipos de sección (se
  reutilizan solo si encajan con el diseño; si no, se cambian o se crean con `nueva-seccion`),
  el texto de `gracias.yaml`, los textos legales y el resto de `site/es.yaml`.
- **Infraestructura que se conserva:** el modelo de secciones validadas, el SEO técnico, los
  formularios, los idiomas, las redirecciones, la integración con Binflow y las revisiones.

## Borrar la portada demo

```bash
pnpm demo:clear --dry-run   # lista lo que va a borrar, sin tocar nada
pnpm demo:clear             # lo borra
```

El comando:

1. Reemplaza la portada por una provisional de una sola sección ("Página en construcción")
   para que el sitio siga compilando. Lleva el marcador `bin-astro-template:home-pendiente`.
2. Borra `src/assets/images/demo-*`.
3. Vacía el menú y quita el botón del encabezado.
4. Regenera el inventario de Binflow (`pnpm bsi:sync`).

Solo actúa si encuentra el marcador de demo: si la portada ya es contenido real, se niega y no
toca nada.

En un sitio creado con `pnpm bootstrap`, `pnpm check:placeholders` falla mientras quede la
portada demo **o** la provisional. Así ningún sitio se publica con contenido de ejemplo ni a
medio diseñar.

## Ruta 1: desde Figma

Para cuando ya existe un diseño.

1. Crea un token personal de solo lectura en Figma (Settings → Security → Personal access
   tokens) y copia la file key de la URL (`figma.com/design/<FILE_KEY>/...`).
2. Ponlos en `.env` (nunca en Git):

   ```bash
   FIGMA_API_KEY=figd_...
   FIGMA_FILE_KEY=...
   ```

3. Pide al agente _"crea el home desde Figma"_. Revisa el acceso, lista las páginas y frames
   del archivo y acuerda contigo el `node-id` de cada página del sitio (el `node-id=7-2` de la
   URL de un frame).
4. El agente construye **una página a la vez** según su `node-id`, empezando por el home.
   Los bloques salen del frame, no de los tipos de arranque: propone qué tipos crear (o cuáles
   de los existentes encajan sin forzar el diseño), pasa los textos a YAML y compara el
   resultado con el frame.

Detalle técnico: skills `construir-desde-figma` y `figma-rest-design-reader`.

## Ruta 2: con Hallmark

Para cuando no hay diseño previo. Hallmark es una skill de diseño que evita la estética genérica
de las páginas hechas con IA: elige estructura, tipografía y color con criterio.

1. Pide al agente _"crea el home con Hallmark"_.
2. Hallmark pregunta audiencia, acción principal y tono (puedes responder _"decide tú"_) y
   muestra un resumen del diseño antes de escribir código.
3. Al aprobarlo, el agente lo implementa dentro de las reglas del template: colores y fuentes
   como tokens en `src/styles/global.css`, textos en `src/content/`, los bloques del diseño
   como tipos de sección (nuevos o adaptados) y sin datos inventados.

## Después del home

- Vuelve a llenar el menú en `src/content/site/es.yaml` con las páginas o secciones reales.
- Crea las demás páginas en `src/content/pages/es/` (ruta Figma: una por `node-id`).
- Sustituye el resto del material de arranque: textos de `site/es.yaml`, `gracias.yaml` y
  legales. Los tipos de sección de arranque que el sitio no use pueden quedarse (no se
  publican si ninguna página los usa) o quitarse (ver
  [Secciones](secciones.md#crear-cambiar-o-quitar-tipos)).
- Corre `pnpm verify` antes de publicar.

Guías relacionadas: [Crear un sitio nuevo](crear-sitio-nuevo.md),
[Diseño y marca](diseno-y-marca.md), [Secciones](secciones.md) y [Skills](skills.md). La
decisión está en la [ADR 0008](../adr/0008-portada-demo-destruible.md).
