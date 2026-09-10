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
npm run build
npm run test:sites
```

For visual changes, also check the layout at desktop, tablet, and narrow mobile widths. Do not commit credentials, local paths, screenshots, generated reports, caches, or temporary files.

## Pull requests

Explain the motivation, list the affected areas, and report the validation that actually ran. Link an issue when one exists.
