# Idiomas

<!-- check:docs ejemplos: src/content/pages/es/servicios.yaml src/content/pages/en/ -->

El sitio sale en **español** y está preparado para más idiomas sin cambiar código: se activan
desde configuración y se agrega el contenido traducido. Con un agente, pide `/agregar-idioma`
(por ejemplo, _"haz el sitio bilingüe con inglés"_).

## Cómo funcionan las URLs

El idioma por defecto va sin prefijo y los demás con prefijo:

| Idioma         | Archivo                               | URL            |
| -------------- | ------------------------------------- | -------------- |
| Español        | `src/content/pages/es/servicios.yaml` | `/servicios`   |
| Inglés         | `src/content/pages/en/services.yaml`  | `/en/services` |
| Español (home) | `src/content/pages/es/index.yaml`     | `/`            |
| Inglés (home)  | `src/content/pages/en/index.yaml`     | `/en`          |

## Activar un idioma

1. **Configuración** — en `src/config/locales.ts`, agrega el código a `ENABLED_LOCALES`. Si no
   está en `LOCALE_META`, agrégalo con su `label`, `hreflang`, `ogLocale` y `htmlLang`.
2. **Textos de interfaz** — en `src/i18n/ui.ts`, agrega el diccionario del idioma (botones,
   mensajes del formulario, etiquetas de accesibilidad). TypeScript falla si falta una llave.
3. **Textos globales** — `src/content/site/<idioma>.yaml`, con los enlaces internos ya con
   prefijo (`/en/privacy`).
4. **Páginas y legales** — una traducción por archivo en `src/content/pages/<idioma>/` y
   `src/content/legal/<idioma>/`.
5. **Revisar** — `pnpm check:i18n`, `pnpm bsi:sync` y `pnpm verify`.

## Enlazar traducciones

Dos archivos son la misma página en distintos idiomas cuando comparten `translationKey`. Si una
página no lo declara, vale su nombre de archivo (y `home` para la home). Por eso, si el slug
se traduce, declara la llave en ambos:

```yaml
# src/content/pages/es/servicios.yaml
translationKey: servicios

# src/content/pages/en/services.yaml
translationKey: servicios
```

Con eso el sitio genera solo:

- Etiquetas `hreflang` recíprocas entre traducciones, más `x-default` al idioma por defecto.
- Las alternativas en el sitemap.
- El selector de idioma del encabezado, que enlaza directamente a la traducción de la página
  actual.

## Qué revisa `pnpm check:i18n`

- Cada idioma activo tiene sus textos globales, su home y los mismos textos legales.
- No hay carpetas de idiomas desconocidos.
- Ningún `translationKey` se repite dentro de un mismo idioma.

`pnpm check:seo` confirma además que los `hreflang` sean recíprocos.

## Buenas prácticas

- Traduce con naturalidad, no palabra por palabra, y adapta el `title` y la `description` a
  cómo busca la gente en ese idioma.
- Conserva los `id` de sección: los enlaces del tipo `/#contacto` siguen funcionando en todos
  los idiomas.
- No publiques un idioma a medias: si una página no está traducida, es mejor no crearla que
  dejarla con texto en otro idioma.
