# Rúbrica on-page (Yoast + Rank Math, filtrada por Google)

Checks consolidados de los analizadores de Yoast y Rank Math, adaptados a este template.
Se evalúan por página indexable con los datos de `.seo/extract.json`. Resultado por check:
**aprobado**, **mejorable** o **fallido**. No se reporta una "puntuación" de Yoast/Rank Math:
no se ejecutaron esas herramientas.

## Con palabra clave (solo si el usuario la dio o la confirmó)

| Check                                   | Dónde se corrige                | Nota                                         |
| --------------------------------------- | ------------------------------- | -------------------------------------------- |
| Aparece en el `title`, cerca del inicio | `title` o `seo.title` del YAML  | Natural, sin repetir                         |
| Aparece en el H1                        | `heading` de la primera sección |                                              |
| Aparece en el primer párrafo            | `body` de la primera sección    | Responde la intención en las primeras líneas |
| Aparece en la meta description          | `description` del YAML          |                                              |
| Aparece en el slug                      | nombre del archivo YAML         | Cambiar slug = redirección 301               |
| Aparece en algún H2                     | `heading` de otras secciones    | Variantes y sinónimos valen                  |
| Aparece en el alt de alguna imagen      | `image.alt`                     | Solo si describe la imagen de verdad         |
| No se usa como principal en otra página | todas las páginas               | Evita canibalización                         |

**Densidad de palabra clave:** no se mide ni se reporta como problema. Google no la usa.

## Siempre

| Check                        | Regla del template                                                | Fuente                         |
| ---------------------------- | ----------------------------------------------------------------- | ------------------------------ |
| Title presente y único       | Bloquea CI (`check:seo`)                                          | Google                         |
| Longitud del title           | 30–60 caracteres (aviso)                                          | Yoast/Rank Math, guía práctica |
| Description presente y única | Bloquea CI                                                        | Google                         |
| Longitud de description      | 70–160 caracteres (aviso)                                         | Yoast/Rank Math, guía práctica |
| Un solo H1                   | Bloquea CI                                                        | Template                       |
| Jerarquía H2/H3 sin saltos   | Revisión manual                                                   | Yoast                          |
| Contenido suficiente         | Home/servicios: que responda la intención; sin mínimo de palabras | Google                         |
| Enlaces internos salientes   | Al menos 1 enlace contextual a otra página útil                   | Yoast/Rank Math                |
| Enlaces internos entrantes   | Toda página indexable recibe al menos 1 enlace HTML               | Google/Yoast                   |
| Enlaces externos             | Solo a fuentes fiables cuando aportan; `rel` adecuado             | Rank Math                      |
| Alt en imágenes              | Bloquea CI si falta el atributo                                   | Google                         |
| Legibilidad                  | Párrafos cortos, frases claras, voz activa                        | Yoast (guía, no regla)         |
| Slug corto y descriptivo     | Minúsculas, guiones, sin fechas ni ids                            | Google/Rank Math               |
| Datos demo                   | `pnpm check:placeholders`                                         | E-E-A-T                        |

## Legibilidad (guía, no bloqueo)

Yoast mide Flesch, longitud de frases y párrafos, voz pasiva y palabras de transición.
Úsalo como orientación en español: frases de ≤ 20–25 palabras, párrafos de 2–4 frases,
subtítulos cada ~300 palabras en textos largos. No reescribas textos del usuario solo para
subir una métrica: pide aprobación.
