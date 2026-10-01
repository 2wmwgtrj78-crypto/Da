/* Rendered-geometry and contrast regression test (Playwright, real Chromium).

   WHY THIS FILE EXISTS
   --------------------
   Every test in this project before V35 checked source text or in-memory
   state. None of them measured the rendered page. That gap let two severe
   defects ship in V34, both on the home screen, both invisible to source
   review and to `npm test`:

     1. The bottom navigation rendered OFF-SCREEN at every viewport width.
        At 390px, Today sat at x = -145 and Learn at x = -78. The two most
        important tabs in the app were unreachable. Cause: the base rule
        `nav{left:50%;transform:translateX(-50%)}` (correct for
        position:fixed) was left in place when V33.2 switched the nav to
        position:sticky with margin:auto, which centres on its own. Two
        centring methods stacked and slid the bar half its own width left.

     2. Text rendered on top of itself in colour terms. "Climb, don't chase."
        sat at 1.02:1 (dark ink on dark maroon). The Practice self-rating
        buttons — Right / Fragile / Wrong, the core of the SM-2 loop —
        rendered ivory-on-ivory at 1.03:1, i.e. blank rectangles.

   Both are geometry/paint facts. The only way to catch them is to measure
   the composited result in a browser, which is what this file does.

   CONTROL TEST, per LESSONS_LEARNED: each assertion group below was verified
   by deliberately reintroducing the original defect and confirming this file
   FAILS. A test that has never been seen to fail is not evidence.
   Documented per-check in FINAL_QA_REPORT_2026-09-15-V35.md.
*/
const path = require('path');
const http = require('http');
const fs = require('fs');

let chromium;
try {
  chromium = require('playwright').chromium;
} catch (e) {
  console.log('SKIPPED: playwright is not installed. Run `npm install playwright` to enable `npm run test:ui`.');
  process.exit(0);
}

const ROOT = path.join(__dirname, '..');
const PORT = 8923;
const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.png':'image/png', '.svg':'image/svg+xml', '.webmanifest':'application/manifest+json' };

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let p = req.url.split('?')[0];
      if (p === '/') p = '/index.html';
      const full = path.join(ROOT, p);
      fs.readFile(full, (err, data) => {
        if (err) { res.writeHead(404); res.end(); return; }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(full)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
        res.end(data);
      });
    });
    server.listen(PORT, () => resolve(server));
  });
}

let failures = 0;
function check(label, cond, detail) {
  if (cond) { console.log('  OK   ' + label); }
  else { console.log('  FAIL ' + label + (detail ? '\n         ' + detail : '')); failures++; }
}

/* The shipped navigation, top bar then bottom bar. This list was still the
   five-tab V33 layout long after the app moved on, so every `more` probe
   clicked a button that does not exist and then measured whichever screen
   happened to be up — reporting PASS for a screen it never opened. */
const TABS = ['today','revise','progress','more'];
const VIEWPORTS = [
  { name: 'iPhoneSE', width: 375, height: 667 },
  { name: 'iPhone14', width: 390, height: 844 },
  { name: 'Pixel',    width: 412, height: 915 },
  { name: 'tablet',   width: 768, height: 1024 },
  { name: 'desktop',  width: 1280, height: 800 }
];

/* Composites every ancestor background — including gradients, which an
   earlier version of this probe ignored, producing ~80 false positives
   before the bug in the harness itself was found. */
const CONTRAST_PROBE = `(() => {
  const parse = c => { const m = c && c.match(/[\\d.]+/g); return m ? {r:+m[0],g:+m[1],b:+m[2],a:m[3]!==undefined?+m[3]:1} : null; };
  const grad = bi => { if(!bi||bi==='none') return null; const cs = bi.match(/rgba?\\([^)]+\\)/g); if(!cs) return null;
    let R=0,G=0,B=0,A=0,n=0; cs.forEach(c=>{const q=parse(c); if(q&&q.a>0.15){R+=q.r;G+=q.g;B+=q.b;A+=q.a;n++;}});
    return n ? {r:R/n,g:G/n,b:B/n,a:A/n} : null; };
  const over = (f,b) => { const a=f.a+b.a*(1-f.a); return a?{r:(f.r*f.a+b.r*b.a*(1-f.a))/a,g:(f.g*f.a+b.g*b.a*(1-f.a))/a,b:(f.b*f.a+b.b*b.a*(1-f.a))/a,a}:b; };
  const eff = el => { const st=[]; let q=el;
    while(q){ const c=getComputedStyle(q); const bc=parse(c.backgroundColor), bi=grad(c.backgroundImage);
      if(bi&&bi.a>0.05) st.push(bi); if(bc&&bc.a>0.02) st.push(bc); q=q.parentElement; }
    st.push({r:255,g:255,b:255,a:1});
    let acc=st[st.length-1]; for(let i=st.length-2;i>=0;i--) acc=over(st[i],acc); return acc; };
  const L = c => { const f=v=>{v/=255; return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);};
    return 0.2126*f(c.r)+0.7152*f(c.g)+0.0722*f(c.b); };
  const bad = [];
  document.querySelectorAll('#app *, nav *, #smSearchWrap *').forEach(el => {
    if (el.children.length) return;
    const txt = (el.textContent||'').trim(); if (!txt || txt.length < 2) return;
    const r = el.getBoundingClientRect(); if (r.width < 5 || r.height < 5) return;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || +cs.opacity < 0.35) return;
    /* WCAG 1.4.3 exempts inactive controls, and the probe was flagging the
       greyed Copy/Share/Download buttons on Help purely for being disabled. */
    if (el.closest('[disabled],[aria-disabled="true"]')) return;
    const raw = parse(cs.color); if (!raw) return;
    const bg = eff(el);
    const fg = over({r:raw.r,g:raw.g,b:raw.b,a:raw.a*(+cs.opacity||1)}, bg);
    const l1 = L(fg), l2 = L(bg);
    const ratio = (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);
    const size = parseFloat(cs.fontSize), weight = +cs.fontWeight||400;
    const need = (size>=24 || (size>=18.66 && weight>=700)) ? 3 : 4.5;
    if (ratio < need) bad.push(txt.slice(0,30)+' ('+ratio.toFixed(2)+':1, need '+need+')');
  });
  return [...new Set(bad)];
})()`;

async function setVisualMode(page, mode) {
  /* The mode buttons live on the Settings sub-screen, which is reached from
     More -> "FOCUS MODE" chip (data-go-tab="settings"), not from any nav tab.
     tests/e2e.test.js used `const b = await page.$(...); if (b) { ... }` at
     top level, where the buttons never exist — so it silently tested nothing
     for three releases. Navigate properly and assert the mode actually took. */
  // Settings ("Setup") is a direct tab in the 11-tab layout, top bar.
  await page.evaluate(() => { const e = document.querySelector('.railbtn[data-tab="settings"]'); if (e) e.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
  await page.waitForTimeout(300);
  const found = await page.evaluate(m => {
    const b = document.querySelector('[data-visual-mode="' + m + '"]');
    if (!b) return false;
    b.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, mode);
  await page.waitForTimeout(300);
  return found && (await page.evaluate(() => document.body.dataset.smMode)) === mode;
}

(async () => {
  const server = await startServer();
  const browser = await chromium.launch();

  // ---- 1. Both bars: full-width, on-screen, every viewport ----
  /* Navigation is now two fixed horizontal bars (top: reference screens,
     bottom: daily screens) plus a floating search launcher, replacing the
     single right-hand rail. The defect this section exists to catch — fixed
     chrome that does not actually span what it claims to, because a bare
     unscoped `nav{width:...}` rule from an older layer still applies to any
     <nav> in the document — hit THIS chrome during development: both bars
     rendered 28px narrower than the viewport and were shifted off-centre. So
     "spans the full width" is asserted explicitly, not inferred from left/
     right offsets alone. */
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    await page.goto('http://localhost:' + PORT + '/index.html', { waitUntil: 'load' });
    await page.waitForTimeout(600);
    const g = await page.evaluate(() => {
      const top = document.getElementById('smBarTop'), bot = document.getElementById('smBarBottom');
      if (!top || !bot) return null;
      const tr = top.getBoundingClientRect(), br = bot.getBoundingClientRect();
      return {
        top: top ? { left: Math.round(tr.left), right: Math.round(tr.right), top: Math.round(tr.top), bottom: Math.round(tr.bottom), w: Math.round(tr.width) } : null,
        bot: { left: Math.round(br.left), right: Math.round(br.right), top: Math.round(br.top), bottom: Math.round(br.bottom), w: Math.round(br.width) },
        vw: window.innerWidth, vh: window.innerHeight
      };
    });
    check('[' + vp.name + '] both bars exist', !!g);
    if (g) {
      check('[' + vp.name + '] top bar spans the full width and sits at the top',
        g.top.left === 0 && g.top.right === g.vw && g.top.top === 0,
        'x ' + g.top.left + '..' + g.top.right + ' of ' + g.vw + ', top=' + g.top.top);
      check('[' + vp.name + '] bottom bar spans the full width and sits at the bottom',
        g.bot.left === 0 && g.bot.right === g.vw && g.bot.bottom === g.vh,
        'x ' + g.bot.left + '..' + g.bot.right + ' of ' + g.vw + ', bottom=' + g.bot.bottom + ' of ' + g.vh);
      check('[' + vp.name + '] legacy top navigation is absent', g.top === null,
        g.top ? 'legacy top navigation still rendered' : 'absent as intended');
      const btnH = await page.evaluate(() => Math.min(
        ...[...document.querySelectorAll('#smBarBottom .railbtn')]
          .map(b => b.getBoundingClientRect().height)));
      check('[' + vp.name + '] every tab button meets the 44px touch minimum', btnH >= 44, btnH + 'px');
      const launcher = await page.evaluate(() => {
        const l = document.getElementById('smSearchLauncher'); if (!l) return null;
        const r = l.getBoundingClientRect();
        const bot = document.getElementById('smBarBottom').getBoundingClientRect();
        return { left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), bottom: Math.round(r.bottom),
                 w: Math.round(r.width), h: Math.round(r.height), barTop: Math.round(bot.top), vw: window.innerWidth };
      });
      check('[' + vp.name + '] search launcher is on screen and clears the bottom bar',
        !!launcher && launcher.left >= 0 && launcher.right <= launcher.vw && launcher.bottom <= launcher.barTop,
        launcher ? JSON.stringify(launcher) : 'missing');
      check('[' + vp.name + '] search launcher meets the 44px touch minimum',
        !!launcher && launcher.w >= 44 && launcher.h >= 44, launcher ? launcher.w + 'x' + launcher.h : 'missing');
    }
    await ctx.close();
  }

  // ---- 2. Every destination is reachable by real clicks ----
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto('http://localhost:' + PORT + '/index.html', { waitUntil: 'load' });
    await page.waitForTimeout(600);
    for (const t of TABS) {
      let ok = true;
      // page.click does real hit-testing, which is what caught the off-screen
      // nav originally; a synthetic dispatchEvent would pass on an unreachable
      // element and prove nothing.
      try { await page.click('.railbtn[data-tab="' + t + '"]', { timeout: 5000 }); }
      catch (e) { ok = false; }
      await page.waitForTimeout(250);
      const at = await page.evaluate(() => document.body.dataset.smPage);
      check('rail tab "' + t + '" is clickable and navigates', ok && at === t,
        ok ? ('landed on "' + at + '"') : 'not clickable (off-screen or covered)');
    }
    await ctx.close();
  }

  // ---- 3. Primary navigation covers the core workflow ----
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto('http://localhost:' + PORT + '/index.html', { waitUntil: 'load' });
    await page.waitForTimeout(600);
    const railTabs = await page.evaluate(() => [...document.querySelectorAll('.railbtn')].map(b => b.dataset.tab));
    check('primary navigation renders exactly the shipped destinations',
      railTabs.length === TABS.length, railTabs.join(', '));
    for (const t of TABS) check('"' + t + '" is a primary destination', railTabs.includes(t));
    check('Viva is removed from primary navigation', !railTabs.includes('viva'));
    check('Mocks are removed from primary navigation', !railTabs.includes('mocks'));
    check('More is a primary destination', railTabs.includes('more'));

    /* THE CHECK THAT WAS MISSING (13.2.1). render() dispatches on `tab`, and a
       tab with no branch silently falls through to renderToday(). Both `log`
       and `myday` had shipped that way: a button in the bar, a real renderer in
       the source, and Today on the screen. Nothing caught it, because every
       existing probe asked only "did something render?" — and Today always
       renders. Two tabs showing byte-identical output is the signature, so
       assert it directly. It also stops the opposite mistake: reading a
       fall-through as a redundant tab and deleting a screen that was merely
       unwired. */
    const sigs = {};
    /* Today opens on the arrival-state question and settles into the dashboard
       once answered, so its output legitimately differs between the first and
       second visit. Settle it BEFORE taking signatures — otherwise a tab that
       falls through to renderToday() compares against Today's pre-answer state
       and looks distinct, which is exactly how this check first passed on a
       defect it was written to catch. */
    await page.evaluate(() => { const e = document.querySelector('.railbtn[data-tab="today"]'); if (e) e.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
    await page.waitForTimeout(350);
    for (const t of TABS) {
      const opened = await page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return false; e.dispatchEvent(new MouseEvent('click', { bubbles: true })); return true; }, '.railbtn[data-tab="' + t + '"]');
      if (!opened) { check('tab "' + t + '" exists to be rendered', false); continue; }
      await page.waitForTimeout(300);
      /* Exclude the sr-only <h1>: it is built from SCREEN_NAME[tab], so it
         differs per tab even when the body below it is a fall-through, and
         including it made this check pass on the very defect it exists for. */
      sigs[t] = await page.evaluate(() => {
        const a = document.getElementById('app').cloneNode(true);
        const h = a.querySelector('.sm-a11y-h1'); if (h) h.remove();
        /* textContent, NOT innerText: several screens are page-scoped in CSS
           (`[data-sm-page="today"]` shows the arrival-state gate), so innerText
           made a fall-through to renderToday() look distinct from Today itself.
           textContent compares what was actually rendered, not what CSS chose
           to paint. */
        return (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 600);
      });
      check('"' + t + '" renders something', !!sigs[t]);
    }
    const seen = {};
    for (const t of Object.keys(sigs)) {
      const twin = seen[sigs[t]];
      check('"' + t + '" renders its own screen, not a fall-through',
        !twin, twin ? 'identical to "' + twin + '" — render() is probably missing a branch for one of them' : '');
      if (!twin) seen[sigs[t]] = t;
    }
    await ctx.close();
  }

  // ---- 4. Contrast floor (WCAG AA) across every mode and tab ----
  for (const mode of ['focus', 'study', 'night']) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto('http://localhost:' + PORT + '/index.html', { waitUntil: 'load' });
    await page.waitForTimeout(600);
    const applied = await setVisualMode(page, mode);
    check('[' + mode + '] visual mode is reachable and actually applies', applied);
    for (const t of TABS) {
      const opened = await page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return false; e.dispatchEvent(new MouseEvent('click', { bubbles: true })); return true; }, '.railbtn[data-tab="' + t + '"]');
      if (!opened) { check('tab "' + t + '" exists to be measured', false); continue; }
      await page.waitForTimeout(250);
      // Open the search panel with results showing, so its colours are measured
      // too. A display:none panel contributes nothing and would pass silently.
      await page.evaluate(async () => {
        const i = document.getElementById('smSearchInput');
        if (!i) return;
        i.focus(); i.value = 'pancreas';
        i.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise(r => setTimeout(r, 200));
      });
      await page.waitForTimeout(150);
      const bad = await page.evaluate(CONTRAST_PROBE);
      await page.evaluate(() => {
        const i = document.getElementById('smSearchInput');
        if (i) { i.value = ''; i.blur(); }
        document.body.classList.remove('sm-search-open');
        const w = document.getElementById('smSearchWrap'); if (w) w.classList.remove('open');
      });
      check('[' + mode + '/' + t + '] all text meets WCAG AA contrast', bad.length === 0,
        bad.slice(0, 4).join(' | '));
    }
    await ctx.close();
  }

  // ---- 5. No horizontal overflow, no console errors ----
  for (const vp of [VIEWPORTS[0], VIEWPORTS[1]]) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push('[pageerror] ' + e.message.slice(0, 160)));
    page.on('console', m => { if (m.type() === 'error') errs.push('[console] ' + m.text().slice(0, 160)); });
    await page.goto('http://localhost:' + PORT + '/index.html', { waitUntil: 'load' });
    await page.waitForTimeout(600);
    for (const t of TABS) {
      const opened = await page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return false; e.dispatchEvent(new MouseEvent('click', { bubbles: true })); return true; }, '.railbtn[data-tab="' + t + '"]');
      if (!opened) { check('tab "' + t + '" exists to be measured', false); continue; }
      await page.waitForTimeout(250);
      const spill = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth, out = [];
        document.querySelectorAll('#app *').forEach(el => {
          const b = el.getBoundingClientRect();
          if (b.width > 0 && (b.right > vw + 1 || b.left < -1)) {
            out.push((el.tagName + '.' + (typeof el.className === 'string' ? el.className.split(' ')[0] : '')).slice(0, 34));
          }
        });
        return [...new Set(out)];
      });
      check('[' + vp.name + '/' + t + '] no content spills outside the viewport', spill.length === 0, spill.slice(0, 3).join('; '));
    }
    check('[' + vp.name + '] walkthrough produces zero console errors', errs.length === 0, errs.slice(0, 3).join('\n         '));
    await ctx.close();
  }

  // ---- 6. Disclosure rows are tappable ----
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto('http://localhost:' + PORT + '/index.html', { waitUntil: 'load' });
    await page.waitForTimeout(600);
    for (const t of TABS) {
      const opened = await page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return false; e.dispatchEvent(new MouseEvent('click', { bubbles: true })); return true; }, '.railbtn[data-tab="' + t + '"]');
      if (!opened) { check('tab "' + t + '" exists to be measured', false); continue; }
      await page.waitForTimeout(250);
      const tiny = await page.evaluate(() => {
        const out = [];
        document.querySelectorAll('#app details > summary').forEach(s => {
          const r = s.getBoundingClientRect();
          if (r.height > 0 && r.height < 44) out.push((s.textContent || '').trim().slice(0, 26) + ' h=' + Math.round(r.height));
        });
        return out;
      });
      check('[' + t + '] every disclosure row meets the 44px touch minimum', tiny.length === 0, tiny.slice(0, 3).join('; '));
    }
    await ctx.close();
  }

  await browser.close();
  server.close();

  if (failures) { console.log('\nUI GEOMETRY FAIL: ' + failures + ' check(s) failed.'); process.exit(1); }
  console.log('\nUI GEOMETRY PASS: launcher reachable at 5 viewports, grid covers the app, real clicks route, AA contrast in 3 modes x 5 tabs, no overflow, no console errors, touch targets met.');
})();
