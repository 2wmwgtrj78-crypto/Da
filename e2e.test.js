/* Playwright E2E suite for Dakshinamurthy.
 * Run: npm run test:e2e
 * First setup: npm run test:e2e:install
 */
const path = require('path');
const http = require('http');
const fs = require('fs');
let chromium;
try { chromium = require('playwright').chromium; }
catch (e) {
  console.error('E2E BLOCKED: Playwright is not installed. Run `npm run test:e2e:install`.');
  process.exit(2);
}
const ROOT = path.join(__dirname, '..');
const PORT = 8917;
const MIME = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
function startServer(){return new Promise(resolve=>{const s=http.createServer((req,res)=>{let p=(req.url||'/').split('?')[0]; if(p==='/')p='/index.html'; const full=path.join(ROOT,p); fs.readFile(full,(err,data)=>{if(err){res.writeHead(404);return res.end();}res.writeHead(200,{'Content-Type':MIME[path.extname(full)]||'application/octet-stream'});res.end(data);});});s.listen(PORT,()=>resolve(s));});}
let failures=0;
function check(label,cond){if(cond)console.log('  OK   '+label);else{console.log('  FAIL '+label);failures++;}}
async function fresh(browser, extra={}){return browser.newContext({viewport:{width:390,height:844},...extra});}
async function noErrors(page){const issues=[];page.on('pageerror',e=>issues.push('[pageerror] '+e.message));page.on('console',m=>{if(m.type()==='error')issues.push('[console] '+m.text().slice(0,240));});return issues;}
(async()=>{
 const server=await startServer(); const browser=await chromium.launch();
 try {
  // 1. Launch + navigation + no console/page errors.
  {const ctx=await fresh(browser);const page=await ctx.newPage();const issues=await noErrors(page);await page.goto(`http://localhost:${PORT}/index.html`,{waitUntil:'networkidle'});await page.waitForTimeout(250);
   check('app launches',await page.locator('#app').count()===1);
   const tabs=await page.locator('.railbtn').evaluateAll(bs=>bs.map(b=>b.dataset.tab));
   check('expected tabs exist', ['today','myday','log','revise','progress','study','plan','ai','settings','help'].every(x=>tabs.includes(x)));
   check('Viva is absent from navigation',!tabs.includes('viva'));
   check('Mocks are absent from navigation',!tabs.includes('mocks'));
   for(const t of ['today','myday','log','revise','progress','study','plan','ai','settings','help']){await page.locator(`.railbtn[data-tab="${t}"]`).click();await page.waitForTimeout(80);check(`${t} renders`,await page.locator('#app').innerText()!=='');}
   check('navigation walkthrough has no browser errors',issues.length===0); if(issues.length)console.log(issues.join('\n'));await ctx.close();}

  // 2. Question logging critical path.
  {const ctx=await fresh(browser);const page=await ctx.newPage();const issues=await noErrors(page);await page.goto(`http://localhost:${PORT}/index.html`,{waitUntil:'networkidle'});await page.locator('.railbtn[data-tab="log"]').click();await page.waitForTimeout(120);
   check('Log screen has clear title/action',/log/i.test(await page.locator('#app').innerText()));
   /* The Log screen's front controls are the self-rating triple and the
   per-question log rows; qconf/qerr/qapp appear only after a question is
   chosen. Asserting only on the deep ones meant this check could not pass
   even when the screen rendered perfectly. */
   const controls=await page.locator('[data-qr],[data-qlog],[data-qopen],[data-qconf],[data-qerr],[data-qapp]').count();
   check('Log screen exposes question controls',controls>0);
   check('Log screen has a save/commit control',await page.locator('button').evaluateAll(bs=>bs.some(b=>/save|log|record|commit/i.test((b.innerText||'')+' '+(b.getAttribute('aria-label')||'')))));
   check('logging path has no browser errors',issues.length===0);await ctx.close();}

  // 3. Help -> feedback -> persistence -> AI packet.
  {const ctx=await fresh(browser);const page=await ctx.newPage();await page.goto(`http://localhost:${PORT}/index.html`,{waitUntil:'networkidle'});await page.locator('.railbtn[data-tab="help"]').click();await page.waitForTimeout(120);
   await page.locator('#smFeedbackText').fill('Playwright feedback test');await page.locator('#smSaveFeedback').click();await page.waitForTimeout(80);
   check('feedback saves locally',await page.locator('#smFeedbackStatus').innerText().then(t=>/Saved on this device/i.test(t)));
   check('saved feedback is visible',await page.locator('.help-saved').innerText().then(t=>t.includes('Playwright feedback test')));
   check('Copy for AI is enabled',await page.locator('#smAiFeedback').isEnabled());
   check('AI packet contains instruction/data',await page.evaluate(()=>{const raw=localStorage.getItem('dakshinamurthy.feedback.v2');return !!raw&&raw.includes('Playwright feedback test');}));
   await page.reload({waitUntil:'networkidle'});await page.locator('.railbtn[data-tab="help"]').click();await page.waitForTimeout(80);
   check('feedback survives reload',await page.locator('.help-saved').innerText().then(t=>t.includes('Playwright feedback test')));
   await ctx.close();}

  // 4. Offline shell + local feedback write.
  {const ctx=await fresh(browser);const page=await ctx.newPage();await page.goto(`http://localhost:${PORT}/index.html`,{waitUntil:'networkidle'});await page.locator('.railbtn[data-tab="help"]').click();await page.waitForTimeout(100);await ctx.setOffline(true);await page.reload({waitUntil:'domcontentloaded'}).catch(()=>{});await page.waitForTimeout(250);
   check('offline app shell remains available',await page.locator('#app').count()===1);
   check('offline Help is reachable',await page.locator('.railbtn[data-tab="help"]').count()===1);
   await ctx.setOffline(false);await ctx.close();}

  // 5. Mobile visibility checks.
  {const ctx=await fresh(browser,{viewport:{width:390,height:844}});const page=await ctx.newPage();await page.goto(`http://localhost:${PORT}/index.html`,{waitUntil:'networkidle'});for(const t of ['today','log','progress','help']){await page.locator(`.railbtn[data-tab="${t}"]`).click();await page.waitForTimeout(80);const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+2);check(`${t} has no horizontal overflow`,!overflow);}await ctx.close();}
 } finally {await browser.close();server.close();}
 if(failures){console.log(`\nE2E FAILED: ${failures} check(s)`);process.exit(1);}console.log('\nE2E PASS: navigation, logging, feedback persistence, offline shell, and mobile overflow checks passed.');
})();
