#!/usr/bin/env node
/**
 * Presupuesto de peso de los archivos fuente. Las imágenes de src/assets las
 * optimiza Astro, pero un original enorme alarga el build y el repo.
 * Las de public/ se sirven tal cual: ahí el límite es más estricto.
 */
import fs from "node:fs"

import { reporter, walk } from "./lib/output.mjs"

const KB = 1024
const BUDGETS = [
  { dir: "public", warn: 150 * KB, fail: 400 * KB },
  { dir: "src/assets", warn: 800 * KB, fail: 2500 * KB },
]
const TOTAL_PUBLIC = 3 * 1024 * KB
const ALLOWED =
  /\.(avif|webp|jpe?g|png|svg|gif|ico|woff2|pdf|xsl|txt|json|webmanifest|mp4|webm)$/i

const r = reporter()
const kb = (bytes) => `${Math.round(bytes / KB)} KB`

for (const { dir, warn, fail } of BUDGETS) {
  let total = 0
  for (const file of walk(dir)) {
    if (file.endsWith(".DS_Store")) continue
    const { size } = fs.statSync(file)
    total += size
    if (!ALLOWED.test(file))
      r.warn(`${file}: tipo de archivo inusual para ${dir}/`)
    if (size > fail) r.fail(`${file}: ${kb(size)} (máximo ${kb(fail)})`)
    else if (size > warn)
      r.warn(`${file}: ${kb(size)} (recomendado < ${kb(warn)})`)
    if (/\.(woff|ttf|otf)$/i.test(file))
      r.fail(`${file}: usa .woff2 para fuentes`)
  }
  if (dir === "public" && total > TOTAL_PUBLIC) {
    r.fail(`public/ pesa ${kb(total)} (máximo ${kb(TOTAL_PUBLIC)})`)
  }
  r.ok(`${dir}/: ${kb(total)}`)
}

r.done("peso de assets dentro del presupuesto")
