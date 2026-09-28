# Crear un sitio nuevo

Pasos para convertir el template en el sitio de un cliente. Con un agente de IA puedes pedir
`/nuevo-sitio` y seguirá esta misma guía.

## 1. Crear el repositorio

En GitHub, usa **Use this template** (o clona y cambia el `origin`). El repositorio nuevo es
independiente: los cambios del cliente no afectan al template. Para traer mejoras futuras del
template, ver [Actualizar desde el template](actualizar-desde-template.md).

```bash
git clone <url-del-repo-nuevo> mi-cliente
cd mi-cliente
pnpm install
pnpm setup
```

## 2. Personalizar con `pnpm bootstrap`

```bash
pnpm bootstrap
```

Pregunta nombre del sitio, dominio, correo, teléfono, dirección y clave del proyecto en
Binflow. También acepta los datos como argumentos:

```bash
pnpm bootstrap --nombre "Clínica Norte" --dominio https://www.clinicanorte.mx \
  --correo hola@clinicanorte.mx --telefono "+52 81 1234 5678" \
  --direccion "Monterrey, N.L." --project-key clinica-norte
```

Qué hace:

- Actualiza `package.json`, `src/config/site.ts` y los textos globales de
  `src/content/site/`.
- Escribe `PUBLIC_SITE_URL` en `.env`.
- Pone la clave del proyecto en `binflow/surface-inventory.yaml` y regenera el inventario.
- Regenera favicons e imagen social con el nombre nuevo.
- Crea `template.lock.json`, que marca el proyecto como **sitio de cliente**.

Desde ese momento, `pnpm check:placeholders` se vuelve estricto: falla si queda algún dato
del template (el teléfono `+52 55 0000 0000`, el dominio `tu-dominio.mx`, textos marcados como
`[EJEMPLO]`) y avisa de los archivos de demostración que siguen sin cambios. Es la lista de
pendientes antes de publicar.

`pnpm bootstrap` se niega a correr dos veces. Si necesitas repetirlo, usa `--force`.

## 3. Marca

- Reemplaza `public/favicon.svg` por el logo del cliente y corre `pnpm brand:assets`.
- Cambia colores y tipografía en `src/styles/global.css`.

Detalles: [Diseño y marca](diseno-y-marca.md). Si hay un diseño en Figma, usa la skill
`/construir-desde-figma`.

## 4. Contenido

- Reescribe `src/content/pages/es/index.yaml` (la home) con los textos del cliente.
- Crea las demás páginas como archivos nuevos en `src/content/pages/es/`.
- Revisa el menú, pie de página y contacto en `src/content/site/es.yaml`.
- Adapta el aviso de privacidad y los términos en `src/content/legal/es/`. **Deben revisarlos
  el cliente o su asesor legal**: el template trae un texto genérico.
- Sustituye las imágenes de `src/assets/images/`.

Guías: [Contenido](contenido.md), [Secciones](secciones.md) e [Imágenes](imagenes.md).

## 5. Revisar y publicar

```bash
pnpm verify
```

Cuando pase, conecta el repositorio a Vercel y configura el dominio:
[Despliegue en Vercel](despliegue-vercel.md). Si el cliente usará formularios, medición o
Binflow, sigue [Formularios y email](formularios-y-email.md), [Analytics](analytics.md) y
[Binflow](binflow.md).

## Lista final

- [ ] `pnpm verify` pasa sin avisos de placeholders.
- [ ] Textos legales revisados por el cliente.
- [ ] `PUBLIC_SITE_URL` configurado en Vercel (Production).
- [ ] Dominio conectado y con HTTPS.
- [ ] Formulario probado de punta a punta (si aplica).
- [ ] Sitio dado de alta en Search Console con su sitemap (ver [SEO](seo.md)).
- [ ] `pnpm check:headers --live <dominio>` pasa.
