import fs from "node:fs"
import { parseEnv } from "node:util"

/** Variables de .env (si existe) combinadas con process.env (gana process.env). */
export function readEnv() {
  const fromFile = fs.existsSync(".env")
    ? parseEnv(fs.readFileSync(".env", "utf8"))
    : {}
  return { ...fromFile, ...process.env }
}

/**
 * URL que usan `pnpm build:ci` y los checks cuando no hay PUBLIC_SITE_URL.
 * Es un dominio reservado (.invalid) para que nunca se confunda con uno real.
 */
export const CI_SITE_URL = "https://www.sitio-de-prueba.invalid"

export function checkSiteUrl() {
  const value = readEnv()["PUBLIC_SITE_URL"]?.trim()
  return (value || CI_SITE_URL).replace(/\/$/, "")
}
