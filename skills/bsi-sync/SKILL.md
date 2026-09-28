---
name: bsi-sync
description: >-
  Mantiene al día el inventario de superficies editables de Binflow
  (binflow/surface-inventory.yaml) y diagnostica fallas de `pnpm check:bsi`.
  Úsala después de agregar, quitar o renombrar secciones o páginas, cuando
  falle check:bsi, o al preparar el sitio para conectarlo con Binflow.
---

# BSI sync

El inventario le dice a Binflow qué textos e imágenes puede editar y en qué archivo viven.
Se genera desde `src/content/`. Contrato completo: [docs/guias/binflow.md](../../docs/guias/binflow.md).

## Cuándo correrla

- Se agregó, quitó o cambió el `id` de una sección.
- Se agregó o eliminó una página o un documento legal.
- Se activó un idioma.
- Se creó un tipo de sección (después de la skill `nueva-seccion`).
- Falla `pnpm check:bsi`.

## Pasos

1. `pnpm bsi:sync` — regenera el inventario. Conserva `notes` y `deny_reason` escritos a mano.
2. Revisa el diff de `binflow/surface-inventory.yaml`:
   - Filas nuevas o eliminadas = secciones agregadas o quitadas. ¿Es lo esperado?
   - Si cambió el `bf_id` de una fila existente, alguien cambió un `id` de sección: eso rompe
     las referencias que Binflow ya tenga. Confirma con la persona o restaura el `id`.
3. `pnpm build:ci && pnpm check:bsi` — cruza el inventario con el HTML publicado.
4. Sube el inventario en el mismo commit que el cambio de contenido.

## Diagnóstico de fallas

| Mensaje de `check:bsi`                               | Causa y arreglo                                                                                       |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `falta en el inventario` / `sobra en el inventario`  | Contenido cambió sin sync → `pnpm bsi:sync`                                                           |
| `data-bf-id="…" no está en el inventario`            | Un componente marca un campo que no está en `src/lib/bsi-fields.ts` → agrégalo ahí y sincroniza       |
| `… está en el inventario pero no aparece en el HTML` | El componente no marca ese campo con `bf()` → corrige el componente (`pnpm check:sections` lo señala) |
| `data-bf-kind="…" pero el inventario dice …`         | El `kind` del componente no coincide con `bsi-fields.ts`                                              |
| `el locator usa un índice sections[n]`               | Edición manual incorrecta: los locators usan el `id` de sección                                       |
| `sample cambió` (aviso)                              | Cambió el texto: `pnpm bsi:sync` actualiza el ejemplo                                                 |

## Reglas

- Nunca edites a mano `bf_id`, `locator` ni `path`: se generan.
- No uses índices (`sections[2]`) en ningún locator.
- `bf()` en `src/lib/bf.ts` solo genera atributos: no cargues el inventario en el cliente.
