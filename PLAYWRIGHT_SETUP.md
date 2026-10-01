# Playwright E2E testing

Dakshinamurthy includes a real-browser regression suite in `tests/e2e.test.js`.

## Install

```bash
npm install
npx playwright install chromium
```

## Run browser tests

```bash
npm run test:e2e
```

## What it covers

- application launch and navigation
- expected tabs and absence of Viva/Mocks navigation
- question logging controls
- Help and local feedback persistence
- AI feedback packet generation
- offline shell availability
- iPhone-sized viewport horizontal-overflow checks

## Full regression gate

```bash
npm test
npm run test:e2e
npm run test:ui
npm run test:resilience
npm run test:search
```

If Playwright is unavailable, the E2E command reports the missing dependency instead of silently treating browser coverage as a pass.
