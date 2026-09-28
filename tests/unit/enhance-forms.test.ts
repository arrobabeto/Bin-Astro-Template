// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest"

import { enhanceForm, submitForm } from "~/scripts/enhance-forms"

function renderForm(): HTMLFormElement {
  document.body.innerHTML = `
    <form action="/api/forms/contact" method="post" data-enhanced-form
      data-msg-submitting="Enviando…" data-msg-success="¡Gracias!" data-msg-error="Falló">
      <input name="email" value="ana@ejemplo.mx" />
      <button type="submit">Enviar</button>
      <p data-form-status></p>
    </form>`
  return document.querySelector("form")!
}

const json = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status }))

describe("submitForm", () => {
  beforeEach(() => {
    document.body.innerHTML = ""
  })

  it("true solo si la respuesta trae success: true", async () => {
    const form = renderForm()
    expect(await submitForm(form, () => json({ success: true }))).toBe(true)
    expect(await submitForm(form, () => json({ success: false }))).toBe(false)
    expect(await submitForm(form, () => json({ success: true }, 500))).toBe(
      false,
    )
  })

  it("un error de red cuenta como fallo", async () => {
    const form = renderForm()
    expect(
      await submitForm(form, () => Promise.reject(new Error("offline"))),
    ).toBe(false)
  })

  it("pide JSON al servidor", async () => {
    const form = renderForm()
    const fetchMock = vi.fn(() => json({ success: true }))
    await submitForm(form, fetchMock)
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(new Headers(init.headers).get("Accept")).toBe("application/json")
  })
})

describe("enhanceForm", () => {
  it("muestra el mensaje de éxito y limpia el formulario", async () => {
    const form = renderForm()
    enhanceForm(form, () => json({ success: true }))
    form.dispatchEvent(new Event("submit", { cancelable: true }))
    await vi.waitFor(() => expect(form.dataset.state).toBe("success"))
    expect(form.querySelector("[data-form-status]")?.textContent).toBe(
      "¡Gracias!",
    )
    expect(form.querySelector("button")?.textContent).toBe("Enviar")
  })

  it("muestra el mensaje de error", async () => {
    const form = renderForm()
    enhanceForm(form, () => json({ success: false }))
    form.dispatchEvent(new Event("submit", { cancelable: true }))
    await vi.waitFor(() => expect(form.dataset.state).toBe("error"))
    expect(form.querySelector("[data-form-status]")?.textContent).toBe("Falló")
  })
})
