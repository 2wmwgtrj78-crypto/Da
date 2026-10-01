/* Storage resilience: quota exhaustion, corruption, and interrupted sessions.

   WHY THIS FILE EXISTS
   --------------------
   These paths were audited and, unusually for this codebase, nothing was
   wrong. The app already warns rather than failing silently when storage
   fills, keeps the last good state rather than truncating it, and recovers
   from a corrupt primary through a 3-deep recovery ring.

   That is exactly why it is worth pinning down. This behaviour is invisible in
   normal use — you only discover it is gone on the day a phone runs out of
   space with months of logged answers in it, which is the worst possible
   moment to find out. None of the other suites touch any of it.

   Two of the "findings" from the original audit turned out to be defects in
   the probe, not the app: it read the wrong localStorage key ('sm8' rather
   than 'surgimaster:v10'), and it tried to trigger a save using a control that
   was not on the screen at the time. Both are guarded below — the key is
   derived rather than typed, and the save trigger asserts the control exists
   before relying on it.
*/
const path = require('path');
const http = require('http');
const fs = require('fs');

let chromium;
try { chromium = require('playwright').chromium; }
catch (e) {
  console.log('SKIPPED: playwright is not installed. Run `npm install playwright` to enable `npm run test:resilience`.');
  process.exit(0);
}

const ROOT = path.join(__dirname, '..');
const PORT = 8927;
const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.png':'image/png', '.svg':'image/svg+xml', '.webmanifest':'application/manifest+json' };

function startServer() {
  return new Promise(resolve => {
    const s = http.createServer((req, res) => {
      let p = req.url.split('?')[0];
      if (p === '/') p = '/index.html';
      fs.readFile(path.join(ROOT, p), (err, data) => {
        if (err) { res.writeHead(404); res.end(); return; }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
        res.end(data);
      });
    });
    s.listen(PORT, () => resolve(s));
  });
}

let failures = 0;
function check(label, cond, detail) {
  if (cond) console.log('  OK   ' + label);
  else { console.log('  FAIL ' + label + (detail ? '\n         ' + detail : '')); failures++; }
}

const url = 'http://localhost:' + PORT + '/index.html';

/* Derive the storage key from what the app actually wrote, rather than
   hardcoding it — typing it by hand is what made the first probe report two
   phantom failures. */
const KEY_PROBE = `(() => {
  const k = Object.keys(localStorage).filter(x => !/:last$|:recovery:/.test(x));
  return k.sort((a,b) => (localStorage.getItem(b)||'').length - (localStorage.getItem(a)||'').length)[0] || null;
})()`;

async function settle(page, ms) { await page.waitForTimeout(ms); }

async function triggerSave(page) {
  await page.evaluate(() => document.querySelector('.railbtn[data-tab="today"]').dispatchEvent(new MouseEvent('click', { bubbles: true })));
  await page.waitForTimeout(350);
  const n = await page.evaluate(() => document.querySelectorAll('[data-emstate]').length);
  if (!n) return false;
  await page.evaluate(() => {
    const els = document.querySelectorAll('[data-emstate]');
    (els[1] || els[0]).dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await page.waitForTimeout(600);
  return true;
}

(async () => {
  const server = await startServer();
  const browser = await chromium.launch();

  // ---- 1. Storage full: warn, keep rendering, do not lose what was saved ----
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message.slice(0, 120)));
    await page.goto(url); await settle(page, 800);
    check('a save control is present to drive this test', await triggerSave(page));

    const KEY = await page.evaluate(KEY_PROBE);
    check('app wrote a primary state key', !!KEY, 'none found');
    const before = await page.evaluate(k => (localStorage.getItem(k) || '').length, KEY);

    // Every write now throws, as a full device would.
    await page.evaluate(() => {
      window.__realSet = Storage.prototype.setItem;
      Storage.prototype.setItem = function () {
        const e = new Error('QuotaExceededError'); e.name = 'QuotaExceededError'; throw e;
      };
    });
    await triggerSave(page);
    for (const t of ['study', 'revise', 'progress']) {
      await page.evaluate(s => document.querySelector(s).dispatchEvent(new MouseEvent('click', { bubbles: true })), `button[data-tab="${t}"]`);
      await settle(page, 300);
    }
    const full = await page.evaluate(k => ({
      warn: !!(document.getElementById('saveWarn') && !document.getElementById('saveWarn').hidden),
      rendered: !!document.querySelector('#app .card,#app .sm-v25-route-main'),
      stored: (localStorage.getItem(k) || '').length
    }), KEY);
    check('shows the save warning when storage is full', full.warn);
    check('keeps rendering with storage full', full.rendered);
    check('does not shrink or clear already-saved state on a failed write',
      full.stored >= before, before + ' -> ' + full.stored + ' bytes');
    check('no uncaught error while storage is full', errs.length === 0, errs[0] || '');

    // ---- 2. ...and recovers once space is free ----
    await page.evaluate(() => { Storage.prototype.setItem = window.__realSet; });
    check('save control still reachable after recovery', await triggerSave(page));
    const after = await page.evaluate(k => ({
      warn: !!(document.getElementById('saveWarn') && !document.getElementById('saveWarn').hidden),
      len: (localStorage.getItem(k) || '').length
    }), KEY);
    check('clears the save warning once storage frees up', !after.warn);
    check('writes state again once storage frees up', after.len > 0);
    await ctx.close();
  }

  // ---- 3. Corrupt primary state recovers ----
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto(url); await settle(page, 800);
    await triggerSave(page);
    const KEY = await page.evaluate(KEY_PROBE);
    await page.evaluate(k => localStorage.setItem(k, '{corrupted'), KEY);
    await page.reload({ waitUntil: 'load' }); await settle(page, 1100);
    const r = await page.evaluate(k => ({
      rendered: !!document.querySelector('#app .card,#app .sm-v25-route-main'),
      restored: (localStorage.getItem(k) || '').charAt(0) === '{' && (localStorage.getItem(k) || '').length > 200
    }), KEY);
    check('renders after the primary state is corrupted', r.rendered);
    check('restores real state after corruption, not a blank one', r.restored);
    await ctx.close();
  }

  // ---- 4. Recovery ring fills, and rescues when primary AND :last are gone ----
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto(url); await settle(page, 800);
    for (let i = 0; i < 4; i++) await triggerSave(page);
    const KEY = await page.evaluate(KEY_PROBE);
    const ring = await page.evaluate(() => Object.keys(localStorage).filter(k => /:recovery:/.test(k)).length);
    check('recovery ring is written across successive saves (' + ring + ' slots)', ring >= 2,
      'only ' + ring + ' recovery slots after 4 saves');
    await page.evaluate(k => {
      localStorage.setItem(k, '{broken');
      localStorage.setItem(k + ':last', '{alsobroken');
    }, KEY);
    await page.reload({ waitUntil: 'load' }); await settle(page, 1200);
    const r = await page.evaluate(k => ({
      rendered: !!document.querySelector('#app .card,#app .sm-v25-route-main'),
      restored: (localStorage.getItem(k) || '').charAt(0) === '{' && (localStorage.getItem(k) || '').length > 200
    }), KEY);
    check('survives losing BOTH primary and :last, via the recovery ring', r.rendered && r.restored,
      'rendered=' + r.rendered + ' restored=' + r.restored);
    await ctx.close();
  }

  // ---- 5. Interrupted session: reload must not lose logged work ----
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto(url); await settle(page, 800);
    await page.evaluate(() => document.querySelector('button[data-tab="revise"]').dispatchEvent(new MouseEvent('click', { bubbles: true })));
    await settle(page, 400);
    await page.evaluate(() => document.querySelectorAll('#app details').forEach(d => d.open = true));
    await settle(page, 300);
    await page.evaluate(() => {
      const els = [...document.querySelectorAll('#app [data-lmode],#app [data-grade],#app .pick,#app [data-open]')].slice(0, 6);
      els.forEach(e => e.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    });
    await settle(page, 700);
    const KEY = await page.evaluate(KEY_PROBE);
    const pre = await page.evaluate(k => { const s = JSON.parse(localStorage.getItem(k) || '{}');
      return { misses: (s.misses || []).length, scores: Object.keys(s.scores || {}).length }; }, KEY);
    await page.reload({ waitUntil: 'load' }); await settle(page, 1000);
    const post = await page.evaluate(k => { const s = JSON.parse(localStorage.getItem(k) || '{}');
      return { rendered: !!document.querySelector('#app .card,#app .sm-v25-route-main'),
               misses: (s.misses || []).length, scores: Object.keys(s.scores || {}).length }; }, KEY);
    check('renders after an interrupted session', post.rendered);
    check('keeps logged misses across an interruption', post.misses >= pre.misses,
      pre.misses + ' -> ' + post.misses);
    check('keeps scores across an interruption', post.scores >= pre.scores,
      pre.scores + ' -> ' + post.scores);
    await ctx.close();
  }

  await browser.close();
  server.close();
  if (failures) { console.log('\nRESILIENCE FAIL: ' + failures + ' check(s) failed.'); process.exit(1); }
  console.log('\nRESILIENCE PASS: storage-full warns and preserves, corruption and double-corruption recover, interrupted sessions keep logged work.');
})();
