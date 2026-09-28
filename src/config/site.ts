/**
 * Identidad técnica del sitio. Los textos por idioma (tagline, navegación,
 * footer, contacto) viven en src/content/site/<idioma>.yaml.
 * `pnpm bootstrap` reescribe este archivo al crear un sitio nuevo.
 */
export const site = {
  name: "Bin Astro Template",
  /** Separador entre el título de la página y el nombre del sitio en <title>. */
  titleSeparator: " | ",
  /** Tipo schema.org de la organización (Organization, LocalBusiness, …). */
  organizationType: "Organization",
  /** Ruta pública del logo para JSON-LD (debe existir en public/). */
  logoPath: "/icon-512.png",
  themeColor: "#0f172a",
  backgroundColor: "#ffffff",
  /** Usuario de X/Twitter con @, o vacío. */
  twitterHandle: "",
  /** Contacto para /.well-known/security.txt (mailto: o https:). */
  securityContact: "mailto:seguridad@tu-dominio.mx",
} as const
