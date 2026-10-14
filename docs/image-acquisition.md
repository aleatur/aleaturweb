# Additional catalog image acquisition

The master spreadsheet contains products beyond the active 279-product image inventory. Image acquisition prepares a separate, reviewable package; it does not change publication flags, synchronize Sheets, or replace the active catalog.

## Documentary collection

Resolve the library through `docs/project-context.local.md`. The acquisition collection is `04 Media/01 Productos/2026-09-28 fuentes catalogo ampliado`.

- `catalog-master.snapshot.json` preserves the source cells used to identify products.
- `priority`, `lattafa`, `alhambra`, `brands_a`, and `brands_b` contain disjoint inventories, source originals, visual review sheets and `acquisitions.json` decisions.
- Every inventory ID must have exactly one accepted or exception decision. Exceptions retain the identity conflict, unavailable source, or unresolved presentation; they are not fabricated replacements.
- Accepted records require the product page, exact image URL, retrieval date, image dimensions, SHA-256, specific identity evidence, usage information and a completed visual review.

Original downloads retain their bytes. Existing documentary collections and the 279 active product images are preserved. Source attributes are evidence for identity, not authorization to edit catalog attributes.

## Prepare an isolated package

```powershell
node scripts/prepare-acquired-images.mjs '<collection>' '<collection>/prepared'
# A completed priority group can be prepared independently:
node scripts/prepare-acquired-images.mjs '<collection>' '<collection>/prepared-priority' priority
node --test tests/acquired-images.test.mjs
```

The output directory must not exist; its existing parent must resolve inside the documentary collection, outside the repository. Preparation rejects an existing catalog ID, missing review, incomplete decisions, escaping source path, changed checksum or incorrect dimensions before encoding. It reuses the canonical and gallery encoders; no new image-processing dependency is introduced.

Each accepted source produces canonical 800 px AVIF/WebP pairs and the current responsive sizes. The existing 1200 px source-detail threshold applies. The gallery retains the photographic background and uses only sizes supported by the selected crop, without sharpening or synthetic detail. Full original files remain available for comparing crop and label identity.

The package contains `public/products`, source and output manifests, browser availability data, a proposed catalog subset, acquisition decisions, `validation.json`, and an `index.html` review page with 24-product pagination and source-limited zoom. The catalog subset records the source publication values for comparison only; it is not the active site snapshot.

Preparation runs the existing canonical and gallery validators against the isolated package, including full decoding, checksums, dimensions and pair coverage. Review the generated framing at desktop/mobile sizes before integration. The active catalog is checked separately with:

```powershell
npm run validate:images
npm run validate:gallery
npm run validate:catalog
npm run test:images
```

## Later integration

Integrate accepted IDs only as part of an explicitly scoped catalog synchronization. Re-read Sheets, resolve its publication/category contract, merge source/output records, add the prepared files and update browser availability together. Keep original IDs, preserve existing source replacements and do not treat an acquired image as a publication decision. Any remaining exception stays absent from the image-ready set.

No commit, deployment, Sheet mutation or replacement of existing photography is performed by the preparation command. The package is generated in an owned staging directory and renamed into place only after encoding, validation and review-page generation succeed. Failed staging is removed; source originals and earlier packages remain untouched.
