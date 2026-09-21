# Catalog experience

## Routes and state

The home page is editorial: hero, category shortcuts, up to six highlights, purchase guidance and contact. The complete inventory lives at `/catalogo`.

Catalog results contain at most 24 products per page. URL parameters are `q`, `categoria`, `marca`, `orden` and `pagina`. Search is submitted with Enter or Buscar, so typing does not create history entries or repeatedly announce result counts. Search handles accents, reversed word order, compact names such as `9pm`, and catalog IDs. Exact names rank first under relevance sorting. Brand/name is the explicit default without a search. Invalid filters are discarded and stale page numbers are clamped. Changing filters resets page 1.

Product routes use `/producto/ALE-####`. The `desde` parameter accepts only internal catalog or selection destinations. Catalog card navigation records the position and focused product in session storage, allowing the return link to restore the same result batch and position. Native history supports back/forward navigation.

`/seleccion` stores only catalog IDs in browser local storage under `aleatur.selection.v1`. It requires no account and does not reserve stock. Changes synchronize between tabs. Corrupt storage is ignored, unknown IDs remain visible as unavailable, and removal offers Undo. If storage is blocked, an in-page notice explains that saving cannot persist. WhatsApp consultation links split long selections into messages below 1,800 URL characters; the site never sends a message automatically.

## Editorial source

Google Sheets remains the master source. `CATEGORIA_WEB` is the only grouping field. `PRIORIDAD_WEB` controls homepage highlights, never catalog relevance. Product imagery preserves each existing AVIF/WebP pair by ID.

The CSV starts with the existing seven required columns, in order:

`ID,MARCA,PRODUCTO,PUBLICAR,PRIORIDAD_WEB,IMAGEN,CATEGORIA_WEB`

These optional columns may follow in any order:

| Column | Snapshot field | Maximum characters |
| --- | --- | --- |
| PRESENTACION | presentation | 120 |
| CONCENTRACION | concentration | 120 |
| DESCRIPCION | description | 1200 |
| FAMILIA_OLFATIVA | olfactoryFamily | 160 |
| NOTAS | notes | 600 |

Blank optional values are omitted. The original seven-column CSV remains valid. Unknown/duplicate headers, malformed row lengths, invalid values and missing images fail before replacing the snapshot. Fill editorial fields only from verified source material. No editorial values, stock levels or prices were inferred during this implementation.

Run `npm run sync:catalog -- <export.csv>`, review the snapshot diff, then run the checks below. Sheet changes are not automatically deployed.

## Hosting and metadata

The existing Sites preparation remains intact. A subsequent build step creates static HTML metadata for home, catalog, selection and every published product, plus a sitemap, robots.txt and a 404 document. Product social images reference the existing WebP derivatives. Vercel serves clean URLs from these files; unknown URLs return the custom 404 document. Selection is excluded from the sitemap and marked noindex. Canonical URLs use `https://aleatur.vercel.app`; update the build script when adopting a custom domain.

Vite development and the Sites fallback still resolve application routes. Vercel's static routing and HTTP status behavior must also be checked in the deployed environment.

## Verification

```sh
npm audit --audit-level=high
npm run validate:catalog
npm run test:catalog
npm run build
npm run test:sites
npm run test:metadata
```

Browser acceptance journeys:

1. Search `khamrah lattafa`, `9pm`, an accented name and an ID; verify counts, exact-name ranking and recovery from no results.
2. Filter Lattafa, move to page 2, open a product and return. Verify URL, filter controls, 24-card limit, scroll position and focus. Repeat with browser Back/Forward and reload.
3. Save several products, reload, open selection, remove/undo, and inspect the WhatsApp message without sending it. Verify empty, corrupt-storage and unavailable-ID states.
4. At 320, 390, 768 and 1440 px, inspect overflow, readable cards, header, dialogs and 44 px controls. Check 200% text size, keyboard order, Escape, focus return and reduced motion.
5. Verify direct product URLs, metadata, sitemap, HTTP 404 and production asset loading after deployment.

Use these measurements for subsequent comparisons: catalog total height, first-card position, rendered card count and horizontal overflow. These are local layout metrics, not field Core Web Vitals or conversion measurements. No third-party analytics are introduced.

The 2026-09-21 local browser check at 390 x 844 measured a 5,154 px catalog page with 24 cards, versus the previous 13,714 px. The first card moved from 1,009 px to 489 px. The home page measured 5,109 px and category shortcuts started at 1,173 px, previously 4,721 px. Browser checks also covered 320/768/1440 px widths, enlarged text, search/history, detail return with restored focus, selection persistence/removal/undo, unavailable IDs and corrupt storage. Recheck these values when editorial content changes.
