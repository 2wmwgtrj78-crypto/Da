/* Backup coverage: every key the app persists must survive a round trip.

   WHY THIS FILE EXISTS
   --------------------
   Fields that are saved to local storage but never written into the backup
   payload have now been found FOUR separate times: mocks, then pace, hist and
   calls, then adaptiveProfile. Each time the symptom was the same and silent —
   the restore succeeds, reports success, and quietly returns that part of the
   user's history to empty. Nothing errors. Nothing warns.

   The existing conservation test does check a backup round trip, but only for
   the fields it happens to name. That is why the same bug kept getting through:
   a test that asserts "these keys survive" cannot notice a key nobody added.

   This file inverts it. It derives the list of persisted keys from
   normalizeState() — the function that defines what state IS — and asserts
   that every one of them is either exported or explicitly, deliberately
   excluded. A new field added to state without being wired into backup fails
   here on the next run, by construction.

   Verified by control: removing adaptiveProfile from exportPayload fails this
   file.
*/
const path = require('path');
const fs = require('fs');

global.window = global;
require(path.join(__dirname, '..', 'engine.js'));
const SM = global.SM;

let failures = 0;
function check(label, cond, detail) {
  if (cond) console.log('  OK   ' + label);
  else { console.log('  FAIL ' + label + (detail ? '\n         ' + detail : '')); failures++; }
}

/* Device-local, and correctly NOT backed up. Each needs a reason, so that
   excluding a field is a decision someone made rather than one they forgot.
     session     — an in-progress study session; restoring a stale one onto a
                   different device would be wrong, not helpful.
     visualMode  — a per-device display choice (Focus / Study / Night).
     diagnostics — local timestamps (lastLoadAt, lastSaveAt, lastMigrationAt).
                   Restoring another device's clock readings is meaningless.
     prefs       — exported, but under its own key rather than as st.prefs. */
const DELIBERATELY_LOCAL = ['session', 'visualMode', 'diagnostics'];

// ---- Derive what the app persists, from normalizeState itself ----
const uiCore = fs.readFileSync(path.join(__dirname, '..', 'ui-modules', 'ui-core.part.js'), 'utf8');
const normalize = uiCore.slice(uiCore.indexOf('function normalizeState'));
const persisted = new Set();
let m;
const patterns = [
  /s\.([a-zA-Z][\w]*)\s*=\s*\(?s\.\1/g,
  /s\.([a-zA-Z][\w]*)\s*=\s*Array\.isArray\(s\.\1\)/g,
  /s\.([a-zA-Z][\w]*)\s*=\s*merge\(/g,
  /s\.([a-zA-Z][\w]*)\s*=\s*s\.\1\s*\|\|/g
];
patterns.forEach(re => { while ((m = re.exec(normalize))) persisted.add(m[1]); });
['prefs', 'misses', 'schemaVersion'].forEach(k => persisted.delete(k));

check('derived a plausible set of persisted keys from normalizeState', persisted.size >= 15,
  'found ' + persisted.size + ': ' + [...persisted].sort().join(', '));

// ---- Every persisted key must appear in the exported payload ----
const sample = {
  schemaVersion: 7,
  prefs: JSON.parse(JSON.stringify(SM.DEFAULTS)),
  misses: [{ id: 'm1', topicId: 3, last: 1000 }]
};
// Give every persisted key a recognisable non-empty value.
const stamp = {};
[...persisted].forEach((k, i) => {
  const v = { __probe: k, n: i + 1 };
  sample[k] = (k === 'calib' || k === 'viva' || k === 'swaps' || k === 'notes' || k === 'mocks')
    ? [v] : v;
  stamp[k] = v;
});

const text = SM.exportPayload(sample);
const payload = JSON.parse(text);

const missing = [...persisted].filter(k =>
  !DELIBERATELY_LOCAL.includes(k) && !(k in payload));
check('every persisted key is present in the backup payload', missing.length === 0,
  'NOT EXPORTED (a restore would silently empty these): ' + missing.join(', '));

const excludedButPresent = DELIBERATELY_LOCAL.filter(k => k in payload);
check('device-local keys are not exported', excludedButPresent.length === 0,
  excludedButPresent.join(', '));

// ---- parseBackup must read back what exportPayload wrote ----
const parsed = SM.parseBackup(text);
check('parseBackup accepts a payload produced by exportPayload', parsed.ok === true,
  parsed.error || '');

if (parsed.ok) {
  const dropped = [...persisted].filter(k =>
    !DELIBERATELY_LOCAL.includes(k) && (k in payload) && !(k in parsed));
  check('parseBackup reads back every exported key', dropped.length === 0,
    'EXPORTED BUT DISCARDED ON IMPORT: ' + dropped.join(', '));

  // Values must survive intact, not merely exist.
  const corrupted = [];
  ['scores', 'tallies', 'cursors', 'lecDone', 'repairs', 'mcq', 'adaptiveProfile'].forEach(k => {
    if (!persisted.has(k)) return;
    const got = parsed[k];
    if (!got || JSON.stringify(got) !== JSON.stringify(stamp[k])) {
      corrupted.push(k + ': sent ' + JSON.stringify(stamp[k]) + ' got ' + JSON.stringify(got));
    }
  });
  check('key fields survive the round trip byte-identical', corrupted.length === 0,
    corrupted.slice(0, 3).join(' | '));
}

// ---- adaptiveProfile specifically, since it was the most recent escape ----
const ap = { topics: { 5: { ease: 2.1, lastUpdate: 99 } }, lastUpdate: 99 };
const rt = SM.parseBackup(SM.exportPayload({
  prefs: SM.DEFAULTS, misses: [], days: {}, scores: {}, adaptiveProfile: ap
}));
check('adaptiveProfile survives a round trip', rt.ok &&
  JSON.stringify(rt.adaptiveProfile) === JSON.stringify(ap),
  'got ' + JSON.stringify(rt && rt.adaptiveProfile));

// ---- Corrupt input is refused rather than half-imported ----
[['not json at all', 'BACKUP'], ['{}', 'valid JSON, wrong shape'],
 ['{"misses":[{"id":null}]}', 'damaged entries']].forEach(([txt, why]) => {
  const r = SM.parseBackup(txt);
  check('rejects ' + why, r.ok === false && !!r.error, JSON.stringify(r).slice(0, 80));
});

if (failures) { console.log('\nBACKUP FAIL: ' + failures + ' check(s) failed.'); process.exit(1); }
console.log('\nBACKUP PASS: ' + persisted.size + ' persisted keys, all exported or deliberately local, round trip intact.');
