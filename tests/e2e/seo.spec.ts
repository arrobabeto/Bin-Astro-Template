import { expect, test } from "@playwright/test"

import { checkSiteUrl } from "../../scripts/lib/env.mjs"

const SITE = checkSiteUrl()

test.describe("head SEO", () => {
  test("la home tiene metadatos completos", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveTitle(/.{10,}/)
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /.{50,}/,
    )
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `${SITE}/`,
    )
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /^index/,
    )
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      new RegExp(`^${SITE.replace(/[.]/g, "\\.")}/_astro/.+\\.jpg$`),
    )
    await expect(
      page.locator('meta[property="og:image:width"]'),
    ).toHaveAttribute("content", "1200")
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    )
  })

  test("la imagen OG existe y mide 1200x630", async ({ page, request }) => {
    await page.goto("/")
    const url = await page
      .locator('meta[property="og:image"]')
      .getAttribute("content")
    const response = await request.get(new URL(url!).pathname)
    expect(response.status()).toBe(200)
    expect(response.headers()["content-type"]).toContain("image/jpeg")
  })

  test("el JSON-LD es válido e incluye la organización", async ({ page }) => {
    await page.goto("/")
    const raw = await page
      .locator('script[type="application/ld+json"]')
      .textContent()
    const data = JSON.parse(raw ?? "")
    const types = data["@graph"].map(
      (node: { "@type": string }) => node["@type"],
    )
    expect(types).toEqual(
      expect.arrayContaining(["Organization", "WebSite", "WebPage"]),
    )
  })

  test("las páginas legales tienen breadcrumbs", async ({ page }) => {
    await page.goto("/privacidad")
    const raw = await page
      .locator('script[type="application/ld+json"]')
      .textContent()
    expect(raw).toContain("BreadcrumbList")
  })

  test("/gracias es noindex", async ({ page }) => {
    await page.goto("/gracias")
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    )
  })
})

test.describe("archivos para buscadores e IA", () => {
  test("robots.txt permite rastrear y declara el sitemap", async ({
    request,
  }) => {
    const body = await (await request.get("/robots.txt")).text()
    expect(body).toContain("User-agent: *")
    expect(body).toContain(`Sitemap: ${SITE}/sitemap.xml`)
    expect(body).not.toMatch(/^Disallow: \/$/m)
  })

  test("sitemap.xml lista solo páginas indexables", async ({ request }) => {
    const response = await request.get("/sitemap.xml")
    expect(response.headers()["content-type"]).toContain("xml")
    const body = await response.text()
    expect(body).toContain(`<loc>${SITE}/</loc>`)
    expect(body).toContain(`<loc>${SITE}/privacidad</loc>`)
    expect(body).not.toContain("/gracias")
    expect(body).toContain(
      '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>',
    )
  })

  test("llms.txt y llms-full.txt describen el sitio", async ({ request }) => {
    const llms = await (await request.get("/llms.txt")).text()
    expect(llms).toMatch(/^# /)
    expect(llms).toContain(`${SITE}/privacidad`)
    const full = await request.get("/llms-full.txt")
    expect(full.status()).toBe(200)
  })

  test("security.txt y webmanifest existen", async ({ request }) => {
    const security = await (
      await request.get("/.well-known/security.txt")
    ).text()
    expect(security).toMatch(/^Contact: /m)
    expect(security).toMatch(/^Expires: /m)
    const manifest = await (await request.get("/site.webmanifest")).json()
    expect(manifest.icons.length).toBeGreaterThan(0)
  })
})
