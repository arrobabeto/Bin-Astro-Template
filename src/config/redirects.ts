import type { AstroUserConfig } from "astro"

/**
 * Redirecciones permanentes. En Vercel se convierten en respuestas HTTP 301
 * reales (`.vercel/output/config.json`); `pnpm check:redirects` lo verifica.
 *
 * Una línea por URL retirada: "/url-vieja": "/url-nueva".
 * Con un agente: skill `agregar-redireccion`.
 */
export const redirects = {
  "/inicio": "/",
  "/home": "/",
} satisfies NonNullable<AstroUserConfig["redirects"]>
