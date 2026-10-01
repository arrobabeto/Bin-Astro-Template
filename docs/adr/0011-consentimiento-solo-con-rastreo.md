# 0011 — Banner de consentimiento solo cuando hay rastreo

**Estado:** Aceptada. Reemplaza a [0007](0007-medicion-opcional-sin-banner.md).

## Contexto

La ADR 0007 dejaba fuera el banner de cookies y lo trataba como un servicio adicional. En la
práctica, los clientes piden píxeles de publicidad (Meta, Google Ads, TikTok) además de la
medición, y casi todas las leyes de privacidad piden al menos informar y permitir rechazar
(México) o pedir consentimiento previo (Unión Europea y otros). Integrar un banner a mano en cada
sitio duplica trabajo y es fácil hacerlo mal (scripts que se cargan antes de aceptar,
decisiones que no se recuerdan, sin forma de cambiar de opinión).

## Decisión

- Medición y píxeles siguen apagados por defecto y se activan con una variable de entorno cada
  uno (`PUBLIC_GTM_ID`, `PUBLIC_GA4_ID`, `PUBLIC_GOOGLE_ADS_ID`, `PUBLIC_META_PIXEL_ID`,
  `PUBLIC_TIKTOK_PIXEL_ID`), solo en builds indexables.
- Si al menos uno está configurado, el sitio incluye un banner ligero propio (sin dependencias)
  con Google Consent Mode v2 y categorías (medición y publicidad) que solo muestran las que el
  sitio usa. Sin ninguno, no hay banner ni JavaScript de terceros.
- La política vive en `src/config/consent.ts`: modo (`opt-in`, `opt-out`, `off`), cada cuánto
  se vuelve a preguntar (por sesión o cada N días), cuánto se recuerda un rechazo y una versión
  que, al subir, vuelve a preguntar a todos.
- Los textos legales (aviso de privacidad, términos, cookies) y la configuración del banner los
  genera la skill `textos-legales` según el país del cliente.

## Alternativas

- **Mantener 0007 (sin banner):** cero JavaScript, pero cada sitio con píxeles necesita una
  integración a mano.
- **Plataforma de consentimiento externa (CMP):** cubre más casos y certificaciones, pero suma
  un script pesado, costo mensual y una dependencia por sitio. Sigue siendo posible: se carga
  desde GTM y se pone `consent.mode: "off"`.
- **Banner siempre visible:** innecesario y molesto en sitios que no rastrean.

## Consecuencias

- Un sitio sin medición ni píxeles sigue sin JavaScript de terceros ni banner.
- Con rastreo, se envía un script pequeño (`src/scripts/consent.ts`) que decide qué cargar.
- Herramientas sin variable propia (Clarity, Hotjar, LinkedIn) requieren ampliar el banner o
  cargarse desde GTM con las señales de Consent Mode.
- La CSP de `vercel.json` incluye los dominios de los píxeles soportados.
- El banner no convierte el sitio en "cumplidor" por sí solo: los textos legales deben
  describir lo que el sitio usa y pasar revisión profesional.
