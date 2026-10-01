/* Special-day rendering and calendar export.

   WHY THIS FILE EXISTS
   --------------------
   `specialDay()` in engine.js read `day.date` — a variable that does not exist
   in that function; the parameter is `c`. Every call reaching that line threw
   ReferenceError. The consequences were not small:

     - ICS calendar export was completely broken. It is the one code path that
       walks every special day at once, so it threw on the first one.
     - 72 of the plan's 246 days are special days (rest, correct, mock,
       mockreview, taper, exam, off). The Learn tab calls specialDay() to render
       them, so roughly 29% of the campaign's days would have failed to render.

   None of the five existing suites caught it, because all of them exercise
   ordinary content days. The smoke and conservation tests build the plan but
   never render a rest day or export a calendar.

   Verified by control: restoring `day.date` in place of `c.date` makes this
   file fail on both checks.
*/
const path = require('path');

global.window = global;
require(path.join(__dirname, '..', 'engine.js'));
const SM = global.SM;

let failures = 0;
function check(label, cond, detail) {
  if (cond) console.log('  OK   ' + label);
  else { console.log('  FAIL ' + label + (detail ? '\n         ' + detail : '')); failures++; }
}

const prefs = JSON.parse(JSON.stringify(SM.DEFAULTS));
const plan = SM.buildPlan(prefs, { scores: {}, days: {}, tallies: {} });

// ---- 1. Every special day in the campaign renders ----
const specialDates = Object.keys(plan.byDate)
  .filter(k => plan.byDate[k].kind && plan.byDate[k].kind !== 'content');
const kinds = [...new Set(specialDates.map(k => plan.byDate[k].kind))];

check('plan contains special days to test', specialDates.length > 0,
  'found ' + specialDates.length);

let rendered = 0; const errors = [];
specialDates.forEach(k => {
  try {
    const r = SM.specialDay(plan.byDate[k], plan.P);
    if (r && Array.isArray(r.blocks)) rendered++;
    else errors.push(k + ' (' + plan.byDate[k].kind + '): returned no blocks');
  } catch (e) {
    errors.push(k + ' (' + plan.byDate[k].kind + '): ' + e.message);
  }
});
check('every special day renders without throwing (' + specialDates.length + ' days, kinds: ' + kinds.join(', ') + ')',
  rendered === specialDates.length, errors.slice(0, 3).join('; '));

// specialDay must also accept a bare kind string, which is how engine.js
// itself called it. With no date available the weekday-dependent gym rule
// must degrade rather than throw.
let stringOk = true, stringErr = '';
kinds.forEach(k => {
  try { const r = SM.specialDay(k, plan.P); if (!r || !Array.isArray(r.blocks)) { stringOk = false; stringErr = k + ': no blocks'; } }
  catch (e) { stringOk = false; stringErr = k + ': ' + e.message; }
});
check('specialDay also accepts a bare kind string', stringOk, stringErr);

// ---- 2. ICS export builds and is structurally valid ----
let ics = '';
let icsThrew = null;
try {
  const r = SM.buildICS(plan, {
    detail: 'block', alarm: 10,
    from: plan.content[0].date,
    to: plan.content[plan.content.length - 1].date
  });
  ics = typeof r === 'string' ? r : ((r && (r.ics || r.text)) || '');
} catch (e) { icsThrew = e.message; }

check('ICS export builds without throwing', !icsThrew, icsThrew || '');

if (!icsThrew) {
  const L = ics.split(/\r\n|\n/);
  const begins = L.filter(x => x === 'BEGIN:VEVENT').length;
  const ends = L.filter(x => x === 'END:VEVENT').length;
  check('ICS starts with BEGIN:VCALENDAR', L[0] === 'BEGIN:VCALENDAR', 'got: ' + L[0]);
  check('ICS ends with END:VCALENDAR', ics.trim().endsWith('END:VCALENDAR'));
  check('ICS VEVENT blocks are balanced (' + begins + ' events)', begins === ends,
    begins + ' BEGIN vs ' + ends + ' END');
  check('ICS contains a usable number of events', begins > 100, 'only ' + begins);
  const malformed = L.filter(x => /^DT(START|END)/.test(x) && !/[0-9]{8}T[0-9]{6}/.test(x));
  check('all DTSTART/DTEND values are well formed', malformed.length === 0,
    malformed.slice(0, 2).join('; '));
  // RFC 5545 caps a content line at 75 octets; longer lines must be folded.
  const long = L.filter(x => Buffer.byteLength(x) > 75);
  check('no ICS content line exceeds the RFC5545 75-octet limit', long.length === 0,
    long.length + ' long lines, e.g. "' + (long[0] || '').slice(0, 60) + '"');
}

// ---- 3. Plan date integrity ----
const ds = Object.keys(plan.byDate).sort();
const badKeys = ds.filter(k => !/^\d{4}-\d{2}-\d{2}$/.test(k));
check('all plan date keys are valid ISO dates', badKeys.length === 0, badKeys.slice(0, 3).join(', '));

const gaps = [];
for (let i = 1; i < ds.length; i++) {
  const g = Math.round((Date.parse(ds[i]) - Date.parse(ds[i - 1])) / 864e5);
  if (g !== 1) gaps.push(ds[i - 1] + ' -> ' + ds[i] + ' (' + g + 'd)');
}
check('plan dates are contiguous with no gaps or duplicates', gaps.length === 0, gaps.slice(0, 3).join('; '));

let badTi = 0, slots = 0;
ds.forEach(k => (plan.byDate[k].blocks || []).forEach(b => {
  if (b.ti != null) { slots++; if (!SM.CURRICULUM[b.ti]) badTi++; }
}));
check('every scheduled block points at a real curriculum topic (' + slots + ' blocks)', badTi === 0,
  badTi + ' blocks reference a nonexistent index');

if (failures) { console.log('\nEXPORTS FAIL: ' + failures + ' check(s) failed.'); process.exit(1); }
console.log('\nEXPORTS PASS: ' + specialDates.length + ' special days render, ICS export valid, plan dates contiguous.');
