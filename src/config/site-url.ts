/**
 * Resuelve el origen canónico que usan `site`, los canonicals, el sitemap y OG.
 * Lo comparten astro.config.ts (Node) y la app, por eso recibe un objeto env
 * y no puede importar `astro:env`.
 *
 * Orden: PUBLIC_SITE_URL → dominio de producción de Vercel → localhost.
 */
export const LOCAL_SITE_URL = "http://localhost:4321"

type EnvLike = Record<string, string | undefined>

export function resolveSiteUrl(env: EnvLike): string {
  const explicit = env["PUBLIC_SITE_URL"]?.trim()
  if (explicit) return explicit.replace(/\/$/, "")

  const vercelProduction = env["VERCEL_PROJECT_PRODUCTION_URL"]?.trim()
  if (vercelProduction) return `https://${vercelProduction.replace(/\/$/, "")}`

  return LOCAL_SITE_URL
}

/**
 * En producción el origen debe ser https y público. Devuelve el motivo del
 * rechazo o null. Fuera de producción no aplica.
 */
export function productionSiteUrlError(
  url: string,
  vercelEnv: string | undefined,
): string | null {
  if (vercelEnv !== "production") return null
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return `PUBLIC_SITE_URL no es una URL válida: "${url}"`
  }
  if (/^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(parsed.hostname)) {
    return `el sitio de producción no puede usar ${parsed.hostname}`
  }
  if (parsed.protocol !== "https:") {
    return `el sitio de producción debe usar https (recibido ${parsed.protocol})`
  }
  if (parsed.hostname.endsWith(".invalid")) {
    return "el sitio de producción no puede usar el dominio de prueba .invalid"
  }
  if (parsed.pathname !== "/" || parsed.search || parsed.hash) {
    return "PUBLIC_SITE_URL debe ser solo el origen, sin ruta ni parámetros"
  }
  return null
}

/**
 * Los previews de Vercel y los builds con `NOINDEX=true` nunca se indexan.
 * Un build local sin VERCEL_ENV cuenta como producción para que los checks
 * revisen la salida real.
 */
export function isIndexableBuild(env: EnvLike): boolean {
  if (env["NOINDEX"] === "true") return false
  const vercelEnv = env["VERCEL_ENV"]
  if (vercelEnv === undefined || vercelEnv === "") return true
  return vercelEnv === "production"
}
