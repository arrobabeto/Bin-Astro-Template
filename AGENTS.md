# AGENTS.md

Instrucciones para agentes de IA (Cursor, Claude Code, Codex) que trabajen en este repositorio.
Es la fuente única: `CLAUDE.md` y `.cursor/rules/` apuntan aquí. Responde en español salvo que la
persona escriba en otro idioma.

## Qué es este proyecto

**Bin Astro Template**: base para sitios web en Astro 7 sin CMS. El contenido vive en Git
(YAML y Markdown validados con Zod), el sitio es estático en Vercel con endpoints opcionales
para formularios, trae SEO técnico completo y está listo para integrarse con Binflow mediante
el contrato BSI. Visión general para personas: [README.md](README.md).

Es un **template de stack, no un sitio de ejemplo** ([ADR 0009](docs/adr/0009-stack-no-contenido.md)).
Su valor es la infraestructura: páginas como secciones validadas, SEO técnico, BSI, i18n,
formularios opcionales, checks y CI. La estructura y el contenido de cada sitio se construyen
desde cero con prompts, skills y Figma. Los tipos de sección, la portada, `gracias.yaml`, los
legales y las imágenes que trae son material de arranque: no los trates como una estructura que
haya que seguir.

## Mapa rápido

| Qué                                        | Dónde                                                                              |
| ------------------------------------------ | ---------------------------------------------------------------------------------- |
| Contenido de páginas (secciones)           | `src/content/pages/<idioma>/<slug>.yaml`                                           |
| Textos globales (menú, pie, contacto)      | `src/content/site/<idioma>.yaml`                                                   |
| Legales                                    | `src/content/legal/<idioma>/*.md`                                                  |
| Tipos de sección                           | `src/components/sections/` (`Section*.astro` + `.schema.ts`)                       |
| Registro de secciones                      | `src/components/sections/registry.ts` y `AnySection.astro`                         |
| Campos editables por Binflow               | `src/lib/bsi-fields.ts` → `binflow/surface-inventory.yaml`                         |
| Identidad, idiomas, redirecciones          | `src/config/` (`site.ts`, `locales.ts`, `redirects.ts`)                            |
| Colores, tipografía, espaciado             | `src/styles/global.css` (tokens `@theme`)                                          |
| SEO (head, JSON-LD, sitemap, robots, llms) | `src/components/seo/`, `src/lib/seo.ts`, `src/lib/jsonld.ts`, `src/pages/*.ts`     |
| Formularios y email                        | `src/lib/forms*.ts`, `src/pages/api/`                                              |
| Scripts y checks                           | `scripts/`                                                                         |
| Guías                                      | `docs/guias/` (índice en [docs/guias/empieza-aqui.md](docs/guias/empieza-aqui.md)) |
| Decisiones de arquitectura                 | `docs/adr/`                                                                        |

## Skills

Las skills están en `skills/` (enlazadas desde `.cursor/skills`, `.claude/skills`, `.codex/skills`
y `.agents/skills`). Antes de una tarea, revisa si hay una skill para ella y síguela.

| Tarea                                          | Skill                                               |
| ---------------------------------------------- | --------------------------------------------------- |
| Cambiar textos, imágenes, menú, contacto       | `editar-contenido`                                  |
| Auditar o corregir SEO                         | `seo-audit`                                         |
| Crear el sitio de un cliente desde el template | `nuevo-sitio`                                       |
| Crear el home / empezar el diseño del sitio    | `disenar-sitio` (borra la portada demo)             |
| Crear un tipo de bloque nuevo                  | `nueva-seccion`                                     |
| Cambiar o migrar URLs                          | `agregar-redireccion`                               |
| Agregar un idioma                              | `agregar-idioma`                                    |
| Mantener el inventario de Binflow              | `bsi-sync`                                          |
| Publicar un artículo de blog                   | `publicar-articulo`                                 |
| Implementar un diseño de Figma                 | `construir-desde-figma`, `figma-rest-design-reader` |
| Diseño visual con criterio                     | `hallmark`                                          |

Detalle de cada una: [skills/INVENTARIO.md](skills/INVENTARIO.md).

## Reglas

### Contenido

- El texto editorial vive en `src/content/`. **Nunca** escribas copy dentro de componentes; los
  textos de interfaz (etiquetas de formularios, accesibilidad) van en `src/i18n/ui.ts`.
- No inventes datos: cifras, clientes, testimonios, precios, premios o experiencia. Si faltan,
  pregunta.
- La portada del template (`src/content/pages/es/index.yaml` con el marcador
  `bin-astro-template:demo`) es relleno: no la adaptes para construir el sitio. Cuando pidan
  crear el home, usa la skill `disenar-sitio`, que la borra con `pnpm demo:clear`.
- El `id` de una sección es estable (anclas y Binflow). No lo cambies sin motivo; si agregas,
  quitas o renombras secciones, corre `pnpm bsi:sync` y sube el inventario en el mismo commit.
- Cambiar un slug cambia la URL: agrega la redirección 301 en `src/config/redirects.ts`.
- Toda imagen lleva `alt` descriptivo y vive en `src/assets/` (se optimiza con `astro:assets`).

### Código

- TypeScript estricto, sin `any`. Imports de tipos con `import type`.
- Colores y fuentes solo como tokens de `src/styles/global.css` (el lint bloquea `#hex` en
  componentes).
- Cero JavaScript de cliente salvo necesidad real (hoy solo la mejora progresiva de formularios).
- Los secretos (`SENDGRID_API_KEY`, `MAILERLITE_API_KEY`) solo se leen en `src/lib/` y
  `src/pages/api/` vía `astro:env/server`; los componentes no pueden importarlo (lint).
- Ninguna variable de entorno es obligatoria: el build debe pasar sin ninguna.
- Una sección nueva requiere schema, componente, registro, `AnySection`, `bsi-fields.ts` y
  `llms.ts` (`pnpm check:sections` lo verifica). Usa la skill `nueva-seccion`.
- Los bloques de un sitio salen de su diseño. Reutiliza un tipo de arranque solo si encaja sin
  forzar el diseño; si no, crea el tipo o modifica el existente.
- Node 24 y pnpm 11. No agregues dependencias sin justificarlo.

### Documentación

- **La documentación se actualiza en el mismo cambio que el código.** Si cambias cómo se usa
  algo, actualiza su guía en `docs/guias/`; si tomas una decisión de arquitectura, escribe un
  ADR en `docs/adr/`. `pnpm check:docs` verifica que las rutas citadas existan; las rutas de
  ejemplo que no existen a propósito se declaran en el documento con
  `<!-- check:docs ejemplos: ruta1 ruta2 -->`.
- Todo en español, claro para personas no técnicas.
- **Skills:** al agregar, cambiar o eliminar una skill, actualiza
  [skills/INVENTARIO.md](skills/INVENTARIO.md) en el mismo cambio (fila en la tabla y ficha
  completa). `pnpm check:skills` falla si no. Plantilla: `skills/_plantilla/`.
- Las skills de terceros (`skills-lock.json`) no se editan.

### Git

- No hagas commit directo a `main` (el hook lo bloquea): trabaja en ramas `feature/*`, `fix/*` o
  `contenido/*`.
- No incluyas, descartes ni escondas cambios ajenos. `git add` con rutas explícitas.
- Nada de push forzado ni reescritura de historia compartida.

## Verificación

Antes de dar por terminada una tarea:

```bash
pnpm verify
```

Encadena: lint → formato → tipos → checks de código → pruebas unitarias → casos de uso (`tests/integration/`) → build → checks del
sitio publicado (SEO, BSI, redirecciones, localhost, secretos) → pruebas e2e. Para iterar más
rápido: `pnpm lint`, `pnpm typecheck`, `pnpm build:ci && pnpm check:dist`.

Si un check falla, su mensaje dice el archivo y la causa. No desactives un check para que pase:
arregla la causa o explica por qué el check está mal.
