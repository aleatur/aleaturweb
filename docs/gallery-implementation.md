# Compact product gallery

Implemented on 2026-09-21 against baseline `700fd6adf08d5afb89b4f911862f1ea2ffe4e896`.

## Scope and decisions

The inventory remains 279 products, with the catalog master, IDs, categories, featured priorities and 24-product pagination unchanged. The gallery now uses reviewed non-square source crops. Five columns fit wide desktop screens; four fit intermediate desktop screens; mobile retains two columns. Complete names and 44 px actions remain visible. Hero, featured cards, detail, selection thumbnails and deferred zoom use the same image contract.

`images/gallery-sources.json` separates composition from quality and records an action for every ID. Its review references cover all six batches in `images/gallery-review/`. A source's pixel count alone does not establish photographic quality or justify replacement. Images classified `card-use-only` remain usable at catalog scale; zoom stops at the generated source dimensions.

| Requirement | Result and evidence |
| --- | --- |
| Inventory of all 279 IDs | Composition, quality, action, source checksum, crop and review sheet per ID in `gallery-sources.json` |
| Better sources and provenance | Three higher-resolution replacements: ALE-0001, ALE-0161, ALE-0175; ALE-0164 is a byte-identical manufacturer confirmation |
| Background treatment | Seven reviewed tighter crops; original photographic background retained for glass and reflections; native alpha preserved for ALE-0056 only |
| Compare two layouts | Same 12 real products in compact vertical and horizontal cards; screenshots and measurements retained |
| Integrate every context | Home hero/featured, paginated catalog, detail, source-limited zoom and selection thumbnails |
| Validate quality and performance | 279 source records, 2,426 gallery derivatives, original 2,294 images independently validated; browser matrix and functional checks below |
| Rollout and reversibility | Generation in batches of at most 50; originals and canonical 800 px pairs preserved; release is a normal Git/Vercel deployment |

## Sources and faithful treatment

New originals belong in the external project library, in `04 Media/01 Productos/2026-09-21 fuentes verificadas galeria`. That collection contains four originals and `provenance.json`. Existing documentary collections are read-only. The local library root is routed through `docs/project-context.local.md`, which must remain unversioned.

The accepted sources are [Afnan 9 AM](https://afnan.com/products/9-am), [Lattafa Khamrah](https://lattafa.com/product/khamrah/) and [Lattafa Mashrabya](https://lattafa.com/product/mashrabya/). Their bottle shape, cap, front lettering and colors match the documentary reference. [Khamrah Waha](https://lattafa.com/product/khamrah-waha/) downloaded with the same checksum as the archived source; it is not counted as a quality upgrade. The manifest records source page, exact asset URL, date, dimensions, checksum, matching evidence and available usage information. It does not infer catalog volume, concentration or GTIN.

The seven tighter crops are ALE-0005, ALE-0011, ALE-0021, ALE-0152, ALE-0155, ALE-0232 and ALE-0233. They remove outer photographic space while keeping the full product and its real background. The surrounding tile uses the reviewed photographic background color. ALE-0102, ALE-0211 and ALE-0259 already had adequate framing; their backgrounds and reflections remain. ALE-0058 has an alpha channel in the original but no useful transparency in the approved crop, so its gallery output is explicitly opaque.

No generative reconstruction, sharpening, label repainting or synthetic detail was used. The original canonical images remain the fallback and social-sharing images.

## Source exceptions

| ID(s) | Decision |
| --- | --- |
| ALE-0039 | Keep the documentary image. The generic catalog name does not establish the gender/concentration variant needed to choose another Club de Nuit Intense photo. |
| ALE-0260 | Keep the documentary image. Its black bottle/box overlaps ALE-0258 despite the name "Rave Now Women"; confirm the master variant before replacement. |
| ALE-0112 | Keep the pink-cap documentary image. Official Tubbees alternatives include promotional artwork; the US candidate also changes the cap color. |
| ALE-0269 | Keep the existing Bare Vanilla presentation. The current official photograph shows a different label/packaging design. |
| ALE-0107 | Keep the documentary Karseell image. The secondary candidate includes different artwork and its provenance is insufficient to establish a clean replacement. |
| ALE-0079 | Low detail remains. Official Odyssey Wild One candidates were inspected, but exact packaging/volume correspondence cannot be established from the small documentary reference. |
| ALE-0095, ALE-0098, ALE-0219 | Existing watermarks remain; obtain a clean verified source instead of erasing them. |
| ALE-0033, ALE-0107, ALE-0109, ALE-0130, ALE-0228, ALE-0239 | Existing artwork/text remains visible; replacement is queued, not invented. |
| ALE-0238 | Preserve the existing upper cap pixels and tight source edge. Manufacturer alternatives are promotional artwork and do not improve the catalog frame. |

These are explicit retained-source exceptions. They are not evidence of an exact stock presentation. New replacement attempts must resolve identity before changing the image; this release does not change master product data. Candidate URLs and decisions are in `images/gallery-source-decisions.json`.

## Layout pilot

The pilot uses ALE-0001, ALE-0161, ALE-0039, ALE-0107, ALE-0112, ALE-0269, ALE-0129, ALE-0242, ALE-0260, ALE-0200, ALE-0065 and ALE-0279, covering bottles, jars, narrow mists and box/set compositions.

| Viewport | Vertical A, 12 products | Horizontal B, 12 products |
| --- | ---: | ---: |
| 320 px | 1,618 px | 2,064 px |
| 390 px | 1,828 px | 2,064 px |
| 768 px | 2,938 px | 1,440 px |
| 1440 px | 1,162 px | 1,112 px |

B is denser at tablet width but its narrower image column substantially shrinks boxes and sets. A preserves two mobile columns and scales to five desktop columns. The final 24-product desktop page, rather than the incomplete last row of a 12-product pilot, is the acceptance measurement. Compare [A desktop](images/gallery-review/pilot-a-desktop.webp), [B desktop](images/gallery-review/pilot-b-desktop.webp), [A mobile](images/gallery-review/pilot-a-mobile.webp) and [B mobile](images/gallery-review/pilot-b-mobile.webp).

## Measured acceptance

Chromium, viewport height 900 px, device pixel ratios 1 and 2, cache disabled, identical first 24 catalog products. All 24 images are deliberately decoded for a comparable complete-batch budget; this is not an initial-fold transfer or field Core Web Vitals measurement. Image bytes are encoded resource body bytes, excluding headers and non-image resources.

| Width / DPR | Before image bytes | After image bytes | Reduction |
| --- | ---: | ---: | ---: |
| 320 / 1 | 37,276 | 34,852 | 6.5% |
| 320 / 2 | 87,945 | 80,845 | 8.1% |
| 390 / 1 | 87,945 | 80,845 | 8.1% |
| 390 / 2 | 149,842 | 144,045 | 3.9% |
| 768 / 1 | 149,842 | 144,045 | 3.9% |
| 768 / 2 | 277,887 | 210,377 | 24.3% |
| 1440 / 1 | 87,945 | 80,845 | 8.1% |
| 1440 / 2 | 277,887 | 210,377 | 24.3% |

At 1440 px, batch height decreases from 2,663.13 to 1,951.94 px (-26.7%). At 320 and 390 px, height is unchanged; at 768 px it decreases by 48 px. The desktop photograph envelope retains at least 90% of its former long dimension, with materially larger subjects in the seven corrected background crops. New photographic angles are visually reviewed separately from this geometric envelope comparison.

All eight matrix cases have no horizontal overflow and measured CLS 0. Functional checks cover home, catalog, filtered results, detail, zoom and selection at 320/390/768/1440 px; pagination replaces rather than appends products, filters and ID lookup work, selection persists, zoom is deferred, Escape closes it and focus returns to the opener. Browser checks confirm source-capped zoom and at least 44 px control height. Automated suites cover catalog data, responsive image decoding/identity, hosting and metadata.

The built JavaScript changes from 83.17 to 90.16 kB gzip, including per-product intrinsic dimensions and gallery variants. The image-byte reductions above do not claim a reduction of every page's total payload. The old image files remain for fallback and rollback, increasing deployed asset storage without requesting both galleries in the browser.

See [before desktop](images/gallery-review/before-desktop.webp), [after desktop](images/gallery-review/after-desktop.webp), [after mobile](images/gallery-review/after-mobile.webp), and `images/gallery-measurements.json` for the reviewed evidence.

## Reproduction and checks

```powershell
npm run generate:gallery -- --source-dir "<archived originals>" --replacement-dir "<verified gallery collection>"
npm run validate:gallery
npm run validate:images
npm run validate:catalog
npm run test:images
npm run test:catalog
npm run build
npm run test:sites
npm run test:metadata
```

`--pilot` generates the 12 pilot IDs; `--ids ALE-0001,ALE-0161` generates a reviewed subset. A recipe/toolchain change requires a full run. The generator preflights requested source checksums, encodes into an OS temporary directory, processes at most 50 products per batch and promotes only after all requested encodes succeed. It removes only obsolete gallery files attributed to those requested IDs. It does not mutate originals or canonical pairs.

Gallery long-edge candidates are 144, 280, 420, 704, 1056 and 1200 px, capped by the actual source crop. Width descriptors always use the encoded width, not the long edge. AVIF quality 54 and WebP quality 84 were reviewed at output size. Validators check exact IDs, source/crop/alpha correspondence, pair completeness, full decoding, hashes, browser dimensions and stale files. CI runs both gallery and original-image validators.

To repeat browser measurements, use a clean Agent Browser session at the listed viewports/DPRs, disable cache, navigate to `/catalogo`, decode the 24 images, sum product resource `encodedBodySize`, measure `.catalog-grid`, inspect image bounds and record layout shifts. Keep the same font/loading state and batch; record any deliberate eager loading.

Rollback: revert the gallery integration commits as one reviewed change and redeploy, or promote the previously verified Vercel deployment for baseline `700fd6a`. Original source collections, canonical 800 px pairs and the earlier responsive pipeline are preserved. Do not delete the verified-source collection during rollback.
