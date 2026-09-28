# Criterio de Google (el que manda)

Resumen operativo de Google Search Central. Si otra fuente contradice esto, gana Google.
Revisa las fuentes enlazadas cuando una recomendación sea sensible: Google actualiza su
documentación.

## Fundamentos

- **Search Essentials:** requisitos técnicos (Googlebot puede rastrear, la página responde 200
  y tiene contenido indexable), políticas contra spam y buenas prácticas.
  [Search Essentials](https://developers.google.com/search/docs/essentials)
- **Contenido útil, fiable y centrado en personas.** Google evalúa experiencia, conocimiento,
  autoridad y confianza (E-E-A-T); la confianza es lo más importante. Preguntas guía: ¿quién lo
  escribió?, ¿cómo se hizo?, ¿por qué existe? No hay un número de palabras preferido.
  [Contenido útil](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- **El SEO tarda.** Los cambios pueden tardar de horas a meses en reflejarse.
  [Guía de inicio SEO](https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=es-419)

## Title y snippet

- Un `<title>` único y descriptivo por página; conciso, sin relleno de palabras clave. Google puede
  reescribirlo si no describe la página. No hay límite oficial de caracteres: los rangos de
  30–60 del template son una guía práctica para que no se corte.
  [Title links](https://developers.google.com/search/docs/appearance/title-link)
- Meta description: resumen único y útil de la página. Google puede usar otro fragmento.
  [Snippets](https://developers.google.com/search/docs/appearance/snippet)
- Nombre del sitio: nodo `WebSite` con `name` en la portada, consistente con `og:site_name`.
  [Site names](https://developers.google.com/search/docs/appearance/site-names)

## Encabezados y estructura

- Google no exige un solo H1, pero el template lo usa como regla de claridad (`check:seo`).
- Jerarquía lógica; encabezados descriptivos.
- Enlaces con texto ancla descriptivo; cada página importante debe recibir enlaces internos
  HTML (no solo aparecer en el sitemap).
  [Enlaces rastreables](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)

## Indexación

- **Canonical:** una URL preferida por contenido; `rel="canonical"` absoluta. El sitemap solo
  lista canónicas. [Canonicalización](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- **Sitemap:** URLs canónicas e indexables; `lastmod` solo si es fiable.
  [Sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- **robots.txt:** controla rastreo, no indexación. Para no indexar se usa `noindex` y la página
  debe poder rastrearse para que Google lo lea.
  [robots.txt](https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec) ·
  [noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- **Errores:** las páginas inexistentes responden 404 (no 200 con "no encontrado": soft 404).
- **Redirecciones:** permanentes (301/308) para cambios de URL; sin cadenas.
  [Redirecciones](https://developers.google.com/search/docs/crawling-indexing/301-redirects)

## Internacional

- `hreflang` con URLs completas, recíproco entre versiones y con `x-default`.
  Cada versión se declara a sí misma. Idioma visible coherente con el declarado.
  [Versiones localizadas](https://developers.google.com/search/docs/specialty/international/localized-versions)

## Imágenes

- `alt` descriptivo (vacío solo si es decorativa), dimensiones explícitas, formatos modernos,
  imágenes cerca del texto relevante. [Imágenes](https://developers.google.com/search/docs/appearance/google-images)
- `og:image` absoluta de 1200×630 para redes sociales (no afecta ranking, sí CTR al compartir).

## Datos estructurados

- JSON-LD que describa **lo que es visible** en la página. Datos falsos o invisibles pueden
  causar una acción manual. [Políticas](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- FAQPage: desde 2023 Google muestra los resultados enriquecidos de FAQ casi solo para sitios
  gubernamentales y de salud. El marcado sigue siendo válido y útil para otros buscadores y
  para IA, pero no prometas el resultado enriquecido.
- LocalBusiness solo con dirección y horarios reales.

## Core Web Vitals y experiencia

- Umbrales "bueno" en el percentil 75 de usuarios reales: **LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1**.
  [Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals)
- Indexación mobile-first: el contenido y los datos estructurados deben estar también en móvil.
- HTTPS y sin intersticiales intrusivos.

## Lo que Google dice que NO importa (o no como se cree)

- Densidad de palabras clave. Meta keywords (se ignora). Número exacto de palabras.
- Puntuaciones de herramientas de terceros (Yoast, Rank Math, Semrush, Ubersuggest, Lighthouse
  SEO): son listas de verificación útiles, no factores de ranking.
