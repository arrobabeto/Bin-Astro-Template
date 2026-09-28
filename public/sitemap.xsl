<?xml version="1.0" encoding="UTF-8"?>
<!--
  Hoja de estilo del sitemap: solo cambia cómo se ve /sitemap.xml en el
  navegador. Google lee el XML y la ignora. Sin marca: toma el dominio del XML.
-->
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  exclude-result-prefixes="sitemap xhtml">
  <xsl:output method="html" version="5.0" encoding="UTF-8" indent="yes" />

  <xsl:template match="/">
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <title>Mapa del sitio (sitemap.xml)</title>
        <style>
          :root { color-scheme: light dark; --ink: #0f172a; --muted: #475569; --line: #e2e8f0; --accent: #4f46e5; --paper: #ffffff; --panel: #f8fafc; }
          @media (prefers-color-scheme: dark) { :root { --ink: #f1f5f9; --muted: #94a3b8; --line: #1e293b; --accent: #818cf8; --paper: #0b1120; --panel: #111827; } }
          * { box-sizing: border-box; }
          body { margin: 0; background: var(--paper); color: var(--ink); font: 15px/1.6 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; }
          main { width: min(100% - 2rem, 64rem); margin: 3rem auto; }
          h1 { margin: 0; font-size: 1.9rem; letter-spacing: -.02em; }
          p { color: var(--muted); }
          .count { display: inline-block; margin-top: .5rem; padding: .2rem .7rem; border: 1px solid var(--line); border-radius: 999px; font-size: .85rem; }
          table { width: 100%; margin-top: 1.5rem; border-collapse: collapse; background: var(--panel); border: 1px solid var(--line); border-radius: 12px; overflow: hidden; }
          th, td { padding: .75rem 1rem; text-align: left; border-bottom: 1px solid var(--line); vertical-align: top; }
          th { font-size: .75rem; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); }
          a { color: var(--accent); word-break: break-all; }
          .alt { display: block; font-size: .8rem; color: var(--muted); }
        </style>
      </head>
      <body>
        <main>
          <h1>Mapa del sitio</h1>
          <p>Este es el sitemap XML que leen Google y otros buscadores. Solo incluye páginas canónicas e indexables.</p>
          <span class="count"><xsl:value-of select="count(sitemap:urlset/sitemap:url)" /> URL</span>
          <table>
            <thead>
              <tr><th>URL</th><th>Última modificación</th></tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <tr>
                  <td>
                    <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc" /></a>
                    <xsl:for-each select="xhtml:link[@hreflang != 'x-default']">
                      <span class="alt"><xsl:value-of select="@hreflang" />: <xsl:value-of select="@href" /></span>
                    </xsl:for-each>
                  </td>
                  <td><xsl:value-of select="sitemap:lastmod" /></td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
