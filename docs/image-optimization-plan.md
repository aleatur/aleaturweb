# Product image improvement plan

Status: measured proposal, 2026-09-21. Product image files have not been regenerated or replaced by the minimal UI redesign.

## Baseline

The repository contains 279 paired AVIF/WebP products. The documentary image directory currently also contains 558 derivatives, so it must not be assumed to contain higher-resolution masters. Locate and verify original source files before any quality restoration work.

| Measure | Observed value |
| --- | --- |
| Published products | 279 |
| Dimensions of all decoded WebP images | 800 x 800 |
| AVIF total / median / maximum | 4,469,854 / 12,817 / 48,794 bytes |
| WebP total / median / maximum | 6,738,482 / 19,848 / 67,224 bytes |
| Transparency in decoded WebP pixels | None detected |
| Delivery variants | One 800 px size per format |
| Existing delivery | AVIF with WebP fallback, explicit dimensions, lazy loading, priority hero/detail |

Images are already small in bytes. The main opportunity is source quality, consistent presentation and appropriate delivered sizes. A second compression pass on existing lossy derivatives is unlikely to be the best first action.

All 279 WebP files were decoded in the browser. A 160 x 160 sampling pass found near-white outer edges for every product. This does **not** establish uniform backgrounds inside the image. Visual review of eight representative products found an embedded pale rectangle in ALE-0129, differences between bottle-only and bottle-plus-box compositions, and soft detail in ALE-0001 at large display sizes. Source resolution and compression history remain unverified.

The pixel heuristic treats opaque pixels below RGB 240 in any channel as foreground. It is a triage aid, not a validated product mask: reflections, pale bottles and shadows can affect the result.

| Product | Observed issue / candidate review |
| --- | --- |
| ALE-0001 — 9 AM (Blanco) | Featured image: inspect original detail before using at larger sizes. |
| ALE-0129 — Art of Universe | Embedded pale background; detected object height about 59% of canvas. |
| ALE-0242 — Ophidian Mango Bliss | Detected longest foreground dimension about 76%; inspect scale. |
| ALE-0260 — Rave Now Women | Bottle plus box; detected longest foreground dimension about 69%. |
| ALE-0200 — Yara My Collection | Wide set: about 89% width and 40% height. Preserve the whole set; low height alone is not a defect. |
| ALE-0065 — Odyssey Chocolate | Bottle plus box: useful pilot for multi-object compositions. |
| ALE-0161 — Khamrah | Detailed glass: useful pilot for edge preservation and compression. |
| ALE-0279 — Velvet Petals | Tall/slim body mist: useful pilot for consistent optical scale. |

## 1. Recover and inventory sources

Start with the six homepage highlights and the candidates above, then cover all 279 IDs. Record source file or verified supplier URL, provenance, actual pixel dimensions, color profile, alpha, license/usage permission, and SHA-256 in a manifest. Distinguish the original master from an enlarged or previously compressed derivative. Flag missing masters explicitly.

Deliverable: a master inventory keyed by the existing catalog ID and a prioritized quality queue. Keep originals untouched and preserve current AVIF/WebP pairings. If a better original is unavailable, retain the current image until a replacement photograph or verified source is available. Do not generate product labels, packaging, colors or fine details with AI.

## 2. Approve a representative pilot

Use 12 products: homepage highlights plus examples covering bottle, bottle with box, multi-product set, pale/transparent glass, dark reflective glass and body mist. Avoid choosing twelve similar bottles.

Define a neutral white product canvas, consistent optical centering and an approximately 84–90% longest subject dimension for ordinary packshots. Treat wide sets separately. Keep the complete product and packaging; never use `object-fit: cover` or aggressive crop to force equal heights. Preserve real colors, reflections, labels and aspect ratios. Review edge quality on white and dark surrounds before accepting any background cleanup.

Deliverable: side-by-side original/pilot comparison at actual card, selection-row and detail sizes. Accept by visual review before processing the full set. Source quality, not artificial sharpening, should determine whether a product can support a large detail image.

## 3. Generate responsive derivatives

From verified masters, produce paired AVIF/WebP widths at 160, 320, 480 and 800 px. Add 1200 px only for a hero/detail source that genuinely supports it. Keep the existing `ALE-####.avif` and `.webp` contracts as the 800 px fallback; store responsive sizes in a dedicated subdirectory or an explicit manifest. Build once from masters, never by repeatedly re-encoding derivatives.

Use `srcset` width descriptors and route-specific `sizes`: compact selection thumbnails, two/four-column catalog cards, homepage feature and detail. Let the browser choose for viewport and device pixel density. This follows [responsive image guidance](https://web.dev/learn/images/responsive-images).

Maintain explicit dimensions, reserve the image box and keep below-fold lazy loading. Measure the actual LCP element before adding preload or fetch priority; do not mark all products high priority. See [image performance guidance](https://web.dev/learn/performance/image-performance).

Deliverable: deterministic generation script, source-to-output manifest, integration in `ProductImage`, and tests for complete pairs and dimensions. No new service or image CDN is required for this catalog size.

## 4. Verify quality and measured savings

Compare the same routes, products, viewport, device scale factor and cold-cache conditions before and after. Cover 320/390 px mobile, 768 px tablet, 1440 px desktop, and DPR 1/2. Check thumbnail labels, bottle edges, color consistency, full packaging visibility, fallback format, layout shift and actual downloaded `currentSrc`.

Targets to validate, not achieved results:

- Reduce image transfer bytes for the first catalog page by at least 30% where the selected responsive sizes are smaller, without visible quality loss. If a source is already tiny, prefer quality over forcing this target.
- Selection thumbnails should fetch an appropriate small variant instead of an 800 px file.
- Preserve all 279 IDs and all complete image pairs; no missing/broken source or stale manifest entries.
- Keep image-induced layout shift at zero in controlled browser runs; compare measured LCP rather than promising an unmeasured score.
- Manually inspect all 12 pilot products, then a contact sheet of the complete set and each flagged exception.

## 5. Roll out in batches

Ship the approved 12-product pilot first, then remaining highlights, then the full catalog. Review a preview, keep the prior image manifest and assets available for rollback, and verify production requests after each batch. Update validation rules to recognize responsive derivatives without weakening the existing 279-pair integrity check.

The current UI rework already removes CSS color filters and the dark overlay from product photography, keeps `object-fit: contain`, reduces the oversized hero presentation, and separates selection thumbnails from catalog cards. The source recovery, pilot editing and responsive asset generation above are future image work, not completed changes.
