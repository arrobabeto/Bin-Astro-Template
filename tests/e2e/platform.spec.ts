import { expect, test } from "@playwright/test"

const PAGES = ["/", "/gracias", "/privacidad", "/terminos"]

test.describe("redirecciones", () => {
  for (const from of ["/home", "/inicio"]) {
    test(`${from} → / con 301`, async ({ request }) => {
      const response = await request.get(from, { maxRedirects: 0 })
      expect(response.status()).toBe(301)
      expect(response.headers()["location"]).toBe("/")
    })
  }

  test("la barra final redirige con 308", async ({ request }) => {
    const response = await request.get("/privacidad/", { maxRedirects: 0 })
    expect(response.status()).toBe(308)
    expect(response.headers()["location"]).toBe("/privacidad")
  })
})

test.describe("rendimiento", () => {
  test("sin formularios activos no se envía JavaScript", async ({ page }) => {
    const scripts: string[] = []
    page.on("request", (request) => {
      if (request.resourceType() === "script") scripts.push(request.url())
    })
    for (const path of PAGES) await page.goto(path)
    expect(scripts).toEqual([])
  })

  test("la imagen principal se carga con prioridad", async ({ page }) => {
    await page.goto("/")
    const hero = page.locator("main section").first().locator("img").first()
    test.skip((await hero.count()) === 0, "la primera sección no tiene imagen")
    await expect(hero).toHaveAttribute("fetchpriority", "high")
    await expect(hero).toHaveAttribute("loading", "eager")
  })

  test("las fuentes son locales", async ({ page }) => {
    const external: string[] = []
    page.on("request", (request) => {
      if (
        request.resourceType() === "font" &&
        !request.url().startsWith("http://127.0.0.1")
      ) {
        external.push(request.url())
      }
    })
    await page.goto("/")
    expect(external).toEqual([])
  })
})

test.describe("cabeceras de seguridad", () => {
  test("vercel.json se aplica a las páginas", async ({ request }) => {
    const headers = (await request.get("/")).headers()
    expect(headers["x-content-type-options"]).toBe("nosniff")
    expect(headers["x-frame-options"]).toBe("DENY")
    expect(headers["content-security-policy"]).toContain("default-src 'self'")
  })
})

test.describe("Binflow (BSI)", () => {
  test("las secciones llevan marcadores data-bf-*", async ({ page }) => {
    await page.goto("/")
    const first = page.locator("main section[id]").first()
    const id = (await first.getAttribute("id"))!
    await expect(first).toHaveAttribute("data-bf-id", `home.${id}.shell`)
    await expect(first).toHaveAttribute("data-bf-kind", "container")
    await expect(
      page.locator(`[data-bf-id="home.${id}.heading"]`),
    ).toHaveAttribute("data-bf-section", id)
    const image = page.locator('[data-bf-presentation="img"]').first()
    if ((await image.count()) > 0) {
      await expect(image).toHaveAttribute("data-bf-kind", "image")
    }
    await expect(
      page.locator('[data-bf-id="chrome.footer.tagline"]'),
    ).toHaveCount(1)
  })

  test("los bf_id no se repiten en una página", async ({ page }) => {
    for (const path of PAGES) {
      await page.goto(path)
      const ids = await page
        .locator("[data-bf-id]")
        .evaluateAll((els) => els.map((el) => el.getAttribute("data-bf-id")))
      expect(new Set(ids).size, path).toBe(ids.length)
    }
  })
})
