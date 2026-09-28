# Inventario de skills

Lista oficial de las skills de este proyecto. **Se actualiza en el mismo cambio en que se
agrega, modifica o elimina una skill** (`pnpm check:skills` lo exige en CI). Qué es una skill y
cómo se usa: [README.md](README.md).

Estados: **estable** (probada, uso diario), **beta** (funciona, puede cambiar), **opcional**
(requiere servicios externos).

## Resumen

| Skill                      | Invocación                  | Para qué sirve                                             | Estado   |
| -------------------------- | --------------------------- | ---------------------------------------------------------- | -------- |
| `editar-contenido`         | `/editar-contenido`         | Cambiar textos, imágenes, menú o contacto sin tocar código | estable  |
| `seo-audit`                | `/seo-audit [audit\|fix]`   | Auditar y corregir el SEO con criterios de Google y más    | estable  |
| `nuevo-sitio`              | `/nuevo-sitio`              | Convertir el template en el sitio de un cliente            | estable  |
| `nueva-seccion`            | `/nueva-seccion`            | Crear un tipo de bloque nuevo (precios, testimonios…)      | estable  |
| `agregar-redireccion`      | `/agregar-redireccion`      | Redirigir URLs viejas (301) al cambiar o migrar páginas    | estable  |
| `agregar-idioma`           | `/agregar-idioma`           | Hacer el sitio bilingüe o multilingüe                      | beta     |
| `bsi-sync`                 | `/bsi-sync`                 | Mantener al día el inventario de Binflow                   | estable  |
| `publicar-articulo`        | `/publicar-articulo`        | Publicar un artículo de blog con SEO, portada y PR         | beta     |
| `construir-desde-figma`    | `/construir-desde-figma`    | Implementar un diseño de Figma como páginas del sitio      | beta     |
| `figma-rest-design-reader` | `/figma-rest-design-reader` | Leer archivos de Figma con la API (sin MCP)                | opcional |
| `hallmark`                 | `/hallmark`                 | Diseño visual con criterio, sin estética genérica de IA    | opcional |

## Fichas

### `editar-contenido`

- **Invocación:** `/editar-contenido` o pedirlo en lenguaje natural.
- **Función:** cambia cualquier texto, imagen, enlace, pregunta frecuente, dato de contacto o
  sección de una página editando solo los archivos de contenido. Valida el resultado y no
  toca el diseño.
- **Casos de uso:** "cambia el teléfono del pie de página", "agrega una pregunta frecuente
  sobre precios", "reemplaza la foto del equipo", "quita la sección de newsletter",
  "actualiza el texto principal de la home".
- **Cuándo no usarla:** para un bloque con diseño nuevo usa `nueva-seccion`; para cambiar una
  URL, `agregar-redireccion`; para un artículo, `publicar-articulo`.
- **Entradas:** qué cambiar y el texto o imagen nuevos.
- **Salidas:** YAML/Markdown editados en `src/content/`, imágenes en `src/assets/images/`,
  inventario BSI actualizado si cambiaron secciones.
- **Requisitos:** ninguno.
- **Origen:** propia del template.
- **Estado:** estable · v1.0 · 2026-09-28.

### `seo-audit`

- **Invocación:** `/seo-audit` (solo reporte), `/seo-audit fix` (corrige), `/seo-audit /ruta`,
  `/seo-audit --live https://dominio`.
- **Función:** revisa el SEO técnico, on-page, datos estructurados, rendimiento, contenido y
  visibilidad en buscadores con IA. Usa la documentación de Google como criterio principal y
  las listas de Yoast, Rank Math, Semrush y Ubersuggest como apoyo, sin inventar
  puntuaciones ni datos. Escribe un reporte con prioridades y, en modo fix, aplica las
  correcciones seguras.
- **Casos de uso:** "audita el SEO antes de lanzar", "¿por qué no aparezco en Google?",
  "corrige títulos y descripciones", "revisa el SEO de /servicios".
- **Cuándo no usarla:** para investigación de palabras clave o backlinks (requiere
  herramientas de pago; la skill lo reporta como pendiente).
- **Entradas:** opcionalmente la palabra clave o intención de cada página.
- **Salidas:** `docs/seo/auditoria-AAAA-MM-DD.md`; en modo fix, cambios en `src/content/` y
  `pnpm verify` en verde.
- **Requisitos:** build local. Opcional: Lighthouse/Chrome para rendimiento, URL publicada para
  `--live`.
- **Origen:** propia del template; formato de reporte basado en la auditoría SEO de webbin.
- **Estado:** estable · v1.0 · 2026-09-28.

### `nuevo-sitio`

- **Invocación:** `/nuevo-sitio`.
- **Función:** convierte una copia del template en el sitio de un cliente: corre
  `pnpm bootstrap`, ajusta logo, colores y datos, guía el reemplazo del contenido demo y deja
  el sitio listo para Vercel.
- **Casos de uso:** "empieza un sitio para Café Núñez", "configura este template para mi
  negocio", justo después de clonar.
- **Cuándo no usarla:** si ya existe `template.lock.json` (el sitio ya fue creado): usa
  `editar-contenido`.
- **Entradas:** nombre y dominio (obligatorios); contacto, logo, colores, textos y fotos.
- **Salidas:** `package.json`, `src/config/site.ts`, `src/content/site/*.yaml`, `.env`,
  `template.lock.json`, assets de marca e inventario BSI.
- **Requisitos:** Node 24 y pnpm.
- **Origen:** propia del template.
- **Estado:** estable · v1.0 · 2026-09-28.

### `nueva-seccion`

- **Invocación:** `/nueva-seccion`.
- **Función:** crea un tipo de bloque nuevo con sus cinco piezas sincronizadas: componente,
  schema de validación, registro, mapa de renderizado y campos de Binflow.
- **Casos de uso:** "necesito una sección de precios", "agrega testimonios", "crea un bloque de
  logos de clientes".
- **Cuándo no usarla:** si una sección existente sirve con otro contenido (`editar-contenido`).
- **Entradas:** qué debe mostrar el bloque y, si hay, el diseño de referencia.
- **Salidas:** `src/components/sections/Section<Tipo>.astro` y `.schema.ts`, cambios en
  `registry.ts`, `AnySection.astro`, `src/lib/bsi-fields.ts`, `src/lib/llms.ts` y la guía de
  secciones.
- **Requisitos:** ninguno.
- **Origen:** propia del template (patrón de secciones de bhend-architektur).
- **Estado:** estable · v1.0 · 2026-09-28.

### `agregar-redireccion`

- **Invocación:** `/agregar-redireccion`.
- **Función:** agrega redirecciones permanentes 301 para que las URLs viejas lleven a las nuevas
  sin perder posicionamiento, y corrige los enlaces internos.
- **Casos de uso:** "cambia la URL de servicios", "migra las URLs del sitio anterior",
  "renombra esta página".
- **Cuándo no usarla:** para una página eliminada sin reemplazo (debe dar 404).
- **Entradas:** URLs viejas y nuevas (o el sitemap del sitio anterior).
- **Salidas:** `src/config/redirects.ts` y enlaces internos actualizados.
- **Requisitos:** ninguno.
- **Origen:** propia del template.
- **Estado:** estable · v1.0 · 2026-09-28.

### `agregar-idioma`

- **Invocación:** `/agregar-idioma`.
- **Función:** activa otro idioma con sus páginas, textos legales, navegación, selector de
  idioma, hreflang y sitemap, manteniendo el español sin prefijo en la URL.
- **Casos de uso:** "haz el sitio bilingüe", "agrega inglés", "traduce el sitio".
- **Cuándo no usarla:** para traducir un solo texto (`editar-contenido`).
- **Entradas:** idioma y textos traducidos (o permiso para traducir).
- **Salidas:** `src/config/locales.ts`, `src/i18n/ui.ts`, `src/content/*/<idioma>/`,
  `src/content/site/<idioma>.yaml` e inventario BSI.
- **Requisitos:** ninguno.
- **Origen:** propia del template.
- **Estado:** beta · v1.0 · 2026-09-28.

### `bsi-sync`

- **Invocación:** `/bsi-sync`.
- **Función:** regenera y revisa el inventario de superficies editables que usa Binflow, y
  explica cómo arreglar cada error de `check:bsi`.
- **Casos de uso:** "falla check:bsi", "agregué una sección", "prepara el sitio para Binflow".
- **Cuándo no usarla:** para editar contenido (Binflow o `editar-contenido` lo hacen).
- **Entradas:** ninguna.
- **Salidas:** `binflow/surface-inventory.yaml`.
- **Requisitos:** ninguno.
- **Origen:** propia del template (contrato BSI v1 de Binflow).
- **Estado:** estable · v1.0 · 2026-09-28.

### `publicar-articulo`

- **Invocación:** `/publicar-articulo`.
- **Función:** convierte un texto en un artículo de blog optimizado para SEO y GEO sin inventar
  datos, prepara una portada AVIF distinta de las existentes, valida el sitio y abre un PR.
  Si el sitio no tiene blog, primero crea la colección de artículos.
- **Casos de uso:** "publica este artículo en la categoría Guías", "sube este post con esta
  imagen".
- **Cuándo no usarla:** para páginas de servicios o landing pages (`editar-contenido` o
  `nueva-seccion`).
- **Entradas:** título, categoría y contenido; opcional imagen, fecha, slug y palabras clave.
- **Salidas:** `src/content/articulos/<idioma>/<slug>.md`, `src/assets/articulos/<slug>.avif`,
  commit y PR.
- **Requisitos:** git con acceso al remoto; generador de imágenes del agente si no hay portada.
- **Origen:** adaptada de `upload-blog` de webbin (sin rutas ni marca de webbin; script de
  portada reescrito en Node con sharp).
- **Estado:** beta · v1.0 · 2026-09-28.

### `construir-desde-figma`

- **Invocación:** `/construir-desde-figma`.
- **Función:** implementa un diseño de Figma paso a paso: lee el frame, propone qué secciones
  usar, crea las que falten, pasa el texto a YAML, sincroniza Binflow y verifica contra el
  diseño.
- **Casos de uso:** "implementa esta página de Figma", "construye la home desde este link".
- **Cuándo no usarla:** para solo inspeccionar un archivo (`figma-rest-design-reader`).
- **Entradas:** link de Figma (archivo y nodo).
- **Salidas:** tokens en `src/styles/global.css`, secciones nuevas si hacen falta, páginas en
  `src/content/pages/` e inventario BSI.
- **Requisitos:** `FIGMA_API_KEY` y `FIGMA_FILE_KEY`, o el MCP de Figma conectado.
- **Origen:** adaptada de `astro-cms-build-from-figma` de bhend-architektur (sin Orbitype).
- **Estado:** beta · v1.0 · 2026-09-28.

### `figma-rest-design-reader`

- **Invocación:** `/figma-rest-design-reader`.
- **Función:** lee archivos de Figma con la API REST: páginas, frames, textos, medidas y
  exportación de imágenes, sin depender del MCP de Figma.
- **Casos de uso:** "lista los frames del archivo de Figma", "exporta el hero de Figma",
  "¿qué tipografía usa el diseño?".
- **Cuándo no usarla:** si el MCP de Figma está conectado y basta con él.
- **Entradas:** `node-id` o nombre de página.
- **Salidas:** JSON en la terminal; URLs temporales de imágenes exportadas.
- **Requisitos:** `FIGMA_API_KEY` (token personal de solo lectura) y `FIGMA_FILE_KEY` en `.env`.
- **Origen:** adaptada de `figma-rest-design-reader` de bhend-architektur (rutas y textos al
  español; sin datos de ese proyecto).
- **Estado:** opcional · v1.0 · 2026-09-28.

### `hallmark`

- **Invocación:** `/hallmark`, `hallmark audit <archivo>`, `hallmark redesign <archivo>`,
  `hallmark study <URL o captura>`.
- **Función:** skill de diseño que evita la estética genérica de las páginas hechas con IA:
  elige estructura, tipografía y color con criterio, y audita diseños existentes. En este
  proyecto debe respetar los tokens de `src/styles/global.css` y las secciones existentes.
- **Casos de uso:** "rediseña la home para que no se vea genérica", "audita el diseño de esta
  sección", "extrae el estilo de este sitio de referencia".
- **Cuándo no usarla:** para cambios de contenido; para crear el componente en sí úsala junto con
  `nueva-seccion`.
- **Entradas:** página o archivo a diseñar/auditar, o una referencia visual.
- **Salidas:** propuesta de diseño o reporte de auditoría; cambios de estilo si se aprueban.
- **Requisitos:** ninguno.
- **Origen:** terceros, [nutlope/hallmark](https://github.com/nutlope/hallmark), licencia MIT,
  commit `13ac0ec` (v1.1.0), hash en `skills-lock.json`. Rescatada de webbin; no se edita.
- **Estado:** opcional · v1.1.0 · 2026-09-28.
