import { defineMiddleware } from "astro:middleware"

/**
 * Solo actúa en rutas bajo demanda (src/pages/api/**): las respuestas de API
 * no se cachean ni se indexan. Los headers de seguridad de las páginas
 * estáticas están en vercel.json (en modo estático el middleware no corre
 * en cada visita).
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next()
  if (context.url.pathname.startsWith("/api/")) {
    response.headers.set("Cache-Control", "no-store")
    response.headers.set("X-Robots-Tag", "noindex, nofollow")
  }
  return response
})
