import js from "@eslint/js"
import astro from "eslint-plugin-astro"
import globals from "globals"
import tseslint from "typescript-eslint"

export default [
  {
    ignores: [
      "dist/**",
      ".astro/**",
      ".vercel/**",
      ".seo/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
      "coverage/**",
      "skills/hallmark/**",
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs["flat/recommended"],
  ...astro.configs["flat/jsx-a11y-recommended"],

  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      eqeqeq: ["error", "always"],
    },
  },

  {
    // Los secretos (SendGrid, MailerLite) solo se leen en src/lib/ y en
    // src/pages/api/. Un componente nunca debe poder filtrarlos al cliente.
    files: ["src/components/**", "src/layouts/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "astro:env/server",
              message:
                "Los componentes no leen secretos. Usa src/lib/ o un endpoint en src/pages/api/.",
            },
          ],
        },
      ],
    },
  },

  {
    // Los colores viven como tokens en src/styles/global.css; un hex suelto
    // no se puede re-tematizar por sitio.
    files: ["src/components/**", "src/layouts/**", "src/pages/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/^#(?:[0-9a-fA-F]{3,4}){1,2}$/]",
          message:
            "Color escrito a mano. Usa un token de src/styles/global.css (docs/guias/diseno-y-marca.md).",
        },
      ],
    },
  },

  {
    files: [
      "scripts/**/*.mjs",
      "skills/*/scripts/**/*.mjs",
      "*.config.{js,mjs,ts}",
      "tests/**/*.ts",
    ],
    languageOptions: { globals: globals.node },
    rules: { "no-console": "off" },
  },
]
