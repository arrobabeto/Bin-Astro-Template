import { readFileSync } from "node:fs"

import { expect, test } from "@playwright/test"

const PAGES = ["/", "/gracias", "/privacidad", "/terminos"]

test.describe("páginas", () => {
  for (const path of PAGES) {
    test(`${path} responde 200 con un solo h1`, async ({ page }) => {
      const response = await page.goto(path)
      expect(response?.status()).toBe(200)
      await expect(page.locator("h1")).toHaveCount(1)
      await expect(page.locator("html")).toHaveAttribute("lang", /^es/)
    })
  }

  test("una URL inexistente responde 404 con la página de error", async ({
    page,
  }) => {
    const response = await page.goto("/esta-pagina-no-existe")
    expect(response?.status()).toBe(404)
    await expect(page.locator("h1")).toBeVisible()
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    )
  })

  test("la fecha de actualización coincide con el contenido", async ({
    page,
  }) => {
    const source = readFileSync("src/content/legal/es/privacidad.md", "utf8")
    const date = /^updatedAt:\s*(\S+)/m.exec(source)?.[1]
    expect(date).toBeDefined()
    await page.goto("/privacidad")
    await expect(page.locator(`time[datetime^="${date}"]`)).toHaveCount(1)
    const day = String(Number(date!.slice(8, 10)))
    await expect(page.locator("time")).toContainText(day)
  })

  test("el enlace para saltar al contenido lleva a <main>", async ({
    page,
  }) => {
    await page.goto("/")
    await page.keyboard.press("Tab")
    const skip = page.getByRole("link", { name: "Saltar al contenido" })
    await expect(skip).toBeFocused()
    await skip.press("Enter")
    await expect(page).toHaveURL(/#contenido$/)
  })

  test("las anclas de la navegación existen", async ({ page }) => {
    await page.goto("/")
    const hrefs = await page
      .locator('header nav a[href^="/#"]')
      .evaluateAll((links) => links.map((a) => a.getAttribute("href") ?? ""))
    for (const href of new Set(hrefs)) {
      await expect(page.locator(href.slice(1))).toHaveCount(1)
    }
  })

  test("todas las imágenes tienen alt y dimensiones", async ({ page }) => {
    for (const path of PAGES) {
      await page.goto(path)
      for (const img of await page.locator("img").all()) {
        await expect(img).toHaveAttribute("alt", /.*/)
        await expect(img).toHaveAttribute("width", /\d+/)
        await expect(img).toHaveAttribute("height", /\d+/)
      }
    }
  })

  test("sin proveedor de formularios se muestra el correo de contacto", async ({
    page,
  }) => {
    await page.goto("/")
    const contact = page.locator('main section:has(a[href^="mailto:"])')
    test.skip(
      (await contact.count()) === 0,
      "la portada no tiene sección de contacto",
    )
    await expect(contact.locator('a[href^="mailto:"]').first()).toBeVisible()
    await expect(contact.locator("form")).toHaveCount(0)
  })
})

test.describe("móvil @mobile", () => {
  test("el menú se abre y navega @mobile", async ({ page }) => {
    await page.goto("/")
    const menu = page.locator("header summary")
    test.skip((await menu.count()) === 0, "el sitio no tiene menú")
    await menu.click()
    const link = page.locator("header details nav a").first()
    await expect(link).toBeVisible()
    await link.click()
    await expect(page).toHaveURL(/#/)
  })

  test("no hay scroll horizontal @mobile", async ({ page }) => {
    for (const path of PAGES) {
      await page.goto(path)
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      )
      expect(overflow, path).toBeLessThanOrEqual(0)
    }
  })
})
