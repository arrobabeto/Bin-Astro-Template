# Historial de cambios

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Las versiones
siguen [SemVer](https://semver.org/lang/es/). Cada entrada indica si hay pasos manuales para los
sitios que actualizan desde el template (ver
[Actualizar desde el template](docs/guias/actualizar-desde-template.md)).

## [Sin publicar]

### Cambiado

- Dependencias al día (Prettier para Astro 1.x, `sharp`, `jsdom`, `globals`, acciones de
  GitHub). TypeScript se queda en la 6 (ver
  [Actualizar dependencias](docs/guias/actualizar-dependencias.md)).
- El inventario de Binflow ordena los idiomas con el idioma por defecto primero.
- La portada del template ahora es una bienvenida marcada como relleno que explica las dos
  rutas de diseño (Figma o Hallmark), en lugar de simular una agencia. Las pruebas e2e de la
  home ya no dependen de su contenido. El encabezado oculta el menú cuando está vacío.
- La documentación presenta el template como un stack, no como un sitio de ejemplo: los tipos
  de sección y los archivos de contenido son material de arranque que cada sitio sustituye
  (ADR 0009). Las skills `nueva-seccion` y `construir-desde-figma` ya no piden preferir los
  tipos existentes.

### Agregado

- `pnpm demo:clear` y la skill `disenar-sitio`: borran la portada demo al crear el home y
  guían el diseño desde Figma (por `node-id`) o con Hallmark. `check:placeholders` bloquea la
  portada demo o la provisional tras `pnpm bootstrap` (ver
  [Diseñar el sitio](docs/guias/disenar-el-sitio.md) y la ADR 0008). Sin pasos manuales para
  sitios existentes: su portada no tiene el marcador de demo.

- Licencia MIT para el código, con aviso de que los nombres Bin Astro Template, Binflow y
  BSI son marcas privadas.
- `pnpm test:integration`: casos de uso reales en una copia temporal del repo.
- Pruebas de coherencia entre scripts, documentación, CI, variables de entorno y skills.
- Historias de visitante en las pruebas e2e.

## [0.1.0] — 2026-09-28

Primera versión de Bin Astro Template.

### Agregado

- Astro 7 estático con `@astrojs/vercel` y endpoints opcionales para formularios y newsletter.
- Contenido en Git: páginas como secciones YAML (`hero`, `features`, `split`, `faq`, `prose`,
  `cta`, `contact`, `newsletter`), textos legales en Markdown y textos globales por idioma.
- SEO técnico: canonical, Open Graph, JSON-LD, `sitemap.xml`, `robots.txt`, `llms.txt`,
  `llms-full.txt`, `security.txt`, 404, redirecciones 301 y `noindex` en previews.
- Español por defecto con i18n lista para activar (`hreflang`, selector de idioma).
- Formularios intercambiables (mailto, Web3Forms, SendGrid) y newsletter con MailerLite.
- Medición opcional con GTM, GA4 y Search Console.
- BSI v1 (perfil `astro_repo`): marcadores `data-bf-*`, inventario generado y revisión en CI.
- `pnpm bootstrap` para convertir el template en un sitio de cliente.
- Revisiones automáticas (`pnpm verify`) y CI en GitHub Actions.
- Skills para Cursor, Claude Code y Codex, con inventario documentado.
- Documentación completa en español: guías y ADR.
