import type { Locale } from "~/config/locales"

/**
 * Textos fijos de la interfaz (no editoriales). Los textos editoriales van en
 * src/content/. Cada idioma debe tener todas las llaves: TypeScript lo exige.
 */
const es = {
  "a11y.skipToContent": "Saltar al contenido",
  "a11y.mainNav": "Navegación principal",
  "a11y.footerNav": "Enlaces del sitio",
  "a11y.openMenu": "Abrir menú",
  "a11y.breadcrumb": "Ruta de navegación",
  "a11y.languages": "Otros idiomas",
  "nav.home": "Inicio",
  "legal.updatedAt": "Última actualización",
  "notFound.title": "Página no encontrada",
  "notFound.description":
    "La página que buscas no existe o cambió de dirección.",
  "notFound.cta": "Volver al inicio",
  "form.name": "Nombre",
  "form.email": "Correo electrónico",
  "form.phone": "Teléfono (opcional)",
  "form.message": "Mensaje",
  "form.submit": "Enviar mensaje",
  "form.submitting": "Enviando…",
  "form.success": "¡Gracias! Recibimos tu mensaje y te responderemos pronto.",
  "form.error":
    "No pudimos enviar el formulario. Intenta de nuevo o escríbenos por correo.",
  "form.privacyNotice": "Al enviar aceptas nuestro",
  "form.privacyLink": "aviso de privacidad",
  "form.fallback": "Escríbenos directamente a",
  "form.subject": "Nuevo mensaje desde el sitio web",
  "newsletter.email": "Tu correo electrónico",
  "newsletter.submit": "Suscribirme",
  "newsletter.success": "¡Listo! Revisa tu correo para confirmar.",
  "newsletter.error": "No pudimos completar la suscripción. Intenta de nuevo.",
  "footer.rights": "Todos los derechos reservados.",
  "consent.title": "Cookies en este sitio",
  "consent.body":
    "Este sitio usa cookies y tecnologías similares de terceros. Puedes aceptarlas, rechazarlas o elegir cuáles permitir.",
  "consent.policyLink": "Política de cookies",
  "consent.privacyLink": "Aviso de privacidad",
  "consent.customize": "Elegir cookies",
  "consent.analytics": "Medición",
  "consent.analyticsHelp":
    "Nos dice cuántas personas visitan el sitio y qué páginas usan.",
  "consent.marketing": "Publicidad",
  "consent.marketingHelp":
    "Permite medir campañas y mostrar anuncios relevantes en otras plataformas.",
  "consent.save": "Guardar selección",
  "consent.reject": "Rechazar",
  "consent.accept": "Aceptar todas",
  "consent.settings": "Configurar cookies",
} as const

export type UiKey = keyof typeof es

const en: Record<UiKey, string> = {
  "a11y.skipToContent": "Skip to content",
  "a11y.mainNav": "Main navigation",
  "a11y.footerNav": "Site links",
  "a11y.openMenu": "Open menu",
  "a11y.breadcrumb": "Breadcrumb",
  "a11y.languages": "Other languages",
  "nav.home": "Home",
  "legal.updatedAt": "Last updated",
  "notFound.title": "Page not found",
  "notFound.description": "The page you are looking for does not exist.",
  "notFound.cta": "Back to home",
  "form.name": "Name",
  "form.email": "Email",
  "form.phone": "Phone (optional)",
  "form.message": "Message",
  "form.submit": "Send message",
  "form.submitting": "Sending…",
  "form.success": "Thank you! We received your message.",
  "form.error": "We could not send the form. Please try again or email us.",
  "form.privacyNotice": "By sending you accept our",
  "form.privacyLink": "privacy policy",
  "form.fallback": "Write to us at",
  "form.subject": "New message from the website",
  "newsletter.email": "Your email",
  "newsletter.submit": "Subscribe",
  "newsletter.success": "Done! Check your inbox to confirm.",
  "newsletter.error": "We could not subscribe you. Please try again.",
  "footer.rights": "All rights reserved.",
  "consent.title": "Cookies on this site",
  "consent.body":
    "This site uses third-party cookies and similar technologies. You can accept, reject or choose which ones to allow.",
  "consent.policyLink": "Cookie policy",
  "consent.privacyLink": "Privacy policy",
  "consent.customize": "Choose cookies",
  "consent.analytics": "Analytics",
  "consent.analyticsHelp":
    "Tells us how many people visit the site and which pages they use.",
  "consent.marketing": "Advertising",
  "consent.marketingHelp":
    "Lets us measure campaigns and show relevant ads on other platforms.",
  "consent.save": "Save selection",
  "consent.reject": "Reject",
  "consent.accept": "Accept all",
  "consent.settings": "Cookie settings",
}

export const ui: Record<Locale, Record<UiKey, string>> = { es, en }

export function t(locale: Locale, key: UiKey): string {
  return ui[locale][key]
}
