# Plantilla del reporte

Guardar como `docs/seo/auditoria-AAAA-MM-DD.md`. Español claro: lo lee el cliente.

```markdown
# Auditoría SEO de <Nombre del sitio>

**Fecha:** <día de mes de año>
**Sitio:** <https://dominio>
**Modo:** audit | fix
**Objetivo:** <qué quiere lograr el negocio; público y país principal>

## Resumen ejecutivo

<3–5 frases: estado general, lo más urgente y el orden de trabajo recomendado.>

**Orden de trabajo recomendado:**

1. …
2. …

## Alcance, método y límites

- Qué se revisó (páginas, build local y/o sitio publicado, fecha).
- Comandos usados: `pnpm check:seo`, `pnpm seo:extract`, Lighthouse (n corridas), etc.
- Qué NO se pudo revisar y por qué (sin acceso a Search Console, GA4, Semrush…).
- Criterio: Google Search Central manda; Yoast, Rank Math, Semrush y Ubersuggest como listas
  de verificación. No se ejecutaron sus herramientas ni se inventaron sus puntuaciones.

## Resultado por área

| Área                           | Resultado                                             | Evidencia y lectura                    |
| ------------------------------ | ----------------------------------------------------- | -------------------------------------- |
| Indexación y rastreo           | Aprobado / Parcial / **Fallido** / Pendiente de datos | …                                      |
| Canonical y sitemap            |                                                       |                                        |
| Idiomas (hreflang)             |                                                       |                                        |
| Títulos, descripciones, H1     |                                                       |                                        |
| Enlaces internos               |                                                       |                                        |
| Imágenes                       |                                                       |                                        |
| Datos estructurados            |                                                       |                                        |
| Rendimiento (laboratorio)      |                                                       |                                        |
| Contenido y confianza          |                                                       |                                        |
| GEO / llms.txt                 |                                                       |                                        |
| Posiciones, tráfico, backlinks | Pendiente de datos                                    | Requiere GSC / herramientas de mercado |

## Hallazgos

### 1. <Título del hallazgo> — prioridad crítica | alta | media | baja

**Hallazgo.** <Qué pasa, dónde (archivo/URL) y la evidencia.>

**Por qué importa.** <Con enlace a la fuente de Google cuando aplique.>

**Instrucciones ejecutables:**

1. …

**Criterio de cierre:** <cómo se comprueba que quedó resuelto.>

## Correcciones aplicadas (modo fix)

| Archivo | Cambio | Hallazgo |
| ------- | ------ | -------- |

## Pendientes que requieren a una persona

- [ ] Verificar el dominio en Google Search Console y enviar `/sitemap.xml`.
- [ ] …

## Próxima revisión

<Fecha sugerida y qué medir para comparar (consultas, CTR, CWV de campo).>

## Fuentes de criterio

- Google Search Central: …
```
