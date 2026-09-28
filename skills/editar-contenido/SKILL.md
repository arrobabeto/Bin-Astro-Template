---
name: editar-contenido
description: >-
  Cambia textos, imágenes, enlaces, navegación, datos de contacto o secciones
  de una página editando solo los archivos de src/content/. Úsala cuando pidan
  "cambia el texto de…", "actualiza el teléfono", "agrega una pregunta
  frecuente", "cambia la foto de…", "quita la sección de…" o cualquier ajuste
  de contenido sin cambiar el diseño.
---

# Editar contenido

Todo el texto del sitio vive en `src/content/`. Esta skill edita esos archivos, valida y
deja el cambio listo para revisión. No toca componentes ni estilos.

## Mapa del contenido

| Qué quiere cambiar la persona                                | Archivo                                                 |
| ------------------------------------------------------------ | ------------------------------------------------------- |
| Textos de una página (títulos, párrafos, botones, preguntas) | `src/content/pages/<idioma>/<página>.yaml` → `sections` |
| Título y descripción para Google de una página               | el mismo YAML → `title`, `description`, `seo`           |
| Menú, botón del encabezado, pie, contacto, redes             | `src/content/site/<idioma>.yaml`                        |
| Aviso de privacidad, términos                                | `src/content/legal/<idioma>/*.md`                       |
| Imágenes                                                     | `src/assets/images/` (y la ruta en el YAML)             |
| Nombre del sitio                                             | `src/config/site.ts`                                    |

Campos de cada tipo de sección: [docs/guias/secciones.md](../../docs/guias/secciones.md).
La página `index.yaml` es la home (`/`); `servicios.yaml` sería `/servicios`.

## Pasos

1. **Ubica** el archivo y el campo exacto con la tabla. Si no es obvio, busca el texto actual
   (`rg "texto actual" src/content`).
2. **Edita solo lo pedido.** Mantén el tono del sitio. No inventes datos (cifras, clientes,
   testimonios, precios): si hacen falta, pregúntalos.
3. **Reglas de YAML:**
   - Textos con `:` o `#` al inicio van entre comillas (`href: "#contacto"`).
   - Párrafos largos con `>-`; una línea en blanco doble separa párrafos en `body`.
   - Enlaces internos sin barra final: `/servicios`, no `/servicios/`.
4. **Imágenes:** copia el archivo a `src/assets/images/` con nombre en minúsculas y guiones,
   ancho ≥ 1600 px para hero (JPG/PNG/WebP; Astro genera versiones optimizadas). Actualiza
   `src` (ruta relativa desde el YAML) y escribe un `alt` que describa lo que se ve.
5. **Secciones:**
   - Cambiar texto: no cambies el `id`.
   - Agregar una sección: usa un tipo existente y un `id` nuevo en kebab-case, único en la página.
   - Quitar o agregar secciones: después corre `pnpm bsi:sync`.
6. **URLs:** si renombras un archivo de página (cambia la URL), agrega la redirección 301 con
   la skill `agregar-redireccion`.
7. **Valida:**

   ```bash
   pnpm dev          # revisa en http://localhost:4321
   pnpm verify       # antes de subir el cambio
   ```

   Si falla, lee el mensaje: los errores de contenido dicen el archivo y el campo.

## Si hay varios idiomas

Aplica el mismo cambio en cada idioma activo (`src/config/locales.ts`) o avisa qué idioma
quedó pendiente. No traduzcas literal: adapta.

## Entrega

Resume qué cambió (archivo y campo), muestra el antes/después del texto y recuerda revisar el
preview de Vercel antes de publicar.
