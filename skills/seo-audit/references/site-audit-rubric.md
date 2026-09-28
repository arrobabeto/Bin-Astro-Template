# Rúbrica de auditoría del sitio (Semrush Site Audit + Ubersuggest)

Categorías de Semrush Site Audit (errores, advertencias, avisos) y del "SEO on-page score"
de Ubersuggest, mapeadas a lo que el template ya verifica. Sirve para no olvidar nada y para
explicar al cliente en términos que reconoce. **No se reporta la puntuación de Semrush ni de
Ubersuggest** si no se ejecutaron esas herramientas.

## Errores (prioridad crítica o alta)

| Problema típico en Semrush/Ubersuggest   | En este template                                        |
| ---------------------------------------- | ------------------------------------------------------- |
| Páginas 4xx / 5xx                        | `check:seo` (enlaces rotos) + e2e (`smoke.spec.ts`)     |
| Enlaces internos rotos                   | `check:seo`                                             |
| Title o description faltante / duplicado | `check:seo`                                             |
| Canonical rota o a otro dominio          | `check:seo` (canonical con `PUBLIC_SITE_URL`)           |
| Sitemap con URLs no canónicas o noindex  | `check:seo`                                             |
| robots.txt con errores o bloqueando todo | `check:seo` + e2e (en previews bloquea a propósito)     |
| hreflang con errores / sin retorno       | `check:seo`                                             |
| Mixed content / sin HTTPS                | `check:headers --live`, HSTS en `vercel.json`           |
| Redirecciones en cadena o bucles         | `check:redirects`                                       |
| Imágenes rotas                           | build de Astro (falla si falta una imagen)              |
| Datos estructurados inválidos            | `check:seo` (JSON parseable) + Rich Results Test manual |

## Advertencias (prioridad media)

| Problema típico                               | En este template                                    |
| --------------------------------------------- | --------------------------------------------------- |
| Title demasiado largo o corto                 | aviso de `check:seo`                                |
| Description demasiado larga o corta           | aviso de `check:seo`                                |
| Imágenes sin alt                              | `check:seo` (bloquea)                               |
| Enlaces a URLs con redirección                | aviso de `check:seo`                                |
| Poco texto / contenido pobre                  | revisión manual                                     |
| Más de un H1 / H1 faltante                    | `check:seo` (bloquea)                               |
| Recursos grandes (imágenes, JS, CSS)          | `check:assets`, Astro optimiza imágenes, e2e sin JS |
| URL con mayúsculas, guiones bajos o muy larga | revisión manual del slug                            |

## Avisos (prioridad baja)

| Problema típico                             | En este template                              |
| ------------------------------------------- | --------------------------------------------- |
| Páginas con un solo enlace interno entrante | revisión manual (`internalLinks` del extract) |
| Páginas huérfanas (solo en sitemap)         | revisión manual                               |
| Enlaces externos `nofollow` innecesarios    | revisión manual                               |
| Falta llms.txt                              | incluido (`/llms.txt`, `/llms-full.txt`)      |
| Profundidad de clics > 3                    | revisión manual de la navegación              |

## Lo que solo dan herramientas externas (reportar como "pendiente de datos")

- Posiciones, volumen, dificultad de palabras clave, CPC → Semrush / Ubersuggest / Google Ads
  Keyword Planner. Cotejar con consultas reales de Search Console.
- Backlinks y autoridad de dominio → Semrush / Ubersuggest / Ahrefs (métricas propietarias,
  no de Google).
- Indexación real, consultas, CTR, Core Web Vitals de campo → Google Search Console.
- Competencia en la SERP → búsqueda manual en incógnito y herramientas de pago.
