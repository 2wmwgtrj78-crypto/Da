# Dakshinamurthy v14.0.0 — Simplification & Stabilisation

## Navigation
- Four fixed bottom tabs: Today, Practice, Progress, More.
- Learn moved into More.
- Removed the legacy top/reference navigation from the shell.
- Fixed More routing and secondary-screen highlighting.

## Visibility
- Larger touch targets and stronger text contrast.
- Tighter content width and safer bottom padding for mobile devices.
- Reduced card density on Today, Practice and More.

## Simplification
- Removed redundant streak display from Today.
- Removed duplicate quick MCQ logger from Practice home; logging opens as a focused action.
- Reduced explanatory copy where the interface is self-explanatory.
- Kept adaptive intelligence underneath the UI rather than exposing unnecessary controls.

## Stabilisation
- Package, HTML, UI bundle and service-worker release versions are generated from one version source.
- More navigation is explicitly handled to avoid dead taps or incorrect route fallbacks.
- Existing conservation, intelligence, export and backup tests remain part of the release gate.
