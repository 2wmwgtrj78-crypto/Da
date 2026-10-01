const path=require('path'),http=require('http'),fs=require('fs');const {chromium}=require('playwright');
const ROOT='/home/claude/app/Dakshinamurthy_V34_Final';const PORT=9971;
const M={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json','.json':'application/json'};
const PROPS=['color','background-color','background-image','font-size','font-weight','line-height',
 'display','position','top','left','right','bottom','width','height','margin','padding','border',
 'border-radius','flex','grid-template-columns','opacity','visibility','transform','z-index',
 'text-align','white-space','overflow','box-shadow','letter-spacing','gap','min-height','max-width'];
const SNAP=`(() => {const out=[];document.querySelectorAll('html,body,nav,#app,#app *,nav *').forEach((el,i)=>{
 const cs=getComputedStyle(el);const o=[el.tagName,(typeof el.className==='string'?el.className:'')];
 ${JSON.stringify(PROPS)}.forEach(p=>o.push(cs.getPropertyValue(p)));out.push(o.join('|'));});return out;})()`;
http.createServer((q,res)=>{let u=q.url.split('?')[0];if(u==='/')u='/index.html';fs.readFile(path.join(ROOT,u),(e,d)=>{if(e){res.writeHead(404);res.end();return}res.writeHead(200,{'Content-Type':M[path.extname(u)]||'text/plain','Cache-Control':'no-store'});res.end(d)})}).listen(PORT,async()=>{
const b=await chromium.launch();let states=0,mismatch=0;const bad=[];
for(const vp of [{w:390,h:844},{w:1280,h:800}]){
for(const mode of ['focus','study','night']){
 const ctx=await b.newContext({viewport:{width:vp.w,height:vp.h}});const p=await ctx.newPage();
 await p.goto(`http://localhost:${PORT}/index.html`);await p.waitForTimeout(700);
 await p.evaluate(()=>document.querySelector('button[data-tab="more"]').dispatchEvent(new MouseEvent('click',{bubbles:true})));await p.waitForTimeout(250);
 await p.evaluate(()=>{const e=document.querySelector('[data-go-tab="settings"]');e&&e.dispatchEvent(new MouseEvent('click',{bubbles:true}))});await p.waitForTimeout(300);
 await p.evaluate(m=>{const e=document.querySelector('[data-visual-mode="'+m+'"]');e&&e.dispatchEvent(new MouseEvent('click',{bubbles:true}))},mode);await p.waitForTimeout(300);
 const screens=['today','myday','study','revise','log','viva','progress','mocks','plan','ai','settings'];
 for(const t of screens.concat(['settings','plan','ai'])){
  if(screens.includes(t)) await p.evaluate(sel=>document.querySelector(sel).dispatchEvent(new MouseEvent('click',{bubbles:true})),`.railbtn[data-tab="${t}"]`);
  else { await p.evaluate(()=>document.querySelector('button[data-tab="more"]').dispatchEvent(new MouseEvent('click',{bubbles:true})));await p.waitForTimeout(200);
         await p.evaluate(g=>{const e=document.querySelector('[data-go-tab="'+g+'"]');e&&e.dispatchEvent(new MouseEvent('click',{bubbles:true}))},t); }
  await p.waitForTimeout(350);
  await p.evaluate(()=>document.querySelectorAll('#app details').forEach(d=>d.open=true));await p.waitForTimeout(350);
  // Snapshot with the ORIGINAL stylesheet, hot-swapped in (no reload => same DOM, same instant)
  await p.evaluate(()=>{document.querySelector('link[rel=stylesheet]').href='surgimaster-orig.css';});
  await p.waitForTimeout(450);
  const before=await p.evaluate(SNAP);
  await p.evaluate(()=>{document.querySelector('link[rel=stylesheet]').href='surgimaster.css';});
  await p.waitForTimeout(450);
  const after=await p.evaluate(SNAP);
  states++;
  if(before.length!==after.length){mismatch++;bad.push(`${vp.w}/${mode}/${t}: element count ${before.length}->${after.length}`);continue;}
  const diffs=before.map((x,i)=>[x,after[i]]).filter(([x,y])=>x!==y);
  if(diffs.length){mismatch++;bad.push(`${vp.w}/${mode}/${t}: ${diffs.length} elements differ e.g. ${diffs[0][0].slice(0,90)} VS ${diffs[0][1].slice(0,90)}`);}
 }
 await ctx.close();
}}
console.log('states compared:',states,'| states with any computed-style change:',mismatch);
bad.slice(0,8).forEach(x=>console.log('  -',x));
await b.close();process.exit(0)});
