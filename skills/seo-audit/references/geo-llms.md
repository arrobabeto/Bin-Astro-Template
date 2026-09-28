# GEO: visibilidad en buscadores con IA

GEO (Generative Engine Optimization) es lograr que asistentes como ChatGPT, Perplexity,
Gemini o las AI Overviews de Google entiendan y citen el sitio. No hay un estándar oficial;
Google dice que las mismas prácticas de SEO aplican a sus funciones de IA
([AI features](https://developers.google.com/search/docs/appearance/ai-features)).

## Lo que ya hace el template

- `/llms.txt`: índice del sitio en Markdown (propuesta de [llmstxt.org](https://llmstxt.org)),
  generado desde el contenido. `/llms-full.txt`: el texto completo de las páginas indexables.
- HTML estático y semántico, sin depender de JavaScript para mostrar el contenido.
- JSON-LD de Organization, WebSite, WebPage, BreadcrumbList y FAQPage.
- robots.txt permite a todos los rastreadores. Si el cliente quiere bloquear bots de
  entrenamiento (GPTBot, Google-Extended, CCBot…), se agregan reglas en
  `src/pages/robots.txt.ts`: es una decisión de negocio, pregúntala.

## Checks

| Check                                                                             | Cómo verificar                                         |
| --------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `llms.txt` lista las páginas indexables con descripción                           | `curl /llms.txt` tras el build                         |
| Cada página responde su pregunta principal en el primer párrafo                   | `firstParagraph` en `.seo/extract.json`                |
| Definiciones claras de qué es el negocio y qué ofrece                             | Home y "Nosotros"                                      |
| Preguntas frecuentes reales (no inventadas)                                       | Sección `faq`; confirmar con el usuario                |
| Nombre, contacto y ubicación consistentes en todo el sitio y en perfiles externos | `site/<idioma>.yaml`, JSON-LD, Google Business Profile |
| Datos verificables (cifras, casos) con fuente o evidencia                         | Revisión manual; no inventar                           |
| Fechas de actualización en contenido que envejece                                 | `updatedAt` en legales y artículos                     |

## Qué no prometer

- No hay forma garantizada de aparecer en respuestas de IA ni métricas oficiales de "share
  of voice". Reporta esto como oportunidad, no como hallazgo fallido.
