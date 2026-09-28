#!/usr/bin/env node
/**
 * Genera los assets de marca a partir de public/favicon.svg y src/config/site.ts:
 *   public/favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png
 *   src/assets/brand/og-default.jpg (imagen para redes sociales 1200x630)
 *
 * Uso: pnpm brand:assets   (vuelve a correrlo al cambiar logo, nombre o color)
 */
import fs from "node:fs"
import path from "node:path"
import sharp from "sharp"

import { site } from "../src/config/site.ts"

const FAVICON = "public/favicon.svg"
const svg = fs.readFileSync(FAVICON)

async function png(size, file) {
  await sharp(svg, { density: 384 }).resize(size, size).png().toFile(file)
  console.log(`ok    ${file}`)
}

/** ICO con un PNG embebido (formato válido desde Windows Vista). */
async function ico(file) {
  const data = await sharp(svg, { density: 384 })
    .resize(32, 32)
    .png()
    .toBuffer()
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(1, 4)
  const entry = Buffer.alloc(16)
  entry.writeUInt8(32, 0)
  entry.writeUInt8(32, 1)
  entry.writeUInt8(0, 2)
  entry.writeUInt8(0, 3)
  entry.writeUInt16LE(1, 4)
  entry.writeUInt16LE(32, 6)
  entry.writeUInt32LE(data.length, 8)
  entry.writeUInt32LE(22, 12)
  fs.writeFileSync(file, Buffer.concat([header, entry, data]))
  console.log(`ok    ${file}`)
}

function escape(value) {
  return value.replace(/[<>&"']/g, (c) => `&#${c.charCodeAt(0)};`)
}

async function ogDefault(file) {
  const logo = svg.toString("base64")
  const og = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${site.themeColor}"/>
      <stop offset="1" stop-color="#312e81"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <circle cx="1040" cy="120" r="260" fill="#ffffff" opacity="0.05"/>
  <circle cx="1120" cy="560" r="180" fill="#ffffff" opacity="0.04"/>
  <image href="data:image/svg+xml;base64,${logo}" x="96" y="96" width="112" height="112"/>
  <text x="96" y="400" font-family="Inter, Helvetica, Arial, sans-serif" font-size="76" font-weight="700" fill="#ffffff">${escape(site.name)}</text>
</svg>`
  fs.mkdirSync(path.dirname(file), { recursive: true })
  await sharp(Buffer.from(og)).jpeg({ quality: 82, mozjpeg: true }).toFile(file)
  console.log(`ok    ${file}`)
}

await png(180, "public/apple-touch-icon.png")
await png(192, "public/icon-192.png")
await png(512, "public/icon-512.png")
await ico("public/favicon.ico")
await ogDefault("src/assets/brand/og-default.jpg")
