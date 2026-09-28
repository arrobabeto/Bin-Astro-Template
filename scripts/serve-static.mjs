#!/usr/bin/env node
/**
 * Servidor local de la salida estática (.vercel/output/static), porque
 * `astro preview` no funciona con el adaptador de Vercel. Imita a Vercel:
 * URLs limpias, redirecciones 301 de config.json, 404.html y headers de
 * vercel.json. Los endpoints /api/* no corren aquí (responden 501).
 *
 * Uso: pnpm preview [--port 4173]
 */
import fs from "node:fs"
import http from "node:http"
import path from "node:path"

import { OUT_DIR, VERCEL_CONFIG } from "./lib/output.mjs"

const portFlag = process.argv.indexOf("--port")
const port = Number(portFlag > -1 ? process.argv[portFlag + 1] : 4173)
const host = process.env["HOST"] ?? "127.0.0.1"

if (!fs.existsSync(OUT_DIR)) {
  console.error(`No existe ${OUT_DIR}. Corre \`pnpm build\` primero.`)
  process.exit(1)
}

const config = fs.existsSync(VERCEL_CONFIG)
  ? JSON.parse(fs.readFileSync(VERCEL_CONFIG, "utf8"))
  : { routes: [] }
const redirectRoutes = config.routes.filter(
  (route) =>
    route.status >= 300 && route.status < 400 && route.headers?.Location,
)

const vercelJson = fs.existsSync("vercel.json")
  ? JSON.parse(fs.readFileSync("vercel.json", "utf8"))
  : { headers: [] }
const globalHeaders = (vercelJson.headers ?? [])
  .filter((rule) => rule.source === "/(.*)")
  .flatMap((rule) => rule.headers)

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".xsl": "text/xsl; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
}

function resolveFile(pathname) {
  const clean = decodeURIComponent(pathname).replace(/\/+$/, "") || "/"
  const candidates =
    clean === "/"
      ? ["index.html"]
      : [
          clean.slice(1),
          `${clean.slice(1)}.html`,
          `${clean.slice(1)}/index.html`,
        ]
  const root = path.resolve(OUT_DIR)
  for (const candidate of candidates) {
    const full = path.resolve(root, candidate)
    if (!full.startsWith(root + path.sep)) continue
    if (fs.existsSync(full) && fs.statSync(full).isFile()) return full
  }
  return null
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://${host}:${port}`)
  for (const header of globalHeaders) {
    if (header.key !== "Strict-Transport-Security") {
      res.setHeader(header.key, header.value)
    }
  }

  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    res.writeHead(308, {
      Location: url.pathname.replace(/\/+$/, "") + url.search,
    })
    return res.end()
  }

  for (const route of redirectRoutes) {
    if (new RegExp(route.src).test(url.pathname)) {
      res.writeHead(route.status, { Location: route.headers.Location })
      return res.end()
    }
  }

  if (url.pathname.startsWith("/api/")) {
    res.writeHead(501, { "Content-Type": "application/json; charset=utf-8" })
    return res.end(
      JSON.stringify({ success: false, message: "api-not-available-locally" }),
    )
  }

  const file = resolveFile(url.pathname)
  const target = file ?? path.join(OUT_DIR, "404.html")
  const type = TYPES[path.extname(target)] ?? "application/octet-stream"
  res.writeHead(file ? 200 : 404, { "Content-Type": type })
  fs.createReadStream(target).pipe(res)
})

server.listen(port, host, () => {
  console.log(`Sitio estático en http://${host}:${port}`)
})
