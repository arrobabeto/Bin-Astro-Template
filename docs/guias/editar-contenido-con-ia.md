# Editar contenido con IA

Esta guía es para quien quiere cambiar el sitio sin programar. Solo necesitas describir el
cambio a un agente de IA: él edita los archivos correctos, revisa el resultado y te lo
muestra antes de publicarlo.

## Qué necesitas

- El proyecto abierto en **Cursor**, **Claude Code** o **Codex**. Los tres leen las mismas
  instrucciones (`AGENTS.md`) y las mismas [skills](skills.md).
- Acceso al repositorio en GitHub.

## Cómo pedir un cambio

Escribe lo que quieres como se lo dirías a una persona. Cuanto más concreto, mejor:

| En lugar de…        | Mejor…                                                                                |
| ------------------- | ------------------------------------------------------------------------------------- |
| "Mejora la home"    | "Cambia el título principal de la home por 'Clínica dental en Monterrey'"             |
| "Agrega una foto"   | "Reemplaza la foto de la sección Nosotros por esta imagen: el equipo en la recepción" |
| "Pon lo de precios" | "Agrega una pregunta frecuente: '¿Cuánto cuesta una limpieza?' con respuesta '…'"     |

Ejemplos que funcionan bien:

- _"Cambia el teléfono del pie de página a +52 81 1234 5678."_
- _"Agrega al menú un enlace a /servicios que diga Servicios."_
- _"Crea una página /servicios con un hero, tres servicios y el formulario de contacto."_
- _"Quita la sección de newsletter de la home."_
- _"Haz una auditoría SEO de la home y corrige lo que encuentres."_ (`/seo-audit`)
- _"Publica este artículo en el blog."_ (`/publicar-articulo`)

## Qué hace el agente

1. Identifica el archivo de contenido (`src/content/…`) y lo edita. No cambia el diseño salvo
   que se lo pidas.
2. Corre las revisiones automáticas. Si algo falla (un título demasiado largo, una imagen sin
   texto alternativo), lo corrige.
3. Te muestra qué cambió. Con Git, cada cambio queda registrado y se puede revertir.

## Límites a propósito

- **Los textos legales** los redacta o valida una persona con criterio legal. El agente puede
  editarlos, pero no inventa obligaciones legales.
- **Cambiar una URL publicada** siempre lleva una redirección 301. El agente la agrega solo.
- **El `id` de una sección** no cambia aunque cambie el título, porque Binflow y los enlaces
  internos (`/#servicios`) dependen de él.
- **Las claves y contraseñas** nunca se escriben en archivos del proyecto; van en Vercel.
  Ver [Variables de entorno](variables-de-entorno.md).

## Si el cliente tiene Binflow

Con [Binflow](binflow.md), el cliente pide los cambios por Telegram y Binflow los prepara, los
muestra en una vista previa y los publica tras aprobarlos. El resultado es el mismo: un cambio
revisado en el repositorio.
