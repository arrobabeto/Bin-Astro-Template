# Diseño y marca

El diseño del template es neutro a propósito: se adapta a cada cliente cambiando pocos archivos.

## Colores y tipografía

Todos los colores y la tipografía están en un único bloque `@theme` de
`src/styles/global.css` (Tailwind CSS 4). Los componentes nunca usan colores directos: usan
nombres como `bg-surface`, `text-ink` o `bg-brand-600`. Cambiar la marca es cambiar ese bloque.

| Token                                      | Uso                                            |
| ------------------------------------------ | ---------------------------------------------- |
| `--color-brand-50` … `--color-brand-900`   | Color principal de la marca (botones, enlaces) |
| `--color-surface`, `--color-surface-muted` | Fondos                                         |
| `--color-surface-inverse`                  | Fondos oscuros (pie de página, CTA)            |
| `--color-ink`, `--color-ink-inverse`       | Texto principal sobre fondo claro / oscuro     |
| `--color-muted`                            | Texto secundario                               |
| `--color-line`                             | Bordes                                         |
| `--color-success`, `--color-danger`        | Mensajes de éxito y error                      |
| `--font-sans`                              | Tipografía                                     |
| `--radius-card`                            | Redondeo de tarjetas                           |

La escala `brand` debe tener buen contraste: el texto sobre `brand-600` es blanco, y `brand-700`
se usa como texto sobre fondo claro. Verifica el contraste (mínimo 4.5:1) al cambiar colores.

ESLint impide escribir colores hexadecimales en componentes, layouts y páginas, para que el
bloque `@theme` siga siendo la única fuente.

## Tipografía

La fuente se instala como paquete y se sirve desde el propio dominio: no hay peticiones a
Google Fonts (más rápido y sin compartir datos de visitantes). Por defecto es Inter Variable
(`@fontsource-variable/inter`, importada en `src/layouts/BaseLayout.astro`).

Para cambiarla:

```bash
pnpm add @fontsource-variable/<fuente>
```

Cambia el `import` en `BaseLayout.astro` y el nombre en `--font-sans`. Prefiere fuentes
variables: un solo archivo cubre todos los pesos.

## Logo, favicons e imagen social

1. Reemplaza `public/favicon.svg` por el logo (cuadrado, SVG).
2. Ajusta `themeColor` y `backgroundColor` en `src/config/site.ts`.
3. Corre `pnpm brand:assets`.

Genera `favicon.ico`, `apple-touch-icon.png`, `icon-192.png` e `icon-512.png` en `public/`, y
la imagen para redes `src/assets/brand/og-default.jpg` (1200×630) con el nombre del sitio. Si
el cliente tiene una imagen social diseñada, reemplaza directamente `og-default.jpg`.

## Diseño desde Figma

Si hay un diseño en Figma, pide `/construir-desde-figma`. La skill lee el archivo, extrae
colores y tipografía al bloque `@theme` y arma las páginas con las secciones existentes (o crea
las que falten). Necesita `FIGMA_API_KEY` o el MCP de Figma. Ver [Skills](skills.md).

Para dirección visual con criterio (evitar el aspecto genérico de "sitio hecho por IA"), la
skill `/hallmark` ofrece guías de composición y tipografía.
