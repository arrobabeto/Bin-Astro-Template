# Servicios recomendados

Servicios externos que se integran con el template. Todos son opcionales. **Este es el único
archivo con enlaces de afiliado y de contratación**: el resto de la documentación enlaza aquí,
así que para actualizar un enlace basta con cambiarlo en este archivo.

> Algunos enlaces son de afiliado: si contratas a través de ellos, podemos recibir una comisión
> sin costo adicional para ti. Solo recomendamos servicios que usamos e integramos en el
> template.

<!-- Enlaces pendientes: reemplazar cada "Enlace pendiente" por el enlace definitivo. -->

## Email transaccional: SendGrid

Envía los mensajes del formulario de contacto desde el dominio del cliente, con buena
entregabilidad y registro de envíos.

- **Cuándo:** el cliente quiere recibir los formularios con su propio remitente y tener
  control del correo.
- **Plan:** el gratuito alcanza para la mayoría de los sitios de contacto.
- **Integración:** `PUBLIC_FORMS_PROVIDER=sendgrid`. Ver
  [Formularios y email](formularios-y-email.md#sendgrid).
- **Contratar:** _Enlace pendiente (afiliado SendGrid)._

## Newsletter y email marketing: MailerLite

Listas de suscriptores, campañas y automatizaciones con editor visual.

- **Cuándo:** el cliente quiere construir una lista de correo y enviar boletines.
- **Plan:** gratuito hasta cierto número de suscriptores.
- **Integración:** `PUBLIC_NEWSLETTER_ENABLED=true` y una sección `newsletter`. Ver
  [Formularios y email](formularios-y-email.md#newsletter-con-mailerlite).
- **Contratar:** _Enlace pendiente (afiliado MailerLite)._

## Formularios sin servidor: Web3Forms

La forma más simple de recibir el formulario de contacto por correo, sin configurar un servidor.

- **Cuándo:** sitio sencillo que solo necesita recibir mensajes.
- **Integración:** `PUBLIC_FORMS_PROVIDER=web3forms`. Ver
  [Formularios y email](formularios-y-email.md#web3forms).
- **Sitio:** [web3forms.com](https://web3forms.com).

## Binflow

Gestión del sitio por Telegram: el cliente pide un cambio, Binflow lo prepara, muestra una
vista previa, espera la aprobación, lo publica y verifica que producción quedó bien. Este
template ya es compatible: no hay que reconstruir el sitio para empezar a usarlo.

- **Cuándo:** el cliente quiere actualizar su sitio seguido sin depender de un desarrollador
  para cada cambio.
- **Qué incluye el template:** marcadores e inventario BSI. Ver [Binflow](binflow.md).
- **Contratar Binflow:** _Enlace pendiente (contratación de Binflow)._

## Medición: Google Analytics, Tag Manager y Search Console

Herramientas gratuitas de Google. La configuración de medición, conversiones e informes se
ofrece como servicio adicional.

- **Integración:** [Analytics](analytics.md).
- **Contratar la configuración:** _Enlace pendiente (servicio de analítica)._

## Hosting: Vercel

El template se despliega en Vercel (plan Hobby para proyectos personales, Pro para sitios
comerciales). Ver [Despliegue en Vercel](despliegue-vercel.md).
