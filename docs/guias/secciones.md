# Secciones

Cada página es una lista de secciones. Cada sección tiene un `type` (qué bloque es), un `id`
estable y sus campos. La razón de este modelo está en la
[ADR 0002](../adr/0002-paginas-como-secciones-yaml.md).

Lo que el template aporta es **el modelo**: cómo se define un bloque, cómo se valida y cómo
queda disponible para Binflow. Los tipos que trae son **bloques de arranque**. Muestran el
patrón completo y dan al build algo que validar, pero no son un catálogo que haya que respetar.
Cada sitio los reutiliza si encajan con su diseño, los modifica, los quita o crea los suyos con
`/nueva-seccion` (ver [ADR 0009](../adr/0009-stack-no-contenido.md)). Esta guía documenta los
tipos que existen en el proyecto: cuando un sitio agrega, cambia o quita uno, la actualiza en
el mismo cambio.

## Campos comunes

| Campo  | Formato                          | Nota                                                            |
| ------ | -------------------------------- | --------------------------------------------------------------- |
| `type` | un tipo registrado en el sitio   | Obligatorio                                                     |
| `id`   | kebab-case: `nuestros-servicios` | Obligatorio, único en la página, no se cambia una vez publicado |
| enlace | `{ label, href }`                | `href` empieza con `/`, `#`, `https://`, `mailto:` o `tel:`     |
| imagen | `{ src, alt }`                   | `src` relativo a `src/assets/`; `alt` obligatorio               |

Los textos largos aceptan párrafos separados por una línea en blanco (con `>-` en YAML).

La primera sección de la página lleva el `<h1>`; las demás usan `<h2>`. Por eso cada página
tiene exactamente un H1 sin que tengas que pensarlo.

## Tipos de arranque

Los ocho tipos que trae el template. Los ejemplos muestran el formato de los campos, no textos
ni estructuras sugeridas.

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
  eyebrow: Texto corto sobre el título
  heading: Título principal de la página
  body: Una o dos frases de apoyo.
  image:
    src: ../../../assets/images/portada.jpg
    alt: Descripción de lo que muestra la imagen
  cta:
    label: Texto del botón
    href: "#id-de-otra-seccion"
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

Este es el patrón que el template aporta y que siguen tanto los tipos de arranque como los que
cree cada sitio. En `src/components/sections/`:

- `SectionX.schema.ts`: los campos y sus reglas (Zod).
- `SectionX.astro`: el componente que la dibuja.
- Una línea en `registry.ts` que une el `type` con su schema, y otra en `AnySection.astro` que
  lo une con su componente.

Fuera de esa carpeta, `src/lib/bsi-fields.ts` declara qué campos puede editar Binflow y
`src/lib/llms.ts` cómo se resume el bloque en `llms-full.txt`. Cada campo visible lleva un
marcador BSI (`bf()`), y `pnpm check:sections` comprueba que las piezas y los marcadores estén
completos y coincidan con `src/lib/bsi-fields.ts`.

## Crear, cambiar o quitar tipos

- **Crear:** pide `/nueva-seccion` a tu agente (por ejemplo, _"crea una sección de
  testimonios"_ o _"crea el bloque del frame 12-4 de Figma"_). La skill crea las piezas,
  registra los campos BSI, actualiza esta guía y corre las revisiones. Es el camino normal
  cuando el diseño pide un bloque que no existe, aunque se parezca a uno de arranque.
- **Cambiar:** un tipo de arranque se puede rediseñar o cambiar de campos. Si cambian los
  campos, actualiza `src/lib/bsi-fields.ts`, esta guía y el contenido que lo usa, y corre
  `pnpm bsi:sync`.
- **Quitar:** si ningún contenido lo usa, borra su componente y su schema, y sácalo de
  `registry.ts`, `AnySection.astro`, `src/lib/bsi-fields.ts`, `src/lib/llms.ts` y esta guía.
  `pnpm check:sections` y `pnpm typecheck` avisan si queda alguna pieza suelta. Algunas
  pruebas del template usan tipos de arranque como ejemplo (`tests/unit/section-schemas.test.ts`
  y los casos de `tests/integration/`): si quitas uno, ajústalas en el mismo cambio.

Cualquier alta, cambio o baja de un tipo **debe** documentarse aquí en el mismo cambio.
