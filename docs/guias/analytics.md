# Analytics

La medición es **opcional** y viene apagada. Se activa con una variable de entorno por
herramienta y solo se carga en producción: los previews y el desarrollo local nunca envían datos.

> **Servicio adicional.** Configurar la medición, los objetivos de conversión y los informes es
> un servicio que se ofrece aparte del sitio. Esta guía cubre solo la conexión técnica.

## Qué herramienta usar

| Herramienta                 | Para qué sirve                                                           | Variable                             |
| --------------------------- | ------------------------------------------------------------------------ | ------------------------------------ |
| Google Search Console (GSC) | Cómo aparece el sitio en Google: búsquedas, clics, errores de indexación | `PUBLIC_GSC_VERIFICATION` (opcional) |
| Google Tag Manager (GTM)    | Contenedor para administrar etiquetas sin tocar código                   | `PUBLIC_GTM_ID`                      |
| Google Analytics 4 (GA4)    | Visitas, origen del tráfico y conversiones                               | `PUBLIC_GA4_ID`                      |

Recomendación: **Search Console siempre**; **GTM** si habrá campañas o varias etiquetas
(Google Ads, Meta, etc.), con GA4 configurado dentro de GTM; **GA4 directo** si solo interesa
medir visitas.

Si defines GTM, el sitio ignora `PUBLIC_GA4_ID` para no contar cada visita dos veces.

## Search Console

La mejor opción es verificar el dominio por **DNS** (propiedad de dominio): cubre `www`, sin
`www` y todos los subdominios, y no requiere cambiar el sitio. Si no hay acceso al DNS, usa la
meta etiqueta: copia solo el valor `content` en `PUBLIC_GSC_VERIFICATION`.

Después de verificar, envía `https://<dominio>/sitemap.xml`.

## Activarlas

1. En Vercel, agrega la variable en el entorno **Production**.
2. Vuelve a desplegar.
3. Confirma en la herramienta (vista en tiempo real de GA4 o el modo Preview de GTM).

`vercel.json` ya permite los dominios de Google en la política de seguridad (CSP). Si agregas
etiquetas de otros servicios dentro de GTM, tendrás que añadir sus dominios a
`script-src`, `connect-src` e `img-src`.

## Privacidad y consentimiento

El template no incluye banner de cookies. Antes de activar GA4 o GTM, confirma con el cliente
qué exige la ley que le aplica (en la Unión Europea, el RGPD pide consentimiento previo) y
actualiza el aviso de privacidad para mencionar la herramienta. Si hace falta un banner, se
integra como servicio adicional.
