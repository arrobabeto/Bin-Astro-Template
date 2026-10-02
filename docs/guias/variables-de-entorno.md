# Variables de entorno

**Todas son opcionales:** el sitio compila y funciona sin ninguna. Cada variable activa algo
concreto (dominio, medición, formularios). La lista completa y comentada está en
`.env.example`.

- **Local:** `pnpm setup` copia `.env.example` a `.env`. El archivo `.env` nunca se sube a Git.
- **Vercel:** Project Settings → Environment Variables, eligiendo el entorno (Production,
  Preview, Development).

## Públicas y secretas

- Las que empiezan con `PUBLIC_` se leen **durante el build** y pueden terminar en el HTML.
  Cambiarlas en Vercel requiere volver a desplegar.
- Las demás son **secretas**: solo existen en el servidor, se leen al momento de cada envío de
  formulario y nunca llegan al navegador. No las pongas en archivos del proyecto.

## Referencia

| Variable                      | Tipo    | Para qué                                                       | Guía                                  |
| ----------------------------- | ------- | -------------------------------------------------------------- | ------------------------------------- |
| `PUBLIC_SITE_URL`             | pública | Dominio canónico, con `https://` y sin `/` final               | abajo                                 |
| `NOINDEX`                     | build   | `true` pone todo el sitio en `noindex` (sitio en construcción) | [SEO](seo.md)                         |
| `PUBLIC_GTM_ID`               | pública | Google Tag Manager (`GTM-XXXXXXX`)                             | [Analytics](analytics.md)             |
| `PUBLIC_GA4_ID`               | pública | Google Analytics 4 (`G-XXXXXXXXXX`), solo si no usas GTM       | [Analytics](analytics.md)             |
| `PUBLIC_GOOGLE_ADS_ID`        | pública | Google Ads (`AW-XXXXXXXXXX`), solo si no usas GTM              | [Analytics](analytics.md)             |
| `PUBLIC_META_PIXEL_ID`        | pública | Píxel de Meta (Facebook/Instagram), número de 10 a 20 dígitos  | [Analytics](analytics.md)             |
| `PUBLIC_TIKTOK_PIXEL_ID`      | pública | Píxel de TikTok (código en mayúsculas)                         | [Analytics](analytics.md)             |
| `PUBLIC_GSC_VERIFICATION`     | pública | Verificación de Search Console por meta etiqueta               | [Analytics](analytics.md)             |
| `PUBLIC_FORMS_PROVIDER`       | pública | `none`, `web3forms` o `sendgrid`                               | [Formularios](formularios-y-email.md) |
| `PUBLIC_WEB3FORMS_ACCESS_KEY` | pública | Clave de Web3Forms                                             | [Formularios](formularios-y-email.md) |
| `SENDGRID_API_KEY`            | secreta | API key de SendGrid (Mail Send)                                | [Formularios](formularios-y-email.md) |
| `MAIL_FROM_EMAIL`             | secreta | Remitente (dominio autenticado en SendGrid)                    | [Formularios](formularios-y-email.md) |
| `MAIL_FROM_NAME`              | secreta | Nombre del remitente                                           | [Formularios](formularios-y-email.md) |
| `MAIL_TO_EMAIL`               | secreta | Quién recibe los mensajes                                      | [Formularios](formularios-y-email.md) |
| `PUBLIC_NEWSLETTER_ENABLED`   | pública | `true` muestra las secciones `newsletter`                      | [Formularios](formularios-y-email.md) |
| `MAILERLITE_API_KEY`          | secreta | API key de MailerLite                                          | [Formularios](formularios-y-email.md) |
| `MAILERLITE_GROUP_ID`         | secreta | Grupo de MailerLite para las altas                             | [Formularios](formularios-y-email.md) |
| `FIGMA_API_KEY`               | local   | Solo para las skills de Figma; el sitio no la usa              | [Skills](skills.md)                   |
| `FIGMA_FILE_KEY`              | local   | Archivo de Figma por defecto para esas skills                  | [Skills](skills.md)                   |

Los IDs de GTM, GA4 y Search Console se validan con su formato: un valor mal copiado se ignora
en lugar de romper la página.

Usa **exactamente** estos nombres. Una variable con otro nombre (por ejemplo
`SENDGRID_FROM_EMAIL` en lugar de `MAIL_FROM_EMAIL`) no la lee nadie, y el formulario deja de
enviar. `pnpm check:env` (incluido en `pnpm verify`) y el log del build detectan los nombres de
formularios y correo que no corresponden, y dicen a cuál renombrar. Ver
[Si los correos no llegan](formularios-y-email.md#si-los-correos-no-llegan).

## El dominio (`PUBLIC_SITE_URL`)

Define las URLs absolutas: canonical, sitemap, Open Graph, `hreflang` y JSON-LD. Se resuelve en
este orden:

1. `PUBLIC_SITE_URL`, si existe.
2. En Vercel, el dominio de producción del proyecto (`VERCEL_PROJECT_PRODUCTION_URL`).
3. `http://localhost:4321` en local.

En un despliegue de **producción**, el build **falla a propósito** si el dominio es
`localhost`, no usa `https`, termina en `.invalid` o incluye una ruta. Así nunca se publican
canonical ni sitemap apuntando al lugar equivocado. Configura `PUBLIC_SITE_URL` con el dominio
final (con o sin `www`, el que vaya a ser el principal) en el entorno Production de Vercel.

En CI, `pnpm build:ci` usa `https://www.sitio-de-prueba.invalid` para compilar sin dominio real,
y `pnpm check:no-localhost` confirma que no quedó ningún `localhost` en el resultado.
