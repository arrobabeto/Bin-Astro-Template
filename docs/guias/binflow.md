# Binflow

Binflow es una plataforma de operación web: el cliente pide cambios a su sitio desde Telegram
y Binflow prepara el cambio, genera una vista previa exacta, reúne las aprobaciones necesarias,
publica en el repositorio y verifica producción. Cada paso queda auditado.

Este template ya viene **listo para Binflow**: si el cliente decide contratarlo, no hay que
rehacer el sitio. Cómo contratarlo: [Servicios recomendados](servicios-recomendados.md#binflow).

## Qué significa "listo para Binflow"

Binflow necesita saber qué textos e imágenes puede tocar y dónde viven. El template se lo dice
con el **BSI (Binflow Surface Inventory)**, que tiene dos partes:

1. **Marcadores en el HTML.** Cada sección y cada campo editable lleva atributos invisibles
   `data-bf-*`. No cambian el aspecto del sitio ni cargan nada extra.
2. **El inventario** `binflow/surface-inventory.yaml`: la lista de todas las superficies
   editables, con el archivo y el campo exacto de cada una.

Sin Binflow, ambas partes son inofensivas. Con Binflow, permiten cambios precisos: "cambia el
título de la portada" apunta a un campo concreto, no a una búsqueda de texto en todo el
repositorio.

La decisión de incluirlo desde el inicio está en la [ADR 0003](../adr/0003-bsi-incrustado.md).

## El contrato en resumen (BSI v1, perfil `astro_repo`)

### Identificadores

Cada superficie tiene un `bf_id` estable con la forma `{área}.{sección}.{campo}`:

| Parte     | De dónde sale                                     | Ejemplo                    |
| --------- | ------------------------------------------------- | -------------------------- |
| `área`    | El slug de la página (`home` para la portada)     | `home`, `servicios-web`    |
| `sección` | El `id` de la sección en el YAML                  | `hero`, `servicios`        |
| `campo`   | El campo del schema, o `shell` para el contenedor | `heading`, `body`, `image` |

Por eso el `id` de una sección publicada **nunca se cambia**: rompería el `bf_id`.

### Marcadores

```html
<section
  data-bf-id="home.hero.shell"
  data-bf-kind="container"
  data-bf-section="hero"
>
  <h1
    data-bf-id="home.hero.heading"
    data-bf-kind="style_target"
    data-bf-section="hero"
  >
    …
  </h1>
  <p data-bf-id="home.hero.body" data-bf-kind="copy" data-bf-section="hero">
    …
  </p>
  <img
    data-bf-id="home.hero.image"
    data-bf-kind="image"
    data-bf-section="hero"
    data-bf-presentation="img"
    …
  />
</section>
```

Los genera `bf()` de `src/lib/bf.ts`. Los componentes nunca escriben estos atributos a mano.

### Tipos de superficie (`kind`)

| Kind            | Qué es                           | Qué hace Binflow                       | En el template                               |
| --------------- | -------------------------------- | -------------------------------------- | -------------------------------------------- |
| `style_target`  | Título                           | Cambia el texto y le aplica estilos    | `heading` de cada sección, título de legales |
| `copy`          | Texto corrido                    | Reemplaza el texto completo            | `eyebrow`, `body`, `intro`, lema del footer  |
| `image`         | Imagen con su `alt`              | Reemplaza la imagen                    | `image` de hero y split                      |
| `container`     | Contenedor de sección            | La identifica (sin editarla)           | `shell` de cada sección, cuerpo de legales   |
| `chrome_denied` | Botones, enlaces, menú           | No los edita con herramientas de texto | `cta`, `secondaryCta`                        |
| `catalog_bound` | Entradas de catálogo (artículos) | Se gestionan como familia propia       | Artículos del blog, si existen               |

Qué campo lleva qué `kind` se define una sola vez en `src/lib/bsi-fields.ts`.

### Filas del inventario

```yaml
- bf_id: home.hero.heading
  kind: style_target
  area: home
  section: hero
  path: src/content/pages/es/index.yaml
  locator: github:src/content/pages/es/index.yaml#sections.hero.heading
  locales: [es]
  publication_target: github_content
  sample: Sitios web profesionales listos para crecer
  notes: "Componente: src/components/sections/SectionHero.astro"
```

- `locator` apunta al `id` de la sección (`#sections.hero.heading`), **nunca** a su posición
  (`sections[0]`). Así, reordenar secciones no rompe nada.
- `publication_target: github_content`: la fuente de verdad es el repositorio.
- `sample` es el texto actual; Binflow lo usa para encontrar la superficie cuando el cliente cita
  un fragmento. Por eso conviene que no haya dos textos idénticos (`pnpm check:bsi` avisa).
- Las imágenes llevan además `alt_locator`, que apunta a su texto alternativo.
- Con varios idiomas, la fila lista todos en `locales` y el `path` usa `{locale}`.

## Mantenerlo al día

El inventario **se genera** a partir del contenido; no se edita a mano (salvo `notes` y
`deny_reason`, que se conservan).

```bash
pnpm bsi:sync     # regenera binflow/surface-inventory.yaml
pnpm check:bsi    # (después de build) compara inventario, contenido y HTML
```

Corre `pnpm bsi:sync` cada vez que agregues, quites o renombres páginas o secciones. Con un
agente: `/bsi-sync`. `pnpm check:bsi` corre en CI y falla si:

- falta una fila para un marcador del HTML, o sobra una fila sin marcador;
- el inventario no coincide con lo que generaría `pnpm bsi:sync`;
- algún `locator` usa índices `sections[n]` o apunta a un archivo inexistente;
- `bf()` intenta cargar el inventario en el navegador.

Las secciones condicionales (como `newsletter`, que solo se muestra con MailerLite activado)
pueden estar en el inventario sin aparecer en el HTML.

## Checklist para dar de alta el sitio en Binflow

- [ ] `project_key` del inventario acordado con Binflow (`pnpm bootstrap --project-key`).
- [ ] `pnpm verify` pasa, incluido `check:bsi`.
- [ ] Repositorio en GitHub con `main` como rama de producción y CI activo.
- [ ] Dominio de producción configurado (`PUBLIC_SITE_URL`) y previews de Vercel activos.
- [ ] Rutas editables acordadas: `src/content/**` y `src/assets/images/**`.
- [ ] Acceso de Binflow al repositorio (lo configura el equipo de Binflow).

Binflow sigue su propio contrato (Editable Surface Contract, perfil `astro_repo`). Si el
contrato cambia, este template se actualiza y la mejora se trae con
[Actualizar desde el template](actualizar-desde-template.md).
