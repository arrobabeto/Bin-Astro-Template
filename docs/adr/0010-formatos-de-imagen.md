# 0010 — Formatos de imagen: AVIF como original, WebP publicado

**Estado:** Aceptada

## Contexto

Las fotos llegan del cliente o de cámaras en JPG o PNG de varios megas, con nombres como
`IMG_2041.jpg`. Astro optimiza en el build las imágenes de `src/assets/` (varios anchos y WebP),
pero el original sigue pesando en el repositorio y alarga cada build. Las de `public/` se sirven
tal cual. Además, comprimir dos veces con pérdida (al guardar el original y otra vez en el
build) puede producir pixelado o bandas si el original ya iba muy comprimido.

La skill `publicar-articulo` ya guardaba las portadas en AVIF.

## Decisión

- **Originales en `src/assets/`: AVIF**, como máximo de 2400 px de ancho, con la calidad más
  baja cuyo resultado mantiene SSIM ≥ 0.98 frente a la imagen redimensionada (visualmente igual).
  El margen evita que la segunda compresión del build se note.
- **Lo que se publica: WebP**, generado por Astro (`<Image>`, salida por defecto). Lo soportan
  todos los navegadores actuales y codificarlo en el build es mucho más rápido que AVIF.
- **`public/`: WebP**, como máximo de 1600 px, SSIM ≥ 0.975, porque no pasa por el build ni
  tiene alternativa para navegadores.
- **Imágenes para redes sociales: JPG** de 1200 px: los rastreadores de Facebook, LinkedIn y
  WhatsApp no leen AVIF de forma fiable.
- **Capturas, diagramas o imágenes con texto:** sin pérdida (AVIF o WebP lossless).
- Nunca se agranda una imagen; si no alcanza el tamaño, se pide otra.
- La skill `optimizar-imagenes` aplica estas reglas con un script que mide la calidad (SSIM) en
  vez de usar una calidad fija, y `seo-imagenes` cuida nombres, `alt` y `caption`.

## Alternativas

- **Dejar los JPG originales y confiar en Astro:** el sitio publicado queda bien, pero el repo
  crece con cada foto y el build es más lento.
- **Publicar AVIF con `<Picture>` y WebP de respaldo:** ~20–30 % menos peso, pero builds más
  lentos y más HTML. Se puede activar en un sitio concreto cambiando los componentes.
- **Calidad fija (por ejemplo 80):** demasiado alta para fotos simples y demasiado baja para
  fotos con mucho detalle. Medir SSIM ajusta cada imagen.

## Consecuencias

- Un original típico pasa de varios MB a 100–300 KB sin diferencia visible.
- AVIF no se abre en algunas herramientas de visualización; la skill `seo-imagenes` trae un
  script para generar una vista previa PNG temporal.
- Si una herramienta futura requiere otro formato de origen, el script acepta `--format`.
