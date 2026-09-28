# Actualizar dependencias

Cómo mantener al día Astro, Tailwind y el resto de paquetes sin romper el sitio.

## Versiones fijadas

- **Node.js 24**: en `.nvmrc`, `.node-version` y `engines` de `package.json`. CI usa `.nvmrc`.
- **pnpm**: versión exacta en `packageManager` de `package.json`. `corepack` la instala sola.
- **`@astrojs/vercel`**: versión exacta, porque su formato de salida afecta las redirecciones y
  las cabeceras.
- `pnpm check:node` comprueba que todas estas fijaciones coincidan.

## Proceso

En una rama nueva:

```bash
pnpm outdated              # qué hay nuevo
pnpm update                # versiones compatibles (sin cambios de versión mayor)
pnpm verify
```

Para una versión mayor (por ejemplo, Astro 7 → 8):

1. Lee la guía de migración oficial y el changelog del paquete.
2. Actualiza un paquete mayor a la vez: `pnpm add astro@latest`.
3. Corre `pnpm verify`. Presta atención a `check:redirects`, `check:headers` y `check:bsi`:
   son los que detectan cambios en la salida del adaptador de Vercel.
4. Revisa el sitio en `pnpm preview` y en el preview de Vercel.
5. Anota en el [CHANGELOG](../../CHANGELOG.md) cualquier paso manual.

## Versiones que no se actualizan todavía

- **TypeScript 7**: se queda en TypeScript 6. `astro check` todavía no lo soporta y
  `typescript-eslint` exige una versión menor a 6.1. Cuando ambos lo acepten, actualiza y corre
  `pnpm verify`.
- **`@types/node`**: sigue la versión mayor de Node del proyecto (24), no la última publicada.

## Node.js

Para cambiar de versión de Node, actualízala a la vez en `.nvmrc`, `.node-version` y
`engines`, y corre `pnpm check:node`. Los scripts usan funciones de Node 24 (ejecución directa
de TypeScript sin dependencias, `util.parseEnv`), así que no bajes de esa versión.

## Seguridad

```bash
pnpm audit
```

Las alertas de paquetes que solo se usan en desarrollo (pruebas, lint) no afectan al sitio
publicado, que es HTML estático. Priorízalas por debajo de las que afectan a `src/pages/api/`.
