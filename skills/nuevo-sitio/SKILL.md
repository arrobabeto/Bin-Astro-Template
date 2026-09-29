---
name: nuevo-sitio
description: >-
  Convierte una copia recién clonada de Bin Astro Template en el sitio de un
  cliente: corre el bootstrap, ajusta marca, delega el diseño del home en
  `disenar-sitio` (que borra el contenido demo) y deja todo listo para
  desplegar en Vercel. Úsala cuando pidan "empieza un
  sitio nuevo para…", "configura este template para mi negocio" o justo
  después de clonar el template.
---

# Nuevo sitio

Guía completa para personas: [docs/guias/crear-sitio-nuevo.md](../../docs/guias/crear-sitio-nuevo.md).

## Input

Pide solo lo que falte:

- **Obligatorio:** nombre del negocio y dominio (`www.negocio.mx`).
- **Recomendado:** correo y teléfono de contacto, ciudad, a qué se dedica y qué ofrece
  (servicios/productos), público objetivo, logo (SVG ideal) y colores de marca.
- **Opcional:** textos existentes, fotos reales, redes sociales, `project_key` de Binflow.

## Preflight

1. Si existe `template.lock.json`, este proyecto ya pasó por bootstrap: no lo repitas; usa
   `editar-contenido`.
2. `node -v` debe ser 24 (`nvm use`). `pnpm install` y `pnpm setup`.

## Pasos

1. **Bootstrap** (reescribe identidad, `.env`, Binflow y assets de marca):

   ```bash
   pnpm bootstrap --nombre "Nombre" --dominio www.negocio.mx \
     --correo hola@negocio.mx --telefono "+52 ..." --direccion "Ciudad, Estado"
   ```

2. **Logo:** reemplaza `public/favicon.svg` (cuadrado, se ve bien a 32 px) y corre
   `pnpm brand:assets` (genera favicon.ico, íconos y la imagen para redes).
3. **Colores y tipografía:** ajusta la escala `--color-brand-*` y demás tokens en
   `src/styles/global.css` ([docs/guias/diseno-y-marca.md](../../docs/guias/diseno-y-marca.md)).
   Actualiza `themeColor` en `src/config/site.ts`.
4. **Diseño y contenido del home:** sigue la skill `disenar-sitio`. Borra la portada demo con
   `pnpm demo:clear` y construye el home desde Figma o con Hallmark. No edites la portada demo
   para convertirla en el sitio real. Sin datos inventados: donde falte información, pregunta
   o deja la sección fuera.
5. **Fotos:** usa fotos reales en `src/assets/images/` con `alt` descriptivo.
6. **Legales:** adapta `src/content/legal/es/*.md` con los datos del responsable y quita el
   aviso "Plantilla de referencia" **solo después** de que la persona confirme que un
   profesional lo revisó.
7. **Organización:** si es un negocio con local, cambia `organizationType` a `LocalBusiness`
   (o el subtipo) en `src/config/site.ts`.
8. `pnpm bsi:sync` si cambiaron secciones.
9. **Verifica:** `pnpm verify`. `check:placeholders` bloquea datos del template y avisa de
   archivos demo sin cambiar.
10. **Despliegue:** [docs/guias/despliegue-vercel.md](../../docs/guias/despliegue-vercel.md).
    En Vercel define `PUBLIC_SITE_URL`.
11. **Cierre SEO:** corre `/seo-audit` antes de lanzar.

## Opcionales que ofrecer al final

- Formularios (Web3Forms o SendGrid) y newsletter (MailerLite):
  [docs/guias/formularios-y-email.md](../../docs/guias/formularios-y-email.md).
- Medición (GA4, Tag Manager, Search Console): [docs/guias/analytics.md](../../docs/guias/analytics.md).
- Binflow para editar el sitio desde Telegram: [docs/guias/binflow.md](../../docs/guias/binflow.md).
