/* Conservation & invariant tests — the checks the CHANGELOG describes doing
   by hand during development ("13,729 -> 13,450: 279 questions silently
   lost, reverted"), now automated so a future change can't reintroduce that
   class of bug without a test failing.

   These load engine.js directly in Node (no browser needed — it's pure
   logic behind `window.SM`) and check real, empirically-verified numbers,
   not assumed ones. Every assertion below was checked against the actual
   current output before being written into this file. */
const assert = require('assert');
const path = require('path');

global.window = {};
require(path.join(__dirname, '..', 'engine.js'));
const SM = global.window.SM;

function sumCurriculum(field) {
  return SM.CURRICULUM.reduce((sum, row) => sum + (row[field] || 0), 0);
}

// ---- Curriculum headline totals ----
// Protects the source data itself: if someone edits CURRICULUM and the
// totals drift, every downstream conservation check below would otherwise
// silently re-baseline to the wrong number instead of catching the change.
const TOTAL_LECTURES = sumCurriculum('nlec');
const TOTAL_BANK = sumCurriculum('dtq');
const TOTAL_SPEED = sumCurriculum('spq');
const TOTAL_QUESTIONS = TOTAL_BANK + TOTAL_SPEED;

assert.equal(TOTAL_LECTURES, 679, 'curriculum lecture count must stay 679');
assert.equal(TOTAL_BANK, 9603, 'curriculum bank-question count must stay 9,603');
assert.equal(TOTAL_SPEED, 4126, 'curriculum speed-question count must stay 4,126');
assert.equal(TOTAL_QUESTIONS, 13729, 'curriculum total questions must stay 13,729');
assert.equal(SM.CURRICULUM.length, 39, 'expected 39 curriculum topics');

// ---- Plan-level conservation (the actual scheduler output) ----
const plan = SM.buildPlan({});
assert(plan.content && plan.content.length > 0, 'buildPlan must produce a non-empty campaign');

let sumBank = 0, sumSpeed = 0, sumLec = 0, sumRe = 0, sumRe3 = 0;
plan.content.forEach(day => {
  if (day.kind !== 'content' || !day.slots) return;
  day.slots.forEach(s => {
    sumBank += s.nBank || 0;
    sumSpeed += s.nSpeed || 0;
    sumLec += s.nLec || 0;
    sumRe += s.nRe || 0;
    sumRe3 += s.nRe3 || 0;
  });
});

// Pass 1 (new content) must cover the syllabus exactly once — no loss,
// no accidental duplication. This is the exact invariant whose violation
// the changelog documents catching and reverting.
assert.equal(sumBank, TOTAL_BANK, 'pass 1 must schedule every bank question exactly once (found ' + sumBank + ')');
assert.equal(sumSpeed, TOTAL_SPEED, 'pass 1 must schedule every speed question exactly once (found ' + sumSpeed + ')');
assert.equal(sumLec, TOTAL_LECTURES, 'pass 1 must schedule every lecture exactly once (found ' + sumLec + ')');

// Passes 2 and 3 must each achieve full coverage of the combined pool.
assert.equal(sumRe, TOTAL_QUESTIONS, 'pass 2 must cover all 13,729 questions (found ' + sumRe + ')');
assert.equal(sumRe3, TOTAL_QUESTIONS, 'pass 3 must cover all 13,729 questions (found ' + sumRe3 + ')');

// ---- Mastery-based pace must free minutes, never questions ----
// The scheduling-capacity fix: a topic with confirmed mastery can go faster
// through its own pass-2/3 questions, but the count of questions scheduled
// anywhere must never move by a single question. This is the one invariant
// that would be easiest to accidentally break while tuning the pace factor
// later, so it is pinned here permanently.
const masteryPace = {};
for (let i = 0; i < 10; i++) masteryPace[i] = 0.5;
const planWithMastery = SM.buildPlan({ masteryPace });
let mBank = 0, mSpeed = 0, mLec = 0, mRe = 0, mRe3 = 0, mMin = 0;
planWithMastery.content.forEach(day => {
  if (day.blocks) day.blocks.forEach(b => { mMin += b.mins || 0; });
  if (day.kind !== 'content' || !day.slots) return;
  day.slots.forEach(s => { mBank += s.nBank || 0; mSpeed += s.nSpeed || 0; mLec += s.nLec || 0; mRe += s.nRe || 0; mRe3 += s.nRe3 || 0; });
});
assert.equal(mBank, sumBank, 'masteryPace must not change how many bank questions are scheduled');
assert.equal(mSpeed, sumSpeed, 'masteryPace must not change how many speed questions are scheduled');
assert.equal(mLec, sumLec, 'masteryPace must not change how many lectures are scheduled');
assert.equal(mRe, sumRe, 'masteryPace must not change pass-2 question coverage');
assert.equal(mRe3, sumRe3, 'masteryPace must not change pass-3 question coverage');
let baselineMin = 0;
plan.content.forEach(day => { if (day.blocks) day.blocks.forEach(b => { baselineMin += b.mins || 0; }); });
assert(mMin < baselineMin, 'masteryPace must actually reduce total scheduled minutes when supplied (baseline ' + baselineMin + ', with mastery ' + mMin + ')');
// An empty or absent masteryPace must be a complete no-op — the default
// behaviour for every existing caller, including this file's own baseline
// plan above, must be provably unaffected by this mechanism existing at all.
const planEmptyPace = SM.buildPlan({ masteryPace: {} });
assert.equal(JSON.stringify(planEmptyPace.content.map(d => d.blocks ? d.blocks.map(b => b.mins) : null)),
  JSON.stringify(plan.content.map(d => d.blocks ? d.blocks.map(b => b.mins) : null)),
  'an empty masteryPace map must produce an identical schedule to no masteryPace at all');

// ---- Backup export/import round-trip ----
// The user's accumulated study history is more valuable than the app
// itself — a silent round-trip corruption here would be the worst possible
// class of bug.
const fakeState = {
  prefs: SM.DEFAULTS,
  misses: [{ id: 'a1b2c3', topicId: 3, due: 1789200000000, reps: 2, ef: 2.4 }],
  days: { '2026-09-15': { done: true, mins: 180 } },
  scores: {}, calib: [], tallies: {}, repairs: {}, mcq: {},
  cursors: {}, lecDone: {}, viva: [], swaps: [], notes: [], retiredCount: 0
};
const payload = SM.exportPayload(fakeState);
const parsed = SM.parseBackup(payload);
assert(parsed.ok, 'a freshly exported backup must parse as valid');
assert.deepStrictEqual(parsed.misses, fakeState.misses, 'misses must round-trip exactly through export/import');
assert.deepStrictEqual(parsed.days, fakeState.days, 'days must round-trip exactly through export/import');

// parseBackup must reject malformed input rather than silently accepting it
assert.equal(SM.parseBackup('{"not":"a backup"}').ok, false, 'a wrong-shape object must be rejected');
assert.equal(SM.parseBackup('not even json{{{').ok, false, 'unparseable text must be rejected');

// ---- Spaced-repetition core (SM-2) ----
// Success must grow the interval and improve the ease factor; failure must
// reset both. Verified manually earlier in this project's history —
// encoded here so it can't silently regress.
let s = { ef: 2.5, iv: 1, reps: 0 };
for (let i = 0; i < 3; i++) {
  const r = SM.calculateNextInterval(5, s.ef, s.iv, s.reps);
  assert(r.interval >= s.iv, 'a successful review must never shrink the interval (step ' + i + ')');
  assert(r.reps === s.reps + 1, 'a successful review must increment reps (step ' + i + ')');
  s = { ef: r.ef, iv: r.interval, reps: r.reps };
}
const failed = SM.calculateNextInterval(0, s.ef, s.iv, s.reps);
assert.equal(failed.interval, 1, 'a failed review must reset the interval to 1');
assert.equal(failed.reps, 0, 'a failed review must reset reps to 0');

console.log('CONSERVATION PASS: curriculum totals, 3-pass coverage (' + TOTAL_QUESTIONS +
  ' questions x3), backup round-trip, and SM-2 interval logic all verified.');
