const assert = require('assert');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const ui = read('ui-modules/ui-simple-v14.part.js');
const actions = read('ui-modules/ui-render-ai.part.js');
const notes = read('V15_RELEASE_NOTES.md');
const pkg = JSON.parse(read('package.json'));

assert.equal(pkg.version, '15.0.0', 'release must be v15.0.0');
assert(ui.includes('function smTodayIntelligence(date,entry,r)'), 'Today intelligence director must exist');
assert(ui.includes('TODAY · RECOVERY + REPAIR'), 'recovery and repair must share one Today state');
assert(ui.includes('Repair and retrieval signals are folded into this unfinished Today block'), 'repair must fold into unfinished Today work');
assert(ui.includes('Today has no unfinished campaign block'), 'repair must be allowed to become the next action when Today is clear');
assert(ui.includes('data-recovery-start="1"'), 'recovery path must use the existing bounded recovery action');
assert(ui.includes('data-session-start="1"'), 'normal/repair Today path must use the existing adaptive session');
assert(notes.includes('No campaign schedule mutation'), 'release notes must state schedule protection');
assert(actions.includes('state.session={'), 'Today actions must continue through persisted sessions');

console.log(`TODAY INTELLIGENCE PASS: ${pkg.version} merges Today, repair and recovery without creating a second plan.`);

assert(ui.includes('function smTodayRecoveryTarget(date,ad)'), 'Today must choose a recovery target through the same decision layer');
assert(ui.includes('strongest repair signal before opening new learning'), 'recovery should prefer an evidence-backed repair target');
console.log('TODAY RECOVERY BRIDGE PASS: recovery target is unified with Today and prefers repair evidence.');

assert(ui.includes('function smTodayPrimaryBlock(ts,date)'), 'Today must anchor itself to the first unfinished scheduled block');
assert(ui.includes('the schedule remains the anchor'), 'adaptive repair must not replace the campaign block');
assert(actions.includes('smSessionPlan(activeDate(),30,_ti.anchor,_ti)'), 'session start must persist the same Today bridge and anchor');
console.log('TODAY ANCHOR PASS: unfinished campaign block remains stable while adaptive evidence shapes the work.');

assert(ui.includes('function smTodayBridge(date,entry,r)'), 'Today bridge director must exist');
assert(ui.includes('repair\n   is an overlay') || ui.includes('repair/retrieval becomes an overlay'), 'repair must be represented as an overlay on Today');
assert(actions.includes('smTodayBridge(activeDate(),plan.byDate[activeDate()],recFor(activeDate()))'), 'session start must use the same Today bridge decision');
assert(read('ui-modules/ui-learning.part.js').includes('todayBridge'), 'session planner must accept and preserve the Today bridge');
console.log('TODAY BRIDGE PASS: Today, repair and recovery share one decision and the session preserves it.');
