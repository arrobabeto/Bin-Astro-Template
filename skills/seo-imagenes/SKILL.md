---
name: seo-imagenes
description: >-
  Optimiza las imágenes para buscadores: les pone un nombre de archivo
  descriptivo con buenas prácticas SEO (inferido del nombre actual, de la
  sección y el texto que la rodea o viendo la imagen), actualiza todas sus
  citas y escribe el texto alternativo (alt) y el pie de foto (caption) en el
  contenido. Se apoya en `optimizar-imagenes` para el peso. Úsala cuando pidan
  "mejora el SEO de las imágenes", "ponle alt a las fotos", "renombra las
  imágenes", "agrega pies de foto" o al subir fotos con nombres como IMG_2041.
---

# SEO de imágenes

Cada imagen con un nombre que la describe, un `alt` útil y, cuando aporta, un `caption`.

Criterios detallados y ejemplos: [references/criterios.md](references/criterios.md).

## Input

- **Obligatorio:** qué imágenes (archivo, página o "todas").
- **Opcional:** palabra clave o intención de la página, datos que deba mencionar el caption
  (lugar, persona, créditos de la foto).

## Preflight

1. `git status -sb`: no mezcles el trabajo con cambios ajenos.
2. Inventario de lo que hay y sus problemas:

   ```bash
   node skills/seo-imagenes/scripts/auditar-imagenes.mjs
   ```

   Lista cada imagen con su peso, medidas, dónde se usa y su `alt`/`caption`, y marca los
   problemas (nombre genérico, alt corto o que repite el archivo, imagen sin usar).

## Pasos

1. **Peso primero.** Si alguna imagen no está optimizada (JPG/PNG pesados en `src/assets/`),
   aplica la skill `optimizar-imagenes` antes de renombrar.
2. **Entiende cada imagen**, en este orden, y quédate con la primera fuente suficiente:
   1. El nombre actual, si ya dice algo (`equipo-oficina.jpg`).
   2. La sección donde se usa: `heading`, `body`, `id` de la sección y la página
      (la auditoría dice el archivo y la sección).
   3. **Mirar la imagen** cuando el nombre no dice nada (`IMG_2041`, `foto-final`) o el
      contexto es ambiguo. Si tu herramienta no abre AVIF, genera una copia PNG temporal:
      `node skills/seo-imagenes/scripts/vista-previa.mjs <imagen>`.
3. **Renombra** con un nombre descriptivo de 3 a 6 palabras (puedes pasar la frase tal cual;
   el script la convierte y corrige todas las citas):

   ```bash
   node skills/seo-imagenes/scripts/renombrar-imagen.mjs <imagen> "Dentista revisando radiografía" --dry-run
   node skills/seo-imagenes/scripts/renombrar-imagen.mjs <imagen> "Dentista revisando radiografía"
   ```

4. **Escribe el `alt`** en el YAML o Markdown donde se usa la imagen (no en componentes):
   describe lo que se ve y por qué importa en esa página, en 80–125 caracteres, en el idioma de
   la página. Cada idioma lleva su propio `alt`.
5. **Agrega `caption` solo si aporta** información que no está en el texto: lugar, fecha,
   nombre de una persona, crédito de la foto o una aclaración. Se muestra como pie de foto
   visible. En secciones con imagen (`hero`, `split`) va junto al `alt`:

   ```yaml
   image:
     src: ../../../assets/images/dentista-revisando-radiografia.avif
     alt: Dentista explicando una radiografía panorámica a una paciente en el consultorio
     caption: Consultorio de Monterrey, abierto de lunes a sábado.
   ```

   Si el tipo de sección o la colección no tiene `caption`, no lo fuerces: repórtalo o agrégalo
   con la skill `nueva-seccion`.

6. **Imagen para redes (`ogImage`):** si una página importante usa la imagen por defecto,
   propón una propia de 1200×630 (JPG) en su campo `ogImage`. Su texto alternativo es el
   `title` de la página; el de la imagen por defecto está en `ogImageAlt` de
   `src/content/site/<idioma>.yaml`.
7. Si cambiaron rutas o se agregaron `caption`: `pnpm bsi:sync` (el pie de foto es editable
   desde Binflow).

## Reglas

- **No inventes datos** en el alt ni en el caption: nombres de personas, lugares, fechas,
  premios o créditos solo si los da la persona o aparecen en el contenido. Si una foto muestra
  personas, descríbelas por lo que hacen, no por quiénes podrían ser.
- Nada de relleno de palabras clave: la palabra clave entra solo si describe la imagen.
- Las imágenes decorativas también llevan `alt` (el schema lo exige): describe brevemente lo
  que transmiten.
- Renombrar una imagen de `public/` cambia su URL: si ya estaba publicada, agrega la
  redirección con `agregar-redireccion`. Las de `src/assets/` no lo necesitan (Astro genera
  URLs nuevas en cada build).
- El atributo `title` no aporta al SEO de imágenes: no lo agregues.

## Verificar

```bash
node skills/seo-imagenes/scripts/auditar-imagenes.mjs
pnpm verify
```

La auditoría debe terminar con 0 problemas o con cada problema restante explicado.

## Entrega

Tabla por imagen: nombre anterior → nuevo, `alt` y `caption` finales, fuente usada para
inferirlos (nombre, sección o vista de la imagen); citas actualizadas; pendientes (datos que
faltan para un caption, imágenes sin usar) y resultado de `pnpm verify`.
