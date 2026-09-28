import type { SectionData } from "~/components/sections/registry"

/**
 * Texto plano de una sección para llms-full.txt (respuestas de IA / GEO).
 * Si agregas un tipo de sección con texto, inclúyelo aquí.
 */
export function sectionToText(section: SectionData): string {
  switch (section.type) {
    case "hero":
    case "split":
      return [section.heading, section.body].filter(Boolean).join("\n\n")
    case "features":
      return [
        section.heading,
        section.body,
        ...section.items.map((item) => `- ${item.title}: ${item.body}`),
      ]
        .filter(Boolean)
        .join("\n")
    case "faq":
      return [
        section.heading,
        ...section.items.map(
          (item) => `P: ${item.question}\nR: ${item.answer}`,
        ),
      ].join("\n\n")
    case "cta":
    case "contact":
    case "newsletter":
      return [section.heading, section.body].filter(Boolean).join("\n\n")
    case "prose":
      return [section.heading, section.body].filter(Boolean).join("\n\n")
  }
}
