# Dakshinamurthy v10.0.0

## Focus
Major workflow and usability release: fewer decisions, clearer question logging, and a decision-oriented Progress screen.

## Changes
- Primary workflow is now **Today → Learn → Practice → Progress → More**.
- Practice opens with **Log a question** as the dominant action.
- Added a three-step logging guide: identity → result → adaptive scheduling.
- Progress rebuilt around: at-a-glance signals, next useful work, needs-attention topics, and collapsed detailed evidence.
- Viva removed from active Coach actions and user-facing flows.
- Mock exam data is no longer retained in live state or exported backups; old backup fields are ignored safely.
- Taper/scheduler remains retrieval-only; no mock/mock-review days are generated.
- Offline-first architecture retained.
- Version/cache bumped to 10.0.0.

## Validation
- Node syntax checks: PASS
- Core smoke/conservation/intelligence/export/backup tests: PASS
- Plan: 72 special days, no mock/mock-review days; 1,987 scheduled blocks point to real curriculum topics.
- E2E/UI geometry tests: SKIPPED because Playwright is not installed in the supplied environment. No browser E2E claim is made.
