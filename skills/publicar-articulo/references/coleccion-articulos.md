# Crear la colección de artículos (una sola vez)

<!-- check:docs ejemplos: src/content/pages/es/articulos.yaml -->

El template no trae blog para no publicar páginas vacías. Estos pasos lo agregan siguiendo
la arquitectura del sitio: los artículos son Markdown en `src/content/articulos/<idioma>/`,
se publican en `/articulos/<slug>`, entran solos al sitemap y a `llms-full.txt`, y el listado
es una página YAML con una sección `articles`. En Binflow las entradas son `catalog_bound`:
`scripts/lib/bsi.mjs` ya genera las filas genéricas `catalog.article.title|body|cover` en
cuanto existe el primer artículo.

Adapta los fragmentos al código actual del repo: si algo cambió, el repo manda.

## 1. Colección — `src/content.config.ts`

```ts
const articulos = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/articulos",
    generateId: idFromPath,
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string().trim().min(1),
      description: z.string().trim().min(1),
      category: z.string().trim().min(1),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      readingTime: z.number().int().positive(),
      image: image(),
      imageAlt: z.string().trim().min(1),
      keywords: z.array(z.string()).default([]),
      author: z.string().optional(),
      faq: z
        .array(
          z.object({ question: z.string().min(1), answer: z.string().min(1) }),
        )
        .default([]),
      translationKey: z.string().optional(),
      seo: seoSchema,
    }),
})

export const collections = { pages, legal, site: siteChrome, articulos }
```

## 2. Rutas — `src/lib/routes.ts`

```ts
export type ArticleRoute = RouteBase & {
  kind: "article"
  entry: CollectionEntry<"articulos">
}
export type SiteRoute = PageRoute | LegalRoute | ArticleRoute

// En getRoutes(): agrega getCollection("articulos") al Promise.all y:
for (const entry of articles) {
  const { locale, slug } = parseEntryId(entry.id)
  if (!isEnabled(locale)) continue
  routes.push({
    kind: "article",
    entry,
    locale,
    slug: `articulos/${slug}`,
    path: localePath(locale, `articulos/${slug}`),
    translationKey: entry.data.translationKey ?? `articulos/${slug}`,
    title: entry.data.title,
    description: entry.data.description,
    noindex: entry.data.seo.noindex,
    canonical: entry.data.seo.canonical,
    updatedAt: entry.data.updatedAt ?? entry.data.publishedAt,
  })
}

/** Artículos publicados de un idioma, del más reciente al más antiguo. */
export async function getArticles(locale: Locale) {
  return (await getRoutes())
    .filter((route): route is ArticleRoute => route.kind === "article")
    .filter((route) => route.locale === locale && !route.noindex)
    .sort(
      (a, b) =>
        b.entry.data.publishedAt.getTime() - a.entry.data.publishedAt.getTime(),
    )
}
```

Si usas otra carpeta de contenido, cambia también `CATALOG_COLLECTIONS` en
`scripts/lib/bsi.mjs`.

## 3. JSON-LD — `src/lib/jsonld.ts`

```ts
export function blogPostingJsonLd(args: {
  origin: string
  url: string
  title: string
  description: string
  image: string
  publishedAt: Date
  updatedAt?: Date
  author?: string
  locale: Locale
}): JsonLd {
  return {
    "@type": "BlogPosting",
    "@id": `${args.url}#article`,
    mainEntityOfPage: { "@id": `${args.url}#webpage` },
    headline: args.title,
    description: args.description,
    image: args.image,
    datePublished: args.publishedAt.toISOString(),
    dateModified: (args.updatedAt ?? args.publishedAt).toISOString(),
    inLanguage: LOCALE_META[args.locale].htmlLang,
    author: args.author
      ? { "@type": "Person", name: args.author }
      : { "@id": `${args.origin}/#organization` },
    publisher: { "@id": `${args.origin}/#organization` },
  }
}
```

## 4. Página del artículo — `src/pages/[...slug].astro`

En el frontmatter:

```ts
import { getImage, Image } from "astro:assets"
import { blogPostingJsonLd } from "~/lib/jsonld"

const article = route.kind === "article" ? await render(route.entry) : undefined
const articleImage =
  route.kind === "article"
    ? await getImage({
        src: route.entry.data.image,
        width: 1200,
        layout: "none",
        format: "jpg",
      })
    : undefined
```

Agrega a `extraJsonLd` el `blogPostingJsonLd(...)` (con `image: absoluteUrl(articleImage.src, origin)`)
y `faqJsonLd(route.entry.data.faq)` cuando haya FAQ. Pasa `ogImage={route.entry.data.image}`
al layout. En el cuerpo, junto al bloque `legal`:

```astro
{article && route.kind === "article" && (
  <article class="container-page max-w-3xl py-16 md:py-20">
    <p class="text-brand-700 text-sm font-semibold uppercase">
      {route.entry.data.category}
    </p>
    <h1
      class="text-ink mt-2 text-4xl font-bold tracking-tight text-balance"
      {...bf("catalog", "article", "title", "catalog_bound")}
    >
      {route.title}
    </h1>
    <p class="text-muted mt-3 text-sm">
      <time datetime={route.entry.data.publishedAt.toISOString()}>
        {dateFormatter.format(route.entry.data.publishedAt)}
      </time>
      {` · ${route.entry.data.readingTime} min`}
    </p>
    <Image
      src={route.entry.data.image}
      alt={route.entry.data.imageAlt}
      widths={[480, 768, 1024, 1280]}
      sizes="(min-width: 768px) 768px, 100vw"
      priority
      class="rounded-card mt-8 aspect-[16/10] w-full object-cover"
      {...bf("catalog", "article", "cover", "catalog_bound", {
        presentation: "img",
      })}
    />
    <div
      class="prose-content mt-10"
      {...bf("catalog", "article", "body", "catalog_bound")}
    >
      <article.Content />
    </div>
  </article>
)}
```

Las migas de pan (`breadcrumbs`) deberían incluir el listado: Inicio → Artículos → título.

## 5. Sección de listado `articles`

Sigue la skill `nueva-seccion` con estos datos:

- `src/lib/bsi-fields.ts`: `articles: { shell: "container", heading: "style_target", body: "copy" }`.
- Schema `SectionArticles.schema.ts`: `type: z.literal("articles")`, `id: sectionId`,
  `heading: text`, `body: text.optional()`, `limit: z.number().int().positive().optional()`.
- Componente `SectionArticles.astro`: `const articles = (await getArticles(locale)).slice(0, limit)`
  y una rejilla de tarjetas con `<Image>` (`loading` lazy), categoría, título enlazado a
  `article.path`, `description` y fecha. Si no hay artículos, no renderiza la rejilla.
- `src/lib/llms.ts`: `case "articles": return [section.heading, section.body].filter(Boolean).join("\n\n")`.

## 6. Página del listado — `src/content/pages/es/articulos.yaml`

```yaml
title: Artículos
description: Guías y novedades sobre <tema del negocio>.
sections:
  - type: articles
    id: articulos
    heading: Artículos
    body: Lo que aprendemos trabajando con nuestros clientes.
```

Agrega el enlace a la navegación en `src/content/site/es.yaml`.

## 7. llms.txt — `src/pages/llms.txt.ts`

Agrega un grupo `## Artículos` con las rutas `kind === "article"` (título, URL y descripción).

## 8. Verificar

```bash
pnpm bsi:sync
pnpm verify
```

Commit sugerido: `feat: colección de artículos y listado`. Documenta el blog en
`docs/guias/contenido.md`.
