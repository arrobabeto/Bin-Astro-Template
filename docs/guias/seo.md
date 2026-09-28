# SEO

El template resuelve el SEO técnico de forma automática. Lo que queda en manos de quien edita
es el contenido: buenos títulos, descripciones, textos e imágenes. Para auditar y corregir una
página o el sitio completo, pide `/seo-audit` a tu agente.

## Qué se genera solo

| Elemento                       | Dónde / cómo                                                                                 |
| ------------------------------ | -------------------------------------------------------------------------------------------- |
| `<title>` y meta description   | De `title` y `description` de cada página; el nombre del sitio se agrega solo                |
| Canonical                      | URL absoluta de cada página (o `seo.canonical` si la defines)                                |
| `hreflang`                     | Entre traducciones, incluido `x-default`, cuando hay más de un idioma                        |
| Open Graph y Twitter           | Título, descripción e imagen (1200×630) de cada página                                       |
| Datos estructurados (JSON-LD)  | `Organization`, `WebSite`, `WebPage`, `BreadcrumbList` y `FAQPage` si hay FAQ                |
| `/sitemap.xml`                 | Solo páginas indexables y canónicas, con `lastmod` y `hreflang`                              |
| `/robots.txt`                  | Permite todo menos `/api/` y apunta al sitemap                                               |
| `/llms.txt` y `/llms-full.txt` | Índice y texto completo del sitio para asistentes de IA ([llmstxt.org](https://llmstxt.org)) |
| `/site.webmanifest`            | Nombre, colores e iconos                                                                     |
| `/.well-known/security.txt`    | Contacto de seguridad (de `src/config/site.ts`)                                              |
| Página 404                     | Con `noindex` y enlaces de regreso                                                           |
| Redirecciones                  | 301 reales desde `src/config/redirects.ts`; sin barra final en las URLs                      |

## Previews nunca indexados

En los previews de Vercel (y con `NOINDEX=true`), todas las páginas llevan
`noindex, nofollow`, `robots.txt` bloquea todo y no se carga ninguna herramienta de medición. Así
Google no indexa copias del sitio ni se ensucian las estadísticas.

## Lo que depende del contenido

- **Título:** de 30 a 60 caracteres, con la palabra clave al principio y único en el sitio.
- **Descripción:** de 70 a 160 caracteres, que invite a hacer clic.
- **Un solo H1 por página:** lo pone solo la primera sección.
- **Jerarquía:** las secciones usan H2; no saltes niveles dentro de los textos.
- **Imágenes:** con `alt` descriptivo (es obligatorio). Ver [Imágenes](imagenes.md).
- **Enlaces internos:** enlaza páginas relacionadas con textos descriptivos (no "clic aquí").
- **URLs:** cortas, en minúsculas y con guiones. Si cambias una, agrega una redirección.

## Revisión automática

`pnpm check:seo` revisa el sitio generado y **falla** si una página no tiene título,
descripción, `lang`, exactamente un H1, canonical correcto, imagen social absoluta o JSON-LD
válido; si hay enlaces internos rotos, `hreflang` sin reciprocidad, títulos o descripciones
duplicados, o si el sitemap no coincide con las páginas indexables. **Avisa** de títulos y
descripciones fuera de rango, e imágenes sin dimensiones.

Para análisis detallado, `pnpm seo:extract` guarda los datos de cada página (títulos,
encabezados, palabras, enlaces, imágenes, JSON-LD) en `.seo/extract.json`.

## Auditoría con `/seo-audit`

La skill combina los criterios de Google Search Central con las rúbricas de Semrush,
Ubersuggest, Rank Math y Yoast:

- `/seo-audit audit`: informe con prioridades, sin cambiar nada.
- `/seo-audit fix`: corrige lo que se pueda corregir en contenido y código, y deja el resto
  como recomendación.

Los informes se guardan en `docs/seo/` con fecha. Ver [docs/seo](../seo/README.md).

## Después de publicar

1. Da de alta el dominio en [Google Search Console](https://search.google.com/search-console)
   (mejor con verificación DNS). Ver [Analytics](analytics.md).
2. Envía `https://<dominio>/sitemap.xml`.
3. Revisa el informe de indexación a las dos semanas.
