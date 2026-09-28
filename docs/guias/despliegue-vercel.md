# Despliegue en Vercel

El sitio se publica en [Vercel](https://vercel.com). Las páginas son HTML estático servido
desde la red global de Vercel; solo los formularios con SendGrid y la newsletter usan funciones
de servidor, y solo si se activan. Ver [ADR 0004](../adr/0004-estatico-con-endpoints.md).

## Primer despliegue

1. En Vercel: **Add New → Project** e importa el repositorio de GitHub.
2. Vercel detecta Astro y pnpm solos. No cambies los comandos de build.
3. En **Environment Variables**, agrega al menos `PUBLIC_SITE_URL` en **Production** con el
   dominio final (`https://www.clinicanorte.mx`). El resto es opcional:
   [Variables de entorno](variables-de-entorno.md).
4. **Deploy.**

Node.js 24 se toma de `package.json` (`engines`). No hace falta configurarlo en Vercel.

## Dominio

1. **Settings → Domains**: agrega el dominio con y sin `www`.
2. Elige cuál es el principal y configura el otro para que **redirija** a él (Vercel lo ofrece
   al agregarlo). Debe coincidir con `PUBLIC_SITE_URL`.
3. Crea los registros DNS que indica Vercel. El certificado HTTPS se emite solo.

## Previews

Cada pull request recibe una URL de preview. Los previews:

- llevan `noindex` en todas las páginas y un `robots.txt` que bloquea todo;
- no cargan Analytics ni Tag Manager;
- usan las variables del entorno **Preview** (útil para probar formularios con otra cuenta).

Si el build de producción falla con un mensaje sobre el dominio, revisa `PUBLIC_SITE_URL`:
debe usar `https://`, no incluir rutas y no ser `localhost`.

## Qué configura el repositorio

- **Cabeceras de seguridad** en `vercel.json`: HSTS, CSP, `X-Content-Type-Options`,
  `X-Frame-Options`, `Referrer-Policy` y `Permissions-Policy`. El adaptador de Vercel agrega
  caché de un año a los archivos con hash de `/_astro/`.
- **Redirecciones 301** desde `src/config/redirects.ts`, y URLs sin barra final (`/servicios/`
  redirige a `/servicios`).
- **Funciones** en `src/pages/api/`, que solo responden si su servicio está configurado.

Después de publicar, comprueba las cabeceras y que no haya referencias a `localhost`:

```bash
pnpm check:headers --live https://www.clinicanorte.mx
pnpm check:no-localhost --live https://www.clinicanorte.mx
```

## Probar el build en local

```bash
pnpm build
pnpm preview      # http://localhost:4173
```

`pnpm preview` sirve `.vercel/output/` imitando a Vercel (redirecciones, cabeceras, 404), porque
`astro preview` no es compatible con el adaptador de Vercel.

## CI

GitHub Actions (`.github/workflows/ci.yml`) corre en cada pull request las mismas revisiones que
`pnpm verify`, sin ninguna variable secreta. Activa en GitHub la protección de la rama `main`
para exigir que CI pase antes de fusionar.
