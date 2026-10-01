# Lessons learned — read before changing this codebase

Hard-won facts from real debugging sessions on this project. Every item
here cost real time to discover once; the point of this file is that it
should never cost that time again.

## Testing methodology

**Never reuse one browser page/context across multiple navigations when
testing state changes.** Repeated `page.goto()` calls to the same URL can
be served a stale cached response from the first navigation. This
produced a real false result — a same-moment, zero-change comparison
that still reported hundreds of differences — before the actual cause
was found. Always use a fresh `browser.newContext()` (or full new
browser) per test scenario that changes state and re-checks it.

**A control test is not optional.** More than once in this project's
history, a test suite reported "PASS" while testing nothing real — either
because the harness itself had a bug (see above), or because the thing
being tested had an independent fallback elsewhere that made the specific
line under test irrelevant (see `migrateState()` below). Before trusting
any new test, deliberately break the thing it claims to test and confirm
the test actually fails. If it doesn't fail, the test isn't testing what
you think it's testing.

**`load()` migrates state in memory but does not immediately persist it.**
`normalizeState()`/`migrateState()` upgrade the in-memory `state` object
on every load, but nothing is written back to `localStorage` until the
next real `save()` — which happens naturally from almost any user action,
but NOT from just clicking through tabs. A test that seeds an old-format
state, loads the page, and immediately reads `localStorage` back without
triggering a save first will see the old, unmigrated shape and draw the
wrong conclusion.

**Verify claims empirically, including your own.** Multiple external "QA
reports" and reviews received during this project's history claimed
things that turned out to be stale, already-fixed, or simply untested by
the author. Re-run any test suite independently rather than trust a
reported "PASS." The same standard applies to your own past reasoning —
several genuine bugs in this project were found specifically by
double-checking an assumption that felt obviously true.

## Architecture facts specific to this app

**There is one spaced-repetition algorithm: `SM.calculateNextInterval`
(SM-2), in `engine.js`.** It is extensively tested and its growth curve
(1 → 6 → 16 → 45 → 131 days on repeated success) is verified. Any new
feature needing spaced review — procedures, future content types, anything
— should call this function, not invent a second one. This project has
already had to walk back a hand-rolled interval curve once (the
procedural-rehearsal feature originally used its own 1.8x multiplier
before being unified onto SM-2).

**`error-handler.js` must load first in `index.html`**, before every
other script. It installs the global `window.onerror` handler; loading it
last means a catastrophic failure in any earlier script goes uncaught and
unlogged. Guarded permanently by `tests/smoke.test.js`.

**A `<details>` element does not survive a re-render without help.**
`render()` replaces `#app`'s entire `innerHTML` on every call. A
`<details open>` you added programmatically will render collapsed again
on the very next render unless you explicitly re-add the `open` attribute
based on whatever view-state should keep it expanded. Found and fixed
once already (the Procedural Skills section, since removed/replaced, hit
this first).

**The scheduler's question-conservation invariant is the single most
important thing in this codebase.** "The 3 passes must cover 100% of the
MCQs three times over" is a hard, explicitly-stated priority, not a nice-
to-have — this project's own history documents a real incident where a
scheduling change silently dropped 279 questions before being caught and
reverted. `tests/conservation.test.js` pins the exact numbers (679
lectures, 9,603 bank + 4,126 speed = 13,729 questions, covered exactly
once in pass 1 and fully in passes 2 and 3). Any change to `buildPlan()`
or its helpers must keep this test green. If you need to free scheduling
capacity, do it by reducing time-per-question for genuinely mastered
topics (see `masteryFactor`/`masteryPace` in `engine.js`) — never by
reducing question counts.

**`migrateState()`'s per-field version gates are largely redundant with
`normalizeState()`'s own unconditional defaults.** Found while building
`tests/e2e.test.js`: breaking almost any single `if(v<N){...}` field
backfill in `migrateState()` produces no observable difference, because
`normalizeState()` independently coerces every one of those same fields
to a safe shape regardless of version. The one genuinely unique thing
`migrateState()` provides is the `diagnostics.lastMigrationAt` timestamp.
This isn't a bug — it's harmless defense-in-depth — but don't assume a
version gate is load-bearing just because it's there; check what actually
depends on it before touching it.

**Two separate procedural/spaced-review systems have existed at different
points in this project** — a user-extensible one (add your own skill and
checklist) and a fixed-catalogue one (four pre-defined procedures with
clinical/exam weighting). The fixed one is current. If you're looking for
the user-extensible version and can't find it, it was intentionally
replaced, not lost — see the CHANGELOG entry for the 4.2.0 merge.

**`topicImportance()` should use the curriculum's own `yINI`/`yNEET`
yield fields, not keyword-match topic names.** Already fixed once — a
name-regex approach silently mis-weighted at least one real topic
(Bariatric Surgery, the lowest real yield in the curriculum, matched no
keyword and got a default mid-range weight instead). If you add a new
importance/priority signal, check whether the data you need already
exists in `CURRICULUM` before approximating it from something else.

## Known, accepted limitations (not gaps to silently "fix")

- **Push notifications require a VAPID key and a server this app doesn't
  have.** The UI is honest about this (see `#enablePush`'s messaging) and
  provides a working calendar-reminder fallback instead. Don't add code
  that pretends push works without a server.
- **No physical iOS device testing has been done.** All verification in
  this project's history has been headless Chromium via Playwright.
  PWA install behavior, safe-area insets, and Web Push support can
  genuinely differ on real iOS Safari.
- **Roughly 30 of ~170 campaign days still run past the configured
  bedtime** even after the mastery-pace fix above, which only frees
  capacity progressively as real mastery accumulates — it does not
  retroactively fix today's schedule. Two earlier attempts to force-fix
  this by cutting or relocating content were tried and correctly reverted
  (one silently lost 279 questions). Any further fix here is a product
  decision (more days, earlier topic retirement, reduced scope), not a
  scheduling bug to patch.

## UI and CSS (added V35, after the first real-browser geometry audit)

**Nothing in this project measured the rendered page until V35.** Every
earlier test checked source text or in-memory state, and every earlier QA
report that said "UI: PASS" was reporting on code it had read, not pixels it
had measured. That gap let the bottom navigation ship OFF-SCREEN — at 390px
the Today button sat at x = -145 and Learn at x = -78, so the two most
important tabs in the app were unreachable on a phone. `npm test` was green
the whole time. If a defect is a geometry or paint fact, only a browser can
see it: `tests/ui-geometry.test.js` exists for exactly that class of bug and
should be extended rather than bypassed.

**Media queries do not raise specificity.** The rule that would have fixed
the nav on phones — `@media(max-width:520px){.sm-v17-nav{position:fixed;
left:11px;right:11px}}` — never applied, because `body.dm-ui33 .sm-v17-nav`
outranks a bare `.sm-v17-nav` regardless of which media block it sits in. A
mobile override of a body-scoped rule must itself be body-scoped. This rule
sat in the file looking like a fix for two releases while doing nothing.

**Two centring methods stack.** `left:50%;transform:translateX(-50%)` is
correct for `position:fixed`. `margin:0 auto` is correct for a sticky or
static block. Applying both slides the element half its own width. When you
change an element's `position`, re-check every offset and transform that was
written for the old positioning model — they do not become inert.

**A theme layer that changes the page surface must state the text colour for
every component that keeps its own surface.** The dm-ui33 light-parchment
layer set generic ink to near-black without excluding the v25/v26 components,
which keep dark maroon backgrounds. "Climb, don't chase." — the home-screen
headline — rendered at 1.02:1. Worse, `.chip`/`.pick`/`.segb` got a light
background from dm-ui33 but no ink, so they inherited `--sm-ivory` from the
old dark theme and rendered at 1.03:1: the Right / Fragile / Wrong self-rating
buttons, the core of the SM-2 loop, were blank rectangles in the shipped V34.

**Measure the composited background; never infer it from the theme's
intent.** The first V35 contrast fix darkened every muted token on the
reasoning that "dm-ui33 is a light theme," and made several elements worse —
the v14 journey card and the calendar grid are dark-maroon leftovers sitting
inside a light page, and `.muted` even resolves onto a light surface on Today
and a dark one on Learn. Walk the ancestor chain, composite the alphas AND
the gradients, then choose ink. Where a component's surface is the odd one
out, normalising the surface beats patching ink per class.

**Fixing the light modes can silently break the dark one.** The section-3
light-surface normalisation was correct for Focus and Study and wrong for
Night, where section 8 had just made those same surfaces dark. Always re-run
the contrast sweep across ALL THREE visual modes; a mode-specific override
must be scoped one level deeper (`body.dm-ui33[data-sm-mode="night"]`) so it
outranks the general rule and only there.

**Override text tokens, not surface tokens.** A Night rule that redefined
`--panel`, `--line2` and `--drape` alongside `--muted` took contrast failures
from 10 to 17, because those tokens are used as BACKGROUNDS elsewhere and
flipped several surfaces light. Redefining `--muted` alone fixed every
unclassed `<span>` in the day timeline at once with no side effects.

**A passing contrast test is not the same as a working dark theme.** Night
mode passed every automated check while the brand card was still a cream
slab — dark ink on light card scores fine. Look at the screenshot as well as
the numbers.

**Check that a "graceful skip" is not skipping everything.** `tests/e2e.test.js`
tested the three visual modes with `const b = await page.$('[data-visual-mode=...]');
if (b) { ... }` at a point in the flow where those buttons never exist — they
live on the Settings sub-screen, reached from More, not on any nav tab. The
test reported PASS for three releases while asserting nothing. This is the
"test that tests nothing" failure mode already described above, in a new
costume: an `if` that is always false is indistinguishable from a passing
test unless you deliberately break the thing it claims to check.

**Markup placed inside `#app` in index.html is dead on arrival.** `render()`
replaces `#app`'s entire innerHTML on first paint, so the static
`.sm-v19-ribbon` brand header in index.html was destroyed before the user
ever saw it. Anything that must persist belongs outside `#app`.

**`className = "..."` on a nav button deletes classes you did not put there.**
The render loop rebuilt `className` from scratch and silently dropped the
`secondary` class that index.html gives the More button. Use
`classList.toggle()` for state classes.

**settings / plan / ai are sub-screens, not tabs.** They have no matching
`data-tab`, so the "which nav button is active" loop matched nothing and the
whole bar went unhighlighted, leaving the user with no indication of where
they were. They now map to More, which is how they are entered.

## Verification methods (added 6.4.0, while deleting dead CSS)

**Full-page pixel diffing does not work on this app.** Capturing the SAME
build twice produced 15 differing states out of 48. The app renders
time-dependent content, so screenshot hashes are not a stable signal and a
"23 states changed" result proved nothing about the change under test. This
is the same false-comparison trap recorded at the top of this file, in a new
form — and it was caught only because the capture was deliberately run twice
against itself as a control.

**The method that does work: hot-swap the stylesheet on an already-rendered
page.** Point the `<link>` at the old file, snapshot `getComputedStyle` for 34
properties on every element, point it at the new file, snapshot again, diff.
Same DOM, same instant, no reload, so nothing time-dependent can drift. This
reported 0 changes across 48 states for the dead-CSS prune, and 48/48 when one
live nav rule was deliberately broken as a control. Harness kept as
`tests/style-parity.harness.js`.

**Never decide a CSS selector is dead by reading it.** Three sources were
needed and the first two were each wrong on their own:
source scan alone marked `t-amber`, `t-drape`, `sm-health-ok` and `l0` dead —
all four are built by string concatenation (`" t-"+tone`) and all four are
live. The authoritative test is `document.querySelector(sel)` in the browser,
across every screen, with `<details>` forced open; of 464 candidates that
survived the first two filters, exactly 1 matched anything.

**Do not rebuild a stylesheet to prune it; edit it in place.** The first
attempt reassembled the file from regex-parsed chunks and changed rendering,
even though the selectors removed were provably inert — the damage came from
the reassembly (dropped bytes, reordered `@media` contents), not the deletions.
Removing byte ranges from the original string, back to front, left everything
else untouched.

**Renaming an ambiguous identifier finds bugs.** Splitting `phaseNow()` into
`examStyleNow()` and `curriculumPhaseNow()` was filed as cosmetic cleanup. It
immediately exposed a second live instance of the bug that motivated it —
`renderViva()` filtering `SM.CURRICULUM` by an exam style, so its topic list
was permanently empty. If a name can mean two things, assume both meanings are
already in the codebase and go looking.


## Flattening the layer stack (6.5.0) — what worked and what did not

**`body.dm-ui33` is present in every state**, verified across 3 modes x 5 tabs.
That means `body.dm-ui33 X` and `X` match identical element sets, which is what
makes a textual collapse of the layer stack theoretically possible. Do not
assume it for `body[data-sm-mode="night"]` or `html:has(...)` — those are
conditional and match subsets.

**Resolving the whole cascade textually is harder than it looks.** An attempt
that grouped rules by body-stripped selector, ranked them by
(important, specificity, source order) and deleted the losers changed rendering
in 48 of 48 states — `html` lost its inherited colour and 154 elements differed
on Today alone. Property-name-exact matching and per-media grouping were not
sufficient; something in the ranking or the grouping was wrong. Reverted.

**What is provably safe: identical selector text in an identical @media
context.** Those are the same rule written N times by N layers, and the last
declaration of a property wins by definition. No reasoning about element sets
is required. 82 such groups existed; collapsing them removed 165 declarations
with 0 computed-style changes across 48 states.

**A control test that passes for the wrong reason is worthless.** The first
control for this change broke `body.dm-ui33 #app{` and the harness reported 0
differences — which looked like a harness failure. The selector existed four
times over, so removing one copy genuinely changed nothing: the control was
ambiguous, not the harness. Always assert that the deliberate break actually
altered the file AND that it targets something not duplicated elsewhere.


## Flattening, second pass (6.6.0)

**A declaration serves every selector in its rule's list.** Removing it because
it is shadowed for ONE of them is wrong. `html,body{background;color}` with a
later `body.dm-ui33{color}` shadows only the `body` half; deleting `color` cost
`html` its inherited colour in all 48 states. Remove only if shadowed for ALL
selectors in the list.

**Never split a selector list with `sel.split(',')`.** It shreds
`:is(.h1,.h2,b,strong)` into `b` and `strong`, which then appear to shadow the
real `b{}` and `strong{}` rules. This mangled font-weight on 45 elements while
looking like a specificity bug. Split on top-level commas only, tracking
parenthesis depth.

**A naive specificity counter cannot model `:is()`, `:where()`, `:not()` or
`:has()`.** Exclude rules containing them rather than guess. Even after doing
so, 9 of 48 states still regressed — the honest response was to narrow to
single-selector rules, verify 0 changes, and ship that, not to keep guessing.

**Narrow until it verifies, then stop.** Four attempts went 48 -> 21 -> 9 -> 0
regressed states by progressively restricting scope. The 1.4% that shipped is
worth more than the 10.9% that did not, because it is proven. Scope is the
variable to trade, not confidence.


## Flattening, completed (7.0.0)

**Bisect; do not reason.** Two passes failed to explain a 9-of-48 regression by
inspection. A binary search over the 106 candidate deletions found it in seven
runs: exactly one was bad. Printing that one candidate showed the cause
immediately — a comment where a selector should have been.

**A CSS parser that finds selectors by backtracking to the previous `{`, `}` or
`;` will walk into comments.** Prose then becomes a selector, and any grouping
keyed on selector text silently merges unrelated rules. Here it merged
`.callbl` with `.calcell` and deleted a live `display:none`. Analyse the
comment-stripped selector, and when deleting a whole rule start after the last
`*/` so documentation is not deleted with it.

**Build the bisect harness before the fix, and control it.** The first bisect
loop re-read the already-modified stylesheet each iteration, compounding
changes, and reported the no-op case as broken. The control (LIMIT=0 must give
DIFF=0) caught it. Any search harness needs a no-op case that provably passes
before its results mean anything.

**Model specificity properly or exclude what you cannot model.** The counter
that stripped pseudo-classes and counted the rest could not represent `:is()`.
Excluding those rules shipped a correct-but-small 1.4% in 6.6.0; implementing
the real W3C rules — unit-checked against 8 known cases first — got 5.4% more
with the same zero-regression guarantee.


## Test the paths the app does not take every day (7.3.0)

`specialDay()` threw ReferenceError on `day.date` for its entire shipped life.
It broke ICS export outright and would have failed to render 72 of 246 campaign
days. Five green suites missed it because every one of them exercises ordinary
content days: they build the plan, but they never render a rest day and never
export a calendar.

The lesson is not "write more tests". It is that a suite which only walks the
common path will stay green through a total failure of the uncommon one, and
the uncommon path here was 29% of the user's year. When auditing, enumerate the
STATES the data can take (kinds, empty, error, boundary) and touch each one,
rather than repeating the happy path at more viewports.

Related: this was found by calling engine functions directly from node, not
through the UI. The UI only reaches specialDay on a day that happens to be
special, so browsing the app on a content day looks perfectly healthy.


## Assert the inverse (7.4.0)

Fields saved locally but missing from the backup payload have now been found
five times: mocks; then pace, hist and calls; then adaptiveProfile and
adaptive4. Every instance was silent — restore succeeds, reports success, and
returns part of the user's history to empty.

A round-trip test existed the whole time. It kept missing them because it
asserted "these named keys survive", and a test that names keys cannot notice
a key nobody added. The fix is to derive the expected set from the code that
defines it (`normalizeState`) and assert the INVERSE: every persisted key is
either exported or on an explicit exclusion list with a stated reason. That
turns "someone remembered" into "the build fails".

It worked immediately: the derived check found `adaptive4` and `ics` on its
first run, after I had already read the same code by hand and missed both.

The general form: when a bug recurs, the test to write is not another example
of it. It is the one that enumerates the space the bug lives in.


## Pin down what is already right (7.5.0)

The storage-resilience audit found no defects — the save path already warns
instead of failing silently, preserves the last good state on a failed write,
and recovers through a 3-deep ring. The right response to that is not to move
on; it is to write the test. This behaviour is invisible in normal use and only
observable on the day a device runs out of space with months of logged answers
on it, which is the worst possible moment to discover it regressed.

Also: when a probe reports a failure, suspect the probe first. Both initial
findings here were mine — a hardcoded storage key that did not match the app's,
and a save trigger that clicked a control not present on the current screen.
Hardcoded identifiers and assumed-present elements are the two ways a harness
lies. Derive the identifier from the app, and assert the control exists before
depending on it.


## Search relevance is mostly ranking (7.6.0)

Matching was the easy half. All three serious defects in the search feature were
ranking, not recall:
- Synonyms added as extra REQUIRED tokens made "hpb" demand five words at once
  and return nothing. Synonyms must be ALTERNATIVES within a token group, and
  discounted against the user's own word — at a 0.72 discount the synonym
  "test" still prefix-matched "Testis" and beat the real mock days; 0.55 fixed
  it.
- 246 scheduled days against 39 topics at equal weight drowned every topic.
  Weight results by what they ARE, not only how well they matched.
- Requiring every token is right when it finds something and useless when it
  does not. Fall back to discounted partial matches rather than returning
  nothing, or "vague" queries fail exactly when the user needs help most.

## A test suite is scoped, and its scope is a place bugs hide (7.6.0)

The contrast sweep scanned `#app *, nav *`. New UI added outside those two
roots — the search shell — was invisible to it, so result titles that rendered
near-black on a dark block passed every check. The rows are <button>s and had
inherited the legacy maroon fill; nothing in the suite was looking.

Two habits follow. When adding UI outside the existing roots, extend the sweeps
to cover it in the same change. And a panel that is `display:none` during a
sweep contributes nothing and passes silently, so the sweep must open it first.

Both defects here were caught by looking at a screenshot. Nine green suites did
not see either.


## When UI is removed, retarget the tests rather than deleting them (7.7.0)

Removing the tab bar invalidated ten assertions in the geometry suite. The
temptation is to delete them with the bar. But the defect they were written for
— fixed chrome sliding partly off screen because two positioning methods
stacked — is a property of fixed chrome, not of that particular bar. Pointed at
the new launcher, the same checks still earn their place.

The redesign also created a new correctness property that did not exist before:
with no persistent bar, a destination missing from the grid is a screen with NO
route to it. That is worth an explicit test (every known tab value must appear
in the grid), because it cannot be noticed by looking at the screen — the app
looks fine, the screen is simply unreachable.


## A dead rule in a stylesheet is a landmine, not a leftover (7.8.0)

`nav{left:50%;transform:translateX(-50%)}` was written for the centred bottom
bar. That bar was removed in 7.7.0. In 7.8.0 a new vertical rail was added as a
`<nav>` and instantly inherited the rule, rendering dead centre on a 390px
screen — the same stacked-centring failure that put the original tab bar off
screen in V34, three releases and one full CSS flattening later.

The flattening could not remove it: the rule was live, because a `<nav>` existed
at the time. The lesson is that element-typed rules (`nav`, `button`, `h2`)
survive the removal of the component they were written for and ambush the next
element of that type. Prefer a class. When adding fixed chrome, reset `left`,
`right`, `transform` and `margin` explicitly rather than assuming the cascade
starts clean.


## The bare-unscoped-rule landmine, four more times (8.0.0)

Every serious defect in the 8.0.0 restructure was the same failure already
named in this file for `nav{width:...}`: a rule with no `body.dm-ui33` scope,
written for the pre-restructure dark theme, matching new elements it was never
written for. This time: `nav{width:min(760px,calc(100% - 28px))}` (both new
bars, 28px too narrow); `button:not(.navbtn),.btn{background:var(--sm-elevated)
!important}` (mode-selector buttons never actually changing colour, and the
My Day link going dark-on-dark the moment it became a `<button>`); and four
bare tone classes (`.drape`, `.rust`, `.sky`, `.violet`) with no light-mode pin
and no night-mode brightening, unlike their sibling `.amber` which had both.

The pattern to internalise: **any bare element or class selector without
`body.dm-ui33` is a trap for the next thing that happens to match it.** This
is not a one-off bug to fix and move past; it is a property of this
stylesheet's history that will keep producing exactly this failure until the
bare rules are found and scoped systematically, not one collision at a time.

## Untested tabs stay broken indefinitely (8.0.0)

Plan, Settings and Coach were never in the contrast sweep's tab list — it
predates them, written when the app had 5 tabs. All three of the tone-class
and mode-button bugs above were sitting in shipped code, unnoticed, for as
long as those screens have existed. They surfaced the moment the 11-tab
restructure put every real destination into the same list the tests already
walk. A test that does not cover a screen is not weak evidence that the screen
is fine; it is no evidence at all.

## Diagnose from the DOM, not from reading CSS (8.0.0)

Every fix in this release came from the same three-step loop: reproduce in a
live browser, read the FAILING element's actual computed style and its
ancestor chain for the effective background, then find the specific rule
responsible. Guessing the cause from grepping source repeatedly missed —
`.big2.drape`'s colour looked at first like it must come from `.card.t-drape`,
and only measuring `getComputedStyle` directly showed it was the bare `.drape`
class matching independently. Read the computed value; then find the rule.


## Uncalled is not the same as dead (9.0.0)

Six functions had no call site. Three were genuinely dead helpers. Three were
working features — procedural rehearsal, smart reminders, system health — that
had lost their call site during earlier restructures and were reachable only by
reading the source. Deleting all six because a grep said "uncalled" would have
removed real functionality that took real work to build.

Worse, the check that made `smProceduralCard` look dead was itself wrong: it
guards on `SM.PROCEDURES`, and a node check loading only `engine.js` reported
that undefined. `intelligence.js` defines it — 4 procedures with critical-step
scoring. **Load the whole app before concluding a guard can never pass.**

What actually saved it was `tests/intelligence.test.js` failing on deletion.
But note what that test really checks: that a string appears in the bundle, not
that anything renders it. It passed for as long as the feature was unreachable.
A test asserting presence-in-source cannot tell you a feature is wired up —
assert that it RENDERS, on the screen it belongs to.

The rule: when something is uncalled, ask whether it is a dead helper or an
orphaned feature. If it has data behind it, restore the call site. If it does
not, remove it.

## A "Check" on a new install is a bug, not a status (9.0.0)

System health reported "Recovery snapshots: Check" on every fresh install,
because the recovery ring only fills from the SECOND save — there is nothing to
snapshot before that. Technically accurate, practically a false alarm that
would send someone troubleshooting a system working exactly as designed.
Diagnostics need a third state for "not yet, and that is expected"; a binary
OK/FAIL forces correct-but-alarming output.
