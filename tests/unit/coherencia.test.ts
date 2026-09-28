/**
 * Coherencia entre documentación, configuración y código: si alguien agrega
 * un script, una variable, una sección o una skill, la documentación debe
 * reflejarlo (y al revés).
 */
import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { SECTION_BSI_FIELDS } from "~/lib/bsi-fields"

const read = (file: string) => fs.readFileSync(file, "utf8")
const pkg = JSON.parse(read("package.json")) as {
  scripts: Record<string, string>
}

function markdownFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return markdownFiles(full)
    return entry.name.endsWith(".md") ? [full] : []
  })
}

const DOCS = [
  "README.md",
  "AGENTS.md",
  ...markdownFiles("docs"),
  ...markdownFiles("skills").filter((file) => !file.includes("hallmark")),
]

/** Comandos propios de pnpm que no son scripts del proyecto. */
const PNPM_BUILTINS = new Set([
  "add",
  "audit",
  "dlx",
  "exec",
  "install",
  "outdated",
  "remove",
  "update",
])

describe("scripts de package.json", () => {
  it("todo `pnpm <script>` citado en la documentación existe", () => {
    const missing: string[] = []
    for (const file of DOCS) {
      for (const [, name] of read(file).matchAll(
        /(?:`|^\s*)pnpm (?:run )?([a-z][a-z0-9:-]*)/gm,
      )) {
        if (!PNPM_BUILTINS.has(name!) && !(name! in pkg.scripts)) {
          missing.push(`${file}: pnpm ${name}`)
        }
      }
    }
    expect(missing).toEqual([])
  })

  it("cada paso de verify tiene su script", () => {
    const steps = [...pkg.scripts["verify"]!.matchAll(/pnpm run ([\w:-]+)/g)]
    for (const [, step] of steps) expect(pkg.scripts).toHaveProperty(step!)
  })

  it("CI corre los mismos pasos que verify", () => {
    const ci = read(".github/workflows/ci.yml")
    for (const [, step] of pkg.scripts["verify"]!.matchAll(
      /pnpm run ([\w:-]+)/g,
    )) {
      expect(ci, `ci.yml no corre ${step}`).toContain(`pnpm run ${step}`)
    }
  })

  it("cada revisión de check:source y check:dist está documentada", () => {
    const guide = read("docs/guias/empieza-aqui.md")
    const checks = [
      ...pkg.scripts["check:source"]!.matchAll(/pnpm run ([\w:-]+)/g),
      ...pkg.scripts["check:dist"]!.matchAll(/pnpm run ([\w:-]+)/g),
    ].map(([, name]) => name!)
    for (const check of checks) {
      expect(guide, `falta ${check} en empieza-aqui.md`).toContain(
        `\`${check}\``,
      )
    }
  })
})

describe("variables de entorno", () => {
  const example = [...read(".env.example").matchAll(/^([A-Z0-9_]+)=/gm)].map(
    ([, name]) => name!,
  )
  const schema = [
    ...read("astro.config.ts").matchAll(/^\s+([A-Z0-9_]+): envField\./gm),
  ].map(([, name]) => name!)
  const documented = [
    ...read("docs/guias/variables-de-entorno.md").matchAll(
      /^\| `([A-Z0-9_]+)`/gm,
    ),
  ].map(([, name]) => name!)

  it(".env.example incluye todas las variables del schema de astro:env", () => {
    expect(example).toEqual(expect.arrayContaining(schema))
  })

  it("la guía documenta todas las variables de .env.example y ninguna más", () => {
    expect([...documented].sort()).toEqual([...example].sort())
  })

  it("los secretos solo son variables de servidor", () => {
    const config = read("astro.config.ts")
    for (const secret of ["SENDGRID_API_KEY", "MAILERLITE_API_KEY"]) {
      expect(config).toMatch(
        new RegExp(`${secret}: envField\\.string\\(optionalSecret\\)`),
      )
    }
  })
})

describe("secciones", () => {
  const types = Object.keys(SECTION_BSI_FIELDS)

  it("cada tipo está documentado en la guía de secciones", () => {
    const guide = read("docs/guias/secciones.md")
    const documented = [...guide.matchAll(/^### `([a-z-]+)`/gm)].map(
      ([, name]) => name!,
    )
    expect(documented.sort()).toEqual([...types].sort())
  })

  it("cada tipo tiene su componente, su schema y su caso en AnySection", () => {
    const anySection = read("src/components/sections/AnySection.astro")
    for (const type of types) {
      const name = type.charAt(0).toUpperCase() + type.slice(1)
      expect(
        fs.existsSync(`src/components/sections/Section${name}.astro`),
      ).toBe(true)
      expect(
        fs.existsSync(`src/components/sections/Section${name}.schema.ts`),
      ).toBe(true)
      expect(anySection).toContain(`Section${name}`)
    }
  })

  it("la guía de Binflow describe los mismos kinds que usa el template", () => {
    const guide = read("docs/guias/binflow.md")
    const kinds = new Set(
      Object.values(SECTION_BSI_FIELDS).flatMap((fields) =>
        Object.values(fields),
      ),
    )
    for (const kind of kinds) expect(guide).toContain(`\`${kind}\``)
  })
})

describe("skills", () => {
  const skills = fs
    .readdirSync("skills", { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_"))
    .map((entry) => entry.name)
    .sort()

  it("AGENTS.md lista todas las skills", () => {
    const agents = read("AGENTS.md")
    for (const skill of skills) expect(agents).toContain(`\`${skill}\``)
  })

  it("la guía de skills no cita skills inexistentes", () => {
    const guide = read("docs/guias/skills.md")
    for (const [, name] of guide.matchAll(/`\/([a-z-]+)`/g)) {
      expect(skills).toContain(name)
    }
  })
})

describe("documentación", () => {
  it("empieza-aqui enlaza todas las guías", () => {
    const index = read("docs/guias/empieza-aqui.md")
    const guides = fs
      .readdirSync("docs/guias")
      .filter((file) => file.endsWith(".md") && file !== "empieza-aqui.md")
    for (const guide of guides) {
      expect(index, `falta ${guide}`).toContain(`](${guide})`)
    }
  })

  it("el índice de ADR lista todas las ADR", () => {
    const index = read("docs/adr/README.md")
    const adrs = fs
      .readdirSync("docs/adr")
      .filter((file) => /^\d{4}-/.test(file))
    for (const adr of adrs) expect(index, `falta ${adr}`).toContain(`(${adr})`)
  })

  it("los enlaces de afiliado solo viven en servicios-recomendados.md", () => {
    const offenders = DOCS.filter(
      (file) =>
        !file.endsWith("servicios-recomendados.md") &&
        /afiliado/i.test(read(file)) &&
        /\]\(https?:\/\/[^)]*(sendgrid|mailerlite)[^)]*\)/i.test(read(file)),
    )
    expect(offenders).toEqual([])
  })

  it("la versión del CHANGELOG coincide con package.json", () => {
    const { version } = JSON.parse(read("package.json")) as { version: string }
    expect(read("CHANGELOG.md")).toContain(`## [${version}]`)
  })
})

describe("versiones fijadas", () => {
  it("Node 24 en .nvmrc, .node-version y engines", () => {
    const { engines } = JSON.parse(read("package.json")) as {
      engines: { node: string }
    }
    expect(read(".nvmrc").trim()).toBe("24")
    expect(read(".node-version").trim()).toMatch(/^24/)
    expect(engines.node).toBe("24.x")
  })

  it("el adaptador de Vercel tiene versión exacta", () => {
    const { dependencies } = JSON.parse(read("package.json")) as {
      dependencies: Record<string, string>
    }
    expect(dependencies["@astrojs/vercel"]).toMatch(/^\d+\.\d+\.\d+$/)
  })
})
