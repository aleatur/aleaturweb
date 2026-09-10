# Design QA — Aleatur landing

## Scope

- Visual target: selected option 1 at `C:\Users\mater\.codex\generated_images\01a08856-2dfa-7873-8b08-443473b2dae3\exec-b987642a-cab1-4486-8dbb-82f3de26a5c3.png`, generated at `1024 × 1536`.
- Implementation: local Vite/React landing at `http://localhost:4173/`.
- Latest implementation capture: `C:\Users\mater\AppData\Local\Temp\aleatur-design-qa\after-humanize-1024x1536.png`.
- Combined comparison input: `C:\Users\mater\AppData\Local\Temp\aleatur-design-qa\qa-humanize-comparison.png`.
- Primary comparison state: `1024 × 1536`, device scale 1, page at scroll position 0, menu closed.
- Additional responsive checks: `1440 × 900`, `768 × 1024` and `375 × 812`.

## Comparison passes

### Pass 1

- The hero kept the dark editorial split, antique-gold accent, high-contrast serif display type and dominant product image from the selected direction.
- P2 typography: the hero title wrapped to four lines at desktop size instead of the target's three-line composition.
- P2 layout: the catalog changed to two columns too early at `1024px`, losing the target's four-card rhythm.
- P2 rendering: the `picture` elements needed an explicit block display to avoid inline-image layout behavior.

### Fixes

- Increased the display title measure and reduced its indented-line offset at intermediate widths.
- Preserved the four-column product grid through desktop widths, switching to two columns at tablet and one column on narrow mobile.
- Added explicit block rendering for responsive image containers.
- Aligned the collection heading more closely with the selected visual while retaining the real eight-product inventory.

### Final pass

- Typography: local Cormorant Garamond and Manrope files load correctly; hierarchy and title wrapping match the selected editorial direction.
- Layout and spacing: header, hero, collection and primary CTA keep the target's proportions and visual rhythm. No horizontal overflow was detected at tested widths.
- Colors and surfaces: near-black, ivory and antique-gold tokens are consistent; borders and panels remain restrained.
- Imagery: all eight documentary product assets load at their intrinsic `800 × 800` size through AVIF with WebP fallback. The implementation intentionally preserves the supplied product compositions rather than inventing replacement imagery.
- Icons: interface icons use one consistent Phosphor family; the official Aleatur emblem is used for brand marks.
- Interactions: skip link, anchor navigation, mobile menu, phone link, Instagram link and WhatsApp CTAs are present and keyboard-reachable. The mobile menu opens, closes and returns focusable navigation; selecting “Perfumes” closes it and lands below the fixed header.
- Accessibility: semantic landmarks and headings, descriptive product alt text, visible focus treatment, reduced-motion handling and at least `44px` interactive heights were verified.
- Runtime: all images completed without errors; browser console and page-error checks returned no application errors.

### Pass 2 — humanización y marca

- P2 voice: several short marketing formulas, numbered product badges and the three-step numbering made the page feel more like a generated luxury template than a small real brand.
- P2 brand expression: the palette and wordmark were close to Aleatur, but did not use the exact documentary brand colors or the title-case treatment shown in the official logo sheet.
- The structure, spacing, hero composition, product order and responsive breakpoints were intentionally kept unchanged.

### Fixes

- Rewrote only the supporting copy in a direct first-person plural voice, keeping the main headline and information architecture intact.
- Removed the decorative product indices and step numbers; the underlying catalog and purchase flow did not change.
- Updated the wordmark treatment to “Aleatur / Perfumería Árabe” and mapped the interface to the official `#B5A87F`, `#FAF7F0`, `#373435` and `#333333` brand colors.
- Reused the existing official emblem in the header, contact panel and footer; no new decorative artwork was invented.

### Post-fix evidence

- Full-view comparison at `1024 × 1536` confirms the original dark editorial direction, split hero, typography hierarchy and four-column desktop catalog remain recognizable.
- Focused header and hero review confirms the title-case wordmark, quieter brand gold and more conversational intro do not alter the main composition.
- Focused purchase/contact review confirms the removal of numbering leaves a clear reading order through the existing Phosphor icons and headings.
- Responsive captures at `1440 × 900` and `375 × 812` show stable wrapping, complete imagery and no horizontal overflow.
- Mobile menu open/close and the “Perfumes” anchor were retested; the destination remains aligned below the fixed `81px` header.

## Intentional differences

- The selected concept preview showed four products; the local base includes all eight products available in the documentary folder.
- The supplied product artwork includes its own editorial labels and contact treatment, so those real source assets replace the cleaner generated packshots shown in the concept.
- Cart, checkout, payments, stock and pricing are intentionally outside this first local phase.

## Result

No unresolved P0, P1 or P2 findings remain in the tested landing flow.

final result: passed
