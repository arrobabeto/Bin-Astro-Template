---
name: nombre-skill
description: >-
  Qué hace la skill en una o dos frases y CUÁNDO usarla, con ejemplos de cómo
  lo pediría una persona ("haz…", "revisa…"). Los agentes deciden cargarla
  leyendo solo esta descripción, así que sé específico.
---

<!--
Plantilla para crear una skill nueva:
  1. Copia esta carpeta: cp -R skills/_plantilla skills/<nombre-skill>
  2. Renombra este archivo a SKILL.md y reemplaza `name` por el nombre de la carpeta
     (minúsculas y guiones).
  3. Borra references/ o scripts/ si no los usas.
  4. OBLIGATORIO: agrega la fila y la ficha en skills/INVENTARIO.md.
  5. Corre `pnpm check:skills`.
Guía completa: docs/guias/skills.md
-->

# Nombre de la skill

Una frase sobre el resultado que produce.

## Input

- **Obligatorio:** …
- **Opcional:** …

Si falta algo obligatorio, pide solo eso.

## Preflight

1. `git status -sb`: no mezcles el trabajo con cambios ajenos.
2. Lee los archivos que vas a tocar antes de editarlos.
3. …

## Pasos

1. …
2. …

## Reglas

- El contenido editorial se edita en `src/content/`, nunca dentro de componentes.
- No inventes datos (cifras, clientes, testimonios).
- Conserva los `id` de sección (Binflow); si cambian secciones, `pnpm bsi:sync`.
- …

## Verificar

```bash
pnpm verify
```

## Entrega

Qué debe reportar el agente al terminar (archivos cambiados, comandos y resultado, pendientes).
