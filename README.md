# Aleatur web

Sitio web de Aleatur, construido a partir del material disponible en la biblioteca documental del proyecto.

## Estado actual

- Portada responsive con identidad visual oscura y editorial.
- Catálogo independiente de 279 productos con búsqueda, categorías, marcas y carga progresiva.
- Contacto general y consultas de producto por WhatsApp.
- Sin carrito, pagos, backend ni administración de productos.
- Publicada en [aleatur.vercel.app](https://aleatur.vercel.app), con previews de los pull requests en Vercel.

## Desarrollo local

Requiere Node.js 22.

```bash
npm install
npm run dev
```

La aplicación queda disponible en la URL informada por Vite.

## Verificación

```bash
npm audit --audit-level=high
npm run validate:catalog
npm run test:catalog
npm run build
npm run test:sites
```

## Estructura principal

- `src/pages/`: portada, catálogo y estado de página inexistente.
- `src/components/`: componentes compartidos de producto, contacto y layout.
- `src/styles.css`: sistema visual y comportamiento responsive.
- `src/data/catalog.generated.json`: instantánea desplegable de la pestaña `Web` de la hoja maestra.
- `src/data/products.js`: productos publicados, categorías, destacados y rutas de imágenes.
- `public/products/`: pares AVIF/WebP identificados por el ID de catálogo.
- `worker/`, `scripts/` y `tests/`: soporte del starter para hosting estático.

El número y los mensajes de WhatsApp están centralizados en `src/site.js`.

## Actualización del catálogo

Google Sheets es la fuente maestra. Para actualizar la instantánea desplegable:

1. Exportar la pestaña `Web` como CSV.
2. Ejecutar `npm run sync:catalog -- <archivo.csv>`.
3. Revisar el diff generado.
4. Ejecutar las verificaciones indicadas arriba.

El importador valida encabezados, IDs, publicación, prioridades, categorías y pares de imágenes antes de reemplazar la instantánea.

Un CSV sin productos se rechaza y conserva la instantánea anterior. Una hoja con productos marcados como `PUBLICAR=NO` es válida; si ninguno está publicado, la portada muestra un estado vacío con acceso al contacto.

La actualización es manual: editar Google Sheets no modifica por sí solo el sitio publicado. CI ejecuta las verificaciones anteriores en pushes y pull requests a `main`.

## Publicación en Vercel

`vercel.json` fija el preset de Vite, sirve `dist/client` y resuelve `/catalogo` mediante la aplicación estática. El proyecto usa Node.js 22 y no requiere variables de entorno en esta etapa.

El repositorio está conectado a Vercel: los pull requests generan previews y los cambios publicados en `main` activan el despliegue de producción.
