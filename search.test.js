/* Global search: forgiving matching, ranking, geometry and navigation.

   The requirement was that search finds things "even if it is vague", so the
   query set below is deliberately made of the ways a half-remembered thing
   gets typed: truncations ("panc"), initials ("gsp", "hpb"), typos
   ("colorectl"), British/American spelling ("oesophagus"), and plain English
   commands ("log an mcq", "night mode").

   Every one of these failed at some point during development, and each failure
   had a different cause worth keeping a test for:
     - "hpb", "mock", "log an mcq" returned NOTHING, because synonyms were
       added as extra REQUIRED tokens rather than alternatives, so "hpb"
       demanded hepatobiliary AND liver AND biliary AND pancreas in one entry.
     - "mock" then returned two unrelated topics, because the synonym "test"
       prefix-matched "Testis" and outscored the actual mock days.
     - "stomach ca" buried the relevant results under scheduled days, because
       246 days were competing with 39 topics at equal weight.
   Ranking here is as much the feature as matching is.
*/
const path = require('path');
const http = require('http');
const fs = require('fs');

let chromium;
try { chromium = require('playwright').chromium; }
catch (e) {
  console.log('SKIPPED: playwright is not installed. Run `npm install playwright` to enable `npm run test:search`.');
  process.exit(0);
}

const ROOT = path.join(__dirname, '..');
const PORT = 8929;
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

async function search(page, q) {
  return page.evaluate(async query => {
    const i = document.getElementById('smSearchInput');
    i.focus(); i.value = query;
    i.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise(r => setTimeout(r, 180));
    return [...document.querySelectorAll('.sm-search-hit')].map(b => ({
      kind: b.querySelector('.sm-search-kind').textContent,
      title: b.querySelector('.sm-search-title').textContent
    }));
  }, q);
}

/* [query, expected substring in a top-N title, N, note] */
const CASES = [
  ['panc',        'Pancreas',                 2, 'truncated word'],
  ['pancrease',   'Pancreas',                 3, 'misspelling'],
  ['colorectl',   'Colorectal',               2, 'dropped letter'],
  ['gsp',         'General Surgery',          2, 'initials'],
  ['hpb',         'HPB',                      3, 'domain shorthand via synonyms'],
  ['oesophagus',  'Esophagus',                2, 'British spelling of an American entry'],
  ['esophagus',   'Esophagus',                2, 'American spelling'],
  ['thyroid',     'Thyroid',                  2, 'exact topic'],
  ['breast',      'Breast',                   2, 'exact topic'],
  ['transplant',  'Transplant',               2, 'exact topic'],
  ['vascular',    'Vascular',                 2, 'exact topic'],
  ['phase 3',     'Colorectal',               2, 'two tokens, one numeric'],
  ['night mode',  'Night mode',               2, 'a setting, phrased as English'],
  ['log an mcq',  'Log',                      2, 'command with a stopword in it'],
  ['december',    'December',                 3, 'month name reaching scheduled days']
];

(async () => {
  const server = await startServer();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message.slice(0, 120)));
  await page.goto('http://localhost:' + PORT + '/index.html', { waitUntil: 'load' });
  await page.waitForTimeout(900);

  check('search input exists in the shell', await page.evaluate(() => !!document.getElementById('smSearchInput')));
  check('search markup survives a re-render', await page.evaluate(async () => {
    document.querySelector('.railbtn[data-tab="more"]').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 300));
    document.querySelector('[data-go-tab="study"]').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 400));
    document.querySelector('.railbtn[data-tab="today"]').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 400));
    return !!document.getElementById('smSearchInput');
  }));

  for (const [q, expect, topN, note] of CASES) {
    const hits = await search(page, q);
    const hit = hits.slice(0, topN).some(h => h.title.indexOf(expect) >= 0);
    check('"' + q + '" finds ' + expect + ' in top ' + topN + ' (' + note + ')', hit,
      hits.length ? hits.slice(0, 3).map(h => h.kind + ': ' + h.title).join(' | ') : 'no results at all');
  }

  // Nonsense must return nothing rather than a random topic.
  const junk = await search(page, 'zzzqqqxyw');
  check('nonsense returns no results rather than a spurious match', junk.length === 0,
    junk.slice(0, 2).map(h => h.title).join(' | '));

  // A result list that is all noise is as bad as none.
  const broad = await search(page, 'panc');
  check('results are capped to a readable number (' + broad.length + ')', broad.length > 0 && broad.length <= 12,
    'returned ' + broad.length);

  // ---- Geometry: launcher and panel must not run off screen or under a bar ----
  await page.click('#smSearchLauncher');
  await page.waitForTimeout(300);
  const geo = await page.evaluate(() => {
    const w = document.getElementById('smSearchWrap').getBoundingClientRect();
    const top = document.getElementById('smBarTop');
    const bot = document.getElementById('smBarBottom').getBoundingClientRect();
    const inp = document.getElementById('smSearchInput').getBoundingClientRect();
    const clear = document.getElementById('smSearchClear').getBoundingClientRect();
    const launcher = document.getElementById('smSearchLauncher').getBoundingClientRect();
    return { left: Math.round(w.left), right: Math.round(w.right), top: Math.round(w.top), bottom: Math.round(w.bottom),
             barBotTop: Math.round(bot.top), vw: innerWidth, topNavPresent: !!top,
             inputH: Math.round(inp.height), clearW: Math.round(clear.width), clearH: Math.round(clear.height),
             launcherW: Math.round(launcher.width), launcherH: Math.round(launcher.height) };
  });
  check('search panel sits fully on screen', geo.left >= 0 && geo.right <= geo.vw,
    geo.left + '..' + geo.right + ' of ' + geo.vw);
  check('legacy top navigation is absent', geo.topNavPresent === false,
    geo.topNavPresent ? 'legacy top navigation still rendered' : 'absent as intended');
  check('search launcher clears the bottom bar', geo.bottom <= geo.barBotTop,
    'panel bottom ' + geo.bottom + ' vs bottom bar top ' + geo.barBotTop);
  check('search input meets the 44px touch minimum', geo.inputH >= 44, geo.inputH + 'px');
  check('clear button meets the 44px touch minimum', geo.clearW >= 44 && geo.clearH >= 44,
    geo.clearW + 'x' + geo.clearH);
  check('search launcher meets the 44px touch minimum', geo.launcherW >= 44 && geo.launcherH >= 44,
    geo.launcherW + 'x' + geo.launcherH);

  // ---- Navigating from a result ----
  await search(page, 'night mode');
  await page.evaluate(() => document.querySelector('.sm-search-hit').dispatchEvent(new MouseEvent('click', { bubbles: true })));
  await page.waitForTimeout(600);
  const afterNav = await page.evaluate(() => ({
    open: document.getElementById('smSearchWrap').classList.contains('open'),
    page: document.body.dataset.smPage,
    rendered: !!document.querySelector('#app .card,#app .sm-v25-route-main')
  }));
  check('choosing a result closes the panel', !afterNav.open);
  check('choosing a result navigates and the app still renders', afterNav.rendered);

  // Escape must close it, or the panel traps a phone keyboard user.
  await page.evaluate(() => document.getElementById('smSearchInput').focus());
  await page.waitForTimeout(250);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(250);
  check('Escape closes the search panel',
    await page.evaluate(() => !document.getElementById('smSearchWrap').classList.contains('open')));

  check('no console errors from search', errs.length === 0, errs[0] || '');

  await browser.close();
  server.close();
  if (failures) { console.log('\nSEARCH FAIL: ' + failures + ' check(s) failed.'); process.exit(1); }
  console.log('\nSEARCH PASS: ' + CASES.length + ' vague queries resolve, ranking holds, launcher clears both bars, results navigate.');
})();
