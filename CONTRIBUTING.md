# Contributing

Thanks for helping improve the Aleatur landing.

## Local setup

Use Node.js 22 and install the locked dependencies:

```bash
npm ci
npm run dev
```

## Before opening a pull request

Keep each change focused and preserve the current visual direction unless the scope explicitly calls for a redesign. Run the project checks before submitting:

```bash
npm audit --audit-level=high
npm run validate:catalog
npm run test:catalog
npm run build
npm run test:sites
npm run test:metadata
```

For visual changes, also check the layout at desktop, tablet, and narrow mobile widths. Do not commit credentials, local paths, screenshots, generated reports, caches, or temporary files.

Catalog updates come from a CSV export of the master sheet's `Web` tab. Run `npm run sync:catalog -- <file.csv>`, review the generated diff, and run all checks above. Empty exports must fail without replacing the existing snapshot. When changing publication handling, also verify the home page with no published products.

CI runs these checks on pushes and pull requests to `main`. Vercel creates pull request previews and deploys production when changes are pushed to `main`.

See [Catalog experience](docs/catalog-experience.md) for optional CSV columns, navigation contracts and browser acceptance journeys.

## Pull requests

Explain the motivation, list the affected areas, and report the validation that actually ran. Link an issue when one exists.
