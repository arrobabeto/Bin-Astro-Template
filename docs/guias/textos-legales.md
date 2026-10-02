# Textos legales y cookies

Cada sitio necesita textos legales que describan lo que **realmente** hace con los datos de sus
visitantes. El template trae una referencia de ejemplo; la skill `textos-legales` la convierte en
los documentos del cliente y configura el banner de cookies.

> **No es asesoría legal.** Los documentos generados son un borrador bien fundamentado. Antes de
> publicar, el cliente debe revisarlos con un profesional.

## Cómo pedirlo

Pídele al agente, por ejemplo: _"Usa la skill textos-legales para crear el aviso de privacidad y
los textos legales del sitio"_. El agente:

1. Revisa qué usa el sitio (formularios, medición, píxeles, mapas, videos) con
   `node skills/textos-legales/scripts/inventario-datos.mjs`.
2. Te entrevista: país, datos del responsable, qué datos se recaban y para qué, herramientas de
   medición y publicidad, venta en línea, conservación y cada cuánto se vuelve a preguntar por
   las cookies.
3. Aplica los requisitos del país. México viene documentado (Ley Federal de Protección de Datos
   Personales en Posesión de los Particulares, 2025); para otros países investiga en fuentes
   oficiales y te entrega el checklist con enlaces.
4. Escribe los documentos y configura el banner.

Si falta un dato (domicilio, correo de privacidad, plazo de conservación), el agente lo
pregunta: no lo inventa.

## Qué se genera

| Documento                    | Dónde                                                  | Cuándo                                   |
| ---------------------------- | ------------------------------------------------------ | ---------------------------------------- |
| Aviso de privacidad integral | `src/content/legal/<idioma>/privacidad.md`             | Siempre                                  |
| Aviso simplificado           | `legal.formNotice` en `src/content/site/<idioma>.yaml` | Si hay formularios; se muestra debajo    |
| Términos y condiciones       | `src/content/legal/<idioma>/terminos.md`               | Siempre                                  |
| Política de cookies          | `src/content/legal/<idioma>/cookies.md`                | Si hay medición, píxeles o terceros      |
| Aviso legal                  | `src/content/legal/<idioma>/aviso-legal.md`            | Si la ley lo exige (por ejemplo, España) |

<!-- check:docs ejemplos: src/content/legal/es/cookies.md src/content/legal/es/aviso-legal.md -->

Cada documento generado empieza con el marcador `bin-astro-template:legal-revision-pendiente`.
Mientras exista, `pnpm check:placeholders` muestra un aviso (no bloquea). Cuando el abogado
apruebe el texto, borra esa línea.

## Banner de cookies

El banner **solo aparece si el sitio tiene medición o publicidad configurada** (variables
`PUBLIC_GTM_ID`, `PUBLIC_GA4_ID`, `PUBLIC_GOOGLE_ADS_ID`, `PUBLIC_META_PIXEL_ID` o
`PUBLIC_TIKTOK_PIXEL_ID`, ver [Analytics](analytics.md)). Sin ellas, el sitio no carga nada de
terceros ni muestra banner. La decisión está en la
[ADR 0011](../adr/0011-consentimiento-solo-con-rastreo.md).

Qué hace:

- Muestra "Aceptar", "Rechazar" y "Elegir", con casillas de **medición** y **publicidad**
  (solo las que el sitio usa).
- Avisa a Google de la decisión (Google Consent Mode v2) y carga cada herramienta según lo que
  la persona permitió.
- Guarda la decisión en el navegador y agrega "Configurar cookies" en el pie de página para
  cambiarla.

Se configura en `src/config/consent.ts`:

| Opción          | Valores                          | Qué significa                                                                    |
| --------------- | -------------------------------- | -------------------------------------------------------------------------------- |
| `mode`          | `"opt-in"`, `"opt-out"`, `"off"` | Nada se carga hasta aceptar / se carga y se puede rechazar / sin banner          |
| `renewal`       | `"session"` o `{ days: N }`      | Cada cuánto se vuelve a preguntar: en cada visita nueva, cada día (1), cada año… |
| `rejectionDays` | número                           | Cuántos días se recuerda un rechazo total                                        |
| `version`       | número                           | Súbelo si cambian las herramientas o la política: vuelve a preguntar a todos     |

Por defecto: `opt-in`, se vuelve a preguntar cada 180 días y el rechazo se recuerda 180 días.

Los textos del banner se pueden personalizar en `src/content/site/<idioma>.yaml`:

```yaml
legal:
  cookieBanner: Usamos Google Analytics para medir visitas. Puedes aceptar o rechazar.
  cookiesHref: /cookies
  formNotice: Usaremos tus datos solo para responder tu mensaje.
```

Sin `cookieBanner`, el banner usa un texto neutro; sin `cookiesHref`, enlaza al aviso de
privacidad.

## Cuándo volver a usar la skill

- Al agregar o quitar una herramienta de medición o publicidad.
- Al agregar un formulario que pide datos nuevos.
- Al empezar a vender en línea o dirigirse a otro país.
- Si cambia la ley (el agente revisa que los artículos citados sigan vigentes).
