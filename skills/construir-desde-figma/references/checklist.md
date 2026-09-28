# Checklist de avance

Copia este bloque al inicio del trabajo y márcalo conforme avances.

```
Progreso:
- [ ] DISEÑO_LEÍDO: frames, textos, imágenes, tokens y versión móvil identificados
- [ ] MAPEO_APROBADO: tabla frame → sección aprobada por la persona
- [ ] SECCIONES_LISTAS: tokens en global.css; secciones nuevas con schema + bf()
- [ ] CONTENIDO_EN_YAML: todo el texto en src/content/; imágenes en src/assets/
- [ ] BSI_SINCRONIZADO: pnpm bsi:sync y diff revisado
- [ ] VERIFICADO: pnpm verify en verde; revisión a 375 / 768 / 1280 px
- [ ] LISTO: aprobado en el preview de Vercel
```

## No se marca LISTO si

- Hay textos editoriales escritos dentro de un componente.
- Hay colores `#hex` en componentes (el lint lo bloquea).
- Una imagen apunta a una URL de Figma.
- Falta el `alt` de una imagen o hay más de un H1.
- `check:bsi` o `check:sections` fallan.
