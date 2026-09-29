# Actualizar desde el template

Cada sitio creado con el template es un repositorio independiente. Cuando el template mejora
(una revisión nueva, una corrección de SEO, un cambio del contrato de Binflow), esas mejoras se
traen a mano, de forma controlada.

## Qué es del template y qué es del sitio

| Normalmente del template (se actualiza) | Siempre del sitio (no se pisa)                          |
| --------------------------------------- | ------------------------------------------------------- |
| `scripts/`                              | `src/content/`                                          |
| `src/lib/`, `src/pages/`                | `src/assets/`                                           |
| `src/components/seo/`, `layout/`        | `src/config/site.ts`, `redirects.ts`                    |
| `skills/` (salvo las propias del sitio) | `src/styles/global.css` (bloque `@theme`)               |
| `.github/`, `eslint.config.js`, `docs/` | `binflow/surface-inventory.yaml`                        |
|                                         | `template.lock.json`, `package.json` (nombre y versión) |

Las secciones (`src/components/sections/`) están en medio: si el sitio las personalizó,
revisa cada cambio a mano.

## Cómo traer los cambios

1. Agrega el template como remoto una sola vez:

   ```bash
   git remote add template <url-del-template>
   ```

2. En una rama nueva, trae los cambios y revisa qué cambió desde la última vez:

   ```bash
   git checkout -b chore/actualizar-template
   git fetch template
   git log --oneline template/main
   git diff HEAD template/main -- scripts/ src/lib/
   ```

3. Trae los archivos del template que quieras actualizar:

   ```bash
   git checkout template/main -- scripts/ src/lib/bf.ts
   ```

4. Lee el [CHANGELOG](../../CHANGELOG.md) del template para ver pasos manuales.
5. Corre `pnpm install`, `pnpm bsi:sync` y `pnpm verify`, y abre un pull request.

Con un agente: _"trae las mejoras del template en scripts y src/lib, sin tocar contenido"_.

## Buenas prácticas

- Actualiza seguido y en cambios pequeños; es más fácil que un salto grande.
- Nunca traigas `src/content/` ni `src/assets/` del template: son material de arranque, no
  contenido del sitio.
- Tampoco sobrescribas los tipos de sección de `src/components/sections/`: cada sitio tiene
  los suyos. Del template solo se trae infraestructura (`scripts/`, `src/lib/`, SEO, checks).
- Si un sitio necesita un cambio que sirve a todos, hazlo primero en el template y luego
  tráelo al sitio.
