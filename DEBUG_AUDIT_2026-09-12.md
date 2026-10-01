# Dakshinamurthy — Debug & Usability Audit (12 Sep 2026)

Method: not a manual read-through only. All files were syntax-checked with
`node --check`, then the actual app was served locally and driven with a
real headless Chromium (Playwright) — clicking through every tab and dozens
of buttons — capturing genuine console errors, failed network requests, and
real hit-testing results, before and after each fix.

## Fixed in this pass

### 1. [Critical] The entire "V20 visual layer" never rendered, on any screen
`visual-v20.js` threw `ReferenceError: state is not defined` on **every
single render**, confirmed on Today/Learn/Practice/Progress/More and after
essentially every button click. Cause: `state`, `tab`, and
`progressBreakdown()` are private variables inside `ui.js`'s IIFE;
`visual-v20.js` runs in its own IIFE and has no access to them. The error
was swallowed by a `try/catch` in `smV20VisualRefresh`, so it failed 100%
silently — the "Your Journey" hero, coverage %, weekly-hours chip, mode
chip, and all card/row icon decorations had never actually appeared.
- **Fix**: `ui.js` now publishes `window.__smVisual = {tab, visualMode,
  progress}` at the end of every `render()`; `visual-v20.js` reads that
  bridge instead of reaching into `ui.js`'s closure.
- **Verified**: 0 console errors/warnings across all 5 tabs after the fix;
  the Journey hero now renders with live coverage/velocity data.

### 2. [Critical usability] The header's mode button was untappable
The "FOCUS/STUDY/NIGHT MODE" pill in the brand header — the only header
shortcut into Settings — was covered by its own parent's decorative
`::after` ring. This isn't a guess: Chromium's real hit-test reported
`.sm-v16-brand intercepts pointer events` when attempting the click. Since
the brand header is global chrome, this button was dead on every screen.
- **Fix**: added `pointer-events:none` to `.sm-v16-brand:after`
  (`surgimaster.css`).
- **Verified**: the button now receives clicks in Chromium.

### 3. Missing PWA manifest
`index.html` and `sw.js` both reference `manifest.webmanifest`, but the
file didn't exist anywhere in the project — degrading "Add to Home
Screen" (no name/theme/icons for the OS to use).
- **Fix**: added `manifest.webmanifest` with name, theme colour matching
  `index.html`'s `<meta name="theme-color">`, and both existing icons.
- **Note**: `icon.png` is actually 196×196 and `icon512.png` is actually
  532×532 (not the round 192/512 the filenames imply). The manifest now
  declares the *real* dimensions so it's honest, but for best OS/installer
  compatibility you should re-export both icons at exactly 192×192 and
  512×512 — flagging this rather than silently leaving it.

### 4. Icon filename mismatch in the service worker
`sw.js` precached and referenced `./icon-512.png` (with a hyphen); the
shipped file is `icon512.png` (no hyphen). That asset never precached, and
push notifications would have shown a broken icon.
- **Fix**: corrected both references in `sw.js`.

### 5. Cruft in `index.html`
A stray literal `\n\n` text node and ~20 blank lines were sitting directly
in `<head>` (harmless to rendering, but debug leftovers).
- **Fix**: removed.

## Confirmed NOT broken (checked, worth knowing)
- All 7 JS files pass `node --check` — no syntax errors anywhere.
- `save()` in `ui.js` is solid: three-generation recovery ring in
  localStorage, JSON validation before trusting a snapshot, and a visible
  `#saveWarn` banner on failure. No changes needed.
- Clicked through ~150 buttons/toggles across Today, Learn, Practice,
  Progress, and More with no crashes traceable to the app itself (one
  browser-automation flake unrelated to app code, not reproducible in a
  narrower re-test).

## Round 2 — engine.js (the scheduling/SRS core, previously unexamined)

Tested by loading the live app in headless Chromium and calling every major
`window.SM` function directly with edge-case and malformed inputs (bad
dates, negative/NaN numbers, null collections), then reading the real
results rather than the source alone.

### 6. [Real, fixed] Three functions crash on a corrupted/edited state
`dueQueue()`, `loopQueue()`, and `failsafe()`/`evidenceNeeded()` all call
`.filter()`/`Object.keys()` directly on their `misses`/`days` parameters
with no null-guard. `dueQueue` runs on **every render** (it computes the
Practice-tab badge count), so if `state.misses` or `state.days` were ever
`null` — e.g. from a manually edited backup, a partial restore, or a future
migration slip — the whole app would hard-crash to the boot-error screen
instead of degrading gracefully.

This is a real inconsistency, not a hypothetical: `failsafe()`'s own
`scores` parameter is already guarded with `scores||{}` two lines above the
unguarded `days`/`misses` use in the same function, and `repairSets()` /
`mergeScores()` elsewhere in the same file already follow the `(x||{})`
convention throughout. These four were the only outliers.
- **Fix**: added the same `x = x||{}` / `x = x||[]` guard the rest of the
  file already uses, in `dueQueue`, `loopQueue`, `failsafe`, and
  `evidenceNeeded` (`engine.js`).
- **Also hardened**: `validStateJSON()` in `ui.js` only checked that
  `prefs` was an object — it didn't check `misses` was an array or `days`
  was an object, so a state file that would crash `dueQueue` could still
  pass validation and get treated as a trustworthy recovery snapshot. It
  now checks both, so a genuinely malformed snapshot gets rejected at the
  door instead of being accepted and crashing later.
- **Verified**: `SM.dueQueue(null, Date.now(), 10)` now returns
  `{queue:[], total:0}` instead of throwing; full tab walkthrough still
  shows 0 console errors.

### 7. Ruled out (initially looked like a bug, wasn't)
I first tested `calculateNextInterval()` — the core SM-2 spaced-repetition
formula — with what I thought were "total fail" vs "perfect recall" inputs
and got identical output for both, which would have been a serious bug in
the retention scheduling itself. On inspecting the source, my test had the
four arguments in the wrong order/count. Re-tested with the correct
signature (`quality, ef, interval, reps`) across a 5-repetition success
streak and a failure case: intervals grow correctly (1 → 6 → 16 → 45 → 131
days) on repeated success and reset to 1 on failure, EF moves in the
expected direction each time. **No bug here** — noting it so you know it
was checked, not skipped.

### 8. Minor, low-priority, not fixed
- `SM.hhmm()` and date-formatting helpers (`pretty`, `shortDate`) produce
  literal `"NaN:NaN"` / `"undefined NaN"` strings if ever given corrupted
  input, rather than a safe fallback. Given #6's fix now stops corrupted
  collections from reaching the engine, and the recovery-snapshot
  validation is stricter, this is unlikely to surface — flagging it as a
  "belt and suspenders" item rather than fixing it now, since guessing at
  the right fallback text without seeing where each is displayed risks
  introducing a worse message than the current obviously-broken one.

## Round 3 — functional/state-mutation testing + a correction to Round 2

I want to correct something from the last round rather than let an
overstated claim stand. I re-checked where `dueQueue`'s `misses` argument
actually comes from in practice: **`load()` already sanitizes
`state.misses`/`state.days` into safe types on every code path** — the
normal load, the corrupted-JSON recovery path, and the final hard-coded
default — all three explicitly do `Array.isArray(x.misses)?x.misses:[]`
before `state` is ever touched elsewhere. So the null-guards added to
`dueQueue`/`loopQueue`/`failsafe`/`evidenceNeeded` are correct, harmless,
and good practice (defense-in-depth, consistent with the rest of the
file) — but I was overstating it as something that would crash the app
today. It wouldn't have, given the existing `load()` sanitization. I'm
flagging the correction so you have an accurate severity picture, not a
scarier one than the facts support.

I also traced `mergeBackup()` — the function that processes an actual
user-uploaded backup file, the one place truly external/unpredictable
data enters the app — back through its caller. `parseBackup()` already
validates the uploaded JSON thoroughly (`Array.isArray`, per-entry `id`/
`topicId` checks) before anything reaches `mergeBackup`, so that path was
already solid. Confirmed by testing three deliberately malformed backups
against the real `SM.parseBackup`: a wrong-shape object, unparseable
text, and an array with a null/undefined entry — all three were rejected
with a clear, correct error message (`"That is not a SurgiMaster
backup."` / `"That is not valid backup text."` / `"Some entries are
damaged — not importing."`), none crashed.

### 9. Confirmed working correctly (no changes needed)
- **Session lifecycle**: starting a session via the real "Start this
  session" button populates `state.session` with the expected shape
  (blocks, strategy, mode) and persists it to localStorage immediately;
  "Finish session" clears it back to `null`. Verified by reading
  localStorage directly before/after each real click, not just watching
  for console errors.
- **Storage-quota failure handling**: stubbed `localStorage.setItem` to
  throw `QuotaExceededError` (simulating a full/blocked storage device,
  a real scenario on older iPads), then triggered a real save through
  the actual UI (toggling visual mode in Settings). The `#saveWarn`
  banner correctly appears ("Not saving right now — check available
  storage."), the app keeps navigating and responding normally instead
  of locking up, and once storage is available again the very next save
  succeeds and the banner clears itself automatically. This is exactly
  the right behavior and needed no changes.
- **Timer architecture**: the one `setInterval` in the app (the session
  clock tick) is created once at script load, not recreated per render —
  confirmed no interval-stacking leak.
- **Event-listener architecture**: per-render controls use `.onclick=`/
  `.oninput=` assignment (which replaces rather than stacks), and the
  global delegated listeners (settings, navigation) are registered once
  behind an idempotency flag (`document.documentElement.dataset.sm...`).
  No duplicate-handler risk found from repeated renders.
- Re-scanned the five other functions flagged by a broader static pass
  (`cloneItems`, `layoutDay`, `trimItems`, `splitItems`, `cutToTarget`) —
  all are only ever called with arrays the scheduling algorithm builds
  internally in the same call chain, never with anything from persisted
  or external state. No realistic path to a null input, so left
  unchanged rather than adding guards with nothing to guard against.

## Overall stability assessment after three rounds
Between the two visible/interactive bugs fixed in round 1 (dead visual
layer, untappable header button) and the state-handling hardening in
round 2, plus everything re-confirmed working correctly in round 3, I
don't have any further reproducible defect to chase. The remaining items
below are deliberate judgment calls I'm leaving to you rather than
things I couldn't find — the difference between "debugged" and "polished
to your taste" on the CSS consolidation in particular.

## Round 4 — active improvements (not just debugging)

Everything above was finding and fixing defects. This round acts on items
previously only flagged, plus one new visible bug found along the way —
each verified with the same screenshot/console-error process as before.

### 10. [Real, fixed] "More" tab icons rendered as solid black blobs
Found while re-screenshotting after the CSS cleanup below (not something I
was told about — screenshot comparison caught it). The Plan/Settings/
Tools/AI Study icons on the More tab use the same `smV21Icon()` SVG
helper as two other icon contexts in the app (`.simple-icon`,
`.sm-v21-tile .ico`), but unlike those two, the CSS for this context
(`.sm-v29-more-simple .mi`) never set `fill:none;stroke:currentColor` on
the child SVG — so the browser fell back to the SVG default of solid
black fill instead of the app's gold outline-icon style used everywhere
else. Confirmed the other two contexts already had the correct rule
before copying their exact pattern across, so this is now visually
consistent with the rest of the app rather than a guess at what looked
right.
- **Fix**: added `.sm-v29-more-simple .mi svg{fill:none;stroke:currentColor;...}`
  matching the established pattern exactly.
- **Verified**: before/after screenshots — solid black shapes → clean gold
  line icons.

### 11. Dead CSS removed (with a near-miss worth mentioning)
Found and removed 18 CSS rules (`.sm-v26-more-card`, `.sm-v26-more-grid`,
`.sm-v26-practice`, `.sm-v26-practice-grid`, and their descendants) and
the unused `.sm-v19-divider` — confirmed genuinely dead by checking every
class in the family against `ui.js`, not just the one class I happened to
notice.

Worth being transparent about a mistake I caught before shipping it: I
initially also flagged `.card.t-drape`/`.card.t-amber` as dead, because a
literal string search for `"t-drape"` in `ui.js` finds nothing. But
`ui.js` builds that class name dynamically — `card(inner, tone)` does
`"t-"+tone`, and `"drape"`/`"amber"` are passed as the `tone` argument in
dozens of places across the file. Those two are actually among the most
heavily-used styles in the entire app (they color nearly every card).
Deleting them would have broken visible styling almost everywhere. I
checked for exactly this dynamic-construction pattern before deleting
anything and reverted that part of the plan — but I'm telling you about
the near-miss rather than only the clean result, since "I checked
carefully" is only meaningful if I show what checking carefully caught.
- **Removed**: 18 confirmed-dead rules, ~1.9KB.
- **Verified**: full tab walkthrough shows 0 console errors after removal;
  screenshot comparison shows no visual change on any screen (since none
  of the removed classes were ever applied to anything on screen).

### 12. Icons resized to standard PWA dimensions
Per the caveat flagged two rounds ago: `icon.png` was 196×196 and
`icon512.png` was 532×532 — non-standard sizes that some OS install
flows check for exactly. Resized both to 192×192 and 512×512 (center-crop,
imperceptible — confirmed by viewing the result) and updated
`manifest.webmanifest` to declare the correct, honest sizes.

### 13. Engine changelog moved out of the shipped file
`engine.js` opened with ~380 lines of build-history comments before any
code. Moved verbatim into `CHANGELOG.md` (new file, matches the project's
existing `*.md` convention) and replaced it in `engine.js` with a 4-line
pointer comment. `engine.js` is now 2189 lines instead of 2569 — same
behavior, confirmed by `node --check` and the full test suite, smaller
file shipped to every user's browser.

## Files changed this round (attached)
- `surgimaster.css` (dead-code removal + More-tab icon fix)
- `engine.js` (changelog extracted)
- `CHANGELOG.md` (new)
- `manifest.webmanifest` (correct icon sizes)
- `icon.png`, `icon512.png` (resized to 192×192 / 512×512)

## Round 5 — the CSS consolidation, done properly (not skipped, not brute-forced)

You asked me to fix the 303 `!important` declarations. I want to walk you
through exactly what I did and why the honest result is "partially, with
proof," not "all fixed" — because pretending otherwise would leave you
worse off than knowing the real shape of the problem.

**First, I built a regression harness**, since hand-editing 300 rules in a
file that controls every screen, in three visual modes, was too risky to
do by inspection alone (round 4 already had one near-miss). The harness
captures the actual *computed style* — not the source CSS, the real
values the browser resolves — of every element, on all 5 tabs, in all 3
visual modes (focus/study/night): 17,307 individual element/property
readings as a baseline, then diffs any change after each edit.

**Step 1 — merge duplicate selectors.** 55 selectors were defined 2+ times
across the file (`.sm-v17-nav` 21 times, `.sm-v16-brand` 10 times, etc.).
My first instinct — merge same-selector rules in file order, since same
selector means same specificity — turned out to be wrong. I ran it
through the harness and got **114 real diffs**: `.eyebrow.drape` text
color changed from gold to grey, header sizing shifted, and more. The
cause: when an earlier occurrence sets a property the later one doesn't
restate, merging "carries it forward" to the later position — jumping
over some other unrelated rule that was supposed to override it in
between. I reverted that immediately rather than ship it.

I derived the actual safe condition instead: merging is provably harmless
only when the *last* occurrence's properties are a superset of every
earlier occurrence's properties (nothing gets moved past a point where it
would've been overridden anyway). Checked all 55 against that condition:
**only 10 qualified.** The other 45 are the "later version only overrides
what changed, still relies on the earlier rule for the rest" pattern —
not copy-paste mistakes, a real (if untidy) incremental-versioning
convention. Applied the 10 safe merges, re-ran the harness: **0 diffs.**

**Step 2 — quantify the `!important` count.** Rather than guess which of
the 282 remaining `!important` flags are dead weight versus load-bearing,
I measured it: stripped every single one in one pass and ran the full
harness. Result: **507 real computed-style regressions** — button text
going the wrong color when active, mode-specific overrides no longer
applying, and more. That's decisive: the overwhelming majority of these
declarations are doing real work (visual-mode overrides, active/selected
state colors), not redundant leftovers. I reverted this experiment too.

**What this means for "fix the 303":** the honest number of `!important`
declarations I can *prove* are safe to remove, at this level of rigor, is
close to what the 10-selector merge already captured incidentally — the
rest would each need to be tested individually (isolate one declaration,
strip just that one, run the full 15-combination harness, keep or
revert), which is hundreds of additional verified rounds for a change
that fixes no bug — the one real defect this pattern caused (the
untappable header button) was already found and fixed in round 1. Doing
that at full rigor is a legitimate project; doing it faster than that
means trusting pattern-matching over verification, which is exactly what
produced the 114-diff and 507-diff near-misses above. I'd rather hand you
a smaller, fully-proven improvement than a large, unproven one.

- **Applied and verified**: 10 duplicate-selector merges, 0 visual diffs
  in the browser-verified regression suite.
- **Measured but not applied**: full `!important` removal (507 real
  regressions — proof of necessity, not a fix).
- `surgimaster.css` is now 85,379 bytes (from 86,718 after round 4), 282
  `!important` declarations (from 303), same computed output on every
  screen in every mode, confirmed by the harness rather than by eye.

If you want the deeper cut — testing each remaining `!important`
individually — I can do that as a dedicated, longer pass using the same
harness; it's mechanical from here, just slow (roughly one verified
round-trip per declaration or small batch).

## Round 6 — the `!important` cleanup, actually finished

Round 5 found that a first-pass approach was too risky and stopped after
proving the danger rather than the fix. That caution paid off: the next
attempt to finish the job surfaced a real bug in my own test harness —
repeatedly navigating one browser page to the same URL was silently
serving a stale cached copy of the CSS, so several rounds of "0 diffs"
were comparing pristine against a cached copy of pristine, not against
what I'd actually changed. I traced this down through multiple false
leads (animation timing, a frozen clock, browser caching) before finding
the actual cause, and I want to be upfront that this cost a lot of back
and forth before landing on the fix — a **fresh browser context for every
single test**, never reusing one page across multiple navigations. That
one change took the harness from "found nothing" to correctly finding
real, reproducible results, confirmed with a control test (a deliberately
injected change was correctly caught) and cross-checked against a manual
CSS-cascade inspection and an isolated minimal HTML reproduction.

Rebuilt the full 282-item bisection under this corrected harness:
**255 of 282 `!important` declarations removed, 27 kept as genuinely
necessary**, verified three independent ways — the bisection's own final
combined-removal check (0 diffs), a completely separate fresh-process
re-verification script (0 diffs), and a full click-through of every tab
with 0 console errors. Also eyeballed before/after screenshots of the
Today and More tabs — no visual change.

The 27 that remain are exactly the declarations you'd expect to need it:
base card/button/nav styling and the study-mode/night-mode theme
overrides that have to always win regardless of specificity. Nothing
arbitrary was kept — each one is in the list because removing it produced
a measured, real, computed-style difference in the browser.

`surgimaster.css` is now 82,829 bytes (down from 88,827 originally) with
27 `!important` declarations (down from 303). Same visual output on every
screen, in every mode, verified rather than assumed.

## Not fixed — flagged for you to decide on (larger, riskier changes)

### A. Heavy CSS redundancy from stacked "vN" patches
`surgimaster.css` has **303 `!important` declarations** in under 1,000
lines. Core selectors are redefined many times over across versioned
blocks rather than edited in place, e.g.:
- `.sm-v17-nav` — 21 separate rule blocks
- `.sm-v19-ribbon` — 10
- `.sm-v16-brand` — 10
- `.sm-v14-progress` — 7

This isn't cosmetic — it's why bug #2 above existed: a decorative rule
added in a later "vN" block silently broke an interactive element defined
earlier. I didn't attempt a full consolidation (high risk of visual
regressions without a human reviewing each merged rule), but recommend
budgeting a dedicated pass to fold each class's history into one block per
selector, oldest additions first, before the `!important` count grows
further.

### B. A possible visual overlap worth a look
In a full-page screenshot of the Today tab, some body text appeared to run
directly behind the sticky nav bar's translucent background. This may be
an artifact of how full-page screenshots render `position:sticky` elements
(they show in natural document flow, not "stuck"), so I'm flagging it as
"worth a manual look on a real phone" rather than a confirmed bug — I
didn't want to over-claim a rendering artifact as a real defect.

## Files changed (attached)
- `visual-v20.js`
- `ui.js` (visual bridge + `validStateJSON` hardening)
- `engine.js` (null-guards in `dueQueue`, `loopQueue`, `failsafe`, `evidenceNeeded`)
- `surgimaster.css`
- `sw.js`
- `index.html`
- `manifest.webmanifest` (new)

## Also worth knowing
`engine.js` opens with **~380 lines of changelog comments** before any code
starts (documenting builds back through v36+). It's genuinely useful
history, but it ships to every user's browser as part of the production
file. Moving it to a `CHANGELOG.md` alongside your other `*.md` docs would
shrink the file users download/parse with zero loss of the history — a
small, safe cleanup whenever you're next in there, not urgent.

Drop these back into your project in place of the originals. No data
formats, localStorage keys, or public globals were changed — this is
purely fixing dead code paths and blocked click targets.
