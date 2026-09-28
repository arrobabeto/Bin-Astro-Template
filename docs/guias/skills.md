# Skills

Una **skill** es un paquete de instrucciones que enseña a un agente de IA a hacer una tarea
concreta de este proyecto, siempre de la misma forma: publicar un artículo, auditar el SEO,
crear una sección. Es como una receta que el agente sigue paso a paso.

- Lista y descripción de cada skill: [inventario de skills](../../skills/INVENTARIO.md).
- Cómo están hechas y cómo crear una: [skills/README.md](../../skills/README.md).

## Cómo se usan

En Cursor, Claude Code o Codex, escribe el nombre con barra (`/seo-audit`) o pide la tarea en
lenguaje natural (_"haz una auditoría SEO"_): el agente reconoce la skill por su descripción.

| Quiero…                                    | Skill                    |
| ------------------------------------------ | ------------------------ |
| Cambiar textos, imágenes, menú o contacto  | `/editar-contenido`      |
| Auditar o corregir el SEO                  | `/seo-audit`             |
| Convertir el template en un sitio nuevo    | `/nuevo-sitio`           |
| Crear un tipo de bloque nuevo              | `/nueva-seccion`         |
| Cambiar una URL sin perder posicionamiento | `/agregar-redireccion`   |
| Agregar un idioma                          | `/agregar-idioma`        |
| Actualizar el inventario de Binflow        | `/bsi-sync`              |
| Publicar un artículo de blog               | `/publicar-articulo`     |
| Construir páginas desde un diseño de Figma | `/construir-desde-figma` |

## Dónde viven

La carpeta canónica es `skills/`. Cada agente la encuentra por un enlace simbólico:

```text
.agents/skills  → ../skills   (Codex y agentes compatibles)
.cursor/skills  → ../skills   (Cursor)
.claude/skills  → ../skills   (Claude Code)
.codex/skills   → ../skills   (Codex)
```

Se edita solo `skills/`; los enlaces nunca se reemplazan por copias. En Windows, activa
`git config core.symlinks true` antes de clonar.

## Reglas

- Toda skill se registra en [INVENTARIO.md](../../skills/INVENTARIO.md) **en el mismo cambio**
  en que se crea, modifica o elimina. `pnpm check:skills` lo exige.
- Las skills propias se escriben en español. Las de terceros (como `hallmark`) se copian sin
  cambios, conservan su licencia y quedan registradas con su versión en `skills-lock.json`.
- Si una skill de terceros se modifica por error, `pnpm check:skills` falla. Para actualizarla
  a propósito: copia la versión nueva y corre `node scripts/check-skills.mjs --update-lock`.

## Figma

`construir-desde-figma` y `figma-rest-design-reader` leen diseños con la API de Figma. Necesitan
`FIGMA_API_KEY` (un token personal de solo lectura) en `.env` o en el entorno del sistema, y
opcionalmente `FIGMA_FILE_KEY`. El sitio nunca usa esas variables.
