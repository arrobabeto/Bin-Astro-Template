---
name: agregar-idioma
description: >-
  Activa un idioma adicional (por ejemplo inglés) con sus páginas, textos
  legales, navegación, hreflang y sitemap. Úsala cuando pidan "haz el sitio
  bilingüe", "agrega inglés", "traduce el sitio" o "quiero una versión en
  otro idioma".
---

# Agregar idioma

El idioma por defecto (español) va sin prefijo (`/servicios`); los demás llevan prefijo
(`/en/services`). Guía: [docs/guias/idiomas.md](../../docs/guias/idiomas.md).

## Pasos

1. **Metadatos del idioma** — `src/config/locales.ts`: si el idioma no está en `LOCALE_META`,
   agrégalo (`label`, `hreflang`, `ogLocale`, `htmlLang`). Agrega su código a
   `ENABLED_LOCALES`.
2. **Textos de interfaz** — `src/i18n/ui.ts`: agrega el diccionario del idioma con **todas**
   las llaves del español (TypeScript falla si falta alguna).
3. **Textos globales** — copia `src/content/site/es.yaml` a `src/content/site/<idioma>.yaml`
   y tradúcelo. Los `href` internos llevan el prefijo (`/en/privacy`), las anclas no cambian.
4. **Páginas** — por cada `src/content/pages/es/<página>.yaml` crea
   `src/content/pages/<idioma>/<slug-traducido>.yaml`:
   - Mismo `translationKey` que la versión en español (si el español no lo declara, su valor
     es el slug; para la home es `home`). Así se enlazan con `hreflang`.
   - Mismos `id` de sección. Si el slug coincide con el del español (la home siempre), los
     `bf_id` de Binflow se comparten entre idiomas; con slug traducido, el inventario genera
     filas propias del idioma (`services.hero.heading`).
   - Las imágenes pueden reutilizarse; el `alt` se traduce.
5. **Legales** — `src/content/legal/<idioma>/` con los mismos documentos y `translationKey`.
6. **Traducción:** natural, no literal; conserva hechos y alcance. No inventes contenido para
   rellenar.
7. **Verifica:**

   ```bash
   pnpm check:i18n     # paridad de archivos y translationKey
   pnpm bsi:sync       # el inventario agrega el idioma a `locales`
   pnpm verify         # incluye hreflang recíproco y sitemap
   ```

8. Revisa en `pnpm dev` que `/en` responda y que el encabezado muestre el selector de idioma
   (aparece solo cuando la página tiene versión en otro idioma; vive en
   `src/components/layout/Header.astro`).

## Cambiar el idioma por defecto

Es un cambio de URLs (el idioma sin prefijo cambia): requiere redirecciones 301 para todas
las páginas. Pide confirmación explícita y usa `agregar-redireccion`.
