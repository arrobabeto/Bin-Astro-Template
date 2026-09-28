import { LOCALE_META, type Locale } from "~/config/locales"
import { site } from "~/config/site"

import type { SiteChrome } from "./routes"

/**
 * Datos estructurados schema.org. Se enlazan por @id para formar un solo
 * grafo por página (Organization ← WebSite ← WebPage).
 */

type JsonLd = Record<string, unknown>

export function organizationJsonLd(origin: string, chrome: SiteChrome): JsonLd {
  const sameAs = chrome.social.map((item) => item.href)
  return {
    "@type": site.organizationType,
    "@id": `${origin}/#organization`,
    name: site.name,
    url: `${origin}/`,
    logo: new URL(site.logoPath, origin).toString(),
    email: chrome.contact.email,
    ...(chrome.contact.phone ? { telephone: chrome.contact.phone } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  }
}

export function websiteJsonLd(
  origin: string,
  chrome: SiteChrome,
  locale: Locale,
): JsonLd {
  return {
    "@type": "WebSite",
    "@id": `${origin}/#website`,
    url: `${origin}/`,
    name: site.name,
    description: chrome.description,
    inLanguage: LOCALE_META[locale].htmlLang,
    publisher: { "@id": `${origin}/#organization` },
  }
}

export function webPageJsonLd(args: {
  origin: string
  url: string
  title: string
  description: string
  locale: Locale
  updatedAt?: Date
}): JsonLd {
  return {
    "@type": "WebPage",
    "@id": `${args.url}#webpage`,
    url: args.url,
    name: args.title,
    description: args.description,
    inLanguage: LOCALE_META[args.locale].htmlLang,
    isPartOf: { "@id": `${args.origin}/#website` },
    ...(args.updatedAt ? { dateModified: args.updatedAt.toISOString() } : {}),
  }
}

export type Crumb = { name: string; url: string }

export function breadcrumbJsonLd(crumbs: Crumb[]): JsonLd {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  }
}

export function faqJsonLd(
  items: { question: string; answer: string }[],
): JsonLd {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  }
}

export function graph(nodes: JsonLd[]): JsonLd {
  return { "@context": "https://schema.org", "@graph": nodes }
}
