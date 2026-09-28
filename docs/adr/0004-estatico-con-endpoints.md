# 0004 — Sitio estático con endpoints opcionales en Vercel

**Estado:** Aceptada

## Contexto

Los sitios del template son principalmente de contenido: cambian cuando alguien publica, no en
cada visita. Algunos necesitan recibir formularios o altas de newsletter con claves secretas,
que no pueden vivir en el navegador.

## Decisión

`output: "static"` con el adaptador `@astrojs/vercel` (versión exacta). Todas las páginas se
generan en el build. Solo los archivos de `src/pages/api/` declaran `prerender = false` y se
publican como Vercel Functions:

- `/api/forms/contact`: formulario de contacto con SendGrid.
- `/api/newsletter`: altas en MailerLite.

Los endpoints responden con un error claro si su servicio no está configurado, así que el sitio
compila y funciona sin ninguna variable. `trailingSlash: "never"` y las redirecciones de
`src/config/redirects.ts` se convierten en reglas de Vercel (301 y 308 reales).

## Alternativas

- **Totalmente estático:** más simple, pero obligaría a depender siempre de un servicio de
  formularios de terceros.
- **Render en servidor (SSR):** innecesario para contenido que cambia al publicar; peor
  rendimiento y más costo.

## Consecuencias

- Páginas servidas desde la CDN de Vercel, sin tiempo de servidor.
- `astro preview` no funciona con el adaptador; `pnpm preview` usa `scripts/serve-static.mjs`,
  que imita a Vercel.
- El formato de salida del adaptador afecta redirecciones y cabeceras; por eso se fija la
  versión y `check:redirects` y `check:headers` lo vigilan.
- Otro hosting requeriría cambiar el adaptador y trasladar las reglas de `vercel.json`.
