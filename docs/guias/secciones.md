# Secciones

Cada página es una lista de secciones. Cada sección tiene un `type` (qué bloque es), un `id`
estable y sus campos. Esta guía es la referencia de todos los tipos disponibles. La razón de
este modelo está en la [ADR 0002](../adr/0002-paginas-como-secciones-yaml.md).

## Campos comunes

| Campo  | Formato                          | Nota                                                            |
| ------ | -------------------------------- | --------------------------------------------------------------- |
| `type` | uno de los tipos de abajo        | Obligatorio                                                     |
| `id`   | kebab-case: `nuestros-servicios` | Obligatorio, único en la página, no se cambia una vez publicado |
| enlace | `{ label, href }`                | `href` empieza con `/`, `#`, `https://`, `mailto:` o `tel:`     |
| imagen | `{ src, alt }`                   | `src` relativo a `src/assets/`; `alt` obligatorio               |

Los textos largos aceptan párrafos separados por una línea en blanco (con `>-` en YAML).

La primera sección de la página lleva el `<h1>`; las demás usan `<h2>`. Por eso cada página
tiene exactamente un H1 sin que tengas que pensarlo.

## Tipos disponibles

### `hero` — Portada

Bloque principal al inicio de la página.

| Campo          | Obligatorio | Descripción                 |
| -------------- | ----------- | --------------------------- |
| `eyebrow`      | no          | Texto corto sobre el título |
| `heading`      | sí          | Título                      |
| `body`         | no          | Texto de apoyo              |
| `image`        | no          | Imagen a un lado            |
| `cta`          | no          | Botón principal             |
| `secondaryCta` | no          | Botón secundario            |

```yaml
- type: hero
  id: hero
  eyebrow: Tu sitio, sin complicaciones
  heading: Sitios web profesionales listos para crecer
  body: Un sitio rápido, bien posicionado y fácil de actualizar.
  image:
    src: ../../../assets/images/hero.jpg
    alt: Ilustración de una página web sobre fondo azul
  cta:
    label: Agenda una llamada
    href: "#contacto"
```

### `features` — Lista de beneficios o servicios

| Campo     | Obligatorio  | Descripción                 |
| --------- | ------------ | --------------------------- |
| `eyebrow` | no           | Texto corto sobre el título |
| `heading` | sí           | Título                      |
| `body`    | no           | Introducción                |
| `items`   | sí (1 o más) | Lista de `{ title, body }`  |

### `split` — Texto con imagen

| Campo           | Obligatorio | Descripción                            |
| --------------- | ----------- | -------------------------------------- |
| `eyebrow`       | no          | Texto corto sobre el título            |
| `heading`       | sí          | Título                                 |
| `body`          | sí          | Texto (admite varios párrafos)         |
| `image`         | sí          | Imagen                                 |
| `imagePosition` | no          | `left` o `right` (por defecto `right`) |
| `cta`           | no          | Botón                                  |

### `faq` — Preguntas frecuentes

Genera también los datos estructurados `FAQPage` para Google.

| Campo     | Obligatorio  | Descripción                     |
| --------- | ------------ | ------------------------------- |
| `heading` | sí           | Título                          |
| `intro`   | no           | Introducción                    |
| `items`   | sí (1 o más) | Lista de `{ question, answer }` |

### `prose` — Texto corrido

| Campo     | Obligatorio | Descripción                    |
| --------- | ----------- | ------------------------------ |
| `heading` | no          | Título                         |
| `body`    | sí          | Texto (admite varios párrafos) |

### `cta` — Llamado a la acción

| Campo     | Obligatorio | Descripción |
| --------- | ----------- | ----------- |
| `heading` | sí          | Título      |
| `body`    | no          | Texto       |
| `cta`     | sí          | Botón       |

### `contact` — Formulario de contacto

Muestra el formulario del proveedor configurado. Sin configuración, muestra un enlace de correo
al email de `src/content/site/es.yaml`. Ver [Formularios y email](formularios-y-email.md).

| Campo     | Obligatorio | Descripción |
| --------- | ----------- | ----------- |
| `heading` | sí          | Título      |
| `body`    | no          | Texto       |

### `newsletter` — Suscripción

Solo se muestra si `PUBLIC_NEWSLETTER_ENABLED=true` (MailerLite). Si está desactivado, la
sección no aparece y no deja huecos.

| Campo     | Obligatorio | Descripción |
| --------- | ----------- | ----------- |
| `heading` | sí          | Título      |
| `body`    | no          | Texto       |

## Cómo está construida una sección

Cada tipo tiene tres piezas en `src/components/sections/`:

- `SectionX.schema.ts`: los campos y sus reglas (Zod).
- `SectionX.astro`: el componente que la dibuja.
- Una línea en `registry.ts` que une el `type` con su schema.

Cada campo visible lleva un marcador BSI (`bf()`), y `pnpm check:sections` comprueba que las
tres piezas y los marcadores estén completos y coincidan con `src/lib/bsi-fields.ts`.

## Crear un tipo nuevo

Pide `/nueva-seccion` a tu agente (por ejemplo, _"crea una sección de testimonios"_). La skill
crea las tres piezas, registra los campos BSI, actualiza esta guía y corre las revisiones. Un
tipo nuevo **debe** documentarse aquí en el mismo cambio.
