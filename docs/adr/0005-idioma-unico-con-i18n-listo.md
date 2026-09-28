# 0005 — Español por defecto con i18n lista para activar

**Estado:** Aceptada

## Contexto

La mayoría de los sitios arrancan en un solo idioma, pero algunos se vuelven bilingües después.
Agregar idiomas a un sitio que no se diseñó para ello obliga a mover contenido y cambiar URLs.

## Decisión

El contenido siempre vive en carpetas de idioma (`src/content/pages/es/`), aunque solo haya
uno. Los idiomas activos se controlan en `src/config/locales.ts` (`ENABLED_LOCALES`), con el
español como `DEFAULT_LOCALE` sin prefijo en la URL y los demás con prefijo (`/en/...`). Las
traducciones se enlazan con `translationKey`. Los textos de interfaz están en `src/i18n/ui.ts`.

## Alternativas

- **Enrutamiento i18n integrado de Astro:** cubre el prefijo, pero no la paridad de contenido
  ni `hreflang` entre slugs traducidos; igual habría que construir esa parte.
- **Sin estructura por idioma hasta que haga falta:** menos carpetas hoy, migración costosa
  después.

## Consecuencias

- Activar un idioma es configuración más contenido; no cambian las URLs existentes.
- `hreflang`, sitemap alternativo y selector de idioma se generan solos.
- `pnpm check:i18n` exige paridad (textos globales, home y legales en cada idioma activo).
- Con un solo idioma, no se emite `hreflang` ni se muestra el selector.
