# Dakshinamurthy V35 — Final

Version 6.2.0.

**6.1.0 and 6.2.0** raise every hardcoded font size in the app by a
compressive, monotonic curve. Body copy goes 14 -> 20px; the 7-10px captions
that dominated the stylesheet all land at 14px. Headings grow least so nothing
overflows. Three width-constrained components (calendar cells, nav labels,
brand tagline) got a layout answer instead — see CHANGELOG.

The first release in this project's history whose UI was verified by
measuring the rendered page in a real browser rather than by reading the
source. That change of method is the release.

## Headline

- **The bottom navigation was off-screen at every viewport width.** Today and
  Learn sat at negative x coordinates and could not be tapped on a phone.
  Fixed, and now guarded by a geometry test at five viewports.
- **The Practice self-rating buttons were blank** — ivory text on an ivory
  background at 1.03:1. Right / Fragile / Wrong is the input side of the whole
  spaced-repetition loop.
- **The home-screen headline was invisible** at 1.02:1, dark on dark.
- **Night mode did not work.** The attribute flipped; the app stayed bright.
  It is now a genuine dark theme.
- **Every disclosure row was ~18px tall** against a 44px touch minimum.

## Also fixed

Sub-screens now highlight More in the nav; the More button keeps its
`secondary` class across renders; the calendar no longer overflows below
390px; keyboard focus is visible; dead ribbon markup that `render()` destroyed
on first paint has been removed; and `tests/e2e.test.js` no longer silently
skips the visual-mode checks.

36 further WCAG AA contrast failures were measured and fixed. Final state is
0 failures across 3 modes × 5 tabs.

## Not changed

The scheduler, curriculum, SM-2 intervals, adaptive intelligence and stored
study state. The question-conservation invariant — 13,729 questions covered
three times over — is re-verified green.

## New

`tests/ui-geometry.test.js` (`npm run test:ui`): 43 checks covering nav
reachability at five viewports, real-click routing, WCAG AA contrast in three
modes across five tabs, horizontal overflow, console errors and touch
targets. `npm run test:all` runs everything.

Each assertion group was verified by deliberately reintroducing the original
defect and confirming the suite fails. See FINAL_QA_REPORT_2026-09-15-V35.md.
