import vercel from "@astrojs/vercel"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, envField } from "astro/config"
import { existsSync, readFileSync } from "node:fs"
import { parseEnv } from "node:util"

import { redirects } from "./src/config/redirects"
import { productionSiteUrlError, resolveSiteUrl } from "./src/config/site-url"
import { diagnoseFormsEnv } from "./src/lib/forms-config"

// `astro:env` no existe en este archivo; el .env se carga a mano.
const env: Record<string, string | undefined> = {
  ...(existsSync(".env") ? parseEnv(readFileSync(".env", "utf8")) : {}),
  ...process.env,
}
// src/lib/seo.ts lee NOINDEX desde process.env durante el build.
if (env["NOINDEX"] && !process.env["NOINDEX"]) {
  process.env["NOINDEX"] = env["NOINDEX"]
}

const site = resolveSiteUrl(env)
const siteError = productionSiteUrlError(site, env["VERCEL_ENV"])
if (siteError) {
  throw new Error(`${siteError}. Ver docs/guias/variables-de-entorno.md`)
}

const optionalPublic = { context: "client", access: "public" } as const
const optionalSecret = {
  context: "server",
  access: "secret",
  optional: true,
} as const

export default defineConfig({
  site,
  // Estático por defecto. Solo las rutas con `export const prerender = false`
  // (src/pages/api/**) se vuelven Vercel Functions.
  // Ver docs/adr/0004-estatico-con-endpoints.md
  output: "static",
  adapter: vercel(),
  trailingSlash: "never",
  redirects,

  // Avisa en `astro dev` y en el log de build (también en Vercel) si las
  // variables de formularios tienen otro nombre o están incompletas. No
  // detiene el build: ninguna variable es obligatoria.
  integrations: [
    {
      name: "diagnostico-variables",
      hooks: {
        "astro:config:done": ({ logger }) => {
          const { errors, warnings } = diagnoseFormsEnv(env)
          for (const message of [...errors, ...warnings]) logger.warn(message)
        },
      },
    },
  ],

  vite: { plugins: [tailwindcss()] },

  image: {
    layout: "constrained",
    responsiveStyles: true,
  },

  // Todas las variables son opcionales: el build nunca falla por falta de keys.
  // Ver .env.example y docs/guias/variables-de-entorno.md
  env: {
    schema: {
      PUBLIC_SITE_URL: envField.string({ ...optionalPublic, optional: true }),
      PUBLIC_GTM_ID: envField.string({ ...optionalPublic, default: "" }),
      PUBLIC_GA4_ID: envField.string({ ...optionalPublic, default: "" }),
      PUBLIC_GOOGLE_ADS_ID: envField.string({ ...optionalPublic, default: "" }),
      PUBLIC_META_PIXEL_ID: envField.string({ ...optionalPublic, default: "" }),
      PUBLIC_TIKTOK_PIXEL_ID: envField.string({
        ...optionalPublic,
        default: "",
      }),
      PUBLIC_GSC_VERIFICATION: envField.string({
        ...optionalPublic,
        default: "",
      }),
      PUBLIC_FORMS_PROVIDER: envField.enum({
        ...optionalPublic,
        values: ["none", "web3forms", "sendgrid"],
        default: "none",
      }),
      PUBLIC_WEB3FORMS_ACCESS_KEY: envField.string({
        ...optionalPublic,
        default: "",
      }),
      PUBLIC_NEWSLETTER_ENABLED: envField.boolean({
        ...optionalPublic,
        default: false,
      }),
      SENDGRID_API_KEY: envField.string(optionalSecret),
      MAIL_FROM_EMAIL: envField.string(optionalSecret),
      MAIL_FROM_NAME: envField.string(optionalSecret),
      MAIL_TO_EMAIL: envField.string(optionalSecret),
      MAILERLITE_API_KEY: envField.string(optionalSecret),
      MAILERLITE_GROUP_ID: envField.string(optionalSecret),
    },
  },
})
