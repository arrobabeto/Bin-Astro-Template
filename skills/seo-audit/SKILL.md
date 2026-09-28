---
name: seo-audit
description: >-
  Audita y corrige el SEO del sitio con los criterios de Google Search Central,
  complementados con las listas de Yoast, Rank Math, Semrush y Ubersuggest.
  Modo audit (solo reporte) o fix (aplica correcciones seguras y pide
  aprobación para cambiar textos visibles). Úsala cuando pidan /seo-audit,
  "audita el SEO", "revisa por qué no aparezco en Google", "corrige títulos y
  descripciones" o antes de lanzar un sitio.
---

# /seo-audit

Revisión SEO completa de un sitio hecho con este template: técnica, on-page,
datos estructurados, rendimiento, contenido y visibilidad en buscadores con IA
(GEO). Produce un reporte en `docs/seo/` y, en modo `fix`, aplica las
correcciones que no cambian el mensaje del sitio.

## Invocación

| Forma                             | Qué hace                                                                |
| --------------------------------- | ----------------------------------------------------------------------- |
| `/seo-audit` o `/seo-audit audit` | Solo audita y escribe el reporte. **No edita nada.**                    |
| `/seo-audit fix`                  | Audita, aplica correcciones seguras y pide aprobación para el resto.    |
| `/seo-audit <ruta>`               | Limita la parte on-page a una página (ej. `/seo-audit /servicios`).     |
| `/seo-audit --live <url>`         | Además revisa el sitio publicado (cabeceras, redirecciones, localhost). |

Si el usuario da una palabra clave o intención por página, úsala. Si no, pregúntala
solo para las páginas principales; no la inventes.

## Reglas que no se rompen

1. **Google manda.** Si Yoast, Rank Math, Semrush o Ubersuggest recomiendan algo que
   contradice la documentación de Google, gana Google ([references/google.md](references/google.md)).
2. **No inventar datos.** Nada de posiciones, volumen de búsqueda, tráfico, backlinks ni
   puntuaciones de herramientas de pago que no se ejecutaron. Si falta el dato, se reporta
   como "pendiente de datos" y se dice qué herramienta lo daría.
3. **No inventar contenido.** No agregar cifras, clientes, testimonios, premios ni
   experiencia que el usuario no haya confirmado.
4. **El contenido se edita solo en `src/content/`** (YAML y Markdown). No se escribe copy en
   componentes. Los metadatos de página van en el frontmatter/YAML (`title`,
   `description`, `seo.*`).
5. **Conservar los `bf_id` de Binflow.** No cambiar `id` de secciones existentes; si se
   agregan o quitan secciones, correr `pnpm bsi:sync`.
6. **URLs:** nunca cambiar un slug sin agregar la redirección 301 (skill `agregar-redireccion`).
7. **Cerrar con `pnpm verify` en verde** en modo `fix`.

## Flujo

### 0. Preparar

```bash
git status -sb                  # no mezclar con cambios ajenos
pnpm build:ci                   # build con URL de prueba
pnpm check:seo                  # reglas que bloquean CI
pnpm seo:extract                # datos por página → .seo/extract.json
```

Lee `.seo/extract.json`, `src/content/`, `src/config/site.ts`, `src/config/redirects.ts`
y el último reporte en `docs/seo/` (si existe) para comparar contra él.

### 1. Técnico (indexación y rastreo)

Con [references/site-audit-rubric.md](references/site-audit-rubric.md):

- `check:seo`, `check:redirects`, `check:no-localhost` y `check:i18n` en verde.
- Sitemap: solo URLs canónicas indexables; robots.txt declara el sitemap.
- Canonical absoluta con el dominio real; `hreflang` recíproco si hay varios idiomas.
- 404 real para URLs inexistentes; páginas utilitarias (`/gracias`) en `noindex`.
- Con `--live`: `pnpm check:headers --live <url>` y `pnpm check:no-localhost --live <url>`,
  `curl -IL` a la versión sin `www`/con `http` para confirmar una sola URL preferida.

### 2. On-page (por página indexable)

Con [references/on-page-rubric.md](references/on-page-rubric.md): title, description, H1,
jerarquía de encabezados, primer párrafo, slug, enlaces internos y externos, alt de
imágenes y extensión útil del contenido. Si hay palabra clave, revisa su presencia
natural en title, H1, primer párrafo, slug y description, **sin densidades**.

### 3. Datos estructurados

- Organization + WebSite en todas las páginas; WebPage; BreadcrumbList en internas;
  FAQPage donde hay sección `faq` (se genera solo).
- Que el JSON-LD coincida con lo visible (nombre, contacto, preguntas).
- Sugerir `LocalBusiness` en `site.organizationType` solo si el negocio atiende en un
  lugar físico y el usuario lo confirma.
- Validación manual recomendada: [Rich Results Test](https://search.google.com/test/rich-results).

### 4. Rendimiento (opcional)

Si hay Chrome/Lighthouse disponible: `pnpm build:ci && pnpm preview` y
`npx lighthouse http://127.0.0.1:4173/ --preset=desktop` y en móvil. Tres corridas,
reporta la **mediana**. Umbrales de Google: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1.
Aclara que son datos de laboratorio; los de campo están en Search Console.

### 5. Contenido y confianza (E-E-A-T)

- ¿Queda claro quién está detrás del sitio, qué ofrece y cómo contactar?
- ¿Hay datos demo o afirmaciones sin respaldo? (`pnpm check:placeholders`).
- ¿Cada página responde a una intención distinta? (sin canibalización).
- Textos legales revisados (sin el aviso "Plantilla de referencia").

### 6. GEO (buscadores con IA)

Con [references/geo-llms.md](references/geo-llms.md): `llms.txt` al día, respuestas
citables (definiciones claras, preguntas frecuentes reales), datos de contacto y
entidad consistentes.

### 7. Reporte

Escribe `docs/seo/auditoria-AAAA-MM-DD.md` con la estructura de
[references/report-template.md](references/report-template.md). Prioridades:
**crítica** (impide indexar o muestra datos falsos), **alta**, **media**, **baja**.
Cada hallazgo lleva evidencia (archivo, URL o salida de comando), instrucción
ejecutable y criterio de cierre.

## Modo fix

Aplica sin preguntar (son correcciones técnicas que no cambian el mensaje):

- Metadatos faltantes o duplicados derivables del contenido existente.
- `alt` faltante en imágenes, describiendo lo que muestran.
- Enlaces internos rotos o que pasan por redirección → enlazar al destino final.
- Páginas utilitarias sin `seo.noindex: true`.
- Ajustes de longitud de title/description que conserven el sentido.

Pide aprobación antes de:

- Reescribir títulos H1, textos visibles o la propuesta de valor.
- Cambiar slugs (implica redirección 301).
- Agregar o quitar páginas o secciones.
- Cambiar `site.organizationType` o datos de contacto.

Al terminar:

```bash
pnpm bsi:sync        # solo si cambiaron secciones
pnpm verify
```

Actualiza el reporte con la sección "Correcciones aplicadas" y deja en
"Pendientes que requieren a una persona" lo que no se puede hacer desde el repo
(Search Console, Google Business Profile, backlinks, investigación de palabras clave
con herramientas de pago).

## Entrega

Resume al usuario: puntuación por área (aprobado/parcial/fallido, no números
inventados), los 3–5 hallazgos más importantes, qué se corrigió, qué queda pendiente
y la ruta del reporte.
