---
name: publicar-articulo
description: >-
  Publica un artículo de blog a partir de un título, categoría y contenido:
  lo edita para SEO y GEO sin inventar datos, prepara una portada AVIF
  distinta de las existentes, valida el sitio y lo deja en una rama con PR.
  Si el sitio aún no tiene blog, primero crea la colección de artículos.
  Úsala cuando pidan /publicar-articulo, "sube este artículo", "publica este
  post" o entreguen un texto para convertirlo en artículo.
---

# Publicar artículo

<!-- check:docs ejemplos: src/assets/articulos/ -->

Adaptada de la skill `upload-blog` de webbin, sin rutas ni marca de ese sitio.

## Input

- **Obligatorio:** `titulo`, `categoria` y `contenido` (texto o archivo).
- **Opcional:** imagen de portada, fecha de publicación, slug, palabras clave, enlaces
  internos sugeridos, idioma de origen, autor.

Si falta algo obligatorio, pide solo eso. No pidas confirmación de lo que puedes resolver
leyendo el repositorio.

## Preflight

1. `git status -sb` y `git branch --show-current`. Nunca incluyas, descartes ni escondas
   cambios ajenos. Trabaja en una rama nueva: `git switch -c contenido/articulo-<slug>`.
2. ¿Existe la colección `articulos` en `src/content.config.ts`?
   - **No:** créala primero con [references/coleccion-articulos.md](references/coleccion-articulos.md)
     y verifica con `pnpm verify` antes de escribir el artículo. Es un cambio de código:
     avisa a la persona y súbelo en su propio commit.
   - **Sí:** lee el schema real y dos artículos recientes; el schema del repo manda sobre la
     referencia.
3. Idiomas activos en `src/config/locales.ts`. Si hay más de uno, el artículo se publica en
   todos con el mismo `translationKey` (o avisa cuál queda pendiente).

## Escribir el artículo

1. **Slug:** corto, descriptivo, minúsculas y guiones, sin fechas. Confirma que no existe.
   Archivo: `src/content/articulos/<idioma>/<slug>.md`.
2. **Conserva la intención, experiencia y datos** de la persona. Puedes reorganizar y editar
   para claridad, SEO y GEO. **No inventes** resultados, clientes, cifras ni experiencia.
3. **Frontmatter** según el schema (ver referencia). Fecha local de hoy salvo indicación;
   `readingTime` ≈ palabras / 220, redondeado hacia arriba.
4. **SEO/GEO** (criterio de la skill `seo-audit`):
   - Responde la intención principal en el primer párrafo.
   - Un solo H1 (lo pone la plantilla con `title`); en el cuerpo usa `##` y `###`.
   - `seo.title` de ~50–60 caracteres y `description` de ~140–160, sin cortar ideas.
   - 3–6 `keywords` naturales; sin repetirlas artificialmente.
   - 2–4 preguntas en `faq` que también se respondan en el cuerpo.
   - Al menos un enlace interno a una página o artículo relacionado que exista.
   - Listas y tablas solo cuando aclaren. Cita fuentes primarias en afirmaciones sensibles.
5. **Traducción** (si aplica): voz natural en cada idioma, mismo alcance y evidencia.

## Portada

- Si la persona da una imagen: revísala (horizontal, sin texto incrustado ilegible).
- Si no: genera una con la herramienta de imágenes disponible. Antes, describe las portadas
  existentes en `src/assets/articulos/` y elige una dirección distinta en al menos dos de:
  sujeto, composición, paleta. Horizontal ~16:10, sin texto, logos ni marcas de agua.
- Conviértela y compárala:

  ```bash
  node skills/publicar-articulo/scripts/preparar-portada.mjs \
    --input <imagen> --output src/assets/articulos/<slug>.avif --compare-dir src/assets/articulos
  ```

  El script falla si la portada se parece demasiado a una existente. Aunque pase, compara
  visualmente con las 3 más parecidas; si comparten sujeto y composición, regenera.

- `imageAlt` describe lo que se ve, sin rellenar palabras clave. No subas los originales
  intermedios (PNG/JPG).

## Validar

```bash
git diff --check
pnpm bsi:sync
pnpm verify
```

Revisa en `pnpm dev` la página del artículo y el listado: título, fecha, categoría, portada,
enlaces internos y FAQ.

## Commit y PR

1. `git add` con rutas explícitas: el/los Markdown, la portada y el inventario BSI.
   Nunca `git add -A` con cambios ajenos.
2. Commit: `contenido: artículo <tema>`.
3. `git push -u origin <rama>` y abre un PR hacia `main` con resumen, portada y validaciones.
   Nunca push forzado ni merge sin checks en verde. Fusiona solo si la persona lo pidió.

## Entrega

URL(s) del artículo, ruta y peso de la portada, commit y PR, resultado de checks, y el prompt
usado si se generó la portada.
