# Imágenes

Las imágenes del contenido se guardan en `src/assets/images/` y Astro las optimiza en el build:
genera varios tamaños, las convierte a formatos modernos (AVIF/WebP) y agrega ancho y alto para
que la página no "salte" al cargar. No hace falta optimizarlas a mano.

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

## Texto alternativo (`alt`)

Es obligatorio. Lo leen los lectores de pantalla y Google. Describe lo que se ve y por qué
importa en esa página:

- Bien: `Dentista revisando una radiografía con un paciente`
- Mal: `imagen1`, `foto`, `banner-home`

## Tamaños

- Sube la imagen con al menos **1600 px** de ancho para portadas y **1200 px** para el resto.
- JPG para fotos, PNG solo si necesitas transparencia, SVG para logos.
- `pnpm check:assets` avisa si una imagen pesa más de 800 KB y falla a partir de 2.5 MB en
  `src/assets/`. En `public/` los límites son 150 KB y 400 KB porque ahí no se optimizan.

## Imagen para redes sociales

Cada página usa `src/assets/brand/og-default.jpg` salvo que defina su propio `ogImage`. La
imagen por defecto se regenera con `pnpm brand:assets`. Ver [Diseño y marca](diseno-y-marca.md).
