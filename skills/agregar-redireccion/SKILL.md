---
name: agregar-redireccion
description: >-
  Agrega redirecciones permanentes 301 cuando una URL cambia o se elimina, o
  al migrar un sitio anterior. Úsala cuando pidan "cambia la URL de…",
  "renombra esta página", "migra las URLs del sitio viejo" o cuando otra
  skill cambie un slug.
---

# Agregar redirección

Las redirecciones viven en `src/config/redirects.ts`. Vercel las publica como 301 reales y
`pnpm check:redirects` lo verifica.

## Pasos

1. **Lista las URLs** viejas y nuevas. Para migraciones, obtén las viejas del sitemap anterior
   (`curl -s https://sitio-viejo/sitemap.xml`) o de Search Console (páginas con tráfico).
2. **Agrega una línea por URL** (sin barra final, sin dominio):

   ```ts
   export const redirects = {
     "/servicios-web": "/servicios",
     "/blog/articulo-viejo": "/articulos/articulo-nuevo",
   } satisfies NonNullable<AstroUserConfig["redirects"]>
   ```

3. **Reglas:**
   - El destino debe existir (o ser una URL externa completa).
   - Sin cadenas: si `/a` → `/b` y ahora `/b` → `/c`, cambia la primera a `/a` → `/c`.
   - No redirijas una URL que sigue existiendo como página.
   - Una URL eliminada sin reemplazo razonable **no** se redirige a la home: déjala en 404.
   - Parámetros dinámicos: `"/blog/[...slug]": "/articulos/[...slug]"`.
4. **Actualiza los enlaces internos** que apuntaban a la URL vieja (`rg "/url-vieja" src`):
   enlazar a una redirección es un aviso de `check:seo`.
5. **Verifica:**

   ```bash
   pnpm build:ci && pnpm check:redirects && pnpm check:seo
   ```

6. Tras publicar: `curl -I https://dominio/url-vieja` debe mostrar `301` y `location`.
