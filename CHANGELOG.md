## 9.0.0 — Redundancy removed, three orphaned features restored (2026-09-16)

### Dead CSS: 444 rules removed, 151KB -> 112KB (-26.8%)

A live selector census (1,089 selectors tested by `document.querySelector`
across 11 tabs x 3 visual modes x 2 orientations, 534 probes, with every
`<details>` forced open and in-page controls clicked) found **415 selectors
that never match anything**. Overwhelmingly the chrome of removed
navigation: 29 `.navbtn`, 24 `.sm-v17-nav`, plus `.sm-v20-*`, `.sm-v21-*`,
`.sm-v29-*` and `#smRail` left behind by successive redesigns.

Verified by computed-style parity across 66 states: **0 changes**. Control:
breaking one live rule reported 66/66.

**surgimaster.css: 183KB at V34 -> 112KB. Down 39%.**

### Three features were orphaned, not dead — restored

Six JS functions were defined but never called. Deleting all six would have
been wrong: three were working features that had silently lost their call
site during earlier restructures, and were reachable only by reading source.

- **Procedural cognitive rehearsal** (`smProceduralCard`) — 4 real procedures
  in intelligence.js with critical-step scoring, now rendered on **Viva**,
  where rehearsing a sequence under pressure belongs.
- **Smart reminders** (`smNotificationsCard`) — now in **Setup**, with its own
  feature-detection for Notification/PushManager support.
- **System health** (`smSystemHealth`) — six local checks (study-data validity,
  recovery snapshots, IndexedDB, service worker, online, storage headroom),
  now in **Setup**. This is the diagnostic you would want when the app
  misbehaves on a phone, and it was unreachable.

Genuinely dead and removed: `progressPanel`, `smRetentionSignal`,
`smV23Kind`, `smV27ActionIcon`, plus `renderMore()` from 8.1.0.

**The near-miss is the point.** `smProceduralCard` guards on `SM.PROCEDURES`,
and a check with only `engine.js` loaded reported it undefined — so it looked
like self-disabling dead code. Loading `intelligence.js` too showed 4 real
procedures. It was only caught because `tests/intelligence.test.js` asserts
"UI must expose procedural rehearsal" and failed the moment it was deleted.
That test had been passing for as long as the feature was unreachable, because
it checks the string exists in the bundle, not that anything renders it.

### Also

- **Six unlabelled form controls** on Plan and Setup (gym, day start, backup
  day, rest day, campaign start, exam dates) now carry `aria-label`. Each had a
  visible row label but no programmatic association.
- **Landscape chrome cut from 120px to 100px** (31% -> 26% of an 844x390
  screen). Below 500px viewport height the bars drop labels and go icon-only;
  touch targets stay 44px, portrait is unchanged.
- **"Recovery snapshots" no longer reports a false alarm on new installs.** The
  ring only fills from the second save, so a fresh install legitimately has
  none; it now reads "Building" rather than "Check", which would have sent
  someone troubleshooting a working system.

Nine suites green.

