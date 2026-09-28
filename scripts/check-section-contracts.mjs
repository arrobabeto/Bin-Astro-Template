#!/usr/bin/env node
/**
 * Cada tipo de sección debe estar completo y sincronizado:
 *   src/lib/bsi-fields.ts          campos BSI del tipo
 *   Section<Nombre>.schema.ts      schema con type: z.literal("<tipo>")
 *   Section<Nombre>.astro          componente que marca cada campo con bf()
 *   registry.ts                    schema en la unión discriminada
 *   AnySection.astro               componente en el mapa type → componente
 */
import fs from "node:fs"

import { SECTION_BSI_FIELDS } from "../src/lib/bsi-fields.ts"
import { reporter } from "./lib/output.mjs"

const DIR = "src/components/sections"
const r = reporter()
const registry = fs.readFileSync(`${DIR}/registry.ts`, "utf8")
const anySection = fs.readFileSync(`${DIR}/AnySection.astro`, "utf8")

const pascal = (type) => type.charAt(0).toUpperCase() + type.slice(1)

for (const [type, fields] of Object.entries(SECTION_BSI_FIELDS)) {
  const name = `Section${pascal(type)}`
  const schemaFile = `${DIR}/${name}.schema.ts`
  const componentFile = `${DIR}/${name}.astro`
  let problems = 0
  const fail = (message) => {
    r.fail(`${type}: ${message}`)
    problems++
  }

  if (!fs.existsSync(schemaFile)) fail(`falta ${schemaFile}`)
  else {
    const schema = fs.readFileSync(schemaFile, "utf8")
    if (!schema.includes(`z.literal("${type}")`)) {
      fail(`${schemaFile} debe declarar type: z.literal("${type}")`)
    }
    if (!/\bid:\s*sectionId\b/.test(schema))
      fail(`${schemaFile} debe usar id: sectionId`)
    const schemaFn = `section${pascal(type)}Schema`
    if (!registry.includes(`${schemaFn}(`))
      fail(`registry.ts no usa ${schemaFn}`)
  }

  if (!fs.existsSync(componentFile)) fail(`falta ${componentFile}`)
  else {
    const component = fs.readFileSync(componentFile, "utf8")
    if (!component.includes(`SectionProps<"${type}">`)) {
      fail(`${componentFile} debe tipar sus props con SectionProps<"${type}">`)
    }
    for (const [field, kind] of Object.entries(fields)) {
      const call = new RegExp(
        `bf\\(\\s*area,\\s*id,\\s*"${field}",\\s*"${kind}"`,
      )
      if (!call.test(component)) {
        fail(`${componentFile} no marca bf(area, id, "${field}", "${kind}")`)
      }
    }
    const extra = [...component.matchAll(/bf\(\s*area,\s*id,\s*"([^"]+)"/g)]
      .map((match) => match[1])
      .filter((field) => !(field in fields))
    for (const field of extra) {
      fail(`${componentFile} marca "${field}", que no está en bsi-fields.ts`)
    }
  }

  if (!new RegExp(`\\b${type}:\\s*${name}\\b`).test(anySection)) {
    fail(`AnySection.astro no mapea ${type}: ${name}`)
  }

  if (problems === 0) r.ok(`${type} (${Object.keys(fields).length} campos BSI)`)
}

for (const file of fs.readdirSync(DIR)) {
  const match = file.match(/^Section([A-Z]\w*)\.astro$/)
  if (!match) continue
  const type = match[1].charAt(0).toLowerCase() + match[1].slice(1)
  if (!(type in SECTION_BSI_FIELDS)) {
    r.fail(`${file} existe pero "${type}" no está en src/lib/bsi-fields.ts`)
  }
}

r.done("contratos de secciones sincronizados")
