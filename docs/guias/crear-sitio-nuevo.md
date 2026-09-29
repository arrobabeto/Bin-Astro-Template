# Crear un sitio nuevo

Pasos para crear el sitio de un cliente sobre el template. Con un agente de IA puedes pedir
`/nuevo-sitio` y seguirá esta misma guía.

El template aporta la infraestructura (secciones validadas, SEO, BSI, idiomas, formularios,
revisiones y CI). La estructura y el contenido del sitio no se adaptan de lo que trae: se
construyen desde cero en el paso 4. Ver la [ADR 0009](../adr/0009-stack-no-contenido.md).

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
`[EJEMPLO]`, la portada demo o la provisional, los legales sin revisar) y avisa de las
páginas, imágenes y logo que siguen iguales que en el template. Es la lista de material de
arranque pendiente de sustituir antes de publicar.

`pnpm bootstrap` se niega a correr dos veces. Si necesitas repetirlo, usa `--force`.

## 3. Marca

- Reemplaza `public/favicon.svg` por el logo del cliente y corre `pnpm brand:assets`.
- Cambia colores y tipografía en `src/styles/global.css`.

Detalles: [Diseño y marca](diseno-y-marca.md).

## 4. Estructura y contenido, desde cero

Nada de lo que trae el template es una estructura que haya que seguir. Pide al agente
_"crea el home"_ (skill `/disenar-sitio`) o sigue [Diseñar el sitio](disenar-el-sitio.md):

- `pnpm demo:clear` borra la portada demo, sus imágenes y el menú que apuntaba a ella.
- El diseño sale de Figma (página por página según el `node-id`) o de Hallmark, no de la
  portada demo.
- Los bloques que pida el diseño se crean con `/nueva-seccion`. Los tipos de arranque se
  reutilizan solo si encajan sin forzar el diseño; también puedes cambiarlos o quitarlos.
- Cada página nueva es un archivo en `src/content/pages/es/`, con los textos del cliente.
- El menú, el pie de página y el contacto de `src/content/site/es.yaml` se escriben para el
  sitio.
- El aviso de privacidad y los términos de `src/content/legal/es/` son una referencia
  genérica: se sustituyen por los del cliente. **Deben revisarlos el cliente o su asesor
  legal**.
- `gracias.yaml` se conserva como página (los formularios la usan), pero su texto se escribe
  para el sitio.
- Las imágenes son las del cliente, en `src/assets/images/`.

Guías: [Contenido](contenido.md), [Secciones](secciones.md) e [Imágenes](imagenes.md).

## 5. Revisar y publicar

```bash
pnpm verify
```

Cuando pase, conecta el repositorio a Vercel y configura el dominio:
[Despliegue en Vercel](despliegue-vercel.md). Si el cliente usará formularios, medición o
Binflow, sigue [Formularios y email](formularios-y-email.md), [Analytics](analytics.md) y
[Binflow](binflow.md).

## Licencia del sitio

El template es MIT: el sitio del cliente puede ser privado. Conserva el archivo `LICENSE` del
template (es la única condición de MIT) y cambia el campo `license` de `package.json` a
`UNLICENSED` si el repositorio del cliente no se publica. Los nombres Bin Astro Template, Binflow
y BSI son marcas privadas: no los uses como nombre del sitio ni de un producto derivado (ver la
sección de licencia del [README](../../README.md#licencia)).

## Lista final

- [ ] `pnpm verify` pasa sin avisos de placeholders.
- [ ] Textos legales revisados por el cliente.
- [ ] `PUBLIC_SITE_URL` configurado en Vercel (Production).
- [ ] Dominio conectado y con HTTPS.
- [ ] Formulario probado de punta a punta (si aplica).
- [ ] Sitio dado de alta en Search Console con su sitemap (ver [SEO](seo.md)).
- [ ] `pnpm check:headers --live <dominio>` pasa.
