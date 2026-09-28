# 0006 — Skills en una carpeta canónica para todos los agentes

**Estado:** Aceptada

## Contexto

El equipo usa Cursor, Claude Code y Codex. Cada uno busca skills en su propia carpeta
(`.cursor/skills`, `.claude/skills`, `.codex/skills`, `.agents/skills`). Mantener copias
separadas termina en versiones distintas de la misma instrucción.

## Decisión

Las skills viven en `skills/` y cada carpeta de agente es un enlace simbólico a ella. Las
instrucciones generales están en `AGENTS.md` (Claude Code lo lee a través de `CLAUDE.md`), con
reglas de Cursor en `.cursor/rules/`. `skills/INVENTARIO.md` documenta cada skill y se actualiza
en el mismo cambio. Las skills de terceros se copian sin cambios y se fijan en
`skills-lock.json` con su hash.

## Alternativas

- **Copias por agente:** funciona sin enlaces simbólicos, pero se desincroniza.
- **Solo `AGENTS.md`:** suficiente para reglas generales, no para procedimientos largos.

## Consecuencias

- Una sola fuente para las tres herramientas.
- `pnpm check:skills` valida enlaces, formato, inventario y hashes de terceros.
- En Windows hay que activar `core.symlinks` en Git.
