import { defineConfig, devices } from "@playwright/test"

/**
 * Las pruebas e2e corren contra el build real (.vercel/output/static) servido
 * por scripts/serve-static.mjs, que imita a Vercel: URLs limpias, 308 de barra
 * final, redirecciones 301 y cabeceras de vercel.json. `astro preview` no
 * funciona con @astrojs/vercel.
 *
 * Requiere un build previo: `pnpm build:ci && pnpm test:e2e`.
 */
const PORT = 4173

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env["CI"]),
  retries: process.env["CI"] ? 1 : 0,
  reporter: process.env["CI"]
    ? [["list"], ["html", { open: "never" }]]
    : "list",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "on-first-retry",
  },
  webServer: {
    command: `node scripts/serve-static.mjs --port ${PORT}`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env["CI"],
    timeout: 30_000,
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"] },
      grepInvert: /@mobile/,
    },
    { name: "mobile", use: { ...devices["Pixel 7"] }, grep: /@mobile/ },
  ],
})
