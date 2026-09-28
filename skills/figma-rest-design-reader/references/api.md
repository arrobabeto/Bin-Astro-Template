# Referencia de la API REST de Figma

## Autenticación

- Cabecera: `X-Figma-Token: $FIGMA_API_KEY`
- Archivo por defecto: `$FIGMA_FILE_KEY` (la parte `<FILE_KEY>` de `figma.com/design/<FILE_KEY>/...`).
- Basta un token personal con permiso de solo lectura sobre el archivo.

## Endpoints que usa la skill

| Acción            | Método | Ruta                                               |
| ----------------- | ------ | -------------------------------------------------- |
| Cuenta            | GET    | `/v1/me`                                           |
| Archivo y páginas | GET    | `/v1/files/{file_key}?depth=1`                     |
| Árbol profundo    | GET    | `/v1/files/{file_key}?depth=N`                     |
| Nodos específicos | GET    | `/v1/files/{file_key}/nodes?ids=1:2,1:3`           |
| Exportar imagen   | GET    | `/v1/images/{file_key}?ids=1:2&format=png&scale=2` |

## Ids de nodo

- En la URL: `node-id=7-2`. En la API: `7:2` (cambia `-` por `:`).
- `scripts/figma.mjs` hace la conversión.

## Organización recomendada del archivo de Figma

| Página              | Uso                                        |
| ------------------- | ------------------------------------------ |
| Fundamentos         | Colores, tipografía, espaciado (tokens)    |
| Componentes         | Kit de UI                                  |
| Escritorio          | Frames por página → secciones del template |
| Móvil               | Adaptaciones móviles                       |
| Contenido pendiente | Huecos de texto (no publicar)              |

## Del diseño al template

| En Figma                | En el template                                              |
| ----------------------- | ----------------------------------------------------------- |
| Frame de sección        | Una entrada `sections[]` del YAML de la página              |
| Tipo de bloque repetido | `src/components/sections/Section<Tipo>.astro` + su schema   |
| Textos                  | Campos del YAML en `src/content/pages/<idioma>/`            |
| Colores y fuentes       | Tokens `@theme` en `src/styles/global.css`                  |
| Imágenes                | Archivos en `src/assets/images/` (exportados y optimizados) |
