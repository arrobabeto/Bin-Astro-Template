# Skills

Una **skill** es un manual de instrucciones para agentes de IA (Cursor, Claude Code, Codex).
Le explica al agente cómo hacer una tarea concreta en este proyecto (editar contenido, auditar
el SEO, crear una sección) con los pasos, reglas y verificaciones correctos. Así cualquier
persona puede pedir cambios en lenguaje natural y el resultado es consistente.

**Inventario oficial con todas las skills, qué hacen y cuándo usarlas:
[INVENTARIO.md](INVENTARIO.md).**

## Dónde viven

Todas las skills están en esta carpeta, `skills/`. Cada agente las encuentra por un enlace
simbólico:

| Agente      | Busca en                             | Apunta a    |
| ----------- | ------------------------------------ | ----------- |
| Cursor      | `.cursor/skills/`                    | `../skills` |
| Claude Code | `.claude/skills/`                    | `../skills` |
| Codex       | `.codex/skills/` y `.agents/skills/` | `../skills` |

En Windows los enlaces simbólicos requieren `git config core.symlinks true` antes de clonar
(y modo desarrollador activado). `pnpm check:skills` avisa si no funcionan.

## Cómo se usan

- **Por nombre:** escribe `/seo-audit`, `/editar-contenido`… en el chat del agente (en Codex
  también `$seo-audit`).
- **Por intención:** pide la tarea con tus palabras ("cambia el teléfono del pie de página");
  el agente lee las descripciones y carga la skill adecuada.

## Estructura de una skill

```
skills/<nombre-skill>/
├── SKILL.md          # obligatorio: frontmatter (name, description) + instrucciones
├── references/       # opcional: documentos que la skill consulta cuando los necesita
├── scripts/          # opcional: scripts que la skill ejecuta
└── agents/openai.yaml  # opcional: metadatos para la interfaz de Codex
```

## Crear una skill

1. `cp -R skills/_plantilla skills/<nombre-skill>` y renombra `PLANTILLA.md` a `SKILL.md`.
2. Escribe `name` (igual a la carpeta) y una `description` que diga qué hace y cuándo usarla.
3. **Agrega su fila y su ficha en [INVENTARIO.md](INVENTARIO.md)** (obligatorio: el CI falla
   si falta).
4. `pnpm check:skills`.

Guía completa (cómo escribir buenas skills, probarlas, versionarlas y compartirlas entre
proyectos): [docs/guias/skills.md](../docs/guias/skills.md).

## Skills de terceros

Las skills copiadas de otros repos (por ejemplo `hallmark`) se registran en
[`skills-lock.json`](../skills-lock.json) con su origen, commit, licencia y un hash del
contenido. No se editan: `check:skills` falla si cambian. Para actualizarlas, copia la versión
nueva completa y corre `pnpm check:skills --update-lock`.
