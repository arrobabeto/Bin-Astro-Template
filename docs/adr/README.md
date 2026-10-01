# Decisiones de arquitectura (ADR)

Cada ADR registra una decisión técnica importante: el contexto, lo que se decidió, las
alternativas y sus consecuencias. Sirven para no volver a discutir lo ya resuelto y para
entender por qué el template es como es.

| ADR                                          | Decisión                                              | Estado   |
| -------------------------------------------- | ----------------------------------------------------- | -------- |
| [0001](0001-contenido-en-git-sin-cms.md)     | Contenido en Git con content collections, sin CMS     | Aceptada |
| [0002](0002-paginas-como-secciones-yaml.md)  | Páginas como listas de secciones en YAML              | Aceptada |
| [0003](0003-bsi-incrustado.md)               | BSI incrustado desde el inicio                        | Aceptada |
| [0004](0004-estatico-con-endpoints.md)       | Sitio estático con endpoints opcionales en Vercel     | Aceptada |
| [0005](0005-idioma-unico-con-i18n-listo.md)  | Español por defecto con i18n lista para activar       | Aceptada |
| [0006](0006-skills-en-carpeta-canonica.md)   | Skills en una carpeta canónica para todos los agentes | Aceptada |
| [0007](0007-medicion-opcional-sin-banner.md) | Medición opcional y sin banner de cookies             | Aceptada |
| [0008](0008-portada-demo-destruible.md)      | Portada demo destruible con `pnpm demo:clear`         | Aceptada |
| [0009](0009-stack-no-contenido.md)           | Un stack, no un sitio de ejemplo                      | Aceptada |
| [0010](0010-formatos-de-imagen.md)           | AVIF como original, WebP publicado                    | Aceptada |

## Cómo escribir una ADR

Copia la estructura de cualquiera de las existentes (Contexto, Decisión, Alternativas,
Consecuencias), numérala con el siguiente número libre y agrégala a esta tabla. Una ADR no se
borra: si una decisión cambia, se escribe una nueva que la reemplaza y la anterior pasa a
estado "Reemplazada por NNNN".
