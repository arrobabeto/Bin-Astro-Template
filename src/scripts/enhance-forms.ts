/**
 * Mejora progresiva de formularios: sin JavaScript el formulario funciona con
 * un POST normal; con JavaScript se envía con fetch y muestra el resultado sin
 * recargar. Sirve para Web3Forms, /api/forms/contact y /api/newsletter
 * (todos responden JSON con `success`).
 */
const TIMEOUT_MS = 10_000

type Messages = { submitting: string; success: string; error: string }

function messagesFrom(form: HTMLFormElement): Messages {
  return {
    submitting: form.dataset.msgSubmitting ?? "…",
    success: form.dataset.msgSuccess ?? "OK",
    error: form.dataset.msgError ?? "Error",
  }
}

export async function submitForm(
  form: HTMLFormElement,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetchImpl(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
      signal: controller.signal,
    })
    if (!response.ok) return false
    const payload: unknown = await response.json().catch(() => null)
    return (
      typeof payload === "object" &&
      payload !== null &&
      "success" in payload &&
      payload.success === true
    )
  } catch {
    return false
  } finally {
    window.clearTimeout(timeout)
  }
}

export function enhanceForm(
  form: HTMLFormElement,
  fetchImpl: typeof fetch = fetch,
): void {
  const status = form.querySelector<HTMLElement>("[data-form-status]")
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')
  if (!status || !button) return

  const messages = messagesFrom(form)
  const idleLabel = button.textContent?.trim() ?? ""

  form.addEventListener("submit", async (event) => {
    event.preventDefault()
    if (form.dataset.state === "submitting") return

    form.dataset.state = "submitting"
    form.setAttribute("aria-busy", "true")
    button.disabled = true
    button.textContent = messages.submitting
    status.textContent = ""

    const ok = await submitForm(form, fetchImpl)

    form.dataset.state = ok ? "success" : "error"
    form.removeAttribute("aria-busy")
    button.disabled = false
    button.textContent = idleLabel
    status.dataset.state = ok ? "success" : "error"
    status.textContent = ok ? messages.success : messages.error
    if (ok) form.reset()
  })
}

export function enhanceAllForms(root: ParentNode = document): void {
  root
    .querySelectorAll<HTMLFormElement>("form[data-enhanced-form]")
    .forEach((form) => enhanceForm(form))
}
