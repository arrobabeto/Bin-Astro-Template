import { safeRedirectPath } from "./forms-config"

/**
 * Respuesta común de los endpoints de formularios: JSON si el cliente lo
 * pide (fetch con mejora progresiva) o redirección 303 si es un POST normal.
 */
export function formResponse(
  request: Request,
  form: FormData,
  result: { success: boolean; status?: number; message?: string },
): Response {
  const wantsJson = request.headers.get("accept")?.includes("application/json")
  const status = result.status ?? (result.success ? 200 : 400)

  if (wantsJson || !result.success) {
    return new Response(
      JSON.stringify({ success: result.success, message: result.message }),
      {
        status,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
        },
      },
    )
  }

  return new Response(null, {
    status: 303,
    headers: {
      Location: safeRedirectPath(form.get("redirect")),
      "Cache-Control": "no-store",
    },
  })
}
