const path=require('path'),http=require('http'),fs=require('fs');const {chromium}=require('playwright');
const ROOT='/home/claude/app/Dakshinamurthy_V34_Final';const PORT=9333;
const M={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json','.json':'application/json'};
const srv=http.createServer((q,res)=>{let u=q.url.split('?')[0];if(u==='/')u='/index.html';fs.readFile(path.join(ROOT,u),(e,d)=>{if(e){res.writeHead(404);res.end();return}res.writeHead(200,{'Content-Type':M[path.extname(u)]||'text/plain','Cache-Control':'no-store'});res.end(d)})});
const F=[];
srv.listen(PORT,async()=>{const b=await chromium.launch();

// ---- 1. Accessibility semantics ----
{const p=await(await b.newContext({viewport:{width:390,height:844}})).newPage();
 await p.goto(`http://localhost:${PORT}/index.html`);await p.waitForTimeout(700);
 for(const t of ['today','myday','study','revise','log','viva','progress','mocks','plan','ai','settings']){
  await p.evaluate(s=>document.querySelector(s).dispatchEvent(new MouseEvent('click',{bubbles:true})),`.railbtn[data-tab="${t}"]`);
  await p.waitForTimeout(300);
  await p.evaluate(()=>document.querySelectorAll('#app details').forEach(d=>d.open=true));await p.waitForTimeout(250);
  const r=await p.evaluate(()=>{
   const o={noName:[],imgNoAlt:[],inputNoLabel:[],headingJumps:[],emptyLink:[]};
   document.querySelectorAll('#app button,nav button').forEach(el=>{
     const n=(el.getAttribute('aria-label')||el.textContent||'').trim();
     if(!n) o.noName.push(el.className.slice(0,30)||el.outerHTML.slice(0,40));});
   document.querySelectorAll('#app img').forEach(i=>{if(i.getAttribute('alt')===null)o.imgNoAlt.push(i.getAttribute('src'));});
   document.querySelectorAll('#app input,#app select,#app textarea').forEach(el=>{
     const id=el.id,lab=id&&document.querySelector('label[for="'+CSS.escape(id)+'"]');
     if(!lab&&!el.getAttribute('aria-label')&&!el.closest('label'))o.inputNoLabel.push((el.tagName+' '+(el.name||el.id||el.className)).slice(0,34));});
   let last=0;document.querySelectorAll('#app h1,#app h2,#app h3,#app h4').forEach(h=>{
     const lv=+h.tagName[1]; if(last&&lv>last+1)o.headingJumps.push('h'+last+'->h'+lv+' "'+h.textContent.trim().slice(0,22)+'"'); last=lv;});
   document.querySelectorAll('#app a').forEach(a=>{if(!(a.textContent||'').trim()&&!a.getAttribute('aria-label'))o.emptyLink.push(a.getAttribute('href'));});
   return o;});
  const u=a=>[...new Set(a)];
  u(r.noName).slice(0,3).forEach(x=>F.push(`[a11y/${t}] button with no accessible name: ${x}`));
  u(r.imgNoAlt).slice(0,3).forEach(x=>F.push(`[a11y/${t}] img missing alt: ${x}`));
  u(r.inputNoLabel).slice(0,4).forEach(x=>F.push(`[a11y/${t}] form control with no label: ${x}`));
  u(r.headingJumps).slice(0,3).forEach(x=>F.push(`[a11y/${t}] heading level skipped: ${x}`));
  u(r.emptyLink).slice(0,2).forEach(x=>F.push(`[a11y/${t}] link with no text: ${x}`));
 }
 // document-level
 const doc=await p.evaluate(()=>({lang:document.documentElement.lang,title:document.title,
   h1:document.querySelectorAll('h1').length, main:document.querySelectorAll('[role=main],main').length,
   navLabel:!!document.querySelector('nav').getAttribute('aria-label'),
   viewportMeta:(document.querySelector('meta[name=viewport]')||{}).content||''}));
 if(!doc.lang)F.push('[a11y/doc] <html> has no lang attribute');
 if(!doc.title)F.push('[a11y/doc] document has no <title>');
 if(doc.h1===0)F.push('[a11y/doc] no <h1> anywhere in the app');
 if(/user-scalable=no|maximum-scale=1/.test(doc.viewportMeta))F.push('[a11y/doc] viewport blocks pinch-zoom: '+doc.viewportMeta);
 // keyboard reachability of nav
 const kb=await p.evaluate(async()=>{const order=[];for(let i=0;i<40;i++){order.push(document.activeElement&&(document.activeElement.dataset&&document.activeElement.dataset.tab||document.activeElement.tagName));}return order.length;});
 await p.close();}

// ---- 2. Boot performance & payload ----
{const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();
 let bytes=0;p.on('response',async r=>{try{const h=r.headers()['content-length'];if(h)bytes+=+h;}catch(e){}});
 const t0=Date.now();await p.goto(`http://localhost:${PORT}/index.html`,{waitUntil:'load'});
 await p.waitForFunction(()=>document.querySelector('#app .card,#app .sm-v25-route-main'),{timeout:10000}).catch(()=>F.push('[perf] first content never rendered within 10s'));
 const boot=Date.now()-t0;
 const metrics=await p.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0]||{};
   return{dom:Math.round(n.domContentLoadedEventEnd||0),load:Math.round(n.loadEventEnd||0),nodes:document.querySelectorAll('*').length};});
 F.push(`[perf] boot to first card ${boot}ms | DOMContentLoaded ${metrics.dom}ms | DOM nodes ${metrics.nodes} | transferred ~${Math.round(bytes/1024)}KB`);
 if(boot>3000)F.push('[perf] boot slower than 3s on a fast local server');
 await ctx.close();}

// ---- 3. Corrupt / hostile stored state ----
for(const [name,val] of [['corrupt JSON','{not json'],['wrong shape','{"prefs":42,"scores":"nope"}'],['empty','']]){
 const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();
 const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,90)));
 await p.addInitScript(v=>{try{localStorage.setItem('sm8',v);}catch(e){}},val);
 await p.goto(`http://localhost:${PORT}/index.html`);await p.waitForTimeout(1200);
 const ok=await p.evaluate(()=>({rendered:!!document.querySelector('#app .card,#app .sm-v25-route-main'),
   bootErr:!!(document.getElementById('sm8BootError')&&document.getElementById('sm8BootError').offsetHeight>0)}));
 if(!ok.rendered&&!ok.bootErr)F.push(`[recovery/${name}] app renders nothing and shows no boot error`);
 else if(!ok.rendered)F.push(`[recovery/${name}] app fell back to the boot-error screen`);
 if(errs.length)F.push(`[recovery/${name}] uncaught: ${errs[0]}`);
 await ctx.close();}

// ---- 4. Extreme viewports ----
for(const vp of [{n:'320w',w:320,h:568},{n:'landscape',w:844,h:390},{n:'large',w:1920,h:1080}]){
 const ctx=await b.newContext({viewport:{width:vp.w,height:vp.h}});const p=await ctx.newPage();
 await p.goto(`http://localhost:${PORT}/index.html`);await p.waitForTimeout(700);
 const r=await p.evaluate(()=>{const vw=document.documentElement.clientWidth;const out=[];
  document.querySelectorAll('.navbtn').forEach(x=>{const b=x.getBoundingClientRect();
    if(b.left<0||b.right>vw)out.push('nav '+x.dataset.tab+' off-screen');});
  document.querySelectorAll('#app *').forEach(el=>{const b=el.getBoundingClientRect();
    if(b.width>0&&(b.right>vw+1||b.left<-1))out.push('overflow '+(el.className||el.tagName).toString().slice(0,26));});
  return [...new Set(out)];});
 r.slice(0,3).forEach(x=>F.push(`[viewport/${vp.n}] ${x}`));
 await ctx.close();}

await b.close();srv.close();
console.log('=== FRESH AUDIT ('+F.length+') ===');F.forEach(x=>console.log(' - '+x));
process.exit(0)});
