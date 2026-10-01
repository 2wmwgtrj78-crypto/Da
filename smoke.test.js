const assert = require('assert');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const pkg = JSON.parse(read('package.json'));
const index = read('index.html');
const sw = read('sw.js');
const ui = read('ui.js');
const core = read('ui-modules/ui-core.part.js');
const modules = fs.readdirSync(path.join(root, 'ui-modules')).filter(x => x.endsWith('.part.js'));
assert.equal(modules.length, 8, 'eight UI modules expected');
/* The search markup must live OUTSIDE #app. render() replaces #app's innerHTML
   on every paint, so anything placed inside it is destroyed on first render —
   the mistake already made once with the brand ribbon. */
assert(index.indexOf('smSearchWrap') > index.indexOf('</div><div id="sm8BootError">') ||
       index.indexOf('smSearchWrap') < index.indexOf('<div id="app"'),
  'search markup must not be inside #app');
assert(index.includes('id="smSearchInput"'), 'search input must be present in the shell');
assert(index.includes(`application-version" content="${pkg.version}"`), 'HTML release must match package version');
assert(index.includes('viewport-fit=cover'), 'safe-area viewport must remain enabled');
assert(index.indexOf('error-handler.js') < index.indexOf('storage.js'), 'error handler must boot first');
assert(sw.includes(`CACHE_NAME='dakshinamurthy-v${pkg.version}'`), 'SW cache must match package version');
assert(sw.includes('var SHELL=['), 'service-worker shell manifest must remain intact');
assert(sw.includes("'./engine.js'") && sw.includes("'./ui.js'"), 'core assets must remain in SW shell');
assert(sw.includes("'./visual-v33-ui.js'"), 'V33 UI refinement module must remain in offline shell');
assert(!index.match(/<script src="visual-v(?:20|21|22|23|24|25|26|27|28|32|33)\.js"><\/script>/), 'legacy visual runtime must not boot in UI-only branch');
assert(sw.includes(`RELEASE='${pkg.version}'`), 'SW release must match package version');
assert(ui.includes(`production bundle — ${pkg.version}`), 'UI bundle must be stamped with package version');
assert(ui.includes('UI MODULE 1') && ui.includes('UI MODULE 8'), 'all UI modules must be bundled');
assert(!fs.existsSync(path.join(root, 'ui.js.bak')), 'obsolete monolith backup should not ship');
assert(core.includes('function normalizeState(s)'), 'state normalization must be centralized');
assert(core.includes("s.recoveryLog=(s.recoveryLog&&typeof s.recoveryLog==='object')?s.recoveryLog:{}"), 'recovery lifecycle state must be normalized');
assert(ui.includes('data-recovery-skip="1"'), 'recovery offer must support a one-day dismiss action');
assert(ui.includes('state.recoveryLog[activeDate()]={status:"completed"'), 'completed recovery must be recorded to prevent repeat prompting');
assert(core.includes('Saved state failed verification'), 'save verification must be enabled');
assert(core.includes('smStorageEstimate'), 'storage health estimate must be available');
assert(read('error-handler.js').includes('unhandledrejection'), 'runtime rejection boundary must remain installed');

/* EVERY NAV BUTTON MUST HAVE A DISPATCH BRANCH (13.2.1).
   render() is a ternary chain on `tab` ending in `: renderToday()`. A tab with
   no branch does not error — it silently renders Today. Both `log` and `myday`
   shipped that way: a button in the bar, a working renderer in the source, and
   the wrong screen on the device. The browser suites could not see it, because
   a post-render mount makes Today's own output differ between visits, so
   comparing rendered text called the fall-through "distinct". Compare the
   declaration instead: it is exact, and it covers every tab at once. */
const navTabs = [...index.matchAll(/class="railbtn[^"]*"[^>]*data-tab="([a-z]+)"/g)].map(m => m[1]);
assert.deepEqual(navTabs, ['today','revise','progress','more'], 'v14 requires four primary bottom tabs; Learn lives under More');
assert(ui.includes('function renderMore()'), 'More renderer must exist');
assert(ui.includes('data-go-tab="study"'), 'Learn must be reachable from More');
const missing = navTabs.filter(t => !new RegExp('tab===\\s*"' + t + '"\\s*\\?').test(ui));
assert(missing.length === 0,
  'every nav tab needs a render() branch or it silently falls through to Today — missing: ' + missing.join(', '));

console.log(`SMOKE PASS: ${pkg.version} release, boot order, UI bundle and persistence hardening checks passed.`);
