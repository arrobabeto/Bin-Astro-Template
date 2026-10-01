# Criterios SEO para imágenes

Basados en las
[recomendaciones de Google para imágenes](https://developers.google.com/search/docs/appearance/google-images)
y en las pautas de accesibilidad WCAG para texto alternativo.

## Nombre de archivo

Google usa el nombre del archivo como una señal más del tema de la imagen.

| Regla                                      | Bien                                  | Mal                                        |
| ------------------------------------------ | ------------------------------------- | ------------------------------------------ |
| Describe el contenido en 3–6 palabras      | `cafe-de-especialidad-en-prensa.avif` | `IMG_2041.avif`                            |
| Minúsculas, sin acentos, guiones           | `nino-jugando-en-el-parque.avif`      | `Niño Jugando_Parque.jpg`                  |
| Sin números de cámara, fechas ni versiones | `fachada-de-la-clinica.avif`          | `fachada-final-v2.avif`                    |
| Máximo 60 caracteres                       | `equipo-revisando-un-diseno-web.avif` | (frases enteras)                           |
| Palabra clave solo si describe la imagen   | `limpieza-dental-profesional.avif`    | `dentista-barato-mejor-dentista-cdmx.avif` |
| Idioma: el del sitio principal             | `terraza-con-vista-al-mar.avif`       | mezclar idiomas                            |

Una imagen usada en varios idiomas conserva un solo nombre (el del idioma por defecto); lo que
cambia por idioma es el `alt`.

## Texto alternativo (`alt`)

Lo leen los lectores de pantalla y es la señal principal para Google Imágenes.

- Describe lo que se ve **y** por qué está en esa página. Imagina que se lo describes por
  teléfono a alguien que no la ve.
- 80–125 caracteres como guía; nunca más de 150 (lo largo va al caption).
- Sin "imagen de" ni "foto de": el lector de pantalla ya anuncia que es una imagen.
- Sin repetir el título de la sección palabra por palabra.
- Texto incrustado en la imagen (un letrero, un dato): inclúyelo en el alt.
- En el idioma de la página.

| Contexto                   | Alt                                                                         |
| -------------------------- | --------------------------------------------------------------------------- |
| Hero de una clínica dental | `Dentista explicando una radiografía panorámica a una paciente sonriente`   |
| Sección "Nuestro equipo"   | `Cinco integrantes del equipo conversando alrededor de una mesa de trabajo` |
| Ilustración decorativa     | `Ilustración de formas geométricas en tonos azules que sugieren movimiento` |
| Captura del producto       | `Panel de reservas mostrando el calendario semanal con tres citas activas`  |

## Pie de foto (`caption`)

Google usa el texto cercano a la imagen para entenderla, y el caption es el más cercano.
También lo leen las personas que solo recorren la página con la vista.

- Úsalo cuando aporte algo que no está en el alt ni en el texto: lugar, fecha, nombre,
  crédito ("Foto: Ana Ruiz") o una aclaración.
- No dupliques el alt: el alt describe, el caption contextualiza.
- Una frase. Sin datos inventados.

## Lo que ya resuelve el template

No hace falta agregarlo a mano:

- `width` y `height` en cada imagen (evita saltos de diseño, CLS).
- Varios anchos con `srcset` y `sizes`, y conversión a WebP en el build.
- Carga diferida (`loading="lazy"`) salvo en la primera imagen de la página, que se carga con
  prioridad.
- Imagen social (`og:image`) con medidas. Su texto alternativo es el título de la página o, para
  la imagen por defecto, `ogImageAlt` en los textos del sitio.
- Rutas estables en `/_astro/` con caché larga.
