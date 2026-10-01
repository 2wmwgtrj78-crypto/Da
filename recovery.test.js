const assert = require('assert');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const ui = read('ui-modules/ui-simple-v14.part.js');
const actions = read('ui-modules/ui-render-ai.part.js');
const pkg = JSON.parse(read('package.json'));

assert.equal(pkg.version, '15.0.0', 'release must be v14.4.8');
assert(ui.includes('rs.days<2 && rs.totalMins<60'), 'single small misses must stay below the recovery threshold');
assert(ui.includes('rs.days>=2'), 'repeated recent misses must qualify for recovery');
assert(ui.includes('rs.totalMins<60'), '60-minute recent miss threshold must be explicit');
assert(ui.includes('slice().sort(function(a,b){return (b.mins-a.mins)||(b.date.localeCompare(a.date));})'), 'recovery source must be deterministic and prefer the strongest recent miss signal');
assert(ui.includes('var signal='), 'recovery must expose the signal that triggered the offer');
assert((ui+actions).includes('This is an opportunity, not a second plan') || (ui+actions).includes('No additional catch-up has been added'), 'recovery must remain explicitly non-debt');
assert(ui.includes('data-recovery-skip="1"'), 'recovery must remain dismissible for the day');
assert(ui.includes('Math.min(30,recovery.summary.totalMins)'), 'recovery UI must remain capped at one bounded block');
assert(actions.includes('Math.min(30,rs.summary.totalMins||30)'), 'recovery session must remain capped at one bounded block');
assert(actions.includes('recoveryTarget:{topicId:rs.topicId||null,action:action'), 'recovery session must persist the exact Today-selected repair/retrieval target');

// The recovery path must not mutate campaign scheduling; it only creates a session.
const start = actions.slice(actions.indexOf('on("[data-recovery-start]"'));
assert(start.includes('state.session={'), 'recovery start must create a session');
assert(!start.includes('plan.byDate[') && !start.includes('plan.days['), 'recovery start must not rewrite the campaign schedule');

console.log(`RECOVERY PASS: ${pkg.version} calm-threshold, deterministic selection, one-block cap and no-debt guards passed.`);
