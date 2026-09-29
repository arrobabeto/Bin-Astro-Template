# Bin Astro Template

Template base para crear sitios web profesionales con [Astro](https://astro.build): contenido en
Git (sin CMS), SEO técnico completo, formularios opcionales, listo para varios idiomas y
preparado para integrarse con **Binflow** desde el primer día.

> **¿Primera vez aquí?** Lee [Empieza aquí](docs/guias/empieza-aqui.md). Explica el proyecto
> sin tecnicismos y te dice qué guía leer según lo que necesites.

## Un stack, no un sitio de ejemplo

Bin Astro Template (BAT) no trae estructura ni contenido sugerido. Su valor está en la
infraestructura: el modelo de páginas como secciones validadas, el SEO técnico, BSI, i18n,
los formularios opcionales, las revisiones automáticas y CI. La estructura y el contenido de
cada sitio se construyen desde cero con prompts, skills (`disenar-sitio`, `nueva-seccion`,
`construir-desde-figma`, `editar-contenido`…) y Figma.

Lo que hay en `src/content/`, `src/assets/images/` y los ocho tipos de sección es **material de
arranque**. Los tipos muestran el patrón de un bloque (schema, componente, registro y campos
BSI); cada sitio los reutiliza, los cambia o crea los suyos. La portada, la página de gracias,
los legales y las imágenes existen para que el build y las revisiones tengan algo que validar,
y `check:placeholders` exige sustituirlos después del bootstrap. Detalle en la
[ADR 0009](docs/adr/0009-stack-no-contenido.md).

## Qué incluye

- **Páginas como secciones validadas, sin CMS.** Cada página es un archivo YAML con una lista
  de secciones, y cada tipo de sección tiene su schema. Si falta un dato obligatorio, el sitio
  no se publica y el error dice exactamente qué corregir. Los tipos de sección se crean por
  sitio con la skill `nueva-seccion`.
- **SEO de base.** `sitemap.xml`, `robots.txt`, `llms.txt` y `llms-full.txt`, datos
  estructurados (JSON-LD), Open Graph, canonical, `hreflang`, página 404, redirecciones 301
  reales y `noindex` automático en los previews.
- **Rápido por diseño.** HTML estático, cero JavaScript por defecto, imágenes optimizadas y
  fuentes servidas desde el propio dominio.
- **Formularios opcionales.** Web3Forms, SendGrid o un simple enlace `mailto:`, más newsletter
  con MailerLite. Sin configurar nada, el sitio compila y funciona.
- **Medición opcional.** Google Tag Manager, Google Analytics 4 y Search Console con una
  variable de entorno cada uno.
- **Listo para Binflow.** Marcadores BSI e inventario de superficies incluidos (ver abajo).
- **Trabajo con IA.** Instrucciones y skills para Cursor, Claude Code y Codex, con un
  [inventario de skills](skills/INVENTARIO.md) documentado.
- **Calidad automática.** `pnpm verify` revisa código, contenido, SEO, enlaces, redirecciones,
  seguridad e inventario BSI, y corre pruebas en navegador. Lo mismo corre en CI.

## Inicio rápido

Requisitos: **Node.js 24** y **pnpm 11** (con `corepack enable` basta).

```bash
pnpm install
pnpm setup        # crea .env, sincroniza tipos e instala los hooks de Git
pnpm dev          # http://localhost:4321
```

Para convertir el template en el sitio de un cliente:

```bash
pnpm bootstrap    # pide nombre, dominio y contacto, y deja el proyecto listo
```

Paso a paso completo: [Crear un sitio nuevo](docs/guias/crear-sitio-nuevo.md). Con un agente de
IA basta con pedir `/nuevo-sitio`.

La portada que ves en `pnpm dev` es **relleno**: se borra con `pnpm demo:clear` cuando empiezas
el diseño. Pide al agente _"crea el home"_ y elige la ruta: desde Figma (página por página
según el `node-id`) o con Hallmark. Detalle: [Diseñar el sitio](docs/guias/disenar-el-sitio.md).

## Si no eres técnico

No necesitas tocar código. Abre el proyecto en Cursor, Claude Code o Codex y pide lo que
quieras en lenguaje natural: _"cambia el teléfono del pie de página"_, _"agrega una pregunta
frecuente sobre precios"_, _"haz una auditoría SEO"_. El agente sabe qué archivos editar y
revisa el resultado antes de proponerlo. Más detalles:
[Editar contenido con IA](docs/guias/editar-contenido-con-ia.md).

## Comandos

| Comando                                       | Qué hace                                                                |
| --------------------------------------------- | ----------------------------------------------------------------------- |
| `pnpm dev`                                    | Servidor local con recarga automática                                   |
| `pnpm build`                                  | Genera el sitio en `.vercel/output/`                                    |
| `pnpm preview`                                | Sirve el build local imitando a Vercel (puerto 4173)                    |
| `pnpm bootstrap`                              | Convierte el template en un sitio nuevo                                 |
| `pnpm demo:clear`                             | Borra la portada demo para empezar el diseño (`--dry-run` para simular) |
| `pnpm verify`                                 | Todas las revisiones de calidad, en el mismo orden que CI               |
| `pnpm bsi:sync`                               | Regenera el inventario de Binflow a partir del contenido                |
| `pnpm seo:extract`                            | Extrae los datos SEO de cada página a `.seo/extract.json`               |
| `pnpm brand:assets`                           | Regenera favicons e imagen social a partir del logo                     |
| `pnpm check:source`                           | Revisiones que no necesitan build (contenido, docs, skills…)            |
| `pnpm check:dist`                             | Revisiones sobre el build (SEO, BSI, redirecciones, secretos…)          |
| `pnpm test` / `test:integration` / `test:e2e` | Pruebas unitarias / casos de uso / pruebas en navegador con Playwright  |

Todos los comandos `check:*` están descritos en [Empieza aquí](docs/guias/empieza-aqui.md#revisiones-automáticas).

## Estructura

```text
src/content/        Contenido: páginas (YAML), textos legales (Markdown) y textos globales
src/components/     Componentes; cada tipo de sección tiene su componente y su schema
src/config/         Nombre del sitio, idiomas, redirecciones y dominio
src/styles/         Colores y tipografía (tokens de diseño)
binflow/            Inventario de superficies editables (BSI)
skills/             Skills para agentes de IA (con INVENTARIO.md)
scripts/            Revisiones automáticas y utilidades
docs/               Guías, decisiones de arquitectura (ADR) y auditorías SEO
```

## Listo para Binflow

[Binflow](docs/guias/binflow.md) permite que tu cliente pida cambios a su sitio desde Telegram:
Binflow prepara el cambio, genera una vista previa exacta, pide aprobación, publica y verifica
producción. Este template ya trae lo que Binflow necesita para encontrar y editar cada texto e
imagen de forma segura:

- Marcadores `data-bf-*` en cada sección, generados por `src/lib/bf.ts`.
- El inventario `binflow/surface-inventory.yaml`, generado con `pnpm bsi:sync`.
- Una revisión (`pnpm check:bsi`) que compara el inventario con el HTML publicado.

Sin Binflow, nada de esto afecta al sitio: son atributos invisibles y un archivo de texto. Si
el cliente decide contratarlo, la integración se reduce a conectar el repositorio. Cómo
funciona y cómo contratarlo: [guía de Binflow](docs/guias/binflow.md) y
[servicios recomendados](docs/guias/servicios-recomendados.md).

## Documentación

- [Empieza aquí](docs/guias/empieza-aqui.md): índice de guías y glosario.
- [Decisiones de arquitectura](docs/adr/README.md): por qué el template es como es.
- [Skills](skills/README.md) e [inventario de skills](skills/INVENTARIO.md).
- [Instrucciones para agentes](AGENTS.md) y [historial de cambios](CHANGELOG.md).

## Licencia

El código se publica con licencia [MIT](LICENSE): puedes usarlo, modificarlo y crear sitios
comerciales a partir de él, siempre que conserves el aviso de copyright. La skill
[`hallmark`](skills/hallmark/) es de terceros y conserva su propia licencia MIT.

### Marcas

Los nombres **Bin Astro Template**, **Binflow** y **BSI** (Binflow Surface Inventory) son marcas
de carácter privado de sus titulares. La licencia MIT cubre el código, no los nombres: no otorga
permiso para usarlos para nombrar, promocionar o distribuir productos derivados, ni para dar a
entender que tienen respaldo oficial. Sí puedes mencionarlos para describir con veracidad que tu
sitio parte de este template o es compatible con Binflow.
