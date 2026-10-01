# Dakshinamurthy v9.1.0 — workflow simplification

## Changes
- Removed Viva as a user-facing module, including its navigation entry, search destination and Coach action.
- Removed Mock exams as a user-facing module and stopped the scheduler from creating mock/mock-review days.
- Taper days are now retrieval-only; no mock sub-mode is scheduled.
- Reorganised primary navigation into five destinations: **Today · Learn · Practice · Progress · More**.
- Merged question logging into Practice with a prominent **Log a question** action.
- Kept Log as an internal route only so existing in-app links still open the correct logging screen.
- Moved infrequent tools (Plan, Coach, Setup) under More.
- Reworked Progress into a compact dashboard with four headline metrics and collapsed detailed evidence.
- Preserved existing study history, MCQ logging, adaptive engine, notes, repairs, backup and FSRS/SM-2-related retrieval logic.

## QA
- JavaScript syntax checks: PASS
- npm test suite: PASS
- Plan validation: 72 special days; no mock/mock-review days generated
- Existing offline-first architecture retained
- Browser E2E/UI tests were not rerun because Playwright is not installed in this package environment.
