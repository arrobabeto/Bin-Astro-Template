# Empieza aquí

Esta guía es el punto de entrada para cualquier persona que trabaje con el template, sepa o no
de programación. Explica qué es, cómo está organizado y qué guía leer para cada tarea.

## Qué es este proyecto

**Bin Astro Template (BAT)** es la base técnica, el _stack_, con la que se construyen sitios
web nuevos. No es un sitio de ejemplo para adaptar: no trae estructura ni contenido sugerido.
Lo que trae resuelto es lo difícil y repetitivo: SEO técnico, velocidad, accesibilidad,
seguridad, formularios, idiomas, integración con Binflow y revisiones automáticas. La
estructura y el contenido de cada sitio se crean desde cero con prompts, skills y Figma.

Cuatro ideas lo definen:

1. **Stack, no contenido.** El valor está en la infraestructura, no en lo que trae escrito.
   Cada sitio diseña sus propias páginas y bloques.
2. **El contenido vive en archivos, no en un CMS.** Cada página es un archivo de texto (YAML)
   dentro de `src/content/`, validado contra el schema de sus secciones. Git guarda el
   historial de cada cambio y permite revertirlo.
3. **Se construye y se edita con IA.** Un agente de IA (Cursor, Claude Code o Codex) crea las
   páginas y los bloques con las skills del proyecto, y las personas no técnicas le piden los
   cambios después. El agente conoce las reglas del proyecto y revisa su trabajo.
4. **Nada se publica roto.** Si falta un título, una imagen no tiene texto alternativo o un
   enlace apunta a una página que no existe, las revisiones automáticas lo detectan antes de
   publicar.

## Qué trae y qué construyes tú

| Infraestructura (se conserva)                             | Material de arranque (se sustituye)                              |
| --------------------------------------------------------- | ---------------------------------------------------------------- |
| Modelo de páginas como secciones validadas                | Los ocho tipos de sección (`hero`, `features`, `faq`…)           |
| SEO técnico: metadatos, JSON-LD, sitemap, `llms.txt`      | La portada demo (`index.yaml`), que borra `pnpm demo:clear`      |
| BSI para Binflow, i18n, formularios y medición opcionales | `gracias.yaml`, los textos legales y los textos de `site/*.yaml` |
| Revisiones automáticas (`pnpm verify`) y CI               | Las imágenes de `src/assets/images/` y el logo                   |

Los tipos de sección muestran cómo se arma un bloque completo (schema, componente, registro y
campos BSI). No son un catálogo que haya que respetar: úsalos si encajan con el diseño,
cámbialos o crea los tuyos con la skill `nueva-seccion`. El resto del material de arranque
existe para que el build y las revisiones tengan algo que validar; tras `pnpm bootstrap`,
`check:placeholders` exige sustituirlo. La decisión está en la
[ADR 0009](../adr/0009-stack-no-contenido.md).

## Qué guía leer

| Quiero…                                                | Guía                                                         |
| ------------------------------------------------------ | ------------------------------------------------------------ |
| Crear el sitio de un cliente nuevo                     | [Crear un sitio nuevo](crear-sitio-nuevo.md)                 |
| Diseñar la estructura del sitio (Figma o Hallmark)     | [Diseñar el sitio](disenar-el-sitio.md)                      |
| Cambiar textos o imágenes sin programar                | [Editar contenido con IA](editar-contenido-con-ia.md)        |
| Entender cómo se organiza el contenido                 | [Contenido](contenido.md)                                    |
| Entender cómo se arma un bloque y crear los propios    | [Secciones](secciones.md)                                    |
| Agregar imágenes correctamente                         | [Imágenes](imagenes.md)                                      |
| Cambiar colores, tipografía o logo                     | [Diseño y marca](diseno-y-marca.md)                          |
| Publicar el sitio en internet                          | [Despliegue en Vercel](despliegue-vercel.md)                 |
| Configurar el dominio y otras variables                | [Variables de entorno](variables-de-entorno.md)              |
| Activar el formulario de contacto o newsletter         | [Formularios y email](formularios-y-email.md)                |
| Medir visitas (Analytics, Tag Manager, Search Console) | [Analytics](analytics.md)                                    |
| Crear el aviso de privacidad y el banner de cookies    | [Textos legales y cookies](textos-legales.md)                |
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
src/components/sections/  Un componente + un schema por tipo de sección (se crean por sitio)
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

| Revisión             | Qué comprueba                                                                         |
| -------------------- | ------------------------------------------------------------------------------------- |
| `lint`               | Calidad del código y accesibilidad de los componentes                                 |
| `format:check`       | Formato uniforme (Prettier)                                                           |
| `typecheck`          | Tipos de TypeScript y que el contenido cumpla sus schemas                             |
| `check:node`         | Que Node y pnpm estén fijados igual en todos lados                                    |
| `check:env`          | Que las variables de formularios y correo tengan el nombre correcto y estén completas |
| `check:placeholders` | Que no quede texto de relleno (lorem ipsum, TODO) ni datos del template               |
| `check:docs`         | Que las rutas y enlaces citados en la documentación existan                           |
| `check:assets`       | Que ninguna imagen sea demasiado pesada                                               |
| `check:sections`     | Que cada tipo de sección esté completo: schema, componente, registro y marcadores     |
| `check:skills`       | Que las skills estén bien formadas y en el inventario                                 |
| `check:i18n`         | Que cada idioma activo tenga sus páginas y traducciones                               |
| `check:site-url`     | Que el dominio de producción sea válido                                               |
| `check:headers`      | Que las cabeceras de seguridad de `vercel.json` sean correctas                        |
| `test`               | Pruebas unitarias y de coherencia entre código, documentación y CI                    |
| `test:integration`   | Casos de uso reales (bootstrap, nueva página, idioma, revisiones) en una copia        |
| `build:ci`           | Build con un dominio de prueba                                                        |
| `check:bsi`          | Que el inventario de Binflow coincida con el HTML publicado                           |
| `check:seo`          | Títulos, descripciones, H1, canonical, hreflang, imágenes, enlaces, sitemap…          |
| `check:redirects`    | Que las redirecciones sean 301 reales y sin cadenas                                   |
| `check:no-localhost` | Que no quede ningún `localhost` en el sitio publicado                                 |
| `check:leakage`      | Que ninguna clave secreta termine en el código o en el sitio                          |
| `test:e2e`           | Pruebas en navegador (escritorio y móvil) e historias de visitante                    |

`check:headers` y `check:no-localhost` también revisan un sitio ya publicado:
`pnpm check:headers --live https://www.ejemplo.mx`.

## Glosario

- **Astro:** el framework que convierte el contenido y los componentes en páginas HTML.
- **Build:** el proceso que genera el sitio final. Aquí es donde fallan los errores de
  contenido, antes de publicar.
- **Sección:** un bloque de página (una portada, una lista de servicios, unas preguntas…).
  Cada página es una lista de secciones, y cada sitio define los tipos que necesita.
- **Schema:** las reglas de cada sección: qué campos tiene, cuáles son obligatorios y qué
  formato llevan.
- **YAML:** formato de texto para datos. La sangría importa: usa espacios, nunca tabuladores.
- **Preview:** una versión de prueba del sitio que Vercel publica para cada cambio. Nunca se
  indexa en Google.
- **BSI (Binflow Surface Inventory):** la lista de textos e imágenes que Binflow puede editar.
- **Material de arranque:** los tipos de sección y archivos de contenido que trae el template
  para que el build tenga qué validar. Se sustituyen en cada sitio.
- **Skill:** instrucciones empaquetadas que enseñan a un agente de IA a hacer una tarea
  concreta del proyecto.
- **ADR:** documento corto que registra una decisión técnica y su porqué.
