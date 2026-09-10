# Aleatur landing

Base local para la presencia web de Aleatur, construida a partir del material disponible en la biblioteca documental del proyecto.

## Estado actual

- Landing responsive con identidad visual oscura y editorial.
- Catálogo inicial de ocho perfumes de Afnan y Lattafa.
- Navegación interna y contacto directo por WhatsApp.
- Sin carrito, pagos, backend ni administración de productos.
- Preparada para evolucionar y publicarse en Vercel en una etapa posterior.

## Desarrollo local

Requiere Node.js 20 o posterior.

```bash
npm install
npm run dev
```

La aplicación queda disponible en la URL informada por Vite.

## Verificación

```bash
npm run build
npm run test:sites
```

## Estructura principal

- `src/App.jsx`: estructura y contenido de la landing.
- `src/styles.css`: sistema visual y comportamiento responsive.
- `src/data/products.js`: catálogo inicial y referencias a imágenes.
- `src/assets/`: marca e imágenes optimizadas para web.
- `worker/`, `scripts/` y `tests/`: soporte del starter para hosting estático.

El número y el mensaje de WhatsApp están centralizados al inicio de `src/App.jsx` para facilitar su confirmación antes del despliegue.

## Preparación para Vercel

`vercel.json` fija el preset de Vite y sirve `dist/client`, que es el resultado estático generado por este starter. El proyecto usa Node.js 22 y no requiere variables de entorno en esta etapa.

El enlace con la cuenta de Vercel, la creación del primer preview y la asociación del subdominio se realizan después de confirmar el proyecto y el dominio de destino.
