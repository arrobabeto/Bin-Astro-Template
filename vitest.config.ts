import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

const path = (relative: string) =>
  fileURLToPath(new URL(relative, import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      "~": path("./src"),
      // Los módulos virtuales de Astro no existen fuera de Vite+Astro; las
      // pruebas los reemplazan con vi.mock sobre estos stubs.
      "astro:env/server": path("./tests/stubs/astro-env-server.ts"),
      "astro:env/client": path("./tests/stubs/astro-env-client.ts"),
    },
  },
  test: {
    environment: "node",
    projects: [
      {
        extends: true,
        test: { name: "unit", include: ["tests/unit/**/*.test.ts"] },
      },
      {
        extends: true,
        test: {
          name: "integracion",
          include: ["tests/integration/**/*.test.ts"],
          testTimeout: 120_000,
          hookTimeout: 120_000,
        },
      },
    ],
  },
})
