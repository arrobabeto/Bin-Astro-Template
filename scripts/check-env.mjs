#!/usr/bin/env node
/**
 * Variables de formularios y correo (.env y entorno), sin mostrar valores:
 *  - falla si una variable tiene un nombre que el sitio no lee
 *    (SENDGRID_FROM_EMAIL en lugar de MAIL_FROM_EMAIL) o si un proveedor está
 *    activado sin sus variables obligatorias;
 *  - advierte de variables que no se usan.
 * Sin variables pasa: ninguna es obligatoria.
 *
 * Uso: pnpm check:env
 */
import { diagnoseFormsEnv } from "../src/lib/forms-config.ts"
import { readEnv } from "./lib/env.mjs"
import { reporter } from "./lib/output.mjs"

const r = reporter()
const { errors, warnings } = diagnoseFormsEnv(readEnv())

for (const message of errors) r.fail(message)
for (const message of warnings) r.warn(message)
if (errors.length === 0) r.ok("variables de formularios y correo coherentes")

r.done("variables de entorno")
