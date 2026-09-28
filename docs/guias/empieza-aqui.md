# Empieza aquí

Esta guía es el punto de entrada para cualquier persona que trabaje con el template, sepa o no
de programación. Explica qué es, cómo está organizado y qué guía leer para cada tarea.

## Qué es este proyecto

**Bin Astro Template** es la base con la que se construyen sitios web nuevos. En lugar de
empezar cada sitio desde cero, se copia este template, se cambia el contenido y la marca, y se
publica. Todo lo difícil (SEO técnico, velocidad, accesibilidad, seguridad, formularios,
revisiones automáticas) ya está resuelto.

Tres ideas lo definen:

1. **El contenido vive en archivos, no en un CMS.** Cada página es un archivo de texto (YAML)
   dentro de `src/content/`. Cambiar un texto es editar ese archivo. Git guarda el historial
   de cada cambio y permite revertirlo.
2. **Se edita con IA.** Las personas no técnicas piden los cambios a un agente de IA (Cursor,
   Claude Code o Codex), que conoce las reglas del proyecto y revisa su trabajo.
3. **Nada se publica roto.** Si falta un título, una imagen no tiene texto alternativo o un
   enlace apunta a una página que no existe, las revisiones automáticas lo detectan antes de
   publicar.

## Qué guía leer

| Quiero…                                                | Guía                                                         |
| ------------------------------------------------------ | ------------------------------------------------------------ |
| Crear el sitio de un cliente nuevo                     | [Crear un sitio nuevo](crear-sitio-nuevo.md)                 |
| Cambiar textos o imágenes sin programar                | [Editar contenido con IA](editar-contenido-con-ia.md)        |
| Entender cómo se organiza el contenido                 | [Contenido](contenido.md)                                    |
| Saber qué bloques existen y qué campos tienen          | [Secciones](secciones.md)                                    |
| Agregar imágenes correctamente                         | [Imágenes](imagenes.md)                                      |
| Cambiar colores, tipografía o logo                     | [Diseño y marca](diseno-y-marca.md)                          |
| Publicar el sitio en internet                          | [Despliegue en Vercel](despliegue-vercel.md)                 |
| Configurar el dominio y otras variables                | [Variables de entorno](variables-de-entorno.md)              |
| Activar el formulario de contacto o newsletter         | [Formularios y email](formularios-y-email.md)                |
| Medir visitas (Analytics, Tag Manager, Search Console) | [Analytics](analytics.md)                                    |
| Entender y mejorar el SEO                              | [SEO](seo.md)                                                |
| Hacer el sitio bilingüe                                | [Idiomas](idiomas.md)                                        |
| Conectar el sitio a Binflow                            | [Binflow](binflow.md)                                        |
| Elegir servicios de email o contratar Binflow          | [Servicios recomendados](servicios-recomendados.md)          |
| Usar o crear skills para agentes                       | [Skills](skills.md)                                          |
| Traer mejoras del template a un sitio existente        | [Actualizar desde el template](actualizar-desde-template.md) |
| Actualizar Astro y demás dependencias                  | [Actualizar dependencias](actualizar-dependencias.md)        |

Las razones detrás de cada decisión técnica están en las [ADR](../adr/README.md).

## Mapa del proyecto

```text
src/content/pages/es/     Una página por archivo: index.yaml es la home (/)
src/content/legal/es/     Aviso de privacidad y términos (Markdown)
src/content/site/es.yaml  Menú, pie de página, contacto e imagen para redes
src/assets/               Imágenes del contenido y de la marca
src/components/sections/  Un componente + un schema por tipo de sección
src/config/               Nombre del sitio, idiomas, redirecciones, dominio
src/styles/global.css     Colores y tipografía
binflow/                  Inventario de superficies editables para Binflow
skills/                   Skills para agentes de IA
scripts/                  Revisiones automáticas y utilidades
docs/                     Esta documentación
```

## Revisiones automáticas

`pnpm verify` corre todo en orden y se detiene en el primer error. CI (GitHub Actions) corre
las mismas revisiones en cada pull request.

| Revisión             | Qué comprueba                                                                     |
| -------------------- | --------------------------------------------------------------------------------- |
| `lint`               | Calidad del código y accesibilidad de los componentes                             |
| `format:check`       | Formato uniforme (Prettier)                                                       |
| `typecheck`          | Tipos de TypeScript y que el contenido cumpla sus schemas                         |
| `check:node`         | Que Node y pnpm estén fijados igual en todos lados                                |
| `check:placeholders` | Que no quede texto de relleno (lorem ipsum, TODO) ni datos del template           |
| `check:docs`         | Que las rutas y enlaces citados en la documentación existan                       |
| `check:assets`       | Que ninguna imagen sea demasiado pesada                                           |
| `check:sections`     | Que cada tipo de sección esté completo: schema, componente, registro y marcadores |
| `check:skills`       | Que las skills estén bien formadas y en el inventario                             |
| `check:i18n`         | Que cada idioma activo tenga sus páginas y traducciones                           |
| `check:site-url`     | Que el dominio de producción sea válido                                           |
| `check:headers`      | Que las cabeceras de seguridad de `vercel.json` sean correctas                    |
| `test`               | Pruebas unitarias y de coherencia entre código, documentación y CI                |
| `test:integration`   | Casos de uso reales (bootstrap, nueva página, idioma, revisiones) en una copia    |
| `build:ci`           | Build con un dominio de prueba                                                    |
| `check:bsi`          | Que el inventario de Binflow coincida con el HTML publicado                       |
| `check:seo`          | Títulos, descripciones, H1, canonical, hreflang, imágenes, enlaces, sitemap…      |
| `check:redirects`    | Que las redirecciones sean 301 reales y sin cadenas                               |
| `check:no-localhost` | Que no quede ningún `localhost` en el sitio publicado                             |
| `check:leakage`      | Que ninguna clave secreta termine en el código o en el sitio                      |
| `test:e2e`           | Pruebas en navegador (escritorio y móvil) e historias de visitante                |

`check:headers` y `check:no-localhost` también revisan un sitio ya publicado:
`pnpm check:headers --live https://www.ejemplo.mx`.

## Glosario

- **Astro:** el framework que convierte el contenido y los componentes en páginas HTML.
- **Build:** el proceso que genera el sitio final. Aquí es donde fallan los errores de
  contenido, antes de publicar.
- **Sección:** un bloque de página (hero, servicios, preguntas…). Cada página es una lista de
  secciones.
- **Schema:** las reglas de cada sección: qué campos tiene, cuáles son obligatorios y qué
  formato llevan.
- **YAML:** formato de texto para datos. La sangría importa: usa espacios, nunca tabuladores.
- **Preview:** una versión de prueba del sitio que Vercel publica para cada cambio. Nunca se
  indexa en Google.
- **BSI (Binflow Surface Inventory):** la lista de textos e imágenes que Binflow puede editar.
- **Skill:** instrucciones empaquetadas que enseñan a un agente de IA a hacer una tarea
  concreta del proyecto.
- **ADR:** documento corto que registra una decisión técnica y su porqué.
