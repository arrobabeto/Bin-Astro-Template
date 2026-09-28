# 0007 — Medición opcional y sin banner de cookies

**Estado:** Aceptada

## Contexto

No todos los clientes necesitan medir visitas, y la configuración correcta de Analytics y Tag
Manager (objetivos, conversiones, informes) es un servicio en sí mismo. Un banner de cookies
agrega peso, fricción y obligaciones que dependen de la jurisdicción de cada cliente.

## Decisión

GTM, GA4 y la verificación de Search Console se activan con una variable de entorno cada una y
vienen apagados. Solo se cargan en builds indexables (nunca en previews ni en local). Si hay
GTM, GA4 directo se desactiva para no contar doble. El template no incluye banner de cookies ni
herramientas de consentimiento.

## Alternativas

- **GA4 siempre activo:** datos desde el primer día, pero obligaciones de privacidad para
  todos los sitios.
- **Banner incluido:** cubre el RGPD, pero es innecesario para muchos clientes y difícil de
  hacer bien de forma genérica.

## Consecuencias

- Un sitio sin medición no carga ningún script de terceros ni necesita consentimiento.
- Activar la medición es una decisión del cliente, con revisión de su aviso de privacidad y, si
  su jurisdicción lo exige, un banner integrado como servicio adicional
  (ver [Analytics](../guias/analytics.md)).
