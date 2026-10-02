# Contenido

<!-- check:docs ejemplos: src/content/pages/es/servicios.yaml src/content/pages/es/servicios/web.yaml -->

Todo el contenido del sitio vive en `src/content/`, en archivos de texto que Git versiona. No
hay base de datos ni CMS: editar un archivo y publicarlo es todo el proceso. La razón de esta
decisión está en la [ADR 0001](../adr/0001-contenido-en-git-sin-cms.md).

El template no trae contenido sugerido. Los archivos que hay en `src/content/` son material de
arranque: existen para que el build y las revisiones tengan algo que validar, y cada sitio los
sustituye por los suyos (ver [ADR 0009](../adr/0009-stack-no-contenido.md)). Los ejemplos de
esta guía muestran el formato, no textos que haya que usar.

## Las tres colecciones

| Carpeta                    | Formato  | Qué contiene                                          |
| -------------------------- | -------- | ----------------------------------------------------- |
| `src/content/pages/es/`    | YAML     | Páginas del sitio, cada una como lista de secciones   |
| `src/content/legal/es/`    | Markdown | Textos largos: aviso de privacidad, términos          |
| `src/content/site/es.yaml` | YAML     | Textos globales: menú, pie de página, contacto, redes |

Las reglas de cada colección (qué campos existen y cuáles son obligatorios) están en
`src/content.config.ts`. Si un archivo no las cumple, el build falla con un mensaje en
español que dice qué campo corregir.

## De archivo a URL

El nombre del archivo es la URL. La carpeta del idioma no aparece en la URL del idioma
principal:

| Archivo                                   | URL              |
| ----------------------------------------- | ---------------- |
| `src/content/pages/es/index.yaml`         | `/`              |
| `src/content/pages/es/servicios.yaml`     | `/servicios`     |
| `src/content/pages/es/servicios/web.yaml` | `/servicios/web` |
| `src/content/legal/es/privacidad.md`      | `/privacidad`    |

Usa nombres en minúsculas, sin acentos y con guiones (`quienes-somos.yaml`). **Cambiar el
nombre de un archivo publicado cambia su URL**: agrega una redirección 301 en
`src/config/redirects.ts` (skill `/agregar-redireccion`) para no perder posicionamiento.

Si dos archivos producen la misma URL (por ejemplo, una página y un texto legal con el mismo
nombre), el build falla y dice cuáles son.

## Una página

```yaml
title: Servicios de diseño web
description: >-
  Diseñamos sitios rápidos y optimizados para Google. Conoce nuestros planes
  y agenda una llamada sin compromiso.
updatedAt: 2026-09-28

sections:
  - type: hero
    id: hero
    heading: Diseño web para negocios que quieren crecer
    body: Sitios rápidos, claros y fáciles de mantener.
    cta:
      label: Agenda una llamada
      href: "#contacto"

  - type: contact
    id: contacto
    heading: Hablemos de tu proyecto
```

| Campo            | Obligatorio | Uso                                                               |
| ---------------- | ----------- | ----------------------------------------------------------------- |
| `title`          | sí          | Título de la pestaña y de Google (30 a 60 caracteres ideal)       |
| `description`    | sí          | Descripción en Google (70 a 160 caracteres ideal)                 |
| `sections`       | sí          | Bloques de la página, en orden. Ver [Secciones](secciones.md)     |
| `updatedAt`      | no          | Fecha de última actualización (se usa en el sitemap)              |
| `ogImage`        | no          | Imagen para redes sociales; si falta, se usa la del sitio         |
| `translationKey` | no          | Une traducciones con nombres distintos. Ver [Idiomas](idiomas.md) |
| `seo.title`      | no          | Título para Google distinto del visible                           |
| `seo.noindex`    | no          | `true` para que Google no la indexe (ej. página de gracias)       |
| `seo.canonical`  | no          | URL absoluta, solo si la página es copia de otra                  |

El nombre del sitio se agrega solo al título: `Servicios | Nombre del sitio`.

### El `id` de cada sección

Cada sección tiene un `id` en kebab-case (`nuestros-servicios`). Sirve para dos cosas:

- **Anclas:** `/#servicios` lleva directo a esa sección.
- **Binflow:** los identificadores BSI se construyen con él (`home.servicios.heading`).

Por eso **no se cambia el `id` de una sección publicada** sin correr `pnpm bsi:sync`. Dos
secciones de la misma página no pueden tener el mismo `id`.

## Textos legales

Archivos Markdown con encabezado:

```markdown
---
title: Aviso de privacidad
description: Cómo recabamos, usamos y protegemos tus datos personales.
updatedAt: 2026-09-28
---

## Responsable

Texto en Markdown normal…
```

Los que trae el template son una referencia genérica con el aviso "Plantilla de referencia".
Cada sitio los sustituye por los de su responsable, revisados legalmente;
`pnpm check:placeholders` impide publicarlos con el aviso en un sitio de cliente. La skill
`textos-legales` los redacta a partir de una entrevista y de lo que el sitio usa (ver
[Textos legales y cookies](textos-legales.md)).

## Textos globales (`site/es.yaml`)

Menú (`nav`), botón del encabezado (`headerCta`), pie de página (`footer`), datos de contacto
(`contact`), redes sociales (`social`), la imagen por defecto para redes (`ogImage` +
`ogImageAlt`) y dos rutas: `privacyHref` (enlazada desde los formularios) y `thankYouHref`
(página de agradecimiento).

## Página de agradecimiento

`src/content/pages/es/gracias.yaml` se muestra cuando alguien envía un formulario sin
JavaScript. Tiene `seo.noindex: true`, así que no aparece en Google ni en el sitemap. La página
se conserva porque los formularios la usan (`thankYouHref`), pero su texto se escribe para cada
sitio.

## Editar sin programar

Pide el cambio a un agente de IA: [Editar contenido con IA](editar-contenido-con-ia.md).
