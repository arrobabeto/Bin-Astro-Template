# Imágenes

Las imágenes del contenido se guardan en `src/assets/images/` y Astro las optimiza en el build:
genera varios tamaños, las publica en WebP y agrega ancho y alto para que la página no "salte"
al cargar. Aun así conviene guardar un original ligero: el repositorio no crece con cada foto y
el build es más rápido.

## Optimizar y nombrar con agentes

Dos skills se encargan de las imágenes (pídelas en lenguaje natural):

- **`optimizar-imagenes`**: deja cada imagen ligera sin que se vea pixelada. Busca la
  compresión más baja que sigue siendo visualmente igual al original y actualiza las rutas en
  el contenido. _"Optimiza las imágenes del sitio"_.
- **`seo-imagenes`**: renombra las imágenes con nombres descriptivos (`IMG_2041.jpg` →
  `dentista-revisando-radiografia.avif`), y escribe su `alt` y su pie de foto. _"Mejora el SEO
  de las imágenes"_.

Formatos que usan, y por qué ([ADR 0010](../adr/0010-formatos-de-imagen.md)):

| Imagen                        | Formato del archivo     | Ancho máximo |
| ----------------------------- | ----------------------- | ------------ |
| Contenido (`src/assets/`)     | AVIF                    | 2400 px      |
| Archivos de `public/`         | WebP                    | 1600 px      |
| Imagen para redes sociales    | JPG                     | 1200 px      |
| Capturas o imágenes con texto | AVIF o WebP sin pérdida | según uso    |

## Dónde va cada imagen

| Tipo                                        | Carpeta              | Optimización                |
| ------------------------------------------- | -------------------- | --------------------------- |
| Fotos e ilustraciones del contenido         | `src/assets/images/` | Automática                  |
| Imagen para redes y logo de marca           | `src/assets/brand/`  | Automática                  |
| Favicons, archivos que deben tener URL fija | `public/`            | Ninguna: se copian tal cual |

## Usarla en una página

La ruta es relativa al archivo YAML. Desde `src/content/pages/es/` siempre es
`../../../assets/images/<archivo>`:

```yaml
image:
  src: ../../../assets/images/equipo.jpg
  alt: El equipo reunido en la oficina revisando un diseño en pantalla
```

Si el archivo no existe, el build falla con la ruta exacta.

## Nombre del archivo

Google usa el nombre como pista del contenido. Usa 3 a 6 palabras que describan la imagen, en
minúsculas, sin acentos y con guiones: `terraza-con-vista-al-mar.avif`, no `IMG_2041.jpg`.

## Texto alternativo (`alt`)

Es obligatorio. Lo leen los lectores de pantalla y Google. Describe lo que se ve y por qué
importa en esa página:

- Bien: `Dentista revisando una radiografía con un paciente`
- Mal: `imagen1`, `foto`, `banner-home`

## Pie de foto (`caption`)

Opcional, en las secciones `hero` y `split`. Se muestra debajo de la imagen y Binflow puede
editarlo. Úsalo solo si aporta algo que no dice el texto: lugar, fecha, nombre o crédito.

```yaml
image:
  src: ../../../assets/images/terraza-con-vista-al-mar.avif
  alt: Terraza del restaurante con mesas de madera frente al mar al atardecer
  caption: "Foto: Ana Ruiz."
```

## Tamaños

- Sube la imagen con al menos **1600 px** de ancho para portadas y **1200 px** para el resto.
- Puedes subir JPG, PNG, WebP o AVIF; la skill `optimizar-imagenes` los deja en el formato
  recomendado. SVG para logos.
- `pnpm check:assets` avisa si una imagen pesa más de 800 KB y falla a partir de 2.5 MB en
  `src/assets/`. En `public/` los límites son 150 KB y 400 KB porque ahí no se optimizan.

## Imagen para redes sociales

Cada página usa `src/assets/brand/og-default.jpg` salvo que defina su propio `ogImage`. La
imagen por defecto se regenera con `pnpm brand:assets`. Ver [Diseño y marca](diseno-y-marca.md).
