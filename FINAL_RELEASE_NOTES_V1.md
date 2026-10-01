# Dakshinamurthy — Final Rollout Candidate

## Release
- App: Dakshinamurthy
- Version: 4.6.6
- UI branch: V33.6 UI-only
- Tagline: HIGHER EVERY HOUR

## Rollout scope
- Final UI refinement and hardening only.
- Core adaptive learning, curriculum, persistence, and intelligence engines are unchanged by the V33.6 UI layer.
- Legacy visual-engine files remain in the package for compatibility/history but are not loaded by `index.html` or the offline shell.
- `visual-v33-ui.js` is the only V33 visual runtime loaded.

## Verification
- SMOKE PASS
- CONSERVATION PASS — 13,729 questions × 3 passes
- INTELLIGENCE PASS
- JavaScript syntax checks pass
- E2E test: SKIPPED because Playwright is not installed in the build environment

## Rollout recommendation
READY FOR FINAL ROLLOUT as the V33.6 UI-only release candidate.

Before store/distribution submission, run the platform-specific packaging/signing process and one real-device acceptance pass (iPhone/iPad if iOS is the target), including cold launch, navigation, offline launch, persistence after relaunch, safe-area layout, and reduced-motion accessibility.
