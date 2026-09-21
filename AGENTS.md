# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## Catalog imagery

The normalized documentary image set for the 279 catalog products is the definitive image source. Each product is identified by its catalog ID and has an `ALE-####.avif` plus an `ALE-####.webp` derivative. Preserve those pairings during integration; do not rescrape, substitute, or regenerate product imagery unless the user explicitly requests it.

The authorized responsive pipeline uses the checksum-verified historical sources recorded in `docs/images/sources.json`. Preserve the five previously verified source replacements. Generate each size directly from the selected source, retain the canonical 800 px pairs, and use 1200 px only where the reviewed source crop supports it. Keep complete packaging and sets, real colors and label details; never invent detail or apply automatic sharpening. Run `validate:images` and `test:images` after image changes. Follow `docs/image-optimization-plan.md` for generation, review and rollback.

The compact gallery uses `docs/images/gallery-sources.json` and source-sized, non-square derivatives in `public/products/gallery`. Prefer tighter empty-space framing over cutting or reconstructing a product. Preserve photographic light backgrounds for glass and reflections; use native transparency only where reviewed. Any authorized online replacement or regeneration must establish exact product identity; record provenance and keep ambiguous variants as explicit exceptions. Do not infer volume, concentration, packaging or GTIN into the catalog. Keep five columns on wide desktop, two on mobile, 44 px controls and complete product names. Zoom must respect the available source detail. Run `validate:gallery` as well as the canonical image checks; follow `docs/gallery-implementation.md`.

## Catalog architecture

Keep `/` as a concise editorial landing page and `/catalogo` as the complete discovery surface. The catalog uses search, category and brand filters plus explicit pages of at most 24 products; do not append the full inventory into one long page. Google Sheets remains the master source, `CATEGORIA_WEB` is the only product grouping field, and `PRIORIDAD_WEB` controls landing-page highlights only.

Use a minimal, restrained dark identity with neutral surfaces and subtle warm accents. Use clean sans-serif headings, natural line breaks, readable line height and compact navigation. Reserve the serif for the Aleatur wordmark; avoid oversized italic or overlapping hero typography. Selection should use simple product rows and one main consultation action, with an unboxed empty state. Do not show routine storage/account/reservation implementation explanations to shoppers. Prioritize accessible mobile controls, recoverable navigation and two-column mobile product grids when readable. Product details use stable `/producto/ALE-####` routes; `/seleccion` stores IDs locally without accounts, payments or stock reservation. Never invent editorial attributes or availability. Optional product attributes must come from the catalog master source.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
