---
name: optimizar-imagenes
description: >-
  Optimiza imágenes para web sin que se vean pixeladas: limita el tamaño,
  quita metadatos y busca la compresión más ligera que sigue siendo
  visualmente igual al original (medido con SSIM). Elige el formato según el
  repo: AVIF para los originales de src/assets, WebP para public/ y JPG para
  imágenes de redes sociales. Úsala cuando pidan "optimiza las imágenes",
  "esta foto pesa mucho", "convierte a AVIF/WebP", "check:assets se queja del
  peso" o al agregar fotos nuevas al sitio.
---

# Optimizar imágenes

Imágenes ligeras y sin pérdida visible, con sus citas en el contenido actualizadas.

Por qué cada formato: [ADR 0010](../../docs/adr/0010-formatos-de-imagen.md). Resumen:

| Dónde vive la imagen       | Formato | Ancho máx. | SSIM mínimo | Por qué                                                         |
| -------------------------- | ------- | ---------- | ----------- | --------------------------------------------------------------- |
| `src/assets/` (contenido)  | AVIF    | 2400 px    | 0.98        | Es el original: Astro genera los WebP publicados a partir de él |
| `public/` (URL fija)       | WebP    | 1600 px    | 0.975       | Se sirve tal cual a todos los dispositivos                      |
| Imagen social (`og-*`)     | JPG     | 1200 px    | 0.98        | Facebook, LinkedIn y WhatsApp no leen AVIF de forma fiable      |
| Logos e íconos vectoriales | SVG     | —          | —           | No se tocan                                                     |

## Input

- **Obligatorio:** qué imágenes (archivo, carpeta o "todas").
- **Opcional:** formato forzado, ancho máximo distinto, si la imagen es una captura con texto.

## Preflight

1. `git status -sb`: no mezcles el trabajo con cambios ajenos.
2. Las imágenes nuevas van primero a su carpeta (`src/assets/images/` salvo que necesiten URL
   fija; ver [Imágenes](../../docs/guias/imagenes.md)).
3. Mide el estado actual: `pnpm check:assets`.

## Pasos

1. **Simula** para ver formato, peso y calidad sin escribir nada:

   ```bash
   node skills/optimizar-imagenes/scripts/optimizar-imagen.mjs src/assets/images --dry-run
   ```

2. **Optimiza y actualiza las citas** (borra el original y corrige las rutas en YAML,
   Markdown y componentes):

   ```bash
   node skills/optimizar-imagenes/scripts/optimizar-imagen.mjs <archivo|carpeta> --replace --preview
   ```

3. **Revisa a ojo** la vista previa que imprime el script (recorte al 100 %: original a la
   izquierda, optimizada a la derecha). Busca pixelado, bandas en cielos o degradados, bordes
   con halos y texto borroso. Si ves cualquiera, repite con `--min-ssim 0.99`.
4. Atiende los avisos:
   - _"se verá pixelada si se muestra más grande"_: el original es pequeño. **No lo agrandes**;
     pide a la persona una versión de mayor resolución y repórtalo como pendiente.
   - _"ni con calidad … llega a SSIM"_: imagen difícil (ruido, texto fino). Usa `--lossless`.
5. **Capturas de pantalla, diagramas o imágenes con texto:** usa `--lossless` (o
   `--min-ssim 0.995`); la compresión con pérdida emborrona las letras.
6. Si cambiaron rutas de imágenes en el contenido, corre `pnpm bsi:sync`.
7. Si el nombre del archivo no describe la imagen (`IMG_2041`, `foto-final`), sigue con la
   skill `seo-imagenes`.

## Reglas

- Nunca agrandes una imagen: si no alcanza el tamaño, pide otra.
- No vuelvas a comprimir una imagen que ya es AVIF/WebP optimizada: el script la deja igual si
  no gana peso.
- No borres originales a mano: `--replace` borra solo después de actualizar las citas.
- Favicons, íconos de la app y SVG no se procesan.
- Las imágenes de `src/assets/` no necesitan varios tamaños: Astro genera los anchos y el WebP
  final en el build.

## Verificar

```bash
pnpm check:assets
pnpm verify
```

## Entrega

Tabla con cada imagen: peso antes y después, medidas, formato, calidad y SSIM; citas
actualizadas; avisos pendientes (originales pequeños que conviene reemplazar) y resultado de
`pnpm verify`.
