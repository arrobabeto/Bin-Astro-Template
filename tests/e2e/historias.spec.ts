import { expect, test } from "@playwright/test"

import { checkSiteUrl } from "../../scripts/lib/env.mjs"

const SITE = checkSiteUrl()

/** Convierte una URL absoluta del sitio en una ruta del servidor local. */
const localPath = (url: string) => new URL(url).pathname

test.describe("historias de visitante", () => {
  test("quiero contactar: el botón principal me lleva al formulario de contacto", async ({
    page,
  }) => {
    await page.goto("/")
    await page.locator("#hero").getByRole("link").first().click()
    await expect(page).toHaveURL(/#contacto$/)
    await expect(page.locator("#contacto")).toBeInViewport()
  })

  test("quiero leer el aviso de privacidad desde cualquier página", async ({
    page,
  }) => {
    await page.goto("/terminos")
    await page
      .getByRole("contentinfo")
      .getByRole("link", { name: /privacidad/i })
      .click()
    await expect(page).toHaveURL(/\/privacidad$/)
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  })

  test("quiero resolver una duda: las preguntas se abren con el teclado", async ({
    page,
  }) => {
    await page.goto("/")
    const question = page.locator("#preguntas details").first()
    await expect(question).not.toHaveAttribute("open")
    await question.locator("summary").focus()
    await page.keyboard.press("Enter")
    await expect(question).toHaveAttribute("open")
  })

  test("navego el sitio sin errores en la consola", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text())
    })
    page.on("pageerror", (error) => errors.push(error.message))
    for (const path of ["/", "/privacidad", "/terminos", "/gracias"]) {
      await page.goto(path)
    }
    expect(errors).toEqual([])
  })
})

test.describe("historias de buscadores y asistentes de IA", () => {
  test("cada URL del sitemap responde 200 y es su propia canónica", async ({
    page,
    request,
  }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text()
    const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      ([, url]) => url!,
    )
    expect(urls.length).toBeGreaterThan(0)
    for (const url of urls) {
      expect(url.startsWith(SITE)).toBe(true)
      const response = await page.goto(localPath(url))
      expect(response?.status(), url).toBe(200)
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        url,
      )
    }
  })

  test("cada enlace de llms.txt responde 200", async ({ request }) => {
    const llms = await (await request.get("/llms.txt")).text()
    const links = [...llms.matchAll(/\]\((https?:\/\/[^)]+)\)/g)]
      .map(([, url]) => url!)
      .filter((url) => url.startsWith(SITE))
    expect(links.length).toBeGreaterThan(0)
    for (const url of links) {
      const response = await request.get(localPath(url))
      expect(response.status(), url).toBe(200)
    }
  })
})
