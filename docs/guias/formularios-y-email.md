# Formularios y email

El formulario de contacto y la newsletter son opcionales. Sin configurar nada, el sitio compila
y la sección `contact` muestra un enlace para escribir por correo al email de
`src/content/site/es.yaml`. Los servicios recomendados y sus enlaces están en
[Servicios recomendados](servicios-recomendados.md).

## Elegir proveedor

`PUBLIC_FORMS_PROVIDER` decide cómo funciona el formulario de contacto:

| Valor       | Cómo funciona                                                                   | Necesita servidor    | Cuándo usarlo                            |
| ----------- | ------------------------------------------------------------------------------- | -------------------- | ---------------------------------------- |
| `none`      | Enlace `mailto:` al correo del sitio                                            | No                   | Sitio recién publicado o muy sencillo    |
| `web3forms` | El navegador envía a Web3Forms, que reenvía a tu correo                         | No                   | La opción más simple con formulario      |
| `sendgrid`  | El sitio recibe el envío en `/api/forms/contact` y manda el correo con SendGrid | Sí (Vercel Function) | Control total del correo y del remitente |

Si eliges `web3forms` sin una clave válida, el sitio vuelve a `none` en lugar de mostrar un
formulario que no funciona.

## Web3Forms

1. Crea una clave en [web3forms.com](https://web3forms.com) con el correo que recibirá los
   mensajes.
2. En Vercel: `PUBLIC_FORMS_PROVIDER=web3forms` y `PUBLIC_WEB3FORMS_ACCESS_KEY=<clave>`.
3. Vuelve a desplegar (las variables `PUBLIC_*` se leen durante el build).

La clave de Web3Forms es pública por diseño: solo permite enviar a tu correo.

## SendGrid

1. Crea una cuenta en SendGrid y **autentica el dominio** (Sender Authentication). Sin esto,
   los correos llegan a spam.
2. Crea una API key con permiso solo de **Mail Send**.
3. En Vercel:

   | Variable                | Ejemplo                                         |
   | ----------------------- | ----------------------------------------------- |
   | `PUBLIC_FORMS_PROVIDER` | `sendgrid`                                      |
   | `SENDGRID_API_KEY`      | la API key (secreta)                            |
   | `MAIL_FROM_EMAIL`       | `web@clinicanorte.mx` (del dominio autenticado) |
   | `MAIL_FROM_NAME`        | `Sitio Clínica Norte`                           |
   | `MAIL_TO_EMAIL`         | `hola@clinicanorte.mx`                          |

4. Vuelve a desplegar.

El mensaje llega con "Responder a" apuntando al correo de quien escribió. Si falta alguna
variable, el endpoint responde con un error claro en lugar de fallar en silencio.

## Newsletter con MailerLite

1. En MailerLite, crea una API key (Integrations → API) y, si quieres, un grupo.
2. En Vercel: `PUBLIC_NEWSLETTER_ENABLED=true`, `MAILERLITE_API_KEY` y opcionalmente
   `MAILERLITE_GROUP_ID`.
3. Agrega una sección `newsletter` a la página donde la quieras (ver [Secciones](secciones.md)).
4. Vuelve a desplegar.

Las altas llegan a `/api/newsletter` y de ahí a MailerLite. Con la newsletter desactivada, la
sección no aparece.

## Cómo está protegido

- **Sin JavaScript funciona igual:** el formulario es HTML normal y, al enviarse, lleva a la
  página de agradecimiento (`thankYouHref`). Con JavaScript, el envío es en la misma página y
  muestra el resultado sin recargar.
- **Anti-spam:** campo trampa invisible (honeypot). Los bots reciben una respuesta de éxito para
  no darles pistas.
- **Validación:** nombre, correo y mensaje obligatorios, con límites de longitud, en el
  navegador y en el servidor.
- **Privacidad:** el formulario enlaza el aviso de privacidad (`privacyHref`).
- **Secretos:** las API keys solo existen en el servidor (`astro:env/server`). ESLint impide
  importarlas en componentes y `pnpm check:leakage` comprueba que no terminen en el sitio ni
  en Git.
- **CSP:** `vercel.json` solo permite enviar formularios al propio sitio y a Web3Forms. Si
  agregas otro servicio, actualiza `form-action` y `connect-src`.

## Probarlo

- Local: `pnpm dev` y envía el formulario. Con `sendgrid` necesitas las variables en `.env`.
- Producción: envía un mensaje real y confirma que llega (y que no cae en spam).
