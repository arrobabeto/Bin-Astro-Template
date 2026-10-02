# Analytics

La medición y la publicidad son **opcionales** y vienen apagadas. Se activan con una variable de
entorno por herramienta y solo se cargan en producción: los previews y el desarrollo local nunca
envían datos.

> **Servicio adicional.** Configurar la medición, los objetivos de conversión, las campañas y los
> informes es un servicio que se ofrece aparte del sitio. Esta guía cubre solo la conexión
> técnica.

## Qué herramienta usar

| Herramienta                 | Para qué sirve                                                           | Variable                             |
| --------------------------- | ------------------------------------------------------------------------ | ------------------------------------ |
| Google Search Console (GSC) | Cómo aparece el sitio en Google: búsquedas, clics, errores de indexación | `PUBLIC_GSC_VERIFICATION` (opcional) |
| Google Tag Manager (GTM)    | Contenedor para administrar etiquetas sin tocar código                   | `PUBLIC_GTM_ID`                      |
| Google Analytics 4 (GA4)    | Visitas, origen del tráfico y conversiones                               | `PUBLIC_GA4_ID`                      |
| Google Ads                  | Conversiones y remarketing de campañas de Google                         | `PUBLIC_GOOGLE_ADS_ID`               |
| Píxel de Meta               | Conversiones y audiencias de Facebook e Instagram                        | `PUBLIC_META_PIXEL_ID`               |
| Píxel de TikTok             | Conversiones y audiencias de TikTok                                      | `PUBLIC_TIKTOK_PIXEL_ID`             |

Recomendación: **Search Console siempre**; **GTM** si habrá campañas o varias etiquetas, con GA4
y Google Ads configurados dentro de GTM; **GA4 directo** si solo interesa medir visitas.

Si defines GTM, el sitio ignora `PUBLIC_GA4_ID` y `PUBLIC_GOOGLE_ADS_ID` para no contar cada
visita dos veces. Los píxeles de Meta y TikTok funcionan con o sin GTM.

## Search Console

La mejor opción es verificar el dominio por **DNS** (propiedad de dominio): cubre `www`, sin
`www` y todos los subdominios, y no requiere cambiar el sitio. Si no hay acceso al DNS, usa la
meta etiqueta: copia solo el valor `content` en `PUBLIC_GSC_VERIFICATION`.

Después de verificar, envía `https://<dominio>/sitemap.xml`.

## Activarlas

1. En Vercel, agrega la variable en el entorno **Production**.
2. Vuelve a desplegar.
3. Confirma en la herramienta (vista en tiempo real de GA4, modo Preview de GTM, Meta Pixel
   Helper o TikTok Pixel Helper). Con el banner en modo `opt-in`, acepta las cookies antes de
   probar.

`vercel.json` ya permite en la política de seguridad (CSP) los dominios de Google, Meta y TikTok.
Si agregas etiquetas de otros servicios dentro de GTM, tendrás que añadir sus dominios a
`script-src`, `connect-src` e `img-src`.

## Privacidad y consentimiento

En cuanto configuras una de estas herramientas (salvo Search Console), el sitio muestra un
**banner de cookies** y solo carga cada herramienta según lo que la persona acepte. Con GTM, el
banner envía las señales de Google Consent Mode v2: configura las etiquetas de GTM para
respetarlas.

Antes de activar cualquier herramienta, actualiza los textos legales para mencionarla y ajusta
el banner al país del cliente con la skill `textos-legales`. Detalles en
[Textos legales y cookies](textos-legales.md).
