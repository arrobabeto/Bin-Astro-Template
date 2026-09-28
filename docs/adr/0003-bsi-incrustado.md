# 0003 — BSI incrustado desde el inicio

**Estado:** Aceptada

## Contexto

Binflow puede operar sitios Astro sin inventario, adivinando qué campos editar por su nombre.
Con un inventario BSI (Binflow Surface Inventory) el trabajo es preciso y seguro, pero agregarlo
a un sitio ya construido obliga a revisar cada componente. Queremos que cualquier sitio hecho
con el template pueda contratar Binflow sin trabajo adicional.

## Decisión

El template implementa BSI v1 con el perfil `astro_repo` desde el inicio:

- `bf()` en `src/lib/bf.ts` genera los atributos `data-bf-*`; solo produce atributos y nunca
  carga el inventario en el navegador.
- Los campos y tipos (`kind`) de cada sección se declaran una vez en `src/lib/bsi-fields.ts`.
- `binflow/surface-inventory.yaml` **se genera** a partir del contenido (`pnpm bsi:sync`), con
  locators por `id` de sección (`#sections.hero.heading`), nunca por índice.
- `pnpm check:bsi` compara inventario, generador y HTML en CI; `pnpm check:sections` exige que
  cada componente marque exactamente sus campos.

## Alternativas

- **Sin BSI, agregarlo al contratar Binflow:** menos código hoy, pero cada alta sería un
  proyecto de retrofit.
- **Inventario escrito a mano:** se desincroniza con el contenido; generarlo lo evita.

## Consecuencias

- Contratar Binflow no requiere cambios en el sitio (ver [guía de Binflow](../guias/binflow.md)).
- Sin Binflow, el costo es nulo para el visitante: atributos invisibles y un archivo YAML.
- Quien cree secciones debe declarar sus campos BSI; las revisiones lo hacen obligatorio.
- Renombrar el `id` de una sección publicada cambia sus `bf_id`: se evita por regla.
