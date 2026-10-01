# Dakshinamurthy V35 — Final QA Report

Version 6.4.0. Date 2026-09-15.

## Scope

UI, rendered geometry, colour and accessibility. The scheduler, curriculum,
SM-2 intervals, adaptive intelligence and stored study state are unchanged.
The question-conservation invariant (13,729 questions × 3 passes) is
re-verified green and was not touched.

## Method — what was different this time

Every previous QA report in this repository recorded browser E2E as **"not
run because Playwright is unavailable in the environment."** Playwright with
headless Chromium 141 was available here, so the browser suites were run for
the first time in the project's history.

`npm test` (smoke, conservation, intelligence) passed, as it always had.
`npm run test:e2e` **crashed on its very first action**, unable to click a
navigation button. That single discrepancy is the origin of this report: the
plain-Node tests and the rendered page disagreed, and the rendered page was
right.

Three purpose-built probes were then run across 5 viewports (375/390/412/768/
1280), 5 tabs and 3 visual modes: a geometry/overflow/touch-target audit, a
gradient-aware contrast audit, and a surface-composition probe.

**Two bugs in the harness itself were found and fixed before trusting any
result.** The first contrast probe ignored gradient backgrounds and produced
roughly 80 false positives. The first attempt at fixing contrast then acted
on an assumption ("dm-ui33 is a light theme") instead of a measurement, and
made several elements worse. Both were caught by re-measuring rather than
re-reasoning. Per LESSONS_LEARNED, no probe result was acted on until the
probe was shown to be measuring the real composited pixel values.

## Defects found and fixed

### Critical

**1. Bottom navigation rendered off-screen at every viewport width.**
Measured button positions at 390px: Today `x = -145..-81`, Learn `x = -78..-13`,
Practice `x = -10..54`. The two primary tabs were not merely awkward to hit,
they were outside the viewport. Playwright refused to click them; a real
finger could not reach them either.

Cause: the base rule `nav{left:50%;transform:translateX(-50%)}` was written
for `position:fixed`, where that pair is correct centring. V33.2 changed the
nav to `position:sticky` with `margin:12px auto 0`, which centres on its own,
but left the transform in place. The two methods stacked and shifted the bar
half its own width (-173px at 390) to the left.

Compounding cause: the V33.6 rule intended to fix this on phones
(`@media(max-width:520px){.sm-v17-nav{position:fixed;left:11px;right:11px}}`)
never applied, because `body.dm-ui33 .sm-v17-nav` outranks a bare
`.sm-v17-nav` on specificity regardless of media query. It had been sitting in
the file looking like a fix for two releases.

Fix: one positioning model at every width — fixed, centred by the
left/transform pair, safe-area aware — plus `#app` bottom padding to reserve
the space the now-fixed bar no longer occupies in flow.

**2. Practice self-rating buttons rendered blank.**
`.chip`, `.pick`, `.segb` measured **1.03:1** — ivory text on an ivory
background. These are the Right / Fragile / Wrong and Fluent / Hesitant /
Froze buttons pressed after every single question, i.e. the entire input side
of the SM-2 loop. dm-ui33 gave them a near-white surface but never set their
ink, so they inherited `--sm-ivory` from the superseded dark theme.
Confirmed present in the shipped V34 build by isolating the cascade against a
pristine unzip; not introduced by this work.

**3. Home-screen headline invisible.**
`"Climb, don't chase."` measured **1.02:1**, dark maroon ink on the dark
maroon hero. Same defect on `"Learn · Practice · Recover"` (1.02:1), the
`.sm-v26-pill` labels (1.44:1) and the hero stat labels (1.43:1).

### Significant

**4. Night mode was dead.** The `data-sm-mode` attribute flipped correctly and
`state.visualMode` persisted, but dm-ui33's `!important` rules kept the light
parchment surface: background stayed `rgb(247,241,227)` and cards stayed
`rgba(255,253,248,.96)` in all three modes. Screenshot hashes differed only
by the highlighted button. For an app used late at night before a surgical
exam, this is a real loss, not a cosmetic one.

**5. Every disclosure row failed the touch minimum.** `<summary>` elements
rendered 16–20px tall against a 44px minimum — roughly a third — and they are
the primary means of opening content on four of the five tabs.

**6. No navigation item highlighted on sub-screens.** `settings`, `plan` and
`ai` have no matching `data-tab`, so the active-state loop matched nothing
and the entire bar went unhighlighted.

**7. `className` rebuild deleted the More button's `secondary` class** on the
first render, permanently.

**8. Calendar grid overflowed horizontally** below ~390px, pulling the whole
page into horizontal scroll.

**9. Dead markup in `index.html`.** The static `.sm-v19-ribbon` brand header
was placed inside `#app`, which `render()` clears on first paint. It never
appeared. Removed.

**10. Keyboard focus was invisible** on the parchment surface.

**11. `tests/e2e.test.js` silently tested nothing** for the visual modes. It
used `if (b) { ... }` on `[data-visual-mode]` at a point in the flow where
those buttons do not exist — they live on the Settings sub-screen, reached
from More. The `if` was always false; the test reported PASS regardless.

### Contrast sweep

36 further WCAG AA failures were measured and fixed across the three modes,
including the v14 journey card, the calendar numerals, the action tiles, the
day-timeline tick labels, and the system-health status words. Final state:
**0 failures across 3 modes × 5 tabs**, measured against composited
backgrounds at each element's real rendered font size.

## Verification

| Suite | Result |
|---|---|
| `tests/smoke.test.js` | PASS — 6.0.0 release, boot order, bundle, persistence |
| `tests/conservation.test.js` | PASS — **13,729 questions × 3 passes intact** |
| `tests/intelligence.test.js` | PASS |
| `tests/e2e.test.js` | PASS — first successful run in project history |
| `tests/ui-geometry.test.js` | PASS — new, 43 checks |

Audit findings: geometry **106 → 4**; contrast **36 → 0**. The 4 remaining
geometry findings are the deliberate `text-overflow: ellipsis` truncation of
a long topic label in a calendar cell (the string already ends in `…`), which
is intended behaviour, not a defect.

## Control tests

Per LESSONS_LEARNED, `tests/ui-geometry.test.js` was verified by deliberately
reintroducing each defect and confirming the suite **fails**. A test never
observed failing is not evidence.

| Reintroduced defect | Result |
|---|---|
| Stacked nav centring (`transform` + `margin:auto`) | FAIL × 5 viewports + FAIL on every real click |
| Ivory ink on `.chip`/`.pick`/`.segb` | FAIL on 4 mode/tab combinations |
| `<summary>` touch-target fix removed | FAIL on all 5 tabs |
| `className` rebuild + sub-screen mapping reverted | FAIL on both nav-state checks |

## Known limitations, unchanged

- Push notifications still require a VAPID key and a server this app does not
  have. The calendar-reminder fallback remains the honest path.
- **No physical iOS device testing.** All verification remains headless
  Chromium. Safe-area insets, PWA install behaviour and Web Push can differ
  on real iOS Safari. The nav now uses `env(safe-area-inset-bottom)`
  correctly, but that specific behaviour is unverified on hardware.
- Roughly 30 of ~170 campaign days still run past the configured bedtime.
  This remains a product decision (more days, earlier topic retirement, or
  reduced scope), not a scheduling bug. Two previous attempts to force-fix it
  were correctly reverted; one silently lost 279 questions.
- `surgimaster.css` still carries its 34 historical visual layers. V35 adds a
  single documented resolution layer rather than deleting them, because
  deleting them cannot be verified safe without a visual-regression baseline
  this project does not yet have. That baseline is the natural next piece of
  work.


---

# Addendum — 6.1.0 through 6.4.0

## 6.1.0 / 6.2.0 — type scale

All 400 hardcoded font sizes raised by a compressive, monotonic curve applied
in two passes. Net from the sizes V34 shipped: 7-10px -> 14px, 12 -> 17px,
14 (body) -> 20px, 20 -> 25.5px, 25 -> 29px. Small text gains most, headings
least, so hierarchy is preserved and nothing overflows.

Three components are width-constrained rather than comfort-constrained and
opt out with a layout answer instead: calendar cells drop the per-cell topic
label below 560px and give the space to the day numeral (9px -> 17px); nav
labels hold at 12.5px so "Progress" does not wrap and change the bar height;
the decorative brand tagline holds at 12.5px, having wrapped to four lines and
pushed real content a third of the way down the screen at full scale.

## 6.3.0 — Syllabus, Log, truncated text

**The Syllabus "Current phase" grid was always empty.** `renderStudy()` used
`ph = phaseNow()`, which returns an exam STYLE ("ini"/"neet"), not a curriculum
phase number. The heading read "Phase neet" (undefined name, fallback fired)
and `topics.filter(t => t.phase === "neet")` matched nothing, so the main entry
point into the syllabus rendered blank. Fixed; grid populates and the heading
reads "1. Upper GI & liver".

Fixing it exposed a second defect: those topic cards had never rendered, so
their colours had never been measured, and they carried dark-surface ink on a
light tile. Fixed in both light and dark modes.

**Phase headings were cut mid-word.** Truncated in JS with a bare
`.slice(0, 26)` and no ellipsis, so they ended as "4. Metabolic response,
wound". The curriculum's own names run to 54 characters. Truncation removed;
rows wrap instead of overflowing.

**The Log pointed at a tab that does not exist** ("on the Log tab"). Log and
Redo were merged into Practice in 4.x. Now points at "Log an MCQ" under
Practice questions.

Also: calendar cell labels 6 -> 12 chars, block topic 20 -> 40, block item
32 -> 64, plan heading 44 -> 80, and calendar month arrows raised from 30px to
the 44px touch minimum.

## 6.4.0 — simplification

**Dead CSS: 579 rules / 648 selectors removed, 183KB -> 134KB (26.9%).**

**Dead JS: 11 unloaded `visual-v*.js` modules removed (76KB).** None was
referenced by index.html or the service-worker shell; the single call into
them sat behind a permanently-false guard.

**Phase vocabulary split** into `examStyleNow()` and `curriculumPhaseNow()`.
Filed as cosmetic cleanup, it exposed a SECOND live instance of the 6.3.0 bug:
`renderViva()` filtered CURRICULUM by exam style, so its topic list was always
empty and "Today's topic" always fell back to CURRICULUM[0] while the copy
claimed it came from the current phase.

**Practice flattened.** Three sibling disclosures with the logging UI rendered
last became: due queue, the log at #revq, one collapsed "More detail". Log
controls moved from 1980px down the page to 709px. Nothing deleted.

### How the CSS deletion was verified

Two methods were tried and the first was rejected on evidence.

*Rejected — full-page pixel diffing.* The first prune appeared to change 23 of
48 states. Before investigating, the same build was captured twice as a
control: **15 of 48 states differed against themselves.** The app renders
time-dependent content, so screenshot hashes cannot prove anything here.

*Rejected — source scanning alone.* It marked `t-amber`, `t-drape`,
`sm-health-ok` and `l0` as dead. All four are built by string concatenation
(`" t-"+tone`) and all four are live.

*Also a real finding — the pruner itself was the culprit.* The browser
reported only 1 of 464 candidate selectors ever matching an element, so the
deletions could not explain the pixel change. The damage came from rebuilding
the file out of regex-parsed chunks. Rewritten to excise byte ranges from the
original string back-to-front, touching nothing else.

*Accepted — computed-style parity on identical DOM.* Hot-swap the stylesheet
`<link>` on an already-rendered page, snapshot `getComputedStyle` for 34
properties on every element, swap back, diff. Same DOM, same instant, no
reload, nothing time-dependent can drift.

| Check | Result |
|---|---|
| Computed-style parity, 48 states | **0 changes** |
| Control: one live nav rule broken | **48/48 states flagged** |
| Candidate selectors matching any element (464 tested in browser) | **1** |
| Removed selectors matching in a transient state (463 re-tested, 250 probes) | **0** |
| Control: transient run reached states the shallow census missed | **yes — 4 new classes incl. `t-rust`, `sm-v10-warn`** |

The transient-state pass closes the coverage gap left at 6.4.0's first
packaging: every interactive hook in the app (`data-lmode`, `data-qopen`,
`data-grade`, `data-procedure`, `data-mock`, `data-note`, pickers, chips,
calendar cells) is clicked in two passes — the second reaching controls that
only exist once a panel is open — and every text input is filled to reach
validation states.

Harness retained as `tests/style-parity.harness.js`.

## Suite status at 6.4.0

| Suite | Result |
|---|---|
| smoke | PASS |
| conservation | PASS — 13,729 questions x 3 intact |
| intelligence | PASS |
| e2e | PASS |
| ui-geometry | PASS — 0 findings, 5 viewports, AA contrast 3 modes x 5 tabs |

## Remaining known limitations

- Still no physical iOS device testing. All verification is headless Chromium.
- ~30 of ~170 campaign days still run past the configured bedtime. Unchanged
  product decision, not a scheduling bug.
- `surgimaster.css` is now 134KB. What remains is live, but it is still
  layered: the V35 resolution layer sits on top of earlier layers rather than
  replacing them. Collapsing those into one flat theme is the next structural
  step, and the style-parity harness is what makes it checkable.
