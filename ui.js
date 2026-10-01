/* Dakshinamurthy UI production bundle — 15.0.0. Generated; edit ui-modules instead. */

/* ===== UI MODULE 1: ui-core.part.js ===== */
/* Dakshinamurthy UI — vanilla, no framework, no network. */
(function(){
var SM=window.SM, DAY=SM.DAY;
var $=function(id){ return document.getElementById(id); };
function clip(s,n){
  s=String(s);
  if(s.length<=n) return s;
  var cut=s.slice(0,n), sp=cut.lastIndexOf(" ");
  return (sp>n*0.55?cut.slice(0,sp):cut).replace(/[\s,;:\u2013-]+$/,"")+"\u2026";
}
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(m){
  return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]; }); }
function merge(a,b){ var o={}; for(var k in a) o[k]=a[k]; for(var j in b) if(b[j]!==undefined) o[j]=b[j]; return o; }

var KEY="surgimaster:v10";

/* ---------- shot store: screenshots of wrong questions ----------
   Images live in IndexedDB, not localStorage — localStorage is a few MB of
   strings and photos would blow it out and take the whole diary with them. */
var DB=null, DBFAIL=false;
function db(){
  return new Promise(function(res,rej){
    if(DB) return res(DB);
    if(DBFAIL||!window.indexedDB) return rej(new Error("no indexedDB"));
    var r=indexedDB.open("surgimaster-shots",1);
    r.onupgradeneeded=function(){ if(!r.result.objectStoreNames.contains("s")) r.result.createObjectStore("s"); };
    r.onsuccess=function(){ DB=r.result; res(DB); };
    r.onerror=function(){ DBFAIL=true; rej(r.error); };
  });
}
function shotGet(id){
  return db().then(function(d){ return new Promise(function(res,rej){
    var tx=d.transaction("s","readonly"), q=tx.objectStore("s").get(id);
    q.onsuccess=function(){res(q.result||null);}; q.onerror=function(){rej(q.error);}; }); });
}
var STATE_SCHEMA_VERSION=8;
function migrateState(s){
  s=(s&&typeof s==='object')?s:{};
  var v=Number(s.schemaVersion)||1;
  if(v<2){ s.adaptiveProfile=s.adaptiveProfile||{topics:{},lastUpdate:null}; }
  if(v<3){ s.adaptive4=s.adaptive4||{strategies:{},runs:0}; }
  if(v<4){ s.procedures=s.procedures||{}; }
  if(v<5){ s.notifications=s.notifications||{enabled:false,reminderMinutes:30,publicKey:'',subscription:null,lastSentAt:0}; }
  if(v<6){ s.diagnostics=s.diagnostics||{lastLoadAt:0,lastSaveAt:0,lastMigrationAt:Date.now(),lastSchedulerAt:0}; }
  if(v<7){ s.productPrinciples=s.productPrinciples||{adaptive:true,ai:true,usability:true,stability:true,viability:true}; }
  if(v<8){ s.recoveryLog=s.recoveryLog||{}; }
  s.schemaVersion=STATE_SCHEMA_VERSION;
  if(v<STATE_SCHEMA_VERSION){ s.diagnostics=s.diagnostics||{}; s.diagnostics.lastMigrationAt=Date.now(); }
  return s;
}
function normalizeState(s){
  s=migrateState(s);
  s=(s&&typeof s==='object')?s:{};
  s.prefs=merge(SM.DEFAULTS,s.prefs||{});
  /* Schedule reset: campaign begins 19 Sep 2026. Migrate only the superseded
     default dates so an existing install moves to the new start; never touch
     logged study data. Each old default is listed explicitly rather than
     overwriting whatever is stored, so a start date the user set deliberately
     is left alone. */
  if(s.prefs.startISO==="2026-09-12"||s.prefs.startISO==="2026-09-15") s.prefs.startISO="2026-09-19";
  if(!s.prefs.exams||!s.prefs.exams.length) s.prefs.exams=SM.DEFAULTS.exams;
  s.misses=Array.isArray(s.misses)?s.misses:[];
  s.days=(s.days&&typeof s.days==='object')?s.days:{};
  s.scores=(s.scores&&typeof s.scores==='object')?s.scores:{};
  s.calib=Array.isArray(s.calib)?s.calib:[];
  s.tallies=(s.tallies&&typeof s.tallies==='object')?s.tallies:{};
  s.repairs=(s.repairs&&typeof s.repairs==='object')?s.repairs:{};
  s.mcq=(s.mcq&&typeof s.mcq==='object')?s.mcq:{};
  s.cursors=(s.cursors&&typeof s.cursors==='object')?s.cursors:{};
  s.lecDone=(s.lecDone&&typeof s.lecDone==='object')?s.lecDone:{};
  delete s.viva;
  s.swaps=Array.isArray(s.swaps)?s.swaps:[];
  s.notes=Array.isArray(s.notes)?s.notes:[];
  s.pace=(s.pace&&typeof s.pace==='object')?s.pace:{};
  s.hist=(s.hist&&typeof s.hist==='object')?s.hist:{};
  delete s.mocks;
  s.calls=(s.calls&&typeof s.calls==='object')?s.calls:{};
  s.ics=merge({detail:"block",alarm:10,protect:true,range:"14"},s.ics||{});
  s.retiredCount=Number(s.retiredCount)||0;
  s.lastActivityAt=Number(s.lastActivityAt)||null;
  s.minimumDay=!!s.minimumDay;
  s.minimumDayDate=typeof s.minimumDayDate==='string'?s.minimumDayDate:null;
  s.session=(s.session&&typeof s.session==='object')?s.session:null;
  s.recoveryLog=(s.recoveryLog&&typeof s.recoveryLog==='object')?s.recoveryLog:{};
  Object.keys(s.recoveryLog).forEach(function(k){
    var x=s.recoveryLog[k];
    if(!x||typeof x!=='object'||['completed','dismissed','stopped'].indexOf(x.status)<0) delete s.recoveryLog[k];
  });
  if(s.session) s.session.current=Math.max(0,Math.floor(Number(s.session.current)||0));
  s.aiProfile=(s.aiProfile&&typeof s.aiProfile==='object')?s.aiProfile:{runs:0,topics:{},lastAction:null,history:[],provider:'external',consent:false};
  s.aiProfile.provider=['external','chatgpt','local'].indexOf(s.aiProfile.provider)>=0?s.aiProfile.provider:'external';
  s.aiProfile.consent=!!s.aiProfile.consent;
  s.aiProfile.history=Array.isArray(s.aiProfile.history)?s.aiProfile.history:[];
  s.adaptiveProfile=(s.adaptiveProfile&&typeof s.adaptiveProfile==='object')?s.adaptiveProfile:{topics:{},lastUpdate:null};
  s.adaptiveProfile.topics=(s.adaptiveProfile.topics&&typeof s.adaptiveProfile.topics==='object')?s.adaptiveProfile.topics:{};
  s.adaptive4=(s.adaptive4&&typeof s.adaptive4==='object')?s.adaptive4:{strategies:{},runs:0};
  s.adaptive4.strategies=(s.adaptive4.strategies&&typeof s.adaptive4.strategies==='object')?s.adaptive4.strategies:{};
  s.visualMode=(s.visualMode==='focus'||s.visualMode==='study'||s.visualMode==='night')?s.visualMode:'focus';
  s.procedures=(s.procedures&&typeof s.procedures==='object')?s.procedures:{};
  s.notifications=merge({enabled:false,reminderMinutes:30,publicKey:'',subscription:null,lastSentAt:0},s.notifications||{});
  s.diagnostics=merge({lastLoadAt:Date.now(),lastSaveAt:0,lastMigrationAt:0,lastSchedulerAt:0},s.diagnostics||{});
  s.productPrinciples=merge({adaptive:true,ai:true,usability:true,stability:true,viability:true},s.productPrinciples||{});
  s.schemaVersion=STATE_SCHEMA_VERSION;
  return s;
}
var state=load();
function blankState(){
  return normalizeState({schemaVersion:STATE_SCHEMA_VERSION,prefs:merge(SM.DEFAULTS,{}),misses:[],days:{},scores:{},calib:[],tallies:{},repairs:{},mcq:{},cursors:{},lecDone:{},swaps:[],notes:[],pace:{},hist:{},calls:{},cursor:null,minimumDay:false,minimumDayDate:null,session:null,aiProfile:{runs:0,topics:{},lastAction:null,history:[],provider:'external',consent:false},productPrinciples:{adaptive:true,ai:true,usability:true,stability:true,viability:true},adaptiveProfile:{topics:{},lastUpdate:null},adaptive4:{strategies:{},runs:0},procedures:{},notifications:{enabled:false,reminderMinutes:30,publicKey:"",subscription:null,lastSentAt:0},diagnostics:{lastLoadAt:Date.now(),lastSaveAt:0,lastMigrationAt:0,lastSchedulerAt:0},visualMode:"focus"});
}
function load(){
  try{
    var raw=localStorage.getItem(KEY);
    if(raw){ var loaded=normalizeState(JSON.parse(raw)); loaded.diagnostics.lastLoadAt=Date.now(); return loaded; }
  }catch(e){
    /* Recover only from a previously validated snapshot. Never intentionally
       replace a user's good backup with an empty state. */
    try{
      var recovery=recoverLatest() || localStorage.getItem(KEY+":recovery") || localStorage.getItem(KEY+":last");
      if(recovery){ var recovered=normalizeState(JSON.parse(recovery)); recovered.diagnostics.lastLoadAt=Date.now(); return recovered; }
    }catch(ignore){}
  }
  return blankState();
}
var RECOVERY_RING=3;
function snapshotState(raw){
  try{
    var base=KEY+":recovery:", old=[];
    for(var i=0;i<RECOVERY_RING;i++){ var v=localStorage.getItem(base+i); if(v) old.push(v); }
    for(var j=RECOVERY_RING-1;j>0;j--){ if(old[j-1]) localStorage.setItem(base+j,old[j-1]); }
    localStorage.setItem(base+0,raw);
    return true;
  }catch(e){ try{console.warn("Recovery snapshot failed",e); }catch(ignore){} return false; }
}
function validStateJSON(raw){
  try{ var x=JSON.parse(raw); return !!(x&&typeof x==='object'&&x.prefs&&typeof x.prefs==='object'&&Array.isArray(x.misses)&&x.days&&typeof x.days==='object'); }
  catch(e){ return false; }
}
function recoverLatest(){
  for(var i=0;i<RECOVERY_RING;i++){
    try{ var raw=localStorage.getItem(KEY+":recovery:"+i); if(raw&&validStateJSON(raw)) return raw; }catch(e){}
  }
  return null;
}
function smStorageEstimate(){
  var used=0, keys=0;
  try{ for(var i=0;i<localStorage.length;i++){ var k=localStorage.key(i),v=localStorage.getItem(k)||''; keys++; used+=(k?k.length:0)+v.length; } }catch(e){}
  return {keys:keys,chars:used,approxKB:Math.round(used*2/1024),warn:used>3500000};
}
function smSystemHealth(){
  var checks=[];
  try{ checks.push({n:"Study data",ok:validStateJSON(localStorage.getItem(KEY)||"")}); }catch(e){checks.push({n:"Study data",ok:false});}
  try{ checks.push({n:"Recovery snapshots",ok:!!recoverLatest()}); }catch(e){checks.push({n:"Recovery snapshots",ok:false});}
  checks.push({n:"IndexedDB",ok:!!window.indexedDB});
  checks.push({n:"Service worker",ok:'serviceWorker' in navigator});
  checks.push({n:"Online",ok:navigator.onLine!==false});
  try{ checks.push({n:"Storage headroom",ok:!smStorageEstimate().warn}); }catch(e){checks.push({n:"Storage headroom",ok:true});}
  return checks;
}
var saveInProgress=false, saveQueued=false;
function save(){
  if(saveInProgress){ saveQueued=true; return; }
  saveInProgress=true;
  try{
    state.schemaVersion=STATE_SCHEMA_VERSION;
    state.diagnostics=state.diagnostics||{};
    state.diagnostics.lastSaveAt=Date.now();
    var raw=JSON.stringify(state);
    if(!raw) throw new Error('Could not serialize study state');
    var previous=localStorage.getItem(KEY);
    /* Write a validated recovery copy before replacing primary state. If
       recovery storage is full, still attempt the primary write rather than
       failing the whole save. */
    if(previous && validStateJSON(previous)) snapshotState(previous);
    try{ localStorage.setItem(KEY+":last",raw); }catch(eLast){ /* primary remains the source of truth */ }
    localStorage.setItem(KEY,raw);
    var check=localStorage.getItem(KEY);
    if(!check || !validStateJSON(check)) throw new Error('Saved state failed verification');
    $("saveWarn").hidden=true;
  }catch(e){
    $("saveWarn").hidden=false;
    try{ console.warn("Dakshinamurthy save failed",e); }catch(ignore3){}
  }finally{
    saveInProgress=false;
    if(saveQueued){ saveQueued=false; setTimeout(save,0); }
  }
}
/* Real per-topic accuracy, fed into the scheduler so analysis time is booked
   against what you actually get wrong rather than a flat rate on everything.
   Requires 20 logged questions on a topic before it is trusted \u2014 below that
   the sample says more about which questions you happened to meet than about
   what you know, and the engine falls back to a deliberately generous
   assumption. Nothing here changes until you have logged enough for it to
   mean something. */
function liveTopicAcc(){
  var m={};
  Object.keys(state.scores||{}).forEach(function(k){
    var s=state.scores[k], n=(s.ba||0)+(s.sa||0);
    if(n>=20) m[+k]={acc:((s.bc||0)+(s.sc||0))/n, n:n};
  });
  return m;
}
/* Frees scheduling minutes for genuinely, safely mastered topics — never
   frees questions. Deliberately conservative: only a topic with strong
   accuracy AND retention-confirmed stability AND no overconfidence signal
   gets a pace break, and even then only a partial one. Depends on `plan`
   already existing (smAdaptiveTopics reads plan.P for exam-date context),
   so it safely no-ops on the very first plan build of a session and takes
   effect from the next rebuild() on — exactly like liveTopicAcc's own
   n>=20 gate, evidence has to exist before it is allowed to change anything. */
function liveMasteryPace(){
  var out={};
  try{
    smAdaptiveTopics(todayISO()).forEach(function(a){
      if(a.mastery>=0.8 && a.accuracy!=null && a.accuracy>=0.85 && a.retentionState==='stable' && a.calibrationState!=='overconfident'){
        out[a.i]=0.65;
      }
    });
  }catch(e){}
  return out;
}
function prefsWithAcc(){
  var P={}; for(var k in state.prefs) P[k]=state.prefs[k];
  P.topicAcc=liveTopicAcc();
  P.masteryPace=liveMasteryPace();
  return P;
}
var plan=SM.buildPlan(prefsWithAcc());
reapplyReplanIfAny();
applySwaps();
function rebuild(){ plan=SM.buildPlan(prefsWithAcc()); reapplyReplanIfAny(); applySwaps(); }

var timer=null;      /* {blockId, start, base, running} — logs real elapsed time */
var TIMER_KEY="surgimaster:active-timer";
function persistTimer(){
  try{ if(timer) sessionStorage.setItem(TIMER_KEY,JSON.stringify(timer)); else sessionStorage.removeItem(TIMER_KEY); }catch(e){}
}
function restoreTimer(){
  try{ var raw=sessionStorage.getItem(TIMER_KEY); if(!raw) return; var t=JSON.parse(raw);
    if(t&&typeof t.blockId==='string'&&Number.isFinite(t.start)&&Number.isFinite(t.base)&&typeof t.running==='boolean'){ timer=t; }
  }catch(e){ try{sessionStorage.removeItem(TIMER_KEY);}catch(ignore){} }
}
restoreTimer();
var compact=false;
var panel=null;   /* which inline logger is open, if any */
var pendingPace=null;/* {ti, secs, q} — asked inline, never through a prompt box */
function timerElapsed(){
  if(!timer) return 0;
  return timer.base + (timer.running ? Math.floor((Date.now()-timer.start)/1000) : 0);
}
var tab="today", openBlock=null, logMode="tally", reviewShown=null, msg=null, showAll=false, practiceMode="hub";

/* ---------- helpers ---------- */
function todayISO(){ return SM.iso(new Date()); }
function activeDate(){
  if(state.cursor) return state.cursor;
  var t=todayISO(), c=plan.content;
  for(var i=0;i<c.length;i++){
    if(c[i].date>t) break;
    var r=state.days[c[i].date];
    if(!r) return c[i].date;
    var n=0, ch=r.checks||{};
    for(var k in ch) if(ch[k]===true) n++;   /* a half-done block is not a done block */
    if(n < c[i].blocks.filter(function(b){return b.kind!=="lunch"&&b.kind!=="buffer";}).length) return c[i].date;
  }
  for(var j=0;j<plan.CAL.length;j++) if(plan.CAL[j].date>=t) return plan.CAL[j].date;
  return t;
}
function recFor(d){
  if(!state.days[d]) state.days[d]={bank:0,speed:0,mins:0,checks:{},layer:null};
  return state.days[d];
}
function scoreFor(ti){
  if(!state.scores[ti]) state.scores[ti]={ba:0,bc:0,sa:0,sc:0};
  return state.scores[ti];
}
function tallyFor(ti){
  if(!state.tallies[ti]) state.tallies[ti]={};
  return state.tallies[ti];
}
/* NAMING (6.4.0): "phase" meant two unrelated things in this codebase and the
   collision caused two live bugs — the Syllabus "Current phase" grid and the
   matched nothing. The two concepts are now named apart and must stay so:

     examStyleNow()        -> "ini" | "neet"  — which exam is next, drives
                              STYLES/pacing. NEVER compare this to t.phase.
     curriculumPhaseNow()  -> 1..7            — which block of the syllabus is
                              being studied. This is what t.phase holds. */
function examStyleNow(d){
  var e=SM.nextExam(state.prefs,d||todayISO());
  return e?e.style:"ini";
}
function styleNow(d){ return SM.STYLES[examStyleNow(d)]||SM.STYLES.ini; }
/* The phase actually being studied: taken from today's route, falling back to
   the earliest phase that still has unfinished topics, then to phase 1. */
function curriculumPhaseNow(){
  try{
    var e=plan.byDate[activeDate()];
    if(e && e.blocks){
      for(var i=0;i<e.blocks.length;i++){
        var t=e.blocks[i].ti!=null?SM.CURRICULUM[e.blocks[i].ti]:null;
        if(t && t.phase) return t.phase;
      }
    }
    var topics=(plan.B&&plan.B.topics)||[];
    for(var k=1;k<=7;k++){
      var pend=topics.filter(function(t){return t.phase===k && topicAcc(t.i)<100;});
      if(pend.length) return k;
    }
  }catch(err){}
  return 1;
}
function capDays(){
  var e=SM.nextExam(state.prefs,todayISO());
  return e?Math.max(1,SM.daysBetween(todayISO(),e.iso)):null;
}
/* One accuracy point per topic per day — enough for a trend line, small enough
   to keep forever. */
function snapshot(ti){
  var a=topicAcc(ti); if(a===null) return;
  var d=todayISO();
  state.hist[ti]=state.hist[ti]||[];
  var h=state.hist[ti];
  if(h.length && h[h.length-1][0]===d) h[h.length-1][1]=Math.round(a*100);
  else h.push([d,Math.round(a*100)]);
  if(h.length>40) h.shift();
}
function paceFor(ti){
  if(!state.pace[ti]) state.pace[ti]={sec:0,q:0};
  return state.pace[ti];
}
function paceOverall(){
  var sec=0,q=0;
  Object.keys(state.pace).forEach(function(k){ sec+=state.pace[k].sec; q+=state.pace[k].q; });
  return q?sec/q:null;
}
function callsToday(){ return state.calls[todayISO()]||0; }
function topicAcc(ti){
  var s=state.scores[ti]; if(!s) return null;
  var a=s.ba+s.sa; return a>=10?(s.bc+s.sc)/a:null;
}
/* Tiny inline trend line — 62% climbing needs a different decision from 62%
   stuck for six weeks. */
function spark(h){
  if(!h||h.length<2) return '<span class="muted sm">&mdash;</span>';
  var v=h.map(function(x){return x[1];}), n=v.length;
  var mn=Math.min.apply(null,v), mx=Math.max.apply(null,v), rg=Math.max(6,mx-mn);
  var pts=v.map(function(x,i){ return (i/(n-1)*46).toFixed(1)+','+(14-(x-mn)/rg*12).toFixed(1); }).join(' ');
  var up=v[n-1]-v[0];
  return '<svg class="spk" viewBox="0 0 48 16"><polyline points="'+pts+'" fill="none" stroke="'+
    (up>2?"var(--drape)":up<-2?"var(--rust)":"var(--line2)")+'" stroke-width="1.6" stroke-linejoin="round"/></svg>';
}
function trend(h){ return (!h||h.length<3)?null:Math.round(h[h.length-1][1]-h[0][1]); }
function accColour(a){
  if(a===null) return "var(--line)";
  if(a>=0.80) return "#3E8E7E";
  if(a>=0.68) return "#6FA98C";
  if(a>=0.58) return "#D6A441";
  if(a>=0.45) return "#C98A55";
  return "#BE6B5F";
}

/* ---------- atoms ---------- */
function smV19Sigil(tone){
  if(tone==='amber') return '<span class="sm-v19-card-sigil" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3l2.4 5 5.6.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.6-.8z"/><path d="M12 7v5M9.8 10h4.4"/></svg></span>';
  if(tone==='drape') return '<span class="sm-v19-card-sigil" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 17c4-9 7-12 14-12M5 17h14"/><path d="M8 14l3-3 3 1 3-4"/><circle cx="8" cy="14" r="1.2"/><circle cx="11" cy="11" r="1.2"/><circle cx="14" cy="12" r="1.2"/><circle cx="17" cy="8" r="1.2"/></svg></span>';
  return '';
}
function card(inner,tone){ return '<div class="card'+(tone?" t-"+tone:"")+'">'+smV19Sigil(tone)+inner+'</div>'; }
function bar(pct,color,h){
  return '<div class="track" style="height:'+(h||6)+'px"><div class="fill" style="width:'+
    Math.max(0,Math.min(100,pct))+'%;background:'+(color||"var(--drape)")+'"></div></div>';
}
function ring(pct,label,sub){
  var r=34, c=2*Math.PI*r, off=c*(1-Math.max(0,Math.min(1,pct/100)));
  return '<svg class="ring" viewBox="0 0 84 84" width="84" height="84">'+
    '<circle cx="42" cy="42" r="'+r+'" fill="none" stroke="var(--ink)" stroke-width="9"/>'+
    '<circle cx="42" cy="42" r="'+r+'" fill="none" stroke="var(--drape)" stroke-width="9"'+
    ' stroke-linecap="round" stroke-dasharray="'+c.toFixed(1)+'" stroke-dashoffset="'+off.toFixed(1)+
    '" transform="rotate(-90 42 42)"/>'+
    '<text x="42" y="40" text-anchor="middle" class="rt">'+label+'</text>'+
    '<text x="42" y="55" text-anchor="middle" class="rs">'+sub+'</text></svg>';
}
/* ---------- inline SVG charts, no library, since nothing here may reach the
   network to fetch one. All coordinates are guarded against the zero/one-point
   degenerate cases that a real, sparse campaign produces constantly \u2014 day one,
   a single logged question, an empty series \u2014 rather than assuming a chart
   always has enough data to look like a chart. ---------- */
/* Every content day as one thin bar, capacity drawn as a line across it \u2014
   170 bars is too many to label, but the SHAPE is the point: whether the
   overruns cluster in one phase (a fixable structural problem) or scatter
   evenly (a genuine "syllabus vs hours" problem with no layout fix). A
   count alone cannot show that difference. */
function dayLoadChart(){
  var cap=SM.usableWork(state.prefs);
  var days=plan.content;
  if(!days.length) return "";
  var w=320, h=90, pad=6;
  var maxW=Math.max(cap, Math.max.apply(null, days.map(function(c){return c.work;})));
  var bw=(w-2*pad)/days.length;
  var bars=days.map(function(c,i){
    var hh=(c.work/maxW)*(h-2*pad);
    var x=pad+i*bw;
    var col=c.pastBed>0?"var(--amber)":"var(--drape)";
    return '<rect x="'+x.toFixed(2)+'" y="'+(h-pad-hh).toFixed(2)+'" width="'+Math.max(0.6,bw*0.85).toFixed(2)+
      '" height="'+hh.toFixed(2)+'" fill="'+col+'" opacity="'+(c.pastBed>0?"1":"0.55")+'"/>';
  }).join("");
  var capY=h-pad-(cap/maxW)*(h-2*pad);
  return '<div style="margin-top:12px"><svg viewBox="0 0 '+w+' '+h+'" width="100%" height="'+h+'" preserveAspectRatio="none" style="display:block">'+
    bars+
    '<line x1="'+pad+'" y1="'+capY.toFixed(2)+'" x2="'+(w-pad)+'" y2="'+capY.toFixed(2)+
      '" stroke="var(--bone)" stroke-width="1" stroke-dasharray="3,3" opacity="0.7"/>'+
    '</svg>'+
    '<div class="row-top" style="margin-top:4px"><span class="muted sm">Day 1</span>'+
    '<span class="muted sm">- - capacity ('+Math.floor(cap/60)+'h '+(cap%60)+'m)</span>'+
    '<span class="muted sm">Day '+days.length+'</span></div>'+
    '<p class="muted sm">Amber bars are days whose work runs past bedtime.</p></div>';
}
function svgLine(series,keyA,keyB,opts){
  opts=opts||{};
  var w=opts.w||300, h=opts.h||120, pad=10;
  if(!series||series.length<2)
    return '<div class="muted sm" style="padding:20px 0;text-align:center">Not enough days yet to plot a trend.</div>';
  var vals=[]; series.forEach(function(p){ vals.push(p[keyA],p[keyB]); });
  var maxY=Math.max.apply(null,vals.concat([1]));
  var n=series.length;
  function X(i){ return pad+(i/(n-1))*(w-2*pad); }
  function Y(v){ return h-pad-(Math.max(0,v)/maxY)*(h-2*pad); }
  function pts(key){ return series.map(function(p,i){ return X(i).toFixed(1)+","+Y(p[key]).toFixed(1); }).join(" "); }
  return '<svg viewBox="0 0 '+w+' '+h+'" width="100%" height="'+h+'" preserveAspectRatio="none" style="display:block">'+
    '<line x1="'+pad+'" y1="'+(h-pad)+'" x2="'+(w-pad)+'" y2="'+(h-pad)+'" stroke="var(--line)" stroke-width="1"/>'+
    '<polyline points="'+pts(keyB)+'" fill="none" stroke="var(--muted)" stroke-width="2" stroke-dasharray="4,3"/>'+
    '<polyline points="'+pts(keyA)+'" fill="none" stroke="var(--drape)" stroke-width="2.5"/>'+
    '</svg>';
}
function svgBars(rows,opts){
  opts=opts||{};
  if(!rows||!rows.length) return '<div class="muted sm">Nothing logged yet.</div>';
  var max=Math.max.apply(null,rows.map(function(r){return r.v;}).concat([1]));
  return rows.map(function(r){
    return '<div class="row-top" style="margin-top:6px"><span class="sm">'+esc(r.label)+'</span>'+
      '<span class="muted sm">'+r.text+'</span></div>'+
      bar(max?r.v/max*100:0, r.color||"var(--drape)", 7);
  }).join("");
}
var ICON={
  bank:'<path d="M4 4h12v12H4z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M7 8h6M7 11h4" stroke="currentColor" stroke-width="1.6"/>',
  analysis:'<circle cx="9" cy="9" r="5.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M13 13l4 4" stroke="currentColor" stroke-width="1.8"/>',
  lecture:'<path d="M3 5h14v9H3z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 8l4 2.5L8 13z" fill="currentColor"/>',
  speed:'<circle cx="10" cy="11" r="6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 11V7M10 3h0" stroke="currentColor" stroke-width="1.8"/>',
  recall:'<path d="M4 3h12v14l-6-3-6 3z" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  check:'<path d="M4 10l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2"/>',
  buffer:'<circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="3 3"/>',
  lunch:'<path d="M6 3v7M9 3v7M15 3v14M6 10h3v7" fill="none" stroke="currentColor" stroke-width="1.6"/>'
};
function icon(k,col){
  return '<svg class="ic" viewBox="0 0 20 20" style="color:'+(col||"currentColor")+'">'+(ICON[k]||ICON.check)+'</svg>';
}
var KIND_C={bank:"var(--sky)",analysis:"var(--rust)",lecture:"var(--drape)",speed:"var(--amber)",
  recall:"var(--violet)",check:"var(--drape)",buffer:"var(--line2)",lunch:"var(--muted)"};

/* ---------- week strip ---------- */
/* A full month grid rather than a seven-day slider. The strip could only ever
   show three days either side, which is enough to tap "yesterday" and nothing
   else \u2014 useless for "what does next week look like" or "when is that mock".
   Same colour coding, same tap-to-open behaviour, now against the whole month
   with arrows to move between months. */
function monthCal(date){
  var cur=SM.fromISO(date);
  var y=cur.getFullYear(), m=cur.getMonth();
  var first=new Date(y,m,1), firstDow=first.getDay();
  var daysInMonth=new Date(y,m+1,0).getDate();
  var prevISO=SM.iso(new Date(y,m-1,1)), nextISO=SM.iso(new Date(y,m+1,1));
  var t=todayISO();
  var head='<div class="row-top" style="margin-bottom:6px">'+
    '<button class="btn sm" data-goto="'+esc(prevISO)+'" aria-label="Previous month">\u2039</button>'+
    '<span class="lbl">'+["January","February","March","April","May","June","July",
      "August","September","October","November","December"][m]+' '+y+'</span>'+
    '<button class="btn sm" data-goto="'+esc(nextISO)+'" aria-label="Next month">\u203a</button></div>';
  var dow='<div class="calgrid">'+["S","M","T","W","T","F","S"].map(function(d){
    return '<div class="caldow">'+d+'</div>'; }).join("");
  var cells="";
  for(var i=0;i<firstDow;i++) cells+='<div class="calcell"></div>';
  for(var dnum=1;dnum<=daysInMonth;dnum++){
    var iso=SM.iso(new Date(y,m,dnum));
    var c=plan.byDate[iso];
    var kind=c?c.kind:"none";
    var col={content:"var(--sky)",backup:"var(--amber)",rest:"var(--violet)",
      taper:"var(--violet)",exam:"var(--rust)",off:"var(--line2)",none:"transparent"}[kind];
    var r=state.days[iso], done=false;
    if(r&&c&&!c.rest&&c.blocks){
      var n=0,ch=r.checks||{}; for(var k in ch) if(ch[k]===true) n++;
      done = n>=c.blocks.filter(function(b){return b.kind!=="lunch"&&b.kind!=="buffer";}).length;
    }
    /* A date number alone does not answer "what is on Thursday". Each cell now
       carries a short label: the topic for a study day, or the day-kind for
       anything else. Truncated hard \u2014 seven columns on a phone is about six
       characters before it wraps into nonsense. */
    var label="";
    if(c){
      if(kind==="content" && c.slots && c.slots.length){
        var nm=SM.CURRICULUM[c.slots[0].ti].n;
        label=nm.length>13?nm.slice(0,12)+"\u2026":nm;   /* V35.3: the cell label is now only rendered at >=560px (see CSS section 12a), where there is room for a recognisable name rather than "Esopha\u2026" */
        if(c.slots.length>1) label+="+";
      } else {
        label={backup:"backup",rest:"rest",taper:"taper",exam:"EXAM",off:"off"}[kind]||"";
      }
    }
    /* "Done" used to be signalled only by a dot's colour \u2014 a genuine
       colourblind-accessibility gap, not just a nice-to-have. A checkmark
       glyph now carries that meaning independent of colour; the dot stays as
       reinforcement, not as the only signal. */
    cells+='<button class="calcell'+(iso===date?" sel":"")+(iso===t?" tdy":"")+'" data-goto="'+iso+
      '" aria-label="'+esc(SM.pretty(iso))+(label?", "+esc(label):"")+(done?", done":"")+'">'+
      '<span class="caln">'+dnum+'</span>'+
      (label?'<span class="callbl">'+esc(label)+'</span>':'')+
      (done?'<span class="caldone" aria-hidden="true">\u2713</span>'
            :'<span class="caldot" style="background:'+col+'"></span>')+
      '</button>';
  }
  return card(head+dow+cells+'</div>'+
    '<div class="row-top" style="margin-top:8px;flex-wrap:wrap;gap:8px">'+
    [["var(--sky)","study"],["var(--drape)","done"],["var(--violet)","rest"],
     ["var(--amber)","backup"]].map(function(L){
      return '<span class="muted sm"><span class="caldot" style="background:'+L[0]+
        ';display:inline-block;margin-right:4px"></span>'+L[1]+'</span>'; }).join("")+'</div>');
}

/* ---------- TODAY ---------- */
/* Arrears past this many minutes stop being a side list to clear in spare time
   and start being the thing today is actually about. FOLD_CAP bounds how much
   of it lands on any one day, so clearing a large backlog is itself paced
   rather than dumped onto tomorrow morning. Lecture is cut before the miss
   review or a repeat pass \u2014 skipping a video costs less than skipping the
   retrieval step that actually fixes the error. */
var FOLD_THRESHOLD=180, FOLD_CAP=90;
var CUT_FIRST=["lecture","speed","image","bank"], CUT_PROTECT=["analysis","repass","repass3","recall"];
function shapeToday(entry,date,P,r){
  /* r.layer is only set once a day has been explicitly switched. Until then
     the default comes from prefs, so "Empathy is the normal day for now" is a
     real setting rather than something to re-choose every morning. */
  var layer = r.layer ? (r.layer==="empathy"?"empathy":"normal")
                      : ((P.defaultLayer==="empathy")?"empathy":"normal");
  var want=Math.round((layer==="empathy"?(P.empathyHours||7.25):P.dailyHours)*60);
  /* Ramp: the first rampDays CONTENT days run short regardless of layer.
     Counted in content days, not calendar days, so a rest day inside the
     first week does not silently spend one of them. */
  var rampLeft=0;
  if(P.rampDays>0){
    var ix=plan.content.map(function(c){return c.date;}).indexOf(date);
    if(ix>=0 && ix<P.rampDays){
      want=Math.min(want, Math.round((P.rampHours||3)*60));
      rampLeft=P.rampDays-ix;
    }
  }
  var before=arrears(date);
  var totalOwed=before.reduce(function(a,x){return a+x.mins;},0);
  /* Fold-back on its own clears at most FOLD_CAP a day. Against a genuinely
     large backlog that arithmetic doesn't work: at 90 min/day, a week missed
     takes another five or six days just to absorb, on top of the days already
     lost. "Clear it faster" is an explicit, visible choice to double that rate
     for as long as the backlog stays above threshold \u2014 it does not silently
     reshuffle the calendar, which is the safer trade given how much can go
     wrong rebuilding a schedule this size unattended. */
  var cap=(state.prefs.fastClear && totalOwed>FOLD_THRESHOLD) ? FOLD_CAP*2 : FOLD_CAP;
  var foldTake=[], foldMin=0;
  if(totalOwed>FOLD_THRESHOLD){
    for(var i=0;i<before.length && foldMin<cap;i++){
      var x=before[i], take=Math.min(x.mins,cap-foldMin), src=x.b;
      foldTake.push({ kind:src.kind, ti:src.ti, mins:take,
        label:"Carried \u2014 "+(src.head||src.label||"block")+" ("+SM.shortDate(x.date)+")",
        head:src.head, topic:src.topic,
        note:"Folded forward automatically \u2014 the backlog passed "+FOLD_THRESHOLD+
          " minutes. Ticking this completes it on "+SM.shortDate(x.date)+", where it is actually owed.",
        detail:src.detail, items:src.items,
        foldedFrom:x.date, foldedBlockId:src.i, foldedPart:x.part });
      foldMin+=take;
    }
  }
  var ownWant=Math.max(60,want-foldMin);
  /* On a ramp day the usual protection is wrong: analysis is normally shielded
     from trimming, but shielding it inside a 3-hour budget means a fixed
     67-minute review block swallows the day and leaves nine questions. A ramp
     day should be questions AND their analysis, both scaled down together —
     so lectures are cut first and everything else trims proportionally. */
  var ownItems;
  if(rampLeft>0){
    /* cutToTarget cuts by PRIORITY: it removes whole categories in order and
       stops once the list is exhausted — with only lectures listed it stopped
       at 337 minutes against a 180 target. A ramp day needs proportional
       scaling instead: drop lectures entirely, then shrink everything that
       remains by the same fraction, so questions and their analysis stay in
       balance rather than one starving the other. */
    var keep=SM.cloneItems(entry.rawItems||[]).filter(function(b){ return b.kind!=="lecture"; });
    var prot=keep.filter(function(b){ return b.kind==="recall"; });
    var flex=keep.filter(function(b){ return b.kind!=="recall"; });
    var protMin=prot.reduce(function(a,b){return a+b.mins;},0);
    var flexMin=flex.reduce(function(a,b){return a+b.mins;},0);
    var budget=Math.max(30, ownWant-protMin);
    var frac=flexMin>0 ? Math.min(1, budget/flexMin) : 1;
    flex.forEach(function(b){
      if(frac>=1) return;
      if(b.items && b.items.length){
        var parts=SM.splitItems(b.items, b.mins*frac, b.mins);
        b.items=parts[0];
      }
      b.mins=Math.max(5, Math.round(b.mins*frac));
    });
    ownItems=flex.concat(prot);
  } else {
    ownItems=SM.cutToTarget(SM.cloneItems(entry.rawItems||[]), ownWant, CUT_FIRST, CUT_PROTECT);
  }
  var allItems=foldTake.concat(ownItems);
  var shaped=SM.layoutDay(allItems,P);
  return { shaped:shaped, layer:layer, foldTake:foldTake, foldMin:foldMin, want:want, totalOwed:totalOwed, cap:cap, rampLeft:rampLeft };
}

/* Day label, shared by the Now card and the page header so the two can never
   describe the same day differently. */
/* Nothing in the app ever noticed you showed up. In the first month, day four
   happening is the whole game — more than accuracy, more than pace — and the
   app was silent about it. Counts back from today over CONTENT days only, so
   a scheduled rest day does not break a run you did not break. */
/* Whole-campaign progress, measured in study MINUTES rather than days or
   blocks. Days are the wrong unit because they vary in length, and blocks are
   the wrong unit because a 73-minute bank block and a 10-minute recall block
   are not the same amount of work. Minutes are what the schedule is actually
   built from, so this is the same currency the plan uses.
   A half-ticked block counts as half, matching how the trajectory maths
   already treats it \u2014 two places disagreeing about what "half done" means
   would be worse than not showing it at all. */
/* Separate progress for questions and lectures, because they behave nothing
   alike: questions run three passes and dominate the hours, lectures run once
   and finish early. A single combined bar hides the fact that you can be 90%
   through lectures and 20% through questions at the same moment. */
function progressBreakdown(){
  var q={done:0,total:0}, lec={done:0,total:0}, all={done:0,total:0};
  /* Split by PASS, not just lumped as "questions". A blended figure hides
     the one thing that actually matters at this stage of a campaign: pass 1
     near-finished and pass 3 barely started average out to something that
     looks fine and tells you nothing about how much real relearning is
     still ahead. */
  var q1={done:0,total:0}, q2={done:0,total:0}, q3={done:0,total:0};
  var byPhase={}; for(var ph=1;ph<=7;ph++) byPhase[ph]={done:0,total:0};
  /* Same shape as byPhase, one finer grain down: 39 topics instead of 7
     phases. This is still a genuine schedule-derived %, since the plan
     allocates real minutes per topic \u2014 the same kind of number as the
     phase columns, just at higher resolution. */
  var byTopic={}; SM.CURRICULUM.forEach(function(t2){ byTopic[t2.i]={done:0,total:0}; });
  var expByPhase={}; for(var ph0=1;ph0<=7;ph0++) expByPhase[ph0]=0;
  var expByTopic={}; SM.CURRICULUM.forEach(function(t3){ expByTopic[t3.i]=0; });
  /* Velocity: hours actually logged in the last 7 days against the 7 before
     that. A cumulative percentage cannot say whether you are speeding up or
     slowing down; two adjacent windows of the same data can. */
  var t=todayISO();
  var w1From=SM.iso(new Date(SM.fromISO(t).getTime()-7*SM.DAY));
  var w2From=SM.iso(new Date(SM.fromISO(t).getTime()-14*SM.DAY));
  var thisWeek=0, lastWeek=0, daysElapsed=0, daysTotal=plan.content.length;
  /* The plan's own promise for today, in minutes \u2014 not a day-count ratio.
     Days vary in length (Empathy vs Normal, ramp days), so "43 of 161 days"
     and "43 of 161 days' worth of MINUTES" are different numbers; the second
     is what "expected by now" should actually mean. */
  var expectedByToday=0;
  /* Last 14 days, one fraction per day: done-minutes / that day's own total.
     A rest day or a day with no blocks is skipped rather than counted as 0%,
     since it was never asked of you. */
  var spark=[];
  var sparkFrom=SM.iso(new Date(SM.fromISO(t).getTime()-13*SM.DAY));
  plan.content.forEach(function(c){
    if(!c.blocks) return;
    if(c.date<=t) daysElapsed++;
    var r=state.days[c.date];
    var ti0=(c.slots&&c.slots[0])?c.slots[0].ti:null;
    var phaseOfDay = ti0!=null ? SM.CURRICULUM[ti0].phase : null;
    var dayTotal=0, dayDone=0;
    c.blocks.forEach(function(b){
      if(["lunch","buffer","protected"].indexOf(b.kind)>=0) return;
      var bucket = b.kind==="lecture" ? lec
                 : (b.kind==="bank"||b.kind==="speed"||b.kind==="image") ? q1
                 : b.kind==="repass" ? q2
                 : b.kind==="repass3" ? q3
                 : null;
      all.total+=b.mins; if(bucket) bucket.total+=b.mins;
      if(bucket && bucket!==lec){ q.total+=b.mins; }
      dayTotal+=b.mins;
      if(c.date<=t) expectedByToday+=b.mins;
      var bph = b.ti!=null ? SM.CURRICULUM[b.ti].phase : phaseOfDay;
      if(bph && byPhase[bph]) byPhase[bph].total+=b.mins;
      var bti = b.ti!=null ? b.ti : ti0;
      if(bti!=null && byTopic[bti]) byTopic[bti].total+=b.mins;
      /* Same "plan's own promise" concept as expectedByToday, now tracked
         PER phase and PER topic \u2014 the aggregate marker can only say the
         whole syllabus is behind; it cannot say WHICH phase or topic is
         actually causing that, which is the more useful question once you
         are already looking at 39 separate columns. */
      if(c.date<=t){
        if(bph && expByPhase[bph]!=null) expByPhase[bph]+=b.mins;
        if(bti!=null && expByTopic[bti]!=null) expByTopic[bti]+=b.mins;
      }
      if(!r||!r.checks) return;
      var sd=b.foldedFrom||c.date, sk=b.foldedFrom?b.foldedBlockId:b.i;
      var sr=b.foldedFrom?(state.days[sd]||{}):r;
      var v=(sr.checks||{})[sk], got = v===true?b.mins : v===0.5?b.mins/2 : 0;
      all.done+=got; if(bucket) bucket.done+=got;
      if(bucket && bucket!==lec){ q.done+=got; }
      dayDone+=got;
      if(bph && byPhase[bph]) byPhase[bph].done+=got;
      if(bti!=null && byTopic[bti]) byTopic[bti].done+=got;
      if(v===true||v===0.5){
        if(c.date>w1From && c.date<=t) thisWeek+=got;
        else if(c.date>w2From && c.date<=w1From) lastWeek+=got;
      }
    });
    if(c.date>=sparkFrom && c.date<=t && dayTotal>0) spark.push({d:c.date, frac:dayDone/dayTotal});
  });
  /* Accuracy of logged questions \u2014 right against attempted, from the same
     ledger the calibration and mastery features already read. Feeds the
     overlay on the Questions column: DONE and DONE WELL are not the same
     colour, and until now the bar could not tell you which one you were
     looking at. */
  var attRight=0, attTotal=0;
  Object.keys(state.mcq||{}).forEach(function(k){
    state.mcq[k].attempts.forEach(function(a){ attTotal++; if(a.outcome!=="wrong") attRight++; });
  });
  var accuracy = attTotal>=8 ? attRight/attTotal : null;
  /* Subtopics are not part of the fixed curriculum the way topics and phases
     are \u2014 they are free text you type when logging a question, so there is
     no planned time to measure "% of schedule done" against. What DOES
     exist at this grain is real: accuracy of what you have actually logged,
     grouped by topic then by the subtopic string. Labelled as accuracy, not
     progress, since presenting a mastery metric as a completion metric
     would misrepresent what it is. */
  var bySubtopic={};
  Object.keys(state.mcq||{}).forEach(function(k){
    var qq=state.mcq[k], sub=(qq.subtopic||"").trim();
    if(!sub) return;
    var key=qq.topicId+"|"+sub;
    if(!bySubtopic[key]) bySubtopic[key]={topicId:qq.topicId, sub:sub, right:0, total:0, lastT:0};
    qq.attempts.forEach(function(a){
      bySubtopic[key].total++; if(a.outcome!=="wrong") bySubtopic[key].right++;
      bySubtopic[key].lastT=Math.max(bySubtopic[key].lastT, a.t||0);
    });
  });
  /* Projected finish, from velocity rather than the original static plan
     length: at the CURRENT weekly rate, how many more weeks to clear what is
     left. Falls back to the plan's own remaining-day count when there is not
     yet enough history to trust a rate (early on, or a zero week). */
  var remaining=all.total-all.done;
  var projDate=null;
  if(thisWeek>30 && remaining>0){
    var weeksLeft=remaining/thisWeek;
    projDate=SM.iso(new Date(Date.now()+weeksLeft*7*SM.DAY));
  } else if(daysTotal>daysElapsed){
    projDate=plan.content[plan.content.length-1].date;
  }
  /* On-track state: compares the FRACTION of the plan's days elapsed against
     the fraction of work done. Behind means the clock is outrunning the
     work, which is a more honest comparison than "did you do everything
     scheduled today", since a re-plan or a swap can make today alone a poor
     signal. */
  var dayFrac = daysTotal? daysElapsed/daysTotal : 0;
  var workFrac = all.total? all.done/all.total : 0;
  var track = (dayFrac-workFrac)>0.05 ? "behind" : (workFrac-dayFrac)>0.05 ? "ahead" : "ontrack";
  return {all:all, questions:q, lectures:lec, byPhase:byPhase, byTopic:byTopic, bySubtopic:bySubtopic, expByPhase:expByPhase, expByTopic:expByTopic,
    passes:{q1:q1,q2:q2,q3:q3},
    velocity:{thisWeek:thisWeek, lastWeek:lastWeek}, projDate:projDate, track:track,
    expectedByToday:expectedByToday, sparkline:spark, accuracy:accuracy};
}
/* A bar with milestone ticks ON it. A percentage alone does not tell you how
   far the next checkpoint is; marks at 25/50/75/100 turn an abstract number
   into "nearly at halfway", which is the thing that actually pulls you
   forward. Passed marks fill in, upcoming ones stay hollow. */
/* Marks every 10%, not just quarters \u2014 finer resolution reads as more
   informative even before you have crossed the first one. The percentage
   sits ON the bar itself (large, high-contrast) rather than only in the
   header text above it, so the number is legible at a glance rather than
   requiring you to read a separate line. When a rate is available (velocity),
   the next milestone gets a projected DATE, not just an hours-away figure \u2014
   "50% around 15 Dec" is something you can hold a plan against; "40h away"
   is not, until you also know your own pace, which most people do not carry
   in their head accurately. */
/* Vertical column, same information as milestoneBar but longitudinal (fills
   bottom-to-top) rather than horizontal. This is not just a rotation for its
   own sake: horizontal bars stack one under another, so comparing 7 phases
   meant reading down a list. Columns sit SIDE BY SIDE, so all 7 heights are
   in one glance \u2014 the shape a bar chart is actually for when the point is
   comparison across categories, which "how are the phases doing relative to
   each other" genuinely is.
   Carries the full 1% three-tier ruler from the horizontal version, rotated:
   fine marks are short horizontal lines low-opacity, mid marks a little
   longer, 25/50/75/100 full-width and bright. Label, percentage, and hours
   sit below the column since there is no room to print them across a 3px
   fine tick without overlapping. */
function nextMilestoneText(pct,totalMin,ratePerDay){
  var nextM=Math.floor(pct)+1;
  if(nextM>100) return "complete";
  var hoursAway=Math.round((nextM-pct)/100*totalMin/60);
  var dateStr="";
  if(ratePerDay>0){
    var minsAway=(nextM-pct)/100*totalMin;
    dateStr=" \u2014 around "+esc(SM.pretty(SM.iso(new Date(Date.now()+(minsAway/ratePerDay)*SM.DAY))));
  }
  return "next: "+nextM+"% \u2014 "+hoursAway+"h away"+dateStr;
}
function milestoneColumn(pct,color,label,doneMin,totalMin,jumpTab,acc,expectedPct){
  var marks=[];
  for(var m=1;m<=100;m++){
    var tier = m%25===0 ? "major" : m%5===0 ? "mid" : "fine";
    marks.push('<span class="msc-mk '+tier+(pct>=m?" hit":"")+'" style="bottom:'+m+'%"></span>');
  }
  var h=Math.max(0,Math.min(100,pct));
  /* Accuracy overlay: a thin red band inside the filled portion showing
     wrong-among-attempted. DONE and DONE WELL were the same colour before
     this \u2014 100% complete and 40% accurate would have looked identical.
     Placed as the top slice of the fill (nearest the surface, since that is
     the part visible without hovering), sized to acc's share of the filled
     height specifically, not the whole column. */
  var accBand = (acc!=null && h>0)
    ? '<div class="msc-acc" style="height:'+(h*(1-acc)).toFixed(1)+'%"></div>' : "";
  /* Expected-by-today marker: where the PLAN itself intended you to be, as a
     distinct line separate from the fill \u2014 the fill says what you did, this
     says what was asked, and the gap between them is the thing "behind /
     on track" already computes but could not previously show spatially. */
  var expectLine = (expectedPct!=null && expectedPct>0 && expectedPct<100)
    ? '<span class="msc-exp" style="bottom:'+expectedPct+'%"></span>' : "";
  return '<div class="msc" '+(jumpTab?'data-nav="'+jumpTab+'" role="button" tabindex="0"':'')+'>'+
    '<div class="msc-col">'+marks.join("")+expectLine+
      '<div class="msc-fill" style="height:'+h+'%;background:'+color+'">'+accBand+'</div>'+
    '</div>'+
    '<div class="msc-pct" style="color:'+color+'">'+pct.toFixed(1)+'%</div>'+
    '<div class="msc-lbl">'+esc(label)+(jumpTab?' \u2192':'')+'</div>'+
    '<div class="msc-sub">'+Math.round(doneMin/60)+'h/'+Math.round(totalMin/60)+'h'+
      (acc!=null?' \u00b7 '+Math.round(acc*100)+'% right':'')+'</div>'+
    '</div>';
}
/* 14-day shape of consistency, not just a count. A number ("6 days this
   week") cannot show WHERE the gaps fell; a sparkline can \u2014 three good days
   then three skipped reads differently from six mediocre days, even at the
   same total. */
function sparkline(days){
  if(!days.length) return "";
  var w=14, h=26, n=days.length, gap=2;
  var bw=(w*10-gap*(n-1))/n;
  var bars=days.map(function(d,i){
    var x=i*(bw+gap), bh=Math.max(2,d.frac*h);
    var col = d.frac>=0.8?"var(--drape)":d.frac>=0.3?"var(--amber)":"var(--rust)";
    return '<rect x="'+x.toFixed(1)+'" y="'+(h-bh).toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+bh.toFixed(1)+'" fill="'+col+'" rx="1"/>';
  }).join("");
  return '<svg viewBox="0 0 '+(w*10)+' '+h+'" width="'+(w*10)+'" height="'+h+'" style="display:block;margin-top:4px" aria-label="Daily completion, last '+n+' days">'+bars+'</svg>';
}
/* One bar instead of many small columns. A row of narrow columns forces
   every label down to a handful of characters and scatters related
   subtopics across a wrapped grid; a single SEGMENTED bar keeps them
   together as one object \u2014 each subtopic gets a slice sized by its share
   of everything logged, coloured by its OWN accuracy, with the full detail
   (topic, subtopic, exact right/total) in a legend underneath rather than
   truncated onto the bar itself. Segments below a visibility floor are
   grouped into one final "other" slice so a handful of long-tail subtopics
   with two or three attempts each cannot squeeze a real segment down to an
   invisible sliver. */
/* Each subtopic gets its OWN colour, not an accuracy tier \u2014 tiers meant two
   different subtopics both above 80% looked IDENTICAL, which defeats the
   point of a segmented bar: telling segments apart from each other, not
   just from a good/bad threshold. Colour now comes from a fixed hue
   rotation keyed to each subtopic's position in the list, so the same
   subtopic gets the same colour every time the bar redraws (stable across
   renders) while neighbours are never adjacent hues. Accuracy has not been
   dropped, it is just text now (in the legend and on the segment itself
   when there is room), rather than being the thing colour encodes. */
function subtopicHue(i,n){
  var GOLDEN=137.508; /* golden-angle steps keep hues well-spread regardless of n */
  return Math.round((i*GOLDEN)%360);
}
function subtopicBar(entries){
  var total=entries.reduce(function(a,x){return a+x.total;},0);
  if(total<=0) return "";
  var MIN_PCT=4;
  var big=[], smallSum={total:0,right:0,n:0};
  entries.forEach(function(x){
    if(x.total/total*100 >= MIN_PCT) big.push(x);
    else { smallSum.total+=x.total; smallSum.right+=x.right; smallSum.n++; }
  });
  var segs=big.slice();
  if(smallSum.n>0) segs.push({topicId:null, sub:smallSum.n+" more, "+MIN_PCT+"% or smaller each",
    right:smallSum.right, total:smallSum.total, other:true});
  var track='<div class="subbar">'+segs.map(function(x,i){
    var w=(x.total/total*100).toFixed(2);
    var col=x.other?"var(--line2)":"hsl("+subtopicHue(i,segs.length)+" 62% 52%)";
    return '<div class="subseg" style="width:'+w+'%;background:'+col+'"'+
      (i>0?' data-edge="1"':'')+'></div>';
  }).join("")+'</div>';
  var legend=segs.map(function(x,i){
    var acc=x.total? Math.round(x.right/x.total*100) : 0;
    var col=x.other?"var(--muted)":"hsl("+subtopicHue(i,segs.length)+" 62% 52%)";
    var tname=x.topicId!=null?(SM.CURRICULUM[x.topicId]||{n:""}).n.split(" ")[0]+": ":"";
    return '<div class="row-top" style="margin-top:5px"><span class="sm"><span class="caldot" style="display:inline-block;margin-right:6px;background:'+
      col+'"></span>'+esc(tname+x.sub)+'</span><span class="muted sm">'+
      (x.other?"":acc+"% right \u00b7 ")+x.right+'/'+x.total+'</span></div>';
  }).join("");
  return track+legend;
}
/* Same consolidation as the subtopic bar, but carrying a genuinely
   different kind of data: topics are a fixed, known set of 39 with real
   planned minutes, not free text, so nothing here is grouped into "other"
   the way long-tail subtopics were \u2014 every topic is individually
   meaningful and gets its own slice and its own line in the legend.
   Each slice's WIDTH is that topic's share of the whole syllabus; each
   slice ALSO has its own internal fill sized to that topic's own
   done/total, coloured by phase so the segment still tells you which phase
   it belongs to even fully complete or fully empty. A thin tick marks
   where the plan's own pacing expects that topic to be today, same concept
   as the marker on the phase and headline columns, now visible even inside
   a slice a few pixels wide. */
function topicBar(topics,expByTopic){
  var PH_COL=["","var(--sky)","var(--drape)","var(--amber)","var(--rust)","var(--prog)","#57b7f5","#e08bd0"];
  var total=topics.reduce(function(a,x){return a+x.tb.total;},0);
  if(total<=0) return "";
  var track='<div class="subbar" style="height:26px">'+topics.map(function(x,i){
    var w=(x.tb.total/total*100).toFixed(3);
    var fillPct=x.tb.total? Math.max(0,Math.min(100,x.tb.done/x.tb.total*100)) : 0;
    var col=PH_COL[x.t.phase]||"var(--muted)";
    var expPct = x.tb.total? (expByTopic[x.t.i]||0)/x.tb.total*100 : null;
    var tick = (expPct!=null && expPct>0.5 && expPct<99.5)
      ? '<span class="topexp" style="left:'+expPct.toFixed(1)+'%"></span>' : "";
    return '<div class="topseg" style="width:'+w+'%"'+(i>0?' data-edge="1"':'')+'>'+
      '<div class="topsegfill" style="width:'+fillPct.toFixed(1)+'%;background:'+col+'"></div>'+
      tick+'</div>';
  }).join("")+'</div>';
  var legend=topics.map(function(x){
    var col=PH_COL[x.t.phase]||"var(--muted)";
    var xpct=x.tb.total? x.tb.done/x.tb.total*100 : 0;
    return '<div class="row-top" style="margin-top:4px"><span class="sm"><span class="caldot" style="display:inline-block;margin-right:6px;background:'+
      col+'"></span>'+x.t.phase+'. '+esc(x.t.n)+'</span><span class="muted sm">'+
      xpct.toFixed(1)+'% \u00b7 '+Math.round(x.tb.done/60)+'h/'+Math.round(x.tb.total/60)+'h</span></div>';
  }).join("");
  return track+
    '<div class="row-top" style="margin-top:6px;flex-wrap:wrap;gap:8px">'+
    [1,2,3,4,5,6,7].map(function(ph){ return '<span class="muted sm"><span class="caldot" style="display:inline-block;margin-right:4px;background:'+PH_COL[ph]+'"></span>'+ph+'</span>'; }).join("")+
    '</div>'+
    '<details style="margin-top:8px"><summary class="muted sm" style="cursor:pointer">Every topic, in order \u25be</summary>'+legend+'</details>';
}
/* What you asked for, after several turns of me building the wrong thing:
   not another breakdown by phase/topic/subtopic, but ONE simple answer to
   "what does the next 30 minutes actually get me". Walks today's REAL
   remaining blocks in schedule order, accumulates minutes up to a target,
   and names each step in plain language \u2014 not a percentage to interpret,
   an actual thing you will finish or make a dent in. Baby steps: each line
   is one small, nameable unit of work, not an abstract fraction. */
function next30Card(minutesTarget){
  var t=todayISO(), entry=plan.byDate[activeDate()], r=recFor(activeDate());
  if(!entry||!entry.blocks) return "";
  var f0=shapeToday(entry,activeDate(),plan.P,r);
  var wb=f0.shaped.blocks.filter(function(b){ return ["lunch","buffer","protected"].indexOf(b.kind)<0; });
  function doneOf(b){
    var sd=b.foldedFrom||activeDate(), sk=b.foldedFrom?b.foldedBlockId:b.i;
    var sr=b.foldedFrom?(state.days[sd]||{}):r;
    return (sr.checks||{})[sk];
  }
  var steps=[], used=0;
  for(var i=0;i<wb.length && used<minutesTarget;i++){
    var b=wb[i], v=doneOf(b);
    if(v===true) continue;
    var already = v===0.5 ? b.mins/2 : 0;
    var remaining=b.mins-already;
    var take=Math.min(remaining, minutesTarget-used);
    if(take<=0) continue;
    var name = b.ti!=null ? SM.CURRICULUM[b.ti].n : (b.kind==="recall"?"Blank-page recall":"Review");
    var kind = b.kind==="lecture"?"Watch":(b.kind==="analysis"?"Review":"Answer");
    var full = take>=remaining-0.5;
    steps.push({name:name, kind:kind, mins:Math.round(take), full:full});
    used+=take;
  }
  if(!steps.length) return "";
  /* Same currency as the rest of Progress: the whole-syllabus % this
     increment represents, so the baby step still connects to the big
     number without making the big number the headline. */
  var b2=progressBreakdown();
  var beforePct = b2.all.total? b2.all.done/b2.all.total*100 : 0;
  var afterPct = b2.all.total? (b2.all.done+used)/b2.all.total*100 : 0;
  var lines=steps.map(function(x){
    return '<div class="row-top" style="margin-top:6px"><span class="sm">'+
      (x.full?"\u2713 ":"\u2192 ")+esc(x.kind)+' '+esc(x.name)+'</span>'+
      '<span class="muted sm">'+x.mins+' min'+(x.full?"":", partway")+'</span></div>';
  }).join("");
  /* A syllabus measured in thousands of hours makes any single 30-minute
     step round to "0.0% to 0.0%" at one decimal place \u2014 technically
     correct, but it makes the whole card look pointless, which is the exact
     opposite of what a baby-steps view is for. Two decimals is usually
     enough to show a real, nonzero number for a normal day's block; if it
     is STILL zero at that precision, say the increment plainly instead of
     printing two identical-looking numbers, since that reads as broken
     rather than small. */
  var beforeStr=beforePct.toFixed(2), afterStr=afterPct.toFixed(2);
  var moveLine = (beforeStr===afterStr)
    ? "A small, real step \u2014 too small to move the percentage at two decimal places on a syllabus this size, but it is still one done, one step closer."
    : "Moves the whole syllabus from "+beforeStr+"% to "+afterStr+"%.";
  return card('<div class="eyebrow">Next '+minutesTarget+' minutes</div>'+
    lines+
    '<p class="muted sm" style="margin-top:8px">'+moveLine+'</p>');
}
function smV10TodayStats(){
  var d=activeDate(), c=plan.byDate[d], r=state.days[d]||{}, done=0,total=0,blocks=0,doneBlocks=0;
  if(c&&c.blocks){ c.blocks.forEach(function(b){
    if(["lunch","buffer","protected"].indexOf(b.kind)>=0) return;
    var m=Number(b.mins)||0; total+=m; blocks++;
    if((r.checks||{})[b.i]===true){ done+=m; doneBlocks++; }
  }); }
  return {date:d,done:done,total:total,blocks:blocks,doneBlocks:doneBlocks};
}
function smV10KnowledgeDebt(){
  var a=[];
  Object.keys(state.scores||{}).forEach(function(k){
    var s=state.scores[k]||{}, n=(+s.ba||0)+(+s.sa||0);
    if(n<10) return;
    var acc=((+s.bc||0)+(+s.sc||0))/n;
    if(acc<0.60){ var t=SM.CURRICULUM[+k]; if(t) a.push({t:t,n:n,acc:acc}); }
  });
  a.sort(function(x,y){return x.acc-y.acc || y.n-x.n;});
  return a.slice(0,3);
}
function smV10Cockpit(b){
  try{
    var st=styleNow(), ph=examStyleNow(), ts=smV10TodayStats();
    var cov=b.all.total?b.all.done/b.all.total:0;
    var mast=b.accuracy;
    var next=Math.max(1,Math.round(b.all.total*0.01));
    var mg=[]; try{ mg=SM.marginalGain(state.scores,st,ph).slice(0,1); }catch(e){}
    var kd=smV10KnowledgeDebt();
    var emo=smEmotionalState();
    var emoCopy={focused:"Protect momentum: one clean block at a time.",tired:"Lower friction: shorter blocks, normal target, no catch-up.",overwhelmed:"Shrink the horizon: finish one useful block, then reassess.",low:"Take the smallest useful step. Stopping early is allowed."}[emo]||"One useful block is enough to move today forward.";
    var pulse=timer&&timer.running ? Math.min(60,Math.floor(timerElapsed()/60)) : ts.done;
    var pace=paceOverall(), target=null, paceText="Collecting enough timed-question data.";
    try{target=SM.paceTarget(st);}catch(e){}
    if(pace!=null&&target){ var ratio=pace/target; paceText=ratio<=1.15?"Speed is within a healthy range.":ratio<=1.35?"A little slow — practise clean decisions, not panic.":"Speed needs work; protect accuracy while trimming hesitation."; }
    var finish=b.projDate?SM.pretty(b.projDate):"Not enough history yet";
    var exp=b.all.total?Math.max(0,Math.min(100,b.expectedByToday/b.all.total*100)):0;
    var mission=(cov<1)?"~"+next+" minutes of scheduled work earns the next 1% of syllabus coverage.":"Syllabus coverage is complete — now protect mastery.";
    var segs=""; for(var i=1;i<=100;i++){segs+='<span class="sm-v10-seg '+(cov*100>=i?'hit ':'')+(exp>=i&&exp<i+1?'exp':'')+'" title="'+i+'%'+(exp>=i&&exp<i+1?' · plan marker':'')+'"></span>'; }
    var debtHtml=kd.length?kd.map(function(x){return '<li><div class="sm-v10-row"><span>'+esc(x.t.n)+'</span><span class="sm-v10-pill sm-v10-risk">'+Math.round(x.acc*100)+'%</span></div><div class="sm-v10-s">'+x.n+' logged questions · attention zone</div></li>';}).join(""):'<li>No high-confidence knowledge debt yet. Keep sampling before labelling a topic weak.</li>';
    var mgHtml=mg.length?'<li><div class="sm-v10-row"><b>'+esc(mg[0].t.n)+'</b><span class="sm-v10-pill">+'+mg[0].gain.toFixed(1)+' expected</span></div><div class="sm-v10-s">~'+mg[0].expected.toFixed(1)+' questions expected next hour · '+(mg[0].acc==null?'not sampled yet':Math.round(mg[0].acc*100)+'% correct')+'</div></li>':'<li>Log a few questions to unlock the highest-value-next-hour estimate.</li>';
    var recovery=smMinimumDay()?"One useful block → stop and reassess. No forced catch-up.":emo==='focused'?"Two focused blocks, then reassess.":emo==='tired'?"25–40 minute block → 5–10 minute recovery → reassess. No forced catch-up.":"One 20–30 minute block → recovery → decide whether another block is genuinely useful.";
    var nextMove = mg.length ? mg[0].t.n : null;
    var nextWhy = mg.length ? "Highest expected return from your current data." : "Use the first unfinished scheduled block; the engine will refine this after more data.";
    var nextLabel = nextMove ? nextMove : "the next scheduled block";
    var rescue = (emo==='overwhelmed'||emo==='low'||emo==='tired'||smMinimumDay());
    return '<div class="sm-v10">'+
      card('<div class="row-top"><span class="eyebrow">Rank 1 cockpit</span><span class="sm '+(emo==='focused'?'sm-v10-good':'sm-v10-warn')+'">'+esc(emoCopy)+'</span></div>'+
        '<div class="sm-v10-grid" style="margin-top:8px">'+
          '<div class="sm-v10-card"><div class="sm-v10-k">Coverage</div><div class="sm-v10-v">'+(cov*100).toFixed(1)+'%</div><div class="sm-v10-s">'+Math.round(b.all.done/60)+'h of '+Math.round(b.all.total/60)+'h scheduled</div></div>'+
          '<div class="sm-v10-card"><div class="sm-v10-k">Mastery</div><div class="sm-v10-v">'+(mast==null?'—':Math.round(mast*100)+'%')+'</div><div class="sm-v10-s">Accuracy is separate from coverage</div></div>'+
          '<div class="sm-v10-card"><div class="sm-v10-k">Today</div><div class="sm-v10-v">'+ts.done+' / '+ts.total+'m</div><div class="sm-v10-s">'+ts.doneBlocks+' of '+ts.blocks+' study blocks complete</div></div>'+
          '<div class="sm-v10-card"><div class="sm-v10-k">1-hour pulse</div><div class="sm-v10-v">'+pulse+'m</div><div class="sm-v10-s">'+(timer&&timer.running?'Current timer':'Completed scheduled work today')+'</div></div>'+
        '</div>'+
        '<div class="sm-v14-progress" role="group" aria-label="Syllabus journey progress">'+
          '<div class="sm-v14-top"><div><div class="sm-v14-eyebrow">Your journey</div><div class="sm-v14-pct">'+(cov*100).toFixed(1)+'<span>%</span></div></div><div class="sm-v14-status">'+(cov>=1?'Complete':(cov*100>=exp?'On pace / ahead':'Building toward plan'))+'</div></div>'+
          '<div class="sm-v14-track"><div class="sm-v14-fill" style="width:'+Math.min(100,Math.max(0,cov*100)).toFixed(2)+'%"></div><span class="sm-v14-marker" style="left:'+Math.min(99.5,Math.max(.5,exp)).toFixed(2)+'%" title="Expected by today"></span><span class="sm-v14-you" style="left:'+Math.min(100,Math.max(0,cov*100)).toFixed(2)+'%" title="You are here"></span><span class="sm-v14-dotlabel" style="left:25%">25%</span><span class="sm-v14-dotlabel" style="left:50%">50%</span><span class="sm-v14-dotlabel" style="left:75%">75%</span></div>'+
          '<div class="sm-v14-scale"><span>START</span><span>FINISH</span></div>'+
          '<div class="sm-v14-next"><div><strong>Next milestone: '+(cov>=1?'Mastery protection':((Math.floor(cov*100)+1)+'% syllabus'))+'</strong><small>'+(cov>=1?'Coverage is complete. Protect retention and readiness.':(100-(cov*100%1||0)).toFixed(1)+'% remains to earn the next 1%')+'</small></div><span class="sm-v14-chip">+1%</span></div>'+
          '<div class="sm-v14-stats"><div class="sm-v14-stat"><b>'+(cov*100-exp>=0?'+':'')+(cov*100-exp).toFixed(1)+'%</b><span>vs plan today</span></div><div class="sm-v14-stat"><b>'+Math.max(0,Math.round((b.all.total-b.all.done)/60))+'h</b><span>work remaining</span></div><div class="sm-v14-stat"><b>'+(b.projDate?esc(SM.pretty(b.projDate)):'—')+'</b><span>projected finish</span></div></div>'+
          '<div class="sm-v14-legend"><span class="sm-v14-key"><i class="a"></i>You</span><span class="sm-v14-key"><i class="b"></i>Expected</span><span class="sm-v14-key"><i class="c"></i>25 / 50 / 75% milestones</span></div>'+
          '<details class="sm-v14-details"><summary>See the numbers behind the bar</summary><div class="sm-v14-minirow"><div class="sm-v14-mini"><b>Coverage</b><span>'+(cov*100).toFixed(1)+'% of planned study minutes completed.</span></div><div class="sm-v14-mini"><b>Mastery</b><span>'+(mast==null?'Not enough sampled data yet':Math.round(mast*100)+'% accuracy on logged questions')+'</span></div></div><div class="sm-v14-mini" style="margin-top:7px"><b>Momentum</b><span>'+(b.velocity.thisWeek>0?'This week: '+Math.round(b.velocity.thisWeek/60)+'h logged · '+(vDelta==null?'trend still forming':(vDelta>=0?'+':'')+vDelta+'% vs prior week'):'No recent timed-study history yet.')+'</span></div></details>'+
          '<div class="sm-v10-actions"><button class="btn" data-nav="revise">Start next useful block →</button>'+(rescue?'<button class="btn" data-nav="revise">'+(smMinimumDay()?'Start minimum-day block →':'Start 25-minute rescue →')+'</button>':'')+'</div></div>'+
        '<div class="sm-v10-grid" style="margin-top:8px">'+
          '<div class="sm-v10-card"><div class="sm-v10-k">Best next hour</div><ul class="sm-v10-list">'+mgHtml+'</ul></div>'+
          '<div class="sm-v10-card"><div class="sm-v10-k">Needs attention</div><ul class="sm-v10-list">'+debtHtml+'</ul></div>'+
          '<div class="sm-v10-card"><div class="sm-v10-k">Recovery</div><div class="sm-v10-s" style="font-size:18.5px;color:var(--bone)">'+esc(recovery)+'</div><div class="sm-v10-s">Your long-term target stays intact. Bad days do not create punishment debt.</div></div>'+
          '<div class="sm-v10-card"><div class="sm-v10-k">Finish & speed</div><div class="sm-v10-s">Projected finish: <b>'+esc(finish)+'</b></div><div class="sm-v10-s" style="margin-top:5px">'+esc(paceText)+'</div></div>'+
        '</div>'+
        '<div class="sm-v10-card" style="margin-top:8px"><div class="sm-v10-k">Today&apos;s finish line</div><div class="sm-v10-s">Move one useful block forward. If you have done enough, <b>stop without chasing lost time</b>. Yesterday is not a debt you have to repay tonight.</div></div>')+
      '</div>';
  }catch(e){ try{console.error("Dakshinamurthy V10 cockpit failed",e);}catch(x){} return ""; }
}
function progressSection(){
  var b=progressBreakdown();
  if(b.all.total<=0) return "";
  var t=todayISO();
  var left=plan.content.filter(function(c){return c.date>=t;}).length;
  var pc=function(x){ return x.total? x.done/x.total*100 : 0; };
  var TRACK_COL={behind:"var(--rust)",ontrack:"var(--drape)",ahead:"var(--sky)"};
  var TRACK_TXT={behind:"Behind the plan\u2019s own pace",ontrack:"On track",ahead:"Ahead of the plan\u2019s own pace"};
  var vDelta = b.velocity.lastWeek>0 ? Math.round((b.velocity.thisWeek-b.velocity.lastWeek)/b.velocity.lastWeek*100) : null;
  var velLine = b.velocity.lastWeek<=0 && b.velocity.thisWeek<=0 ? "Not enough history yet for a weekly trend."
    : vDelta===null ? "This week: "+Math.round(b.velocity.thisWeek/60)+"h logged."
    : "This week: "+Math.round(b.velocity.thisWeek/60)+"h ("+(vDelta>=0?"+":"")+vDelta+"% vs last week's "+Math.round(b.velocity.lastWeek/60)+"h).";

  /* Expected-by-today: what the PLAN'S OWN minute-weighted schedule intended
     to have covered by now, as a percentage of the whole. Shown as a marker
     line on the syllabus column rather than only as a derived label \u2014
     "behind/on track" already existed, but nothing showed WHERE the plan
     expected you to be, spatially, next to where you actually are. */
  var expPct = b.all.total? b.expectedByToday/b.all.total*100 : null;

  var phaseCols='<details style="margin-top:12px"><summary class="muted sm" style="cursor:pointer">By phase \u25be</summary><div class="mscrow">';
  var phaseHasAny=false;
  for(var ph=1;ph<=7;ph++){
    var pb=b.byPhase[ph]; if(!pb||pb.total<=0) continue;
    phaseHasAny=true;
    var phExp = pb.total? (b.expByPhase[ph]||0)/pb.total*100 : null;
    phaseCols+=milestoneColumn(pc(pb),"var(--prog)",ph+". "+(SM.PHASE_NAME[ph]||"").split(" ").slice(0,2).join(" "),pb.done,pb.total,null,null,phExp);
  }
  phaseCols+='</div></details>';

  /* Questions broken into its three passes, collapsed the same way phases
     are \u2014 the headline "Questions" column stays the quick read, the three
     passes are one tap away for when blended is not enough. */
  var passCols = (b.passes.q1.total+b.passes.q2.total+b.passes.q3.total>0)
    ? '<details style="margin-top:12px"><summary class="muted sm" style="cursor:pointer">Questions by pass \u25be</summary><div class="mscrow">'+
        milestoneColumn(pc(b.passes.q1),"var(--sky)","Pass 1",b.passes.q1.done,b.passes.q1.total,null)+
        milestoneColumn(pc(b.passes.q2),"var(--sky)","Pass 2",b.passes.q2.done,b.passes.q2.total,null)+
        milestoneColumn(pc(b.passes.q3),"var(--sky)","Pass 3",b.passes.q3.done,b.passes.q3.total,null)+
      '</div></details>'
    : "";

  /* Topic-level milestones \u2014 the same kind of number as the phase columns,
     one grain finer: 39 real schedule-derived percentages instead of 7. Kept
     as one flat row rather than nested under each phase, since a
     disclosure inside a disclosure was already tried and dropped earlier in
     this project for being fiddly on a phone; the phase number in each
     label keeps the grouping visible without nesting the controls. */
  var topicList=[];
  SM.CURRICULUM.forEach(function(t2){
    var tb=b.byTopic[t2.i]; if(!tb||tb.total<=0) return;
    topicList.push({t:t2, tb:tb});
  });
  var topicHasAny=topicList.length>0;
  var topicCols = topicHasAny
    ? '<details style="margin-top:12px"><summary class="muted sm" style="cursor:pointer">By topic, all '+topicList.length+' \u25be</summary>'+
      topicBar(topicList,b.expByTopic)+'</details>'
    : "";

  /* Subtopic-level is a DIFFERENT kind of number, not a finer version of the
     same one: subtopics are free text typed while logging, not a planned
     curriculum unit, so there is no schedule total to measure against. What
     is real at this grain is ACCURACY of what you have actually logged \u2014
     labelled that way rather than dressed up as a completion percentage,
     since presenting a mastery metric as a progress metric would misstate
     what it is. Only subtopics with at least 3 logged attempts are shown,
     so a single guess does not render as a 0% or 100% column; sorted by
     most recently logged, since that is what you would want to check first. */
  /* Everything logged under a subtopic name, before the >=3 floor. Used
     only to tell "genuinely nothing logged yet" apart from "something is
     logged but too thin to show a real segment for" \u2014 the section used to
     vanish outright in EITHER case, with no way to tell which one you were
     looking at, which is its own kind of "it is not there" even when the
     feature was working exactly as designed. */
  var subAll=Object.keys(b.bySubtopic).map(function(k){return b.bySubtopic[k];});
  var subEntries=subAll.filter(function(x){return x.total>=3;})
    .sort(function(a,c2){return c2.lastT-a.lastT;});
  var subCols =
    '<details style="margin-top:12px"><summary class="muted sm" style="cursor:pointer">By subtopic \u2014 '+
      (subEntries.length? subEntries.length+' logged':'none yet')+' \u25be</summary>'+
    '<p class="muted sm" style="margin-top:6px">Not a schedule percentage \u2014 subtopics are not a planned curriculum unit, this is what you have actually logged under that name. Each subtopic gets its own colour and its own share of the bar by how much of it you have logged; sorted most-recent-first.</p>'+
    (subEntries.length ? subtopicBar(subEntries)
      : subAll.length
        ? '<p class="muted sm">'+subAll.length+' subtopic'+(subAll.length===1?"":"s")+' logged so far, none with 3 or more attempts yet \u2014 the bar needs that much before a slice means anything.</p>'
        : '<p class="muted sm">Empty so far. Type a subtopic when logging a question in Practise and it appears here once you have logged 3 or more against it.</p>')+
    '</details>';

  var spark = sparkline(b.sparkline);

  var ratePerDay = b.velocity.thisWeek>0 ? b.velocity.thisWeek/7 : 0;
  var v10=smV10Cockpit(b);
  return v10+card('<div class="row-top"><span class="eyebrow">Progress</span>'+
      '<span class="sm" style="color:'+TRACK_COL[b.track]+'">'+esc(TRACK_TXT[b.track])+'</span></div>'+
    '<div class="mscrow">'+
      milestoneColumn(pc(b.all),TRACK_COL[b.track],"Whole syllabus",b.all.done,b.all.total,null,null,expPct)+
      milestoneColumn(pc(b.questions),"var(--sky)","Questions",b.questions.done,b.questions.total,"revise",b.accuracy)+
      milestoneColumn(pc(b.lectures),"var(--amber)","Lectures",b.lectures.done,b.lectures.total,"revise")+
    '</div>'+
    (spark?'<div class="row-top" style="margin-top:6px"><span class="muted sm">Last '+b.sparkline.length+' days</span></div>'+spark:'')+
    '<p class="muted sm" style="margin-top:10px"><b>Syllabus</b> '+esc(nextMilestoneText(pc(b.all),b.all.total,ratePerDay))+'. '+
      left+' days left'+(expPct!=null?' \u00b7 plan expected '+expPct.toFixed(1)+'% by today':'')+'.</p>'+
    '<p class="muted sm">'+esc(velLine)+(b.projDate?' At this pace, finishes around '+esc(SM.pretty(b.projDate))+'.':'')+'</p>'+
    '<p class="muted sm"><b>Questions</b> '+esc(nextMilestoneText(pc(b.questions),b.questions.total,ratePerDay))+
      (b.accuracy!=null?' \u00b7 '+Math.round(b.accuracy*100)+'% right so far':'')+
      ' \u00b7 <b>Lectures</b> '+esc(nextMilestoneText(pc(b.lectures),b.lectures.total,ratePerDay))+'</p>'+
    passCols+
    (phaseHasAny?phaseCols:"")+
    (topicHasAny?topicCols:"")+
    subCols+
    '<p class="muted sm" style="margin-top:10px">Measured in study minutes, so a 73-minute question block and a 10-minute recall are not counted as equal. Half-ticked blocks count as half. The white line marks where the plan expected each column to be by today \u2014 shown on every phase and topic, not just the totals, since "the syllabus is behind" cannot tell you which specific phase or topic is actually causing that. The hatched band on Questions is the wrong-answer share of what is done. Tap Questions or Lectures to go work on it.</p>');
}
function streakDays(){
  var t=todayISO(), n=0, seenToday=false;
  var days=plan.content.map(function(c){return c.date;}).filter(function(d){return d<=t;});
  for(var i=days.length-1;i>=0;i--){
    var r=state.days[days[i]];
    var any=r&&r.checks&&Object.keys(r.checks).some(function(k){return r.checks[k];});
    if(any){ n++; if(days[i]===t) seenToday=true; }
    else if(days[i]===t) continue;   /* today not started yet does not end a run */
    else break;
  }
  return {n:n, today:seenToday};
}
function head0(entry,idx){
  if(!entry) return "Outside the plan";
  if(entry.kind==="content") return "Day "+(idx+1)+" of "+plan.content.length;
  return {backup:"Weekly backup",rest:"Rest & repair",
    taper:"Taper",exam:"EXAM DAY",off:"Day off"}[entry.kind]||entry.kind;
}



/* ===== UI MODULE 2: ui-learning.part.js ===== */
/* ---------- 2.9.1 learning reliability: session director + weekly audit ---------- */
function smAdaptiveCalibration(topicId){
  var now=Date.now(), arr=[];
  Object.keys(state.mcq||{}).forEach(function(k){
    var m=state.mcq[k]; if(!m||m.topicId!==topicId) return;
    (m.attempts||[]).forEach(function(a){ if((a.t||0)>now-90*DAY && Number(a.conf)>0) arr.push(a); });
  });
  arr.sort(function(a,b){return (a.t||0)-(b.t||0);});
  var n=arr.length, certain=arr.filter(function(a){return Number(a.conf)===3;}), unsure=arr.filter(function(a){return Number(a.conf)===2;}), guessed=arr.filter(function(a){return Number(a.conf)===1;});
  function rate(xs){return xs.length?xs.filter(function(a){return a.outcome==='right';}).length/xs.length:null;}
  var ca=rate(certain), ua=rate(unsure), ga=rate(guessed);
  var gap=ca==null?0:Math.max(0,Math.min(1,ca));
  var stateName=n<5?'unknown':(ca!=null&&ca<.65?'overconfident':(ca!=null&&ca>=.85?'well-calibrated':'mixed'));
  return {n:n,certain:certain.length,unsure:unsure.length,guessed:guessed.length,certainAcc:ca,unsureAcc:ua,guessedAcc:ga,state:stateName};
}
function smAdaptiveCalibrationSummary(){
  var rows=[];
  SM.CURRICULUM.forEach(function(t){var c=smAdaptiveCalibration(t.i); if(c.n>=5) rows.push({t:t,c:c});});
  rows.sort(function(a,b){
    var ax=a.c.certainAcc==null?1:a.c.certainAcc, bx=b.c.certainAcc==null?1:b.c.certainAcc;
    return ax-bx || b.c.n-a.c.n;
  });
  var certain=rows.filter(function(x){return x.c.certainAcc!=null;});
  var avg=certain.length?certain.reduce(function(a,x){return a+x.c.certainAcc;},0)/certain.length:null;
  var over=certain.filter(function(x){return x.c.state==='overconfident';});
  return {rows:rows.slice(0,5),avg:avg,over:over.slice(0,3),sample:rows.reduce(function(a,x){return a+x.c.n;},0)};
}
function smAdaptiveCalibrationCard(){
  var a=smAdaptiveCalibrationSummary();
  if(!a.rows.length) return card('<div class="row-top"><span class="eyebrow drape">Calibration</span><span class="muted sm">building signal</span></div><p class="muted sm">After 5+ scored questions on a topic, the engine can compare what you <b>felt</b> with what you actually retrieved. That helps it choose repair versus recall versus new learning.</p>',"drape");
  var rows=a.rows.map(function(x){
    var pct=x.c.certainAcc==null?'—':Math.round(x.c.certainAcc*100)+'%';
    var tag=x.c.state==='overconfident'?' · slow down':' · stable';
    return '<div class="row-top" style="margin-top:7px"><span class="sm">'+esc(x.t.n)+'</span><span class="muted sm">Certain: '+pct+tag+'</span></div>';}).join('');
  return card('<div class="row-top"><span class="eyebrow drape">Calibration</span><span class="muted sm">'+a.sample+' scored attempts</span></div>'+ '<p class="muted sm">The engine separates <b>not knowing</b> from <b>thinking you know</b>. '+(a.avg!=null?'Across measured topics, certain answers are '+Math.round(a.avg*100)+'% correct.':'Keep logging confidence to build the signal.')+'</p>'+rows+(a.over.length?'<p class="muted sm"><b>Calibration repair:</b> '+esc(a.over.map(function(x){return x.t.n;}).join(', '))+'. Prefer closed-notes retrieval before more input.</p>':'')+'<p class="muted sm">Calibration is a training signal, not a score or judgement.</p>',"drape");
}

function smAdaptiveTopics(date){
  var now=Date.now(), out=[], dueMap={};
  (SM.dueQueue(state.misses,now,999).queue||[]).forEach(function(m){ dueMap[m.topicId]=(dueMap[m.topicId]||0)+1; });
  var exam=SM.nextExam(plan.P,date), examSoon=!!(exam&&SM.daysBetween(date,exam.iso)<=45);
  SM.CURRICULUM.forEach(function(t){
    var sc=state.scores[t.i]||{}, n=(sc.ba||0)+(sc.sa||0), acc=n?((sc.bc||0)+(sc.sc||0))/n:null;
    var arr=[]; Object.keys(state.mcq||{}).forEach(function(k){var q=state.mcq[k];if(q&&q.topicId===t.i)(q.attempts||[]).forEach(function(a){if(a.t>now-45*DAY)arr.push(a);});});
    var recent=arr.slice(-15), rn=recent.length, ra=rn?recent.filter(function(a){return a.outcome==='right';}).length/rn:null;
    var repeat=0, confidentWrong=0, confidentRight=0, confidenceSum=0, lastAt=0, reasons={};
    recent.forEach(function(a){
      var c=Number(a.conf)||0; confidenceSum+=c; lastAt=Math.max(lastAt,Number(a.t)||0);
      if(a.outcome==='wrong') repeat++;
      if(a.outcome==='wrong'&&c>=3) confidentWrong++;
      if(a.outcome==='right'&&c>=3) confidentRight++;
      if(a.reason) reasons[a.reason]=(reasons[a.reason]||0)+1;
    });
    var calProfile=smAdaptiveCalibration(t.i);
    var calibration=(rn&&confidentWrong+confidentRight)?confidentWrong/Math.max(1,confidentWrong+confidentRight):0;
    if(calProfile.certainAcc!=null && calProfile.certainAcc<.65) calibration=Math.max(calibration,.65);
    var staleDays=lastAt?Math.max(0,(now-lastAt)/DAY):99;
    var observedStability=recent.length?Math.max(3, recent.length>=2 ? Math.min(30, (staleDays||7)+7) : 7):7;
    var retention=lastAt?SM.retentionEstimate(staleDays,observedStability):0;
    var retentionRisk=lastAt?Math.max(0,Math.min(1,1-retention)):1;
    var retentionState=!lastAt?'unknown':(retention<.45?'fragile':(retention<.72?'watch':'stable'));
    var repair=!!((state.repairs||{})[t.i]);
    var stable=(n>=8 && (acc!=null&&acc>=.88) && !dueMap[t.i] && !confidentWrong && repeat===0 && retentionRisk<.7);
    var planned=false, plannedMins=0;
    var r=recFor(date); try{ var sh=shapeToday(plan.byDate[date],date,plan.P,r); sh.shaped.blocks.forEach(function(b){if(b.ti===t.i && ['lunch','buffer','protected'].indexOf(b.kind)<0){planned=true;plannedMins=Math.max(plannedMins,Number(b.mins)||30);}}); }catch(e){}
    var mastery=ra!=null?ra:(acc!=null?acc:(n?Math.min(.75,n/20):.25));
    /* Adaptive Learning Model: recent retrieval, confidence calibration and
       forgetting risk supplement the campaign score without replacing it. */
    var confidenceCalibrationRisk=calibration;
    var reasonKey=Object.keys(reasons).sort(function(a,b){return reasons[b]-reasons[a];})[0]||null;
    out.push({i:t.i,name:t.n,accuracy:ra!=null?ra:acc,mastery:Math.max(0,Math.min(1,mastery)),due:dueMap[t.i]||0,
      repeatMisses:repeat,confidentWrong:confidentWrong>0,recentMiss:repeat>0,repair:repair,planned:planned,plannedMins:plannedMins,
      plannedWeight:planned?7:0,examSoon:examSoon,highYield:(t.yINI>=2||t.yNEET>=2),yieldWeight:5,stable:stable,
      calibrationRisk:confidenceCalibrationRisk,calibrationState:calProfile.state,calibrationCertainAcc:calProfile.certainAcc,retentionRisk:retentionRisk,retention:retention,retentionState:retentionState,daysSinceLastAttempt:staleDays,confidenceGap:Math.abs((rn?confidenceSum/rn:0)/3-(ra==null?.5:ra)),dominantReason:reasonKey,
      family:SM.topicFamily?SM.topicFamily(t.n):t.tr,related:SM.topicRelationIds?SM.topicRelationIds(t.i):[]});
  });
  return out;
}

function smAdaptiveDecision(date,minutes,minimum){
  var e=state.emotionalState||'focused';
  var base=SM.adaptiveDecision({topics:smAdaptiveTopics(date),minutes:minutes||45,minimum:!!minimum,energy:e,examSoon:(function(){var x=SM.nextExam(plan.P,date);return !!(x&&SM.daysBetween(date,x.iso)<=45);})()});
  /* v15: the new evidence director is advisory to the existing campaign-aware
     decision. It can improve the target/method when Today is free, but it cannot
     displace a planned anchor. */
  var v15=null;
  try{v15=SM.adaptiveEngineV15?SM.adaptiveEngineV15(state,{minutes:minutes||45,energy:e,now:Date.now(),capDays:capDays()}):null;}catch(e2){v15=null;}
  base.engineV15=v15;
  if(v15&&v15.topicId!=null){
    var match=(base.alternatives||[]).concat([base.target]).find(function(t){return t&&Number(t.i)===Number(v15.topicId);});
    if(match && !match.planned){
      base.target=match;
      base.action=v15.action==='transfer'?'learn':v15.action;
      base.engineReason=v15.reasons||[];
      base.engineConfidence=v15.confidence;
      base.decisionKey=v15.decisionKey;
    }
  }
  return base;
}

function smAdaptiveQuestions(topicId,action){
  var a=SM.adaptiveQuestionSelect?SM.adaptiveQuestionSelect(Object.keys(state.mcq||{}).map(function(k){return state.mcq[k];}),{topicId:topicId,action:action,limit:6,now:Date.now()}):{items:[],hasEvidence:false};
  return a;
}
function smAdaptiveQuestionCard(topicId,action){
  var a=smAdaptiveQuestions(topicId,action);
  if(!a.hasEvidence) return '<p class="muted sm"><b>Question selection:</b> no exact logged question history for this topic yet. The engine will not invent question identities.</p>';
  var items=a.items||[];
  return '<div class="sm-adq"><div class="row-top"><span class="eyebrow">Best question targets</span><span class="muted sm">'+a.total+' known</span></div>'+items.slice(0,4).map(function(q){
    var meta=(q.subtopic?q.subtopic+' · ':'')+'Q'+q.number+' · '+(q.lastOutcome==='wrong'?'needs repair':q.lastOutcome==='fragile'?'fragile':'review');
    return '<button type="button" class="btn sm sm-adq-item" data-adq="'+esc(String(q.topicId))+'" data-adq-app="'+esc(q.app)+'" data-adq-sub="'+esc(q.subtopic)+'" data-adq-num="'+esc(q.number)+'"><b>'+esc(q.subtopic||q.app||'Question')+'</b><span>'+esc('Q'+q.number)+' · '+esc(q.lastOutcome||'review')+' · '+q.attempts+' attempts</span></button>';
  }).join('')+'<p class="muted sm">'+esc(a.reason)+'</p></div>';
}

function smSessionPlan(date,minutes,anchor,todayBridge){
  var requested=Math.max(30,Math.min(240,Number(minutes)||30)); requested=Math.floor(requested/30)*30; if(requested<30) requested=30;
  var topics=smAdaptiveTopics(date), d=smAdaptiveDecision(date,requested,false), energy=state.emotionalState||'focused';
  /* v14.4.8: when Today has a scheduled anchor, carry the same bridge decision
     into the session. This prevents a second adaptive decision from replacing
     the action the user just chose on Today. */
  if(todayBridge && todayBridge.mode==='today'){
    d.todayAnchor=todayBridge.anchor;
    d.todayOverlay=todayBridge.overlay;
    d.todayReason=todayBridge.reason;
    if(todayBridge.target && todayBridge.target.i!=null) d.target=todayBridge.target;
    d.action=todayBridge.overlay==='planned' ? (d.action||'learn') : todayBridge.overlay;
  }
  var inter=SM.adaptiveInterleave?SM.adaptiveInterleave(topics,energy):{enabled:false};
  var target=d.target||{};
  var availableStrategies=inter.enabled?['interleaved','transfer','focused']:['focused','transfer'];
  var strategy=SM.adaptiveStrategyPick?SM.adaptiveStrategyPick((state.adaptive4||{}).strategies,availableStrategies):'focused';
  var difficulty=target.difficulty||{};
  var transfer=target.transferNeed||0;
  /* A learned transfer preference is allowed to raise application work only
     when the topic has enough evidence to support it. Never manufacture
     transfer readiness from an unknown/weak topic. */
  if(strategy==='transfer' && transfer>=.4) transfer=Math.max(transfer,.65);
  var comp=SM.adaptiveSessionCompose?SM.adaptiveSessionCompose({action:d.action,energy:energy,interleaved:inter.enabled,transferNeed:transfer,difficulty:difficulty}):{mins:30,parts:[{mins:10,type:'retrieve',label:'Retrieval'},{mins:10,type:'questions',label:'Questions'},{mins:10,type:'closure',label:'Closure'}]};
  var blocks=[];
  for(var i=0;i<requested/30;i++){
    if(i===0 && inter.enabled) blocks.push({mins:30,label:'Interleaved retrieval · '+inter.topics.map(function(t){return t.name;}).join(' + '),type:'interleave',parts:comp.parts,reason:comp.reason});
    else if(i===0) blocks.push({mins:30,label:(anchor&&anchor.label?anchor.label+' · ':'')+(todayBridge&&todayBridge.overlay==='repair'?'Targeted repair → ':todayBridge&&(todayBridge.overlay==='retrieve'||todayBridge.overlay==='recall')?'Retrieval → ':'')+(comp.parts||[]).map(function(p){return p.label;}).join(' → '),type:'composed',parts:comp.parts,reason:(todayBridge&&todayBridge.reason)||comp.reason,anchor:!!anchor,todayOverlay:todayBridge&&todayBridge.overlay||'planned'});
    else blocks.push({mins:30,label:i===requested/30-1?'Closed-notes recall · '+(target.name||'today'): 'Adaptive retrieval · '+(target.name||'today'),type:i===requested/30-1?'closure':'retrieval'});
  }
  d.minutes=requested; d.blocks=blocks; d.strategy=strategy; d.composition=comp; d.difficulty=difficulty; d.transferNeed=transfer;
  return {mins:requested,blocks:blocks,decision:d};
}
function smMinimumSession(){
  var d=smAdaptiveDecision(activeDate(),15,true);
  d.blocks=[{mins:Math.min(10,d.minutes),label:d.blocks[0].label,type:d.action},{mins:5,label:'Closed-notes recall · '+d.target.name,type:'closure'}];
  d.minutes=15;
  return {mins:15,blocks:d.blocks,decision:d};
}
function smWeeklyAudit(){
  var since=Date.now()-7*DAY, q=0, correct=0, wrong=0, confWrong=0, types={};
  Object.keys(state.mcq||{}).forEach(function(k){
    var m=state.mcq[k], arr=m&&m.attempts||[];
    arr.forEach(function(a){ if((a.t||0)<since) return; q++; if(a.outcome==="right") correct++; if(a.outcome==="wrong") wrong++; if(a.outcome==="wrong"&&Number(a.conf)>=3) confWrong++; if(a.reason) types[a.reason]=(types[a.reason]||0)+1; });
  });
  var top=Object.keys(types).sort(function(a,b){return types[b]-types[a];})[0];
  return {q:q,acc:q?correct/q:null,wrong:wrong,confWrong:confWrong,top:top?((SM.ERR_TYPES||[]).find(function(e){return e[0]===top;})||[top,top])[1]:null};
}
function smAdaptiveMasteryCard(){
  var rows=smAdaptiveTopics(activeDate()).filter(function(t){return t.accuracy!=null||t.attempts>0;}).sort(function(a,b){return b.priority-a.priority;}).slice(0,4);
  if(!rows.length) return '';
  return card('<div class="row-top"><span class="eyebrow">Evidence, not a guess</span><span class="muted sm">adaptive confidence</span></div>'+rows.map(function(t){var pct=t.accuracy==null?'—':Math.round(t.accuracy*100)+'%';var st=t.retentionState||'unknown';return '<div class="sm-mastery-row"><div><b>'+esc(t.name)+'</b><div class="muted sm">'+pct+' recent accuracy · '+esc(st)+' retention</div></div><span class="badge">'+esc((t.difficulty&&t.difficulty.level)||'unknown')+'</span></div>';}).join(''),"drape");
}
function smAdaptiveStopCard(){
  var a=smAdaptiveTopics(activeDate()).find(function(t){return t.i===(smAdaptiveDecision(activeDate(),30,false).target||{}).i;});
  if(!a) return '';
  var x=SM.adaptiveStopSignal?SM.adaptiveStopSignal({recentAccuracy:a.accuracy,retentionState:a.retentionState,calibrationState:a.calibrationState}):{stop:false};
  return card('<div class="eyebrow">When to stop</div><p class="muted sm">'+esc(x.reason)+'</p>',x.stop?'drape':'');
}
function smRetentionCheckCard(){
  var rows=smAdaptiveTopics(activeDate()).filter(function(t){return t.retentionState==='fragile'||t.retentionState==='watch';}).sort(function(a,b){return b.retentionRisk-a.retentionRisk;}).slice(0,2);
  if(!rows.length) return '';
  return card('<div class="row-top"><span class="eyebrow">Forgetting protection</span><span class="muted sm">quick checks</span></div><p class="muted sm">'+rows.map(function(t){return '<b>'+esc(t.name)+'</b>: retrieve it briefly before relearning.';}).join(' · ')+'</p>',"drape");
}
function smLearningReliabilityCard(){
  var active=state.session&&state.session.date===activeDate();
  var s=active?state.session:smSessionPlan(activeDate(),30), d=s.decision||smAdaptiveDecision(activeDate(),s.mins||45,false), idx=active?Math.min(s.current||0,s.blocks.length-1):0, current=s.blocks[idx];
  var why=(d.reason&&d.reason.length)?d.reason.join(' · '):'This is the highest-value available action from your current evidence.';
  var relatedNote=(d.related&&d.related.length)?'Connected topics: '+d.related.join(' + ')+'. The relationship is used to choose retrieval order, not to change your campaign.':'';
  return card('<div class="row-top"><span class="eyebrow drape">'+(active?'Adaptive session':'Adaptive study engine')+'</span><span class="muted sm">'+s.mins+' min</span></div>'+ 
    '<h2 style="margin:4px 0 6px">'+esc(current?current.label:'Your next useful move')+'</h2>'+ 
    '<p class="muted sm"><b>Why:</b> '+esc(why)+'</p>'+ (relatedNote?'<p class="muted sm">'+esc(relatedNote)+'</p>':'')+ 
    '<div class="lbl">'+s.blocks.map(function(b,i){return '<span style="opacity:'+(active&&i<idx?.55:1)+'">'+esc(b.mins+' min · '+b.label)+'</span>';}).join(' → ')+'</div>'+ 
    smAdaptiveQuestionCard(d.target&&d.target.i,d.action)+'<p class="muted sm">'+(active?'Your session is saved. Finish the current block, then let the engine reassess the next move.':'The engine weighs mastery, retrieval history, confidence calibration, observed retention risk, repeated misses, planned work, exam pressure and today’s energy. Standard sessions are built in 30-minute blocks; stable topics can be skipped and comparable weak topics may be interleaved when that is likely to improve retrieval.')+'</p>'+ 
    '<div class="btnrow">'+(active?'<button class="btn solid f1" data-session-next="1">'+(idx<s.blocks.length-1?'Complete block →':'Complete final block')+'</button><button class="btn sm" data-session-stop="1">Finish session</button>':'<button class="btn solid f1" data-session-start="1">Start this session</button><button class="btn sm" data-minimum-start="1">I only have 15 minutes</button>')+'</div>',"drape");
}
function smWeeklyAuditCard(){
  var a=smWeeklyAudit();
  return card('<div class="row-top"><span class="eyebrow">This week</span><span class="muted sm">last 7 days</span></div>'+
    '<div class="g3"><div><div class="big2 drape">'+a.q+'</div><div class="muted sm">logged attempts</div></div>'+
    '<div><div class="big2">'+(a.acc==null?'—':Math.round(a.acc*100)+'%')+'</div><div class="muted sm">accuracy</div></div>'+
    '<div><div class="big2">'+a.confWrong+'</div><div class="muted sm">sure but wrong</div></div></div>'+
    '<p class="muted sm">'+(a.top?'Dominant mistake signal: <b>'+esc(a.top)+'</b>. '+(a.top.toLowerCase().indexOf('forget')>=0?'Use retrieval before adding more input.':'Repair the reasoning, then retrieve it again.'):'Log a few scored questions and this becomes a useful learning signal.')+'</p>',"drape");
}

function renderToday(){
  var date=activeDate(), entry=plan.byDate[date], r=recFor(date), P=plan.P;
  var idx=plan.content.map(function(c){return c.date;}).indexOf(date);
  var st=styleNow(date), nx=SM.nextExam(P,date);
  var out="";
  out+='<div class="sm-v16-brand"><img src="icon.png" alt="Dakshinamurthy app icon"><div><div class="sm-v16-brand-name">Dakshinamurthy</div><div class="sm-v16-brand-sub">Higher Every Hour · Knowledge for Better Surgery</div></div><button type="button" class="sm-v16-brand-mode sm-mode-link" data-go-tab="settings" aria-label="Open visual mode settings">'+(state.visualMode||"focus").toUpperCase()+' MODE</button></div>';
  /* One line, always at the top, regardless of how long the dashboard below
     gets: today's date, the exam countdown, and a way to skip straight past
     target dates / trajectory / Coach to the actual blocks. Opening the app
     to tick off a block should not require scrolling past a feasibility
     report every time. */
  out+='<img class="sm-v22-picture" src="sm-today.svg" alt="Today illustration: mountain, sunrise and winding path">';
  out+='<div class="sm-v25-route"><div class="sm-v25-route-main"><div class="sm-v25-kicker">Today · Your next step</div><div class="sm-v25-title">Climb, don’t chase.</div><div class="sm-v25-copy">One useful block at a time. Your route is already planned; your job is simply to take the next step.</div><div class="sm-v25-badge" style="margin-top:12px">Higher every day</div><div class="sm-v25-route-art"><img src="sm-today.svg" alt=""></div></div><div class="sm-v25-route-side"><div><div class="sm-v25-symbol">ॐ</div><div class="sm-v25-side-title">Learn · Practice · Recover</div><div class="sm-v25-side-copy">Protect sleep. Finish what matters. Let the system carry the rest.</div></div><div class="sm-v25-phase"><div class="sm-v25-phase-dot"></div><div class="sm-v25-phase-line"></div></div></div></div>';
  /* Claude was reachable only from a section partway down the Coach tab —
     rendering correctly but effectively invisible unless you already knew to
     look there. It is now the first action on Today, where the day starts. */
  if(!state.prefs.guideSeen)
    out+=card('<div class="row-top"><span class="eyebrow drape">How this app works</span>'+
      '<button class="btn sm" id="guideHide">Got it</button></div>'+
      '<p class="sm">Two screens, in a loop. That is the whole app.</p>'+
      '<p class="sm"><b>Today</b> → what to do now. Tap Start.</p>'+
      '<p class="sm"><b>Practise</b> → do questions, tap Right / Fragile / Wrong. The ones you get wrong come back here on their own, at the right time.</p>'+
      '<p class="muted sm">Then round again tomorrow. <b>Schedule</b> is only for when something goes wrong — you fall behind, or you want to swap a topic. You can ignore it for weeks.</p>',"drape");
  /* "What should I do now?" — the first thing on the page, above everything
     else. Every other card on Today answers a question you might have; this
     one answers the question you always have. Reads the same shaped blocks
     and the same completion lookup the timeline uses, so it can never
     disagree with the ticks below it. */
  (function(){
    /* shapeToday assumes a real day exists — on a date outside the plan there
       is no entry and it throws on entry.rawItems. The page header below
       already handles that case; the Now card must not crash before reaching
       it. */
    if(!entry){
      out+=card('<div class="eyebrow drape">Do this now</div><p class="lbl">Nothing scheduled for this date.</p>'+
        '<p class="muted sm">This day is outside the plan. Tap Today to go back.</p>',"drape");
      return;
    }
    var f0=shapeToday(entry,date,P,r);
    var wb0=f0.shaped.blocks.filter(function(b){
      return ["lunch","buffer","protected"].indexOf(b.kind)<0; });
    function doneOf(b){
      var sd=b.foldedFrom||date, sk=b.foldedFrom?b.foldedBlockId:b.i;
      var sr=b.foldedFrom?(state.days[sd]||{}):r;
      return (sr.checks||{})[sk];
    }
    var cur=null, nxt=null;
    for(var i=0;i<wb0.length;i++){
      if(doneOf(wb0[i])!==true){ if(!cur) cur=wb0[i]; else { nxt=wb0[i]; break; } }
    }
    var doneCount=wb0.filter(function(b){return doneOf(b)===true;}).length;
    if(!wb0.length){
      out+=card('<div class="eyebrow drape">Do this now</div><p class="lbl">Nothing scheduled today.</p>'+
        '<p class="muted sm">'+esc(head0(entry,idx))+'</p>',"drape");
      return;
    }
    if(!cur){
      /* Surfaced the instant the day is actually complete, rather than a
         button you have to remember to go find in Coach afterwards \u2014 that
         is the honest version of "automatic": the browser will not allow a
         truly silent clipboard write without a tap, but nothing about
         finding this button or building the text requires one now. */
      out+=card('<div class="eyebrow drape">Do this now</div><p class="lbl">Today is done — all '+wb0.length+' blocks.</p>'+
        '<p class="muted sm">Stop here. More today borrows from tomorrow.</p>',"drape");
      return;
    }
    /* Simple calendar reminders: one reminder at the start of each scheduled
       study entry, one reminder per scheduled block. */
    out+=card('<div class="row-top"><span class="muted sm">Schedule reminders</span></div>'+
      '<p class="muted sm">Add a reminder for each study block in today\'s schedule.</p>'+
      '<div class="btnrow"><button class="btn sm" id="scheduleReminders">Add schedule reminders</button></div>'+
      '<p class="muted sm" id="scheduleReminderMsg"></p>');
    /* The 5 diagnostic cards (reliability, calibration, mastery, retention,
       stop-signal) that used to render here moved to Coach in the 11-tab
       restructure: they are advisory/coaching content, not the action this
       screen exists for, and Coach already had appropriate context around
       them ("Your AI learning profile"). See renderAI(). */
    var half=doneOf(cur)===0.5;
    var sk0=streakDays();
    out+=card('<div class="row-top"><span class="eyebrow drape">Do this now</span>'+
      '<span class="muted sm">'+doneCount+' of '+wb0.length+' done'+
        (sk0.n>1?' \u00b7 '+sk0.n+'-day run':'')+'</span></div>'+
      /* "3 of 9" is a fact you have to do arithmetic on; a bar is a glance.
         The whole-syllabus figure moved into the richer Progress section
         below (velocity, projected finish, per-phase, tap-to-jump) rather
         than staying duplicated here in a plainer form. */
      bar(wb0.length?doneCount/wb0.length*100:0,"var(--drape)",5)+
      '<p class="lbl" style="font-size:22.5px;margin:6px 0 2px">'+esc(cur.label)+'</p>'+
      '<p class="muted sm">'+Math.round(cur.mins)+' min'+(cur.detail?' · '+esc(cur.detail):'')+
        (half?' · half done':'')+'</p>'+
      '<div class="btnrow" style="margin-top:12px">'+
        '<button class="btn solid f1" data-nav="myday" style="min-height:50px;font-size:21px">'+
        (half?"Resume this":"Start this")+'</button></div>'+
      (nxt?'<p class="muted sm" style="margin-top:10px">Next: '+esc(nxt.label)+' · '+Math.round(nxt.mins)+' min</p>':
           '<p class="muted sm" style="margin-top:10px">Last block of the day.</p>')+
      /* A bad day needs a number small enough to actually start. Without one,
         "I cannot do seven hours" turns into doing nothing at all. */
      /* Choice, without pretending it is free: the swap is allowed either way,
         but if it jumps a phase the card says so rather than letting you find
         out later from a diagnostic. */
      '<details style="margin-top:10px"><summary class="muted sm" style="cursor:pointer">Work a different topic \u25be</summary>'+
      (function(){
        var all=swapCandidates(date);
        if(!all.length) return '<p class="muted sm" style="margin-top:8px">Nothing else scheduled to swap with.</p>';
        var q=swapQ.trim().toLowerCase();
        var hits=q? all.filter(function(c){ return SM.CURRICULUM[c.ti].n.toLowerCase().indexOf(q)>=0; }) : all;
        /* Show the nearest few by default; searching reaches the rest. Without
           the search the list was capped at eight, which meant a topic further
           out simply could not be chosen from here at all. */
        var cands=hits.slice(0,q?12:8);
        var curPh=Math.max.apply(null,(plan.byDate[date].slots||[]).map(function(x){return SM.CURRICULUM[x.ti].phase;}).concat([0]));
        return '<p class="muted sm" style="margin-top:8px">Pick a topic you would rather do. Today and that day simply trade places \u2014 nothing is lost.</p>'+
          '<textarea id="swapFind" rows="1" aria-label="Search upcoming topics" placeholder="Search all '+all.length+' upcoming topics\u2026"></textarea>'+
          (q?'<p class="muted sm">'+hits.length+' match'+(hits.length===1?'':'es')+'</p>':'')+
          (hits.length?'':'<p class="muted sm">No topic matches that.</p>')+
          '<div class="btnrow" style="flex-wrap:wrap">'+cands.map(function(c){
            var ph=SM.CURRICULUM[c.ti].phase;
            return '<button class="btn sm" data-swap="'+esc(date)+'|0|'+esc(c.d)+'|'+c.i+'">'+
              esc(SM.CURRICULUM[c.ti].n)+(ph>curPh?' \u2197':'')+'</button>';
          }).join("")+'</div>'+
          (!q&&all.length>8?'<p class="muted sm">Showing the next 8 \u2014 search to reach the other '+(all.length-8)+'.</p>':'')+
          '<p class="muted sm">\u2197 means a later phase \u2014 allowed, but you will meet it before the ground it builds on.</p>'+
          ((state.swaps||[]).length?'<div class="btnrow"><button class="btn sm" data-swapclear="1">Undo all swaps</button></div>':'');
      })()+'</details>'+
      '<details style="margin-top:6px"><summary class="muted sm" style="cursor:pointer">Rough day? \u25be</summary>'+
      '<p class="muted sm" style="margin-top:8px">If today is hard, just do <b>this one thing ('+Math.round(cur.mins)+' min)</b>. Nothing else. '+
      'Half of it still counts. A small day is fine. A skipped day is the one that hurts.</p></details>',"drape");
  })();

  /* My Day is merged into Today: keep only the actionable schedule and
     two-tap MCQ logging. */
  out+=renderTodaySchedule(entry,date,r,P);
  out+=quickMcqCard(entry,date);

  return out;
}

function renderMyDay(){
  /* Compatibility route for old links: Today is now the single home dashboard. */
  tab="today";
  return renderToday();
}

function renderTodaySchedule(entry,date,r,P){
  if(!entry) return "";
  var out='<div class="section-title" style="margin-top:18px">Today\'s schedule</div>';
  if(entry.kind!=="content"){
    var sp=SM.specialDay(entry,P);
    out+=card(sp.blocks.map(function(b,i){
      var cv=(r.checks||{})[i], on=cv===true;
      return '<div class="chk" data-check="'+i+'" data-mins="'+b.mins+'"><div class="box'+(on?" on":"")+'">'+
        (on?"&#10003;":"")+'</div><div class="cf"><div class="lbl">'+esc(b.label)+
        (b.mins?' <span class="muted sm">'+b.mins+' min</span>':'')+'</div>'+
        '<div class="muted sm">'+esc(b.note||"")+'</div></div></div>';
    }).join(""));
    return out;
  }
  var fold=shapeToday(entry,date,P,r), blocks=fold.shaped.blocks||[];
  out+=card('<div class="row-top"><span class="lbl">Your day</span>'+
    '<span class="muted sm">'+(fold.layer==="empathy"?"Empathy":"Normal")+'</span></div>'+
    '<div class="seg sm2 mb">'+[["normal","Normal · "+P.dailyHours.toFixed(2).replace(".00","")+" h"],
      ["empathy","Empathy · "+(P.empathyHours||7.25)+" h"]].map(function(L){
      return '<button class="segb'+(fold.layer===L[0]?" on":"")+'" data-layer="'+L[0]+'">'+L[1]+'</button>';
    }).join("")+'</div>'+
    '<p class="muted sm">Tap a block to open it. Check it off when finished.</p>'+
    timeline(blocks,P,r,date));
  return out;
}

var quickMcqTopic=null;
function quickMcqCard(entry,date){
  var ids=[], seen={};
  if(entry && entry.slots) entry.slots.forEach(function(s){ if(!seen[s.ti]){seen[s.ti]=1;ids.push(s.ti);} });
  if(!ids.length && entry && entry.kind==="content"){
    var shaped=shapeToday(entry,date,plan.P,recFor(date));
    (shaped.shaped.blocks||[]).forEach(function(b){
      (b.items||[]).forEach(function(e){ if(e.item && e.item[0]!=null && !seen[e.item[0]]){seen[e.item[0]]=1;ids.push(e.item[0]);} });
    });
  }
  ids=ids.slice(0,8);
  if(!ids.length) return "";
  if(quickMcqTopic==null || ids.indexOf(quickMcqTopic)<0) quickMcqTopic=ids[0];
  return card('<div class="row-top"><span class="lbl">Log an MCQ</span><span class="muted sm">2 taps</span></div>'+
    '<p class="muted sm">Choose the topic, then tap what happened. No question number or source needed.</p>'+
    '<div class="btnrow" style="flex-wrap:wrap">'+ids.map(function(ti){
      return '<button class="btn sm'+(ti===quickMcqTopic?" solid":"")+'" data-quicktopic="'+ti+'">'+esc(SM.CURRICULUM[ti].n)+'</button>';
    }).join("")+'</div>'+
    '<div class="g3" style="margin-top:10px">'+
      '<button class="pick lg" data-quickresult="right">Right</button>'+
      '<button class="pick lg" data-quickresult="fragile">Fragile</button>'+
      '<button class="pick lg" data-quickresult="wrong">Wrong</button>'+
    '</div>'+
    '<p class="muted sm" id="quickLogMsg"></p>');
}


/* Live time-allocation donut. "Live" matters: it is computed from the actual
   blocks in scope \u2014 today's shaped day, or the whole remaining plan \u2014 so it
   moves when you swap a topic, re-plan, or when adaptive analysis shrinks as
   your accuracy data arrives. Not a static pie of intended proportions.
   Drawn with stroke-dasharray on one circle rather than arc paths: fewer
   moving parts, and no risk of a malformed path on a 0% or 100% slice, which
   is exactly the edge case a fresh install and a finished day produce. */
/* Remaining plan, not the whole campaign \u2014 what is already done cannot be
   reallocated, so including it would answer a question nobody is asking. */
function remainingBlocks(){
  var t=todayISO(), out=[];
  plan.content.forEach(function(c){
    if(c.date<t || !c.blocks) return;
    c.blocks.forEach(function(b){ out.push(b); });
  });
  return out;
}
/* Time and questions per topic. Deliberately NOT a 39-slice pie: at that count
   the slices are thinner than their own borders and the legend becomes the
   real chart, which defeats the point. A ranked proportional bar answers the
   same question ("what is eating the time") and stays readable, with a
   phase-coloured donut above it for the coarse split.
   Shows minutes AND question count together because they diverge \u2014 a topic
   can be heavy on lecture time and light on questions, and knowing which is
   the difference between "this is a lot of watching" and "this is a lot of
   practice". */
function topicLoadCard(){
  var B=plan.B, topics=(B.topics||[]).slice();
  if(!topics.length) return "";
  var PH_COL=["","var(--sky)","var(--drape)","var(--amber)","var(--rust)",
              "var(--violet)","#57b7f5","#e08bd0"];
  var totalWork=topics.reduce(function(a,t){return a+t.work;},0);
  var totalQ=topics.reduce(function(a,t){return a+t.dtq+t.spq;},0);
  if(totalWork<=0) return "";

  /* phase donut */
  var byPh={};
  topics.forEach(function(t){ byPh[t.phase]=(byPh[t.phase]||0)+t.work; });
  /* Enlarged from a 118px/52-radius/26-stroke ring to 210px/78-radius/38-stroke
     \u2014 the old size was genuinely hard to read at a glance on a phone. Legend
     rows now carry their own thin bar so the split is visible twice: once in
     the ring, once in the list, since a reader may only look at one. */
  var R=78, C=2*Math.PI*R, off=0;
  var arcs=[1,2,3,4,5,6,7].filter(function(ph){return byPh[ph];}).map(function(ph){
    var len=C*(byPh[ph]/totalWork);
    var seg='<circle cx="105" cy="105" r="'+R+'" fill="none" stroke="'+PH_COL[ph]+'" stroke-width="38"'+
      ' stroke-dasharray="'+len.toFixed(2)+' '+(C-len).toFixed(2)+'"'+
      ' stroke-dashoffset="'+(-off).toFixed(2)+'" transform="rotate(-90 105 105)"/>';
    off+=len; return seg;
  }).join("");
  var phLegend=[1,2,3,4,5,6,7].filter(function(ph){return byPh[ph];}).map(function(ph){
    var pctv=Math.round(byPh[ph]/totalWork*100);
    return '<div style="margin-top:7px"><div class="row-top"><span class="sm"><span class="caldot" style="display:inline-block;margin-right:6px;background:'+
      PH_COL[ph]+'"></span>'+ph+'. '+esc((SM.PHASE_NAME[ph]||""))+'</span>'+
      '<span class="muted sm" style="font-weight:700">'+pctv+'%</span></div>'+
      bar(pctv,PH_COL[ph],5)+'</div>';
  }).join("");

  /* per-topic bars, heaviest first */
  topics.sort(function(a,b){ return b.work-a.work; });
  var maxW=topics[0].work;
  var bars=topics.map(function(t){
    var q=t.dtq+t.spq;
    return '<div style="margin-top:7px"><div class="row-top">'+
      '<span class="sm">'+esc(t.n)+'</span>'+
      '<span class="muted sm">'+Math.round(t.work/60)+'h \u00b7 '+q.toLocaleString()+'q</span></div>'+
      bar(t.work/maxW*100, PH_COL[t.phase]||"var(--line2)", 6)+'</div>';
  }).join("");

  return card('<div class="eyebrow" style="font-size:21px">Where the syllabus time goes</div>'+
    '<div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:center">'+
    '<svg viewBox="0 0 210 210" width="190" height="190" aria-label="Time split by phase" style="flex-shrink:0">'+arcs+
    '<text x="105" y="98" text-anchor="middle" style="font-size:32.5px;font-weight:800;fill:var(--bone)">'+Math.round(totalWork/60)+'h</text>'+
    '<text x="105" y="124" text-anchor="middle" style="font-size:18.5px;fill:var(--muted)">total, 3 passes</text></svg>'+
    '<div style="flex:1;min-width:220px">'+phLegend+'</div></div>'+
    '<p class="muted sm">'+topics.length+' topics \u00b7 '+totalQ.toLocaleString()+' questions \u00b7 '+
      Math.round(totalWork/60)+'h across all three passes.</p>'+
    '<details style="margin-top:8px"><summary class="muted sm" style="cursor:pointer">Every topic, heaviest first \u25be</summary>'+
    bars+'</details>');
}
function allocDonut(blocks,title,note){
  var by={}, total=0;
  (blocks||[]).forEach(function(b){
    if(["lunch","buffer"].indexOf(b.kind)>=0) return;
    var k = b.kind==="protected" ? "life"
          : (b.kind==="bank"||b.kind==="speed"||b.kind==="image") ? "questions"
          : (b.kind==="repass"||b.kind==="repass3") ? "repeats"
          : (b.kind==="analysis") ? "analysis"
          : (b.kind==="lecture") ? "lectures"
          : "other";
    by[k]=(by[k]||0)+b.mins; total+=b.mins;
  });
  if(total<=0) return "";
  /* Protected gym and wind-down are real time but they are not STUDY time \u2014
     leaving them in the same ring made a 20% slice of "life" compete with the
     thing the chart exists to show. Split out and reported separately, so the
     percentages answer "how is my study time divided" rather than "how is my
     day divided". */
  var lifeMin=by.life||0; delete by.life;
  total-=lifeMin;
  if(total<=0) return "";
  var COL={questions:"var(--sky)",analysis:"var(--drape)",repeats:"var(--amber)",
           lectures:"var(--violet)",life:"var(--line2)",other:"var(--muted)"};
  var order=["questions","analysis","repeats","lectures","other"]
    .filter(function(k){ return by[k]>0; });
  /* Same enlargement as the phase donut: 118px/52-radius/26-stroke was small
     on a phone. Legend rows carry their own bar too, so the split reads even
     if the ring itself is glanced past. */
  var R=78, C=2*Math.PI*R, off=0;
  var arcs=order.map(function(k){
    var frac=by[k]/total, len=C*frac;
    var seg='<circle cx="105" cy="105" r="'+R+'" fill="none" stroke="'+COL[k]+'" stroke-width="38"'+
      ' stroke-dasharray="'+len.toFixed(2)+' '+(C-len).toFixed(2)+'"'+
      ' stroke-dashoffset="'+(-off).toFixed(2)+'" transform="rotate(-90 105 105)"/>';
    off+=len; return seg;
  }).join("");
  var legend=order.map(function(k){
    var pctv=Math.round(by[k]/total*100);
    return '<div style="margin-top:7px"><div class="row-top"><span class="sm" style="text-transform:capitalize"><span class="caldot" style="display:inline-block;margin-right:6px;background:'+
      COL[k]+'"></span>'+k+'</span><span class="muted sm" style="font-weight:700">'+pctv+'% \u00b7 '+
      Math.floor(by[k]/60)+'h '+Math.round(by[k]%60)+'m</span></div>'+
      bar(pctv,COL[k],5)+'</div>';
  }).join("");
  return card('<div class="eyebrow" style="font-size:21px">'+esc(title)+'</div>'+
    '<div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:center">'+
    '<svg viewBox="0 0 210 210" width="190" height="190" aria-label="Time split by activity" style="flex-shrink:0">'+arcs+
    '<text x="105" y="98" text-anchor="middle" style="font-size:32.5px;font-weight:800;fill:var(--bone)">'+Math.floor(total/60)+'h</text>'+
    '<text x="105" y="124" text-anchor="middle" style="font-size:18.5px;fill:var(--muted)">'+Math.round(total%60)+'m</text></svg>'+
    '<div style="flex:1;min-width:220px">'+legend+'</div></div>'+
    (lifeMin>0?'<p class="muted sm">Plus '+Math.floor(lifeMin/60)+'h '+Math.round(lifeMin%60)+'m protected for gym and winding down, which is not study time and is not counted above.</p>':'')+
    (note?'<p class="muted sm">'+esc(note)+'</p>':''));
}
function timeline(blocks,P,r,date){
  var rows=blocks.map(function(b){ return {at:b.start,b:b}; });
  if(P.gym>P.dayStart) rows.push({at:P.gym,p:{l:"Gym",n:"Fixed. Not a reward for finishing."}});
  if(P.dinner>P.dayStart && !P.dinnerFloat)
    rows.push({at:P.dinner,p:{l:"Family dinner",n:"Fixed."}});
  rows.sort(function(a,b){ return a.at-b.at; });
  var out='<div class="tl">';
  rows.forEach(function(row){
    if(row.p){
      out+='<div class="tr dim"><div class="tt">'+SM.hhmm(row.at)+'</div>'+
        '<div class="tb" style="background:var(--line)"></div><div class="tc">'+
        '<div class="prot">'+esc(row.p.l)+' <span class="muted sm">'+esc(row.p.n)+'</span></div></div></div>';
      return;
    }
    var b=row.b, col=KIND_C[b.kind]||"var(--line2)";
    if(b.kind==="lunch"||b.kind==="buffer"){
      out+='<div class="tr dim"><div class="tt">'+SM.hhmm(b.start)+'</div>'+
        '<div class="tb" style="background:var(--line)"></div><div class="tc">'+
        '<div class="prot">'+icon(b.kind)+' '+esc(b.label)+' <span class="muted sm">'+b.mins+' min</span></div></div></div>';
      return;
    }
    /* A folded-in arrears block carries its OWN origin day and block id — its
       completion state lives there, not on today's record, so it has to be
       looked up and written back separately or ticking it here would silently
       create a phantom entry under today instead of clearing the actual debt. */
    var srcDate=b.foldedFrom||date, srcKey=b.foldedFrom?b.foldedBlockId:b.i;
    var srcRec=b.foldedFrom?(state.days[srcDate]||{}):r;
    var cv=(srcRec.checks||{})[srcKey], on=(cv===true), half=(cv===0.5), exp=(openBlock===b.i);
    if(compact && !exp){
      out+='<div class="tr"><div class="tt">'+SM.hhmm(b.start)+'</div>'+
        '<div class="tb" style="background:'+col+';opacity:'+(on?.35:1)+'"></div>'+
        '<div class="tc"><div class="cmp'+(on?" done":"")+'">'+
        '<div class="box sm2'+(on?" on":"")+(half?" half":"")+'" data-check="'+srcKey+'" data-cdate="'+srcDate+'" data-mins="'+b.mins+
        '" style="'+(on?"background:"+col+";border-color:"+col:(half?"border-color:"+col:""))+'">'+(on?"&#10003;":(half?"&#9680;":""))+'</div>'+
        '<span class="cmpl" data-open="'+b.i+'">'+esc(b.head||b.label)+
        (b.topic?' <span class="muted">&middot; '+esc(clip(b.topic,40))+'</span>':'')+'</span>'+
        '<span class="muted sm">'+b.mins+'m</span></div></div></div>';
      return;
    }
    var inner='<div class="bh"><div class="box'+(on?" on":"")+(half?" half":"")+'" data-check="'+srcKey+'" data-cdate="'+srcDate+'" data-mins="'+b.mins+
      '" style="'+(on?"background:"+col+";border-color:"+col:(half?"border-color:"+col:""))+'">'+(on?"&#10003;":(half?"&#9680;":""))+'</div>'+
      '<div class="bt" data-open="'+b.i+'"><div class="lbl'+(on?" struck":"")+'">'+
      icon(b.kind,col)+' '+esc(b.head||b.label)+(b.foldedFrom?' <span class="amber sm">&middot; carried</span>':'')+'</div>'+
      (b.topic?'<div class="btop" style="color:'+col+'">'+esc(b.topic)+'</div>':'')+
      /* Clock checkpoints every 20 minutes across the block. A block can be an
         hour or more, and "did I start this at the right time" is not the same
         question as "am I still on time thirty minutes in". Shows the wall
         time you should be at each mark, so drift is visible before the block
         ends rather than after. */
      (b.mins>=25 ? '<div class="ticks">'+(function(){
        var out2=[], m=20;
        while(m<b.mins){ out2.push('<span class="tick">'+SM.hhmm((b.start+m)%1440)+'</span>'); m+=20; }
        return out2.join("");
      })()+'</div>' : '')+
      '<div class="meta"><span>'+SM.hhmm(b.start%1440)+'\u2013'+SM.hhmm((b.start+b.mins)%1440)+' \u00b7 '+b.mins+' min</span>'+
      (b.detail?'<span>'+esc(b.detail)+'</span>':"")+
      (b.items&&b.items.length?'<span>'+(b.items.length>1?b.items.length+' items':esc(clip(b.items[0].item[0],64)))+'</span>':"")+
      '</div></div>'+
      '<div class="chev'+(exp?" up":"")+'" data-open="'+b.i+'">&#8250;</div></div>';
    if(exp){
      inner+='<div class="bd">';
      if(b.items && b.items.length){
        var kk={lecture:"l",bank:"b",speed:"s",image:"b",repass:"b"}[b.kind];
        inner+='<div class="eyebrow" style="margin:0 0 7px">Open exactly this</div>'+
          b.items.map(function(e){
            var L=SM.itemLine(e,kk);
            /* Lectures get a persistent watched marker of their own. Ticking
               the block marks the day done; this records WHICH of the 679
               lectures have actually been watched, which nothing tracked
               before — so a re-plan or a gap left no way to tell. */
            var lk = b.kind==="lecture" ? (e.item[0]+"|"+e.item[2]) : null;
            var seen = lk && state.lecDone && state.lecDone[lk];
            return '<div class="srcitem"><div class="srcn">'+
              (lk?'<button class="btn sm" data-lec="'+esc(lk)+'" style="margin-right:8px">'+(seen?"&#10003;":"\u25cb")+'</button>':'')+
              esc(L.name)+'</div>'+
              '<div class="srcq" style="color:'+col+'">'+esc(L.qty)+'</div>'+
              '<div class="srcp">'+esc(L.where)+'</div></div>';
          }).join("");
      }
      inner+='<p class="muted sm">'+esc(b.note||"")+'</p>';
      if(["bank","speed","image","repass"].indexOf(b.kind)>=0){
        var running=timer&&timer.blockId===date+"#"+b.i;
        var el=running?timerElapsed():0;
        inner+='<div class="timer"><span class="tclock">'+
          String(Math.floor(el/60)).padStart(2,"0")+':'+String(el%60).padStart(2,"0")+'</span>'+
          '<button class="btn sm" data-timer="'+b.i+'">'+(running&&timer.running?"Pause":running?"Resume":"Start")+'</button>'+
          (running?'<button class="btn sm solid" data-timerstop="'+b.i+'" data-ti="'+(b.ti==null?"":b.ti)+'">Log &amp; stop</button>':"")+
          '</div>';
        if(b.ti!=null){
          var pc2=paceFor(b.ti), tgt=SM.paceTarget(styleNow(date));
          if(pc2.q>0){
            var per=Math.round(pc2.sec/pc2.q);
            inner+='<div class="muted sm">Your pace on this topic: <b class="'+(per>tgt*1.15?"rust":per<=tgt?"drape":"amber")+
              '">'+per+' s a question</b> against '+tgt+' s allowed in '+styleNow(date).label+'.</div>';
          }
        }
      }
      if(b.kind==="bank"||b.kind==="speed"||b.kind==="image"||b.kind==="repass"){
        var src=(b.kind==="speed")?"speed":"bank";
        var af=(b.kind==="speed")?"sa":"ba", cf=(b.kind==="speed")?"sc":"bc";
        var sc=b.ti!=null?scoreFor(b.ti):null;
        inner+='<div class="scorebox"><div class="row-top"><span class="muted sm">attempted</span>'+
          '<span class="btnrow">'+[10,25,-10].map(function(n){
            return '<button class="btn sm" data-bump="'+src+'" data-n="'+n+'" data-ti="'+
              (b.ti==null?"":b.ti)+'" data-f="'+af+'">'+(n>0?"+":"")+n+'</button>'; }).join("")+
          '<span class="num">'+(sc?sc[af]:(r[src]||0))+'</span></span></div>';
        if(sc) inner+='<div class="row-top"><span class="muted sm">correct</span>'+
          '<span class="btnrow">'+[10,25,-10].map(function(n){
            return '<button class="btn sm" data-score="'+b.ti+'" data-f="'+cf+'" data-n="'+n+'">'+
              (n>0?"+":"")+n+'</button>'; }).join("")+
          '<span class="num" style="color:'+accColour(sc[af]?sc[cf]/sc[af]:null)+'">'+sc[cf]+'</span></span></div>'+
          (sc[af]>=10?'<div class="muted sm">'+Math.round(sc[cf]/sc[af]*100)+'% on this topic'+
            (b.kind==="speed"?" under a clock":"")+'</div>':'');
        inner+='</div>';
        if(b.kind==="speed") inner+='<p class="muted sm">Target pace '+SM.paceTarget(styleNow(date))+
          ' s a question — that is what '+styleNow(date).label+' allows.</p>';
      }
      if(b.kind==="analysis"&&b.ti!=null){
        var tl=tallyFor(b.ti);
        inner+='<div class="eyebrow" style="margin:10px 0 6px">Tally the misses — one tap each</div>'+
          '<div class="g2">'+SM.ERR_TYPES.map(function(e){
            return '<button class="pick tal" data-tally="'+b.ti+'" data-k="'+e[0]+'">'+e[1]+
              '<span class="tn">'+(tl[e[0]]||0)+'</span></button>'; }).join("")+'</div>'+
          '<div class="btnrow"><button class="btn sm" data-nav="log">Write up a certain-and-wrong one</button>'+
          '<button class="btn sm" data-untally="'+b.ti+'">Undo</button></div>';
      }
      inner+='</div>';
    }
    out+='<div class="tr"><div class="tt">'+SM.hhmm(b.start)+'</div>'+
      '<div class="tb" style="background:'+col+';opacity:'+(on?.35:1)+'"></div>'+
      '<div class="tc"><div class="blk'+(on?" done":"")+(exp?" exp":"")+'">'+inner+'</div></div></div>';
  });
  return out+'</div>';
}

function attemptCard(st){
  var r=SM.attemptRule(state.calib,st);
  var names={3:"&#128994; Certain",2:"&#128993; Unsure",1:"&#128308; Guessed"};
  return card('<div class="eyebrow amber">'+st.label+' attempt rule</div>'+
    '<p class="muted sm">Penalty is '+(st.penalty===0.25?"a quarter":"a third")+
    ' of a mark, so a blind guess is worth <b>'+(SM.blindEV(st)>0.001?"+"+SM.blindEV(st).toFixed(2)+" — attempt everything":"exactly zero — a blank costs nothing")+
    '</b>. Break even at '+Math.round(SM.breakEven(st)*100)+'% accuracy.</p>'+
    r.levels.map(function(l){
      return '<div class="row-top"><span class="sm">'+names[l.conf]+'</span><span class="sm '+
        (l.verdict==="attempt"?"drape":l.verdict==="skip"?"rust":"muted")+'">'+
        (l.p===null?"no data yet":Math.round(l.p*100)+"% right &rarr; "+l.verdict)+'</span></div>'; }).join(""),"amber");
}



/* ===== UI MODULE 3: ui-practice-progress.part.js ===== */
/* ---------- REVISE ---------- */
/* ---------- HIGH-YIELD NOTEBOOK ----------
   The app has always stored WHERE a question lives and never what you learned
   from it. That is the gap this fills, and it is the tool topper accounts cite
   most: one line, in your own words, captured at the moment the explanation
   made sense. Notes carry a topic so the revision book can group them, and a
   flag for whether they are a fact worth keeping or a trap to re-check. */
function addNote(topicId, text, kind, src){
  state.notes=state.notes||[];
  state.notes.unshift({ id:Math.random().toString(36).slice(2,9), t:Date.now(), d:todayISO(),
    topicId:topicId, text:String(text||"").trim(), kind:kind||"fact", src:src||"" });
  if(state.notes.length>1200) state.notes.length=1200;
}
/* The revision book is assembled, not written twice: your notes plus the items
   the app already knows are fragile — questions wrong on more than one pass,
   questions that got worse, and confident-wrong misses. Nothing here is a
   second copy of data entered elsewhere. */
function revisionItems(filterPhase){
  var out=[];
  (state.notes||[]).forEach(function(n){
    out.push({ kind:n.kind==="trap"?"Trap":"High-yield", topicId:n.topicId, text:n.text,
      when:n.d, tone:n.kind==="trap"?"amber":"drape", id:n.id, note:true });
  });
  Object.keys(state.mcq||{}).forEach(function(k){
    var q=state.mcq[k];
    var wrong=q.attempts.filter(function(a){return a.outcome==="wrong";}).length;
    var regressed=false;
    for(var i=1;i<q.attempts.length;i++)
      if(q.attempts[i-1].outcome!=="wrong" && q.attempts[i].outcome==="wrong") regressed=true;
    if(wrong>=2) out.push({ kind:"Wrong "+wrong+"\u00d7", topicId:q.topicId,
      text:q.app+" \u203a "+(q.subtopic||"")+" \u203a Q"+q.number, tone:"rust",
      when:q.attempts[q.attempts.length-1].d });
    else if(regressed) out.push({ kind:"Got worse", topicId:q.topicId,
      text:q.app+" \u203a "+(q.subtopic||"")+" \u203a Q"+q.number, tone:"amber",
      when:q.attempts[q.attempts.length-1].d });
  });
  (state.misses||[]).filter(function(m){return m.hcw&&!m.done;}).forEach(function(m){
    out.push({ kind:"Confident \u2014 wrong", topicId:m.topicId, text:m.stem||m.path||"", tone:"rust",
      when:SM.iso(new Date(m.t)) });
  });
  if(filterPhase) out=out.filter(function(x){
    return x.topicId!=null && SM.CURRICULUM[x.topicId] && SM.CURRICULUM[x.topicId].phase===filterPhase; });
  return out;
}
/* Two tabs, not four. Log and Redo were always the same activity — doing
   questions — split across two screens, so you logged an answer here and
   found its consequence over there. They are one screen now, ordered the way
   the work happens: what is due to come back first, then recording new ones,
   then the diary and the revision book beneath.
   Plan merged into Today for the same reason: the schedule is context for the
   day, not a place to visit. */
function renderPractice(){
  if(practiceMode==="log") return renderLog();
  if(practiceMode==="revise") return renderRevise();
  var dq=SM.dueQueue(state.misses,Date.now(),60), rs=SM.repairSets(state.scores,state.repairs,Date.now(),capDays(),4);
  var out='<div class="sm-simple-intro"><div class="sm-simple-kicker">Practice</div><div class="sm-simple-title">Retrieve. Log. Repair.</div><div class="sm-simple-copy">One home for question work. Log the question immediately after you answer it; the app turns that record into revision and adaptive priorities.</div>'+
    '<div class="sm-simple-actions">'+
    '<button class="sm-simple-action" data-practice="log"><span class="simple-icon">'+smV21Icon('target')+'</span><span><b>Log a question</b><small>Right, fragile or wrong</small></span></button>'+
    '<button class="sm-simple-action" data-practice="revise"><span class="simple-icon">'+smV21Icon('loop')+'</span><span><b>Revise due work</b><small>'+(dq.total?dq.total+' item'+(dq.total===1?'':'s')+' due':'Nothing due')+'</small></span></button>'+
    '<button class="sm-simple-action" data-go-tab="study"><span class="simple-icon">'+smV21Icon('book')+'</span><span><b>Return to Learn</b><small>Source material</small></span></button>'+
    '</div></div>';
  out+=card('<div class="row-top"><span class="eyebrow drape">Your practice signal</span><span class="muted sm">Updates from every logged question</span></div>'+
    '<div class="g3"><div><div class="big2">'+Object.keys(state.mcq||{}).length+'</div><div class="muted sm">questions logged</div></div>'+
    '<div><div class="big2">'+(dq.total||0)+'</div><div class="muted sm">due to retrieve</div></div>'+
    '<div><div class="big2">'+(rs.total||0)+'</div><div class="muted sm">repair sets</div></div></div>');
  out+=aiStrip('revise');
  out+=card('<div class="eyebrow">What gets recorded</div><p class="sm">For each question: source + topic + subtopic + number, then <b>Right</b>, <b>Fragile</b> or <b>Wrong</b>. Wrong answers ask why; confident answers can trigger a quick retest. This is the evidence the adaptive engine uses.</p>', 'drape');
  return out;
}
function renderRevise(){
  var now=Date.now(), dq=SM.dueQueue(state.misses,now,60), q=dq.queue, m=q[0];
  var rs=SM.repairSets(state.scores,state.repairs,now,capDays(),4);
  /* The task first, the evidence after. Revise used to open on charts —
     useful, but not what you came here to do. */
  var due=dq.total, sets=rs.total;
  var out="";
  if(due||sets){
    out+=card('<div class="row-top"><span class="eyebrow rust">Ready to redo</span>'+
      '<span class="muted sm">'+(due?due+' item'+(due===1?"":"s"):"")+
      (due&&sets?' \u00b7 ':'')+(sets?sets+' repair set'+(sets===1?"":"s"):"")+'</span></div>'+
      '<p class="lbl" style="font-size:22.5px;margin:6px 0 2px">'+
        (due?'Retrieve '+due+' item'+(due===1?"":"s"):'Work '+sets+' repair set'+(sets===1?"":"s"))+'</p>'+
      '<p class="muted sm">Cover the answer. Say it out loud. Then say how it went.</p>'+
      '<div class="btnrow" style="margin-top:12px"><button class="btn solid f1" data-nav="log" '+
      'style="min-height:50px;font-size:21px">Start</button></div>',"rust");
  } else {
    out+=card('<div class="eyebrow drape">Nothing due</div>'+
      '<p class="muted sm">Review queue is clear. Items appear here as you log wrong answers.</p>',"drape");
  }
  out+=aiStrip("revise");
  /* SIMPLIFICATION (6.4.0): Practice used to open with three sibling
     disclosures — Calendar & time split, The work (open, and very long), and
     Practice questions — with the actual logging UI rendered last, below all
     of it. The one thing you come to this screen to do every day was the one
     thing you had to scroll past everything else to reach.
     Since 8.0.0 the log is its own tab rather than an in-page section, so
     this screen is the due queue and the repair/discrimination work, with ONE
     collapsed group for reference material. Nothing was deleted. */
  /* Log is a top-level tab — renderLog() is dispatched directly for
     tab==="log". The "Start" button above and the hero actions in
     renderPractice() use data-nav="log" rather than an in-page anchor. */
  out+='<details class="coachMore"><summary class="eyebrow" style="cursor:pointer">More detail \u25be</summary>';
  out+=monthCal(activeDate());
  out+=allocDonut(remainingBlocks(),"Time left, by activity","");
  out+=syllabusStateCard();
  out+=calibrationCard();
  out+=retestEffectCard();
  out+=sleepCalibCard();
  out+='<div class="eyebrow">Topics to redo</div>';
  if(!rs.sets.length){
    out+=card('<p class="muted sm">Nothing due. Repair sets appear once a topic has at least ten scored questions and five wrong ones — and never inside '+
      SM.REPAIR_MIN_GAP+' days of the last repair, because below that you recognise the answer rather than the reasoning.</p>');
  } else {
    out+=card('<p class="muted sm mb">Open DocTutorials, filter to <b>previously incorrect</b>, and take these mixed together rather than one topic at a time. Say why an option is right before you reveal it.</p>'+
      rs.sets.map(function(x){
        return '<div class="rs"><div class="row-top"><span class="lbl">'+esc(x.t.n)+'</span>'+
          '<span class="pillq">'+x.take+' q</span></div>'+
          '<div class="accline">'+bar(x.acc*100,accColour(x.acc),5)+'</div>'+
          '<div class="muted sm">'+Math.round(x.acc*100)+'% correct &middot; '+x.wrong+' wrong available'+
          (x.sinceDays!=null?" &middot; "+x.sinceDays+"d since last":" &middot; first repair")+
          ' &middot; next in '+x.interval+'d</div>'+
          '<div class="btnrow"><button class="btn sm solid" data-repair="'+x.ti+'">Done</button></div></div>';
      }).join("")+(rs.total>rs.sets.length?'<p class="muted sm">'+(rs.total-rs.sets.length)+' more due — these four first.</p>':''));
  }

  var pairs=SM.confusionPairs(state.tallies);
  if(pairs.length){
    out+='<div class="eyebrow violet">Discrimination drills</div>';
    out+=card(pairs.map(function(p){
      return '<div class="rs"><div class="lbl">'+esc(p[0].t.n)+' &nbsp;vs&nbsp; '+esc(p[1].t.n)+'</div>'+
        '<div class="muted sm">You have tallied "mixed it up" '+(p[0].n+p[1].n)+
        ' times across these two. Take one set spanning both rather than revising each separately — telling look-alikes apart is a different skill from knowing either.</div></div>';
    }).join(""),"violet");
  }

  out+='<div class="eyebrow rust">You were sure but wrong</div>';
  if(!state.misses.length){
    out+=card('<p class="muted sm">Nothing written up. This list is only for answers you were <b>certain</b> about and got wrong — those are real misconceptions and they survive into the exam. Everything else is handled by the repair sets above, with no typing.</p>');
    return out+revisionBook();
  }
  if(!m){
    out+=card('<p class="muted sm">'+state.misses.filter(function(x){return !x.done;}).length+
      ' in rotation, none due right now. An item retires after '+SM.CRITERION+
      ' correct recalls on '+SM.CRITERION+' separate days.</p>');
    return out+revisionBook();
  }
  var t=SM.CURRICULUM[m.topicId], shown=(reviewShown===m.id);
  /* Was coloured by legacy track (A-D), a grouping retired when phases became
     the organising structure everywhere else. A colour tied to a category
     nothing else in the app shows was decoration, not information. */
  out+=card('<div class="tagrow"><span class="tag">'+esc(t?t.n:"\u2014")+'</span>'+
    (m.loop?'<span class="pill amberbg">RETRIEVE TODAY</span>':"")+
    '<span class="muted sm">'+(m.sessions||0)+' / '+SM.CRITERION+' sessions</span></div>'+
    '<div class="stem">'+esc(m.stem)+'</div>'+
    (m.shot?'<img class="shotfull" data-shot="'+m.id+'" alt="the question you saved">':'')+
    (!shown?'<div class="btnrow"><button class="btn solid f1" data-show="'+m.id+'">Show the answer</button></div>'
      :'<div class="ans"><div class="eyebrow drape">Right answer</div><div class="lbl mb">'+esc(m.right)+'</div>'+
       '<div class="eyebrow">Why</div><p class="muted sm">'+esc(m.why)+'</p>'+
       (m.chose?'<div class="eyebrow rust">You chose</div><p class="muted sm">'+esc(m.chose)+'</p>':'')+
       (m.path?'<p class="muted sm">'+esc(m.path)+'</p>':'')+
       (m.mcqKey && state.mcq[m.mcqKey] ? revisePassHistory(state.mcq[m.mcqKey]) : '')+'</div>'+
       '<div class="g2">'+
       '<button class="btn warn" data-grade="again">Missed again</button>'+
       '<button class="btn" data-grade="almost">Almost</button>'+
       '<button class="btn" data-grade="got">Got it</button>'+
       '<button class="btn solid" data-grade="easy">Easy</button></div>'),
    m.loop?"rust":null);
  if(dq.total>1) out+='<p class="muted sm">'+(dq.total-1)+' more after this one.</p>';
  /* Progress folded in here rather than living as its own tab: "how am I
     doing" was being answered in two places, and Revise already opened with
     the syllabus-state charts. Now the review queue and the evidence for why
     it looks like that sit on one page, in that order. */
  /* Progress is evidence you consult, not the daily task — Revise should open
     on what to review, with the nine analytics cards one tap away. */
  out+='</details>';
  out+=revisionBook();
  /* Legacy viva rendering is retained only for safe migration compatibility.
     rather than a collapsed section here. Progress now has its own primary
     destination too. */
  return out;
}

/* The final revision book: notes you wrote plus everything the app already
   knows is fragile, in one place. Deliberately assembled rather than authored
   \u2014 nothing here is typed twice. It rises to the top of Revise inside the
   last 45 days, because at that point it IS the revision. */
function revisionBook(){
  var items=revisionItems(rbPhase||0);
  var all=revisionItems(0);
  var nx=SM.nextExam(state.prefs,todayISO());
  var dte=nx?SM.daysBetween(todayISO(),nx.iso):999;
  var head='<div class="row-top"><span class="eyebrow'+(dte<=45?" rust":"")+'">Your revision book</span>'+
    '<span class="muted sm">'+all.length+' item'+(all.length===1?"":"s")+'</span></div>';
  if(!all.length)
    return card(head+'<p class="muted sm">Empty so far. It fills two ways: notes you save from a topic in Log, and automatically \u2014 any question wrong on two passes, any that got worse, any confident-wrong miss. Nothing needs typing twice.</p>');
  var chips='<div class="btnrow" style="flex-wrap:wrap;margin-top:8px">'+
    [0,1,2,3,4,5,6,7].map(function(ph){
      var n=ph? all.filter(function(x){return x.topicId!=null&&SM.CURRICULUM[x.topicId]&&SM.CURRICULUM[x.topicId].phase===ph;}).length : all.length;
      if(ph&&!n) return "";
      return '<button class="btn sm'+(rbPhase===ph?" solid":"")+'" data-rbphase="'+ph+'">'+
        (ph?ph+". "+esc((SM.PHASE_NAME[ph]||"").split(" ")[0]):"All")+' '+n+'</button>';
    }).join("")+'</div>';
  var body=items.slice(0,40).map(function(x){
    var t=x.topicId!=null?SM.CURRICULUM[x.topicId]:null;
    return '<div class="trow"><div class="row-top"><span class="sm '+x.tone+'">'+esc(x.kind)+'</span>'+
      '<span class="muted sm">'+esc(t?t.n:"")+'</span></div>'+
      '<div class="sm">'+esc(x.text)+'</div>'+
      (x.note?'<div class="btnrow"><button class="btn sm'+(armed===("note:"+x.id)?" solid":"")+'" data-notedel="'+x.id+
        '">'+(armed===("note:"+x.id)?"Tap again to remove":"Remove")+'</button></div>':'')+
      '</div>';
  }).join("");
  return card(head+
    (dte<=45?'<p class="sm rust">'+dte+' days out \u2014 this is the revision now. Work it before new questions.</p>':'')+
    chips+body+
    (items.length>40?'<p class="muted sm">Showing 40 of '+items.length+'. Filter by phase to narrow.</p>':'')+
    (!items.length?'<p class="muted sm">Nothing in this phase yet.</p>':''),
    dte<=45?"rust":null);
}

/* ---------- LOG ---------- */
/* The per-MCQ logger. Right is one tap and writes straight to state.scores —
   the counters every accuracy figure in Coach and Progress reads from, and
   which nothing anywhere else in this app ever wrote to. Wrong opens three
   quick fields instead of the full write-up form: confidence and error type
   (both feed Coach's pattern detection and the spaced-repetition schedule),
   and a path field so the question can be found again without a fresh search
   through the source app. */
var qlog={ti:null,app:"DocTutorials",pool:"bank",subtopic:"",number:"",stage:null,conf:null,errType:null,chose:"",retest:""};
function qlogReset(){ qlog={ti:null,app:"DocTutorials",pool:"bank",subtopic:"",number:"",stage:null,conf:null,errType:null,chose:"",retest:""}; }
var qAnalyse=null;
var searchQ="";
var swapOpen=null, armed=null;
var swapQ="";
var noteDraft="";
var rbPhase=0;
/* Purely-numeric question numbers auto-advance after each log, since a real
   session works through a subtopic in order \u2014 the common case becomes "glance,
   tap Right," not "type the number again for every question." Anything else
   (a number with a letter suffix, blank) is left for the person to edit. */
/* Where you had reached in each subtopic, remembered across sessions. Without
   this the number auto-advances within a sitting but resets the moment you
   switch subtopic or come back tomorrow — and re-typing it every time is
   exactly the friction that stops people logging at all. */
/* ---------- RETIREMENT ----------
   Vaughn, Dunlosky & Rawson (2016, Memory & Cognition): the benefit of a
   higher initial learning criterion does not persist once relearning occurs,
   even after a month — continuing to drill a question already answered
   correctly twice on separate days adds little. This is implemented at the
   LOGGING level, not inside the scheduler: buildPlan() still allocates three
   fixed passes by count, exactly as before, because rewriting question
   identities into the count-based allocator is the same class of change that
   twice lost questions earlier in this project. What changes is what you are
   told while working through a repeat pass \u2014 skip a mastered one, spend the
   time on one that is not. The schedule's arithmetic is unaffected either way,
   since it was never a promise about any specific question, only a count. */
function isMastered(app,ti,subtopic,number){
  var key=SM.mcqKey(app,ti,subtopic,number);
  var q=(state.mcq||{})[key];
  if(!q||q.attempts.length<2) return false;
  var days={}, right=0;
  q.attempts.forEach(function(a){ if(a.outcome!=="wrong"){ right++; days[a.d]=1; } });
  return right>=2 && Object.keys(days).length>=2;
}
function subKey(app,ti,sub){ return (app||"")+"|"+ti+"|"+String(sub||"").trim().toLowerCase(); }
function rememberCursor(){
  if(!qlog.subtopic.trim()||!/^\d+$/.test(qlog.number)) return;
  state.cursors=state.cursors||{};
  state.cursors[subKey(qlog.app,qlog.ti,qlog.subtopic)]=qlog.number;
  /* Also remember WHICH subtopic this topic was last worked on, so reopening
     it tomorrow does not start with an empty field. The number cursor already
     did this; the subtopic did not, and it was the last typing left. */
  state.cursors["last|"+qlog.app+"|"+qlog.ti]=qlog.subtopic.trim();
}
function lastSubtopic(app,ti){ return (state.cursors||{})["last|"+app+"|"+ti]||""; }
function recallCursor(){
  if(!state.cursors||!qlog.subtopic.trim()) return null;
  return state.cursors[subKey(qlog.app,qlog.ti,qlog.subtopic)]||null;
}
function qlogAdvance(){
  if(/^\d+$/.test(qlog.number)) qlog.number=String(Number(qlog.number)+1);
  rememberCursor();
  qlog.stage=null; qlog.conf=null; qlog.errType=null; qlog.chose=""; qlog.retest="";
}
/* The point of a per-question ledger over an aggregate tally: THIS exact
   question keeps coming back wrong is a different, more actionable fact than
   the topic overall is weak. Repeat misses and regressions (right once, wrong
   later \u2014 a worse signal than a plain miss, since it means something that
   looked learned was not) are the two findings an aggregate cannot produce. */
/* Shared by the initial render and the live oninput update below, so typing
   a number updates the pass badge immediately \u2014 without this, someone who
   edits the number and taps Right straight away would commit before ever
   seeing which pass they were actually on, which defeats the point of
   showing it at all. */
/* navigator.clipboard needs a secure context and can be absent in an embedded
   webview; the hidden-textarea + execCommand path covers everywhere else. */
function copyText(text,cb,errCb){
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(cb).catch(function(){ legacyCopy(text,cb,errCb); });
  } else legacyCopy(text,cb,errCb);
}
function legacyCopy(text,cb,errCb){
  var ok=false;
  try{
    var ta=document.createElement("textarea");
    ta.value=text; ta.setAttribute("readonly","");
    ta.style.position="fixed"; ta.style.opacity="0"; ta.style.top="0";
    document.body.appendChild(ta); ta.focus(); ta.select();
    ok=document.execCommand("copy");
    document.body.removeChild(ta);
  }catch(e){ ok=false; }
  if(ok){ if(cb) cb(); } else if(errCb) errCb();
}
function passBadgeHTML(ti){
  if(!qlog.number.trim()) return "";
  var key=SM.mcqKey(qlog.app,ti,qlog.subtopic,qlog.number);
  var prior=state.mcq[key];
  var passN=prior?prior.attempts.length+1:1;
  var lastAtt=prior?prior.attempts[prior.attempts.length-1]:null;
  if(isMastered(qlog.app,ti,qlog.subtopic,qlog.number))
    return '<div class="row-top mb"><span class="tag" style="background:var(--ink);padding:4px 10px;border-radius:20px;color:var(--drape)">Mastered</span>'+
      '<span class="muted sm">right twice, on different days \u2014 redoing this one adds little</span></div>'+
      '<div class="btnrow" style="margin-top:-4px;margin-bottom:10px"><button class="btn sm" id="qSkipMastered">Skip to next number</button></div>';
  return '<div class="row-top mb"><span class="tag" style="background:var(--ink);padding:4px 10px;border-radius:20px;color:var(--sky)">Pass '+passN+'</span>'+
    (prior?'<span class="muted sm">last time: '+esc(lastAtt.outcome)+(lastAtt.reason?" \u2014 "+esc(reasonLabel(lastAtt.reason)):"")+'</span>'
      :'<span class="muted sm">new question</span>')+'</div>';
}
function reasonLabel(r){
  var e=SM.ERR_TYPES.find(function(x){return x[0]===r;});
  if(e) return e[1];
  var g=SM.RIGHT_TYPES.find(function(x){return x[0]===r;});
  return g?g[1]:r;
}
/* The ledger's full history for this exact question, shown right where the
   review happens \u2014 including whatever Revise itself has already added, so a
   question that keeps failing retrieval shows that pattern here, not only in
   the topic analysis screen. */
function revisePassHistory(q){
  var rows=q.attempts.map(function(a,i){
    var icon = a.outcome==="wrong" ? "&#10005;" : (a.outcome==="fragile" ? "&#9680;" : "&#10003;");
    return '<span class="sm" style="margin-right:10px">P'+(i+1)+' '+icon+'</span>';
  }).join("");
  var last=q.attempts[q.attempts.length-1];
  var wrongN=q.attempts.filter(function(a){return a.outcome==="wrong";}).length;
  return '<div class="eyebrow" style="margin-top:10px">Pass history for this question</div>'+
    '<div class="row-top">'+rows+'</div>'+
    (wrongN>=2?'<p class="muted sm rust">Wrong '+wrongN+' times across passes. '+esc(SM.REMEDY[last.reason]||"")+'</p>'
      :(last.reason?'<p class="muted sm">'+esc(SM.REMEDY[last.reason]||reasonLabel(last.reason))+'</p>':''));
}
/* One screen answering "where does the whole syllabus actually stand" \u2014 not
   per topic, across all of it. Lives at the top of Revise because that is
   where a review session naturally starts, and because the ledger data this
   draws from only exists once questions have actually been logged through it. */
/* Confidence is the variable hypercorrection research turns on \u2014 whether an
   error gets fixed for good depends on how sure you were, not just whether you
   were right. This makes that visible: accuracy at each confidence level, from
   data already collected on every single logged answer. No new input, no new
   collection \u2014 state.calib has held this since the confidence prompt was
   built, it was just never shown back. */
function calibrationCard(){
  var c=state.calib||[];
  if(c.length<15) return "";
  var levels=[[3,"Certain"],[2,"Unsure"],[1,"Guessed"]];
  var rows=levels.map(function(L){
    var xs=c.filter(function(x){return x.c===L[0];});
    var right=xs.filter(function(x){return x.ok;}).length;
    return {label:L[1], n:xs.length, acc:xs.length?right/xs.length:0};
  }).filter(function(r){return r.n>=3;});
  if(rows.length<2) return "";
  var certain=rows.filter(function(r){return r.label==="Certain";})[0];
  var overconf = certain && certain.acc<0.75;
  return card('<div class="eyebrow">Is your confidence accurate?</div>'+
    svgBars(rows.map(function(r){ return {label:r.label, v:Math.round(r.acc*100), text:Math.round(r.acc*100)+"% of "+r.n}; }))+
    (overconf?'<p class="sm amber">When you say Certain, you are right '+Math.round(certain.acc*100)+'% of the time \u2014 lower than "certain" should mean. '+
      'Sleep-deprived performance and awareness of that performance both drop together in the research on this; a stretch of short nights is worth suspecting before a stretch of bad luck.</p>'
      :'<p class="muted sm">A well-calibrated Certain should sit close to 100%. This is what tells you whether it does.</p>'));
}
/* Whether the immediate re-test (added because high-confidence errors return
   at a delay without one) is actually working for this person specifically,
   not just in the source study. Compares: of confident-wrong questions that
   got a same-session re-test, how many were STILL wrong next time they came
   up, versus confident-wrong questions logged before this feature existed
   (retested === null) or where the re-test was skipped. */
/* The one suggestion from last round that needed building rather than just
   pointing at existing behaviour. Compares "Certain" accuracy on days
   preceded by a night the schedule ran past bedtime versus days that were not
   \u2014 the mechanism this checks is the sleep literature's finding that lost
   sleep impairs both performance and the ability to notice the impairment.
   HONEST LIMIT, stated in the UI as well as here: pastBed is what the
   SCHEDULE predicted for that day, not a measurement of what you actually
   did. The app has no way to know your real bedtime \u2014 swapping a day,
   finishing early, or a bad night unrelated to the schedule are all invisible
   to it. This is a proxy, presented as one, not a verified fact about your
   sleep. */
function priorNightRanLate(dateISO){
  var d=new Date(SM.fromISO(dateISO).getTime()-SM.DAY);
  var entry=plan.byDate[SM.iso(d)];
  return !!(entry && entry.pastBed>0);
}
function sleepCalibCard(){
  var certain=(state.calib||[]).filter(function(x){return x.c===3;});
  if(certain.length<20) return "";
  var afterLate=[], afterNormal=[];
  certain.forEach(function(x){ (priorNightRanLate(x.d)?afterLate:afterNormal).push(x.ok); });
  if(afterLate.length<8 || afterNormal.length<8) return "";
  function rate(arr){ return Math.round(arr.filter(Boolean).length/arr.length*100); }
  var rn=rate(afterNormal), rl=rate(afterLate), gap=rn-rl;
  return card('<div class="eyebrow'+(gap>=15?" amber":"")+'">Confidence after a late night</div>'+
    '<div class="row-top"><span class="sm">Normal night before</span><span class="drape sm">'+rn+'% right when Certain ('+afterNormal.length+')</span></div>'+
    '<div class="row-top"><span class="sm">Schedule ran late the night before</span><span class="'+(gap>=15?"rust":"muted")+' sm">'+rl+'% right when Certain ('+afterLate.length+')</span></div>'+
    (gap>=15?'<p class="sm amber">Certain has been notably less reliable the day after the schedule ran late. Sleep loss impairs both performance and the ability to notice it \u2014 worth suspecting before you suspect a knowledge gap.</p>'
       :'<p class="muted sm">No clear gap between the two yet.</p>')+
    '<p class="muted sm">Based on when the SCHEDULE predicted a late finish, not a measurement of your actual sleep \u2014 the app has no way to know that directly.</p>',
    gap>=15?"amber":null);
}
function retestEffectCard(){

  var withTest=[], withoutTest=[];
  Object.keys(state.mcq||{}).forEach(function(k){
    var q=state.mcq[k], atts=q.attempts;
    for(var i=0;i<atts.length-1;i++){
      var a=atts[i];
      if(a.outcome!=="wrong" || a.conf!==3 || a.retested==null) continue;
      var next=atts[i+1];
      (a.retested?withTest:withoutTest).push(next.outcome!=="wrong");
    }
  });
  if(withTest.length<5 && withoutTest.length<5) return "";
  function rate(arr){ return arr.length? Math.round(arr.filter(Boolean).length/arr.length*100) : null; }
  var rt=rate(withTest), rw=rate(withoutTest);
  return card('<div class="eyebrow">Is the immediate re-test working</div>'+
    '<div class="row-top"><span class="sm">Re-tested on the spot</span><span class="drape sm">'+
      (rt!=null?rt+'% stuck ('+withTest.length+')':'not enough data')+'</span></div>'+
    '<div class="row-top"><span class="sm">Re-test skipped</span><span class="muted sm">'+
      (rw!=null?rw+'% stuck ('+withoutTest.length+')':'not enough data')+'</span></div>'+
    '<p class="muted sm">"Stuck" means it was right the NEXT time that exact question came up. The research this is built on found immediate testing prevents confident errors from resurfacing \u2014 this is whether that holds for your own data specifically.</p>');
}
function syllabusStateCard(){
  var mcqCount=Object.keys(state.mcq||{}).length;
  var series=trajectorySeries();
  var out='<div class="eyebrow">How it is going</div>';
  out+=card('<div class="lbl mb">Actual vs projected</div>'+
    svgLine(series,"actual","projected")+
    '<div class="row-top" style="margin-top:6px">'+
      '<span class="sm" style="color:var(--drape)">\u2014 Actual</span>'+
      '<span class="muted sm">- - Projected (one day per day)</span></div>');
  if(mcqCount===0){
    out+=card('<p class="muted sm">No per-question log yet \u2014 pass-by-pass accuracy and error patterns appear here once you log questions with a subtopic and number. Use \u201cLog an MCQ\u201d under Practice questions below.</p>',"amber");
    return out;
  }
  var byPass={}, errTot={}, topicTrend=[];
  var byTopic={};
  Object.keys(state.mcq).forEach(function(k){
    var q=state.mcq[k];
    (byTopic[q.topicId]=byTopic[q.topicId]||[]).push(q);
    q.attempts.forEach(function(a,i){
      var p=i+1; byPass[p]=byPass[p]||{n:0,right:0};
      byPass[p].n++; if(a.outcome!=="wrong") byPass[p].right++;
      if(a.outcome==="wrong" && a.reason) errTot[a.reason]=(errTot[a.reason]||0)+1;
    });
  });
  out+=card('<div class="lbl mb">Accuracy by pass, across every logged question</div>'+
    svgBars(Object.keys(byPass).sort().map(function(p){
      var b=byPass[p]; return { label:"Pass "+p, v:b.n?b.right/b.n*100:0,
        text:Math.round(b.right/b.n*100)+"% of "+b.n, color:p==="1"?"var(--sky)":p==="2"?"var(--drape)":"var(--amber)" };
    })));
  if(Object.keys(errTot).length)
    out+=card('<div class="lbl mb">Where the wrong answers cluster</div>'+
      svgBars(SM.ERR_TYPES.map(function(e){ return { label:e[1], v:errTot[e[0]]||0, text:String(errTot[e[0]]||0) }; })
        .filter(function(r){return r.v>0;}).sort(function(a,b){return b.v-a.v;})));
  Object.keys(byTopic).forEach(function(ti){
    var qs=byTopic[ti];
    var p1=0,p1r=0,p3=0,p3r=0;
    qs.forEach(function(q){
      if(q.attempts[0]){ p1++; if(q.attempts[0].outcome!=="wrong") p1r++; }
      var last=q.attempts[q.attempts.length-1];
      if(q.attempts.length>1){ p3++; if(last.outcome!=="wrong") p3r++; }
    });
    if(p1>=5) topicTrend.push({ti:+ti, n:qs.length, p1acc:p1?p1r/p1:0, laterAcc:p3?p3r/p3:null});
  });
  if(topicTrend.length){
    topicTrend.sort(function(a,b){ return a.p1acc-b.p1acc; });
    out+=card('<div class="lbl mb">Improving or not, by topic</div>'+
      topicTrend.slice(0,8).map(function(x){
        var t=SM.CURRICULUM[x.ti];
        var delta = x.laterAcc===null?null:Math.round((x.laterAcc-x.p1acc)*100);
        return '<div class="row-top" style="margin-top:6px"><span class="sm">'+esc(t.n)+'</span>'+
          '<span class="muted sm">P1 '+Math.round(x.p1acc*100)+'%'+
          (delta===null?"":' \u2192 later '+Math.round(x.laterAcc*100)+'% ('+(delta>=0?"+":"")+delta+')')+'</span></div>';
      }).join(""));
  }
  return out;
}
function topicAnalysis(ti){
  var qs=Object.keys(state.mcq).map(function(k){return state.mcq[k];}).filter(function(q){return q.topicId===ti;});
  if(!qs.length) return card('<p class="muted sm">No per-question log for this topic yet \u2014 numbers and subtopics have to be entered at least once before pass-over-pass comparison means anything.</p>',"amber");
  var byPass={}, repeats=[], regress=[], wrongReasons={}, rightReasons={};
  qs.forEach(function(q){
    q.attempts.forEach(function(a,i){
      var p=i+1; byPass[p]=byPass[p]||{n:0,right:0};
      byPass[p].n++; if(a.outcome!=="wrong") byPass[p].right++;
      if(a.reason){ if(a.outcome==="wrong") wrongReasons[a.reason]=(wrongReasons[a.reason]||0)+1;
        else rightReasons[a.reason]=(rightReasons[a.reason]||0)+1; }
    });
    var wrongPasses=q.attempts.filter(function(a){return a.outcome==="wrong";}).length;
    if(wrongPasses>=2) repeats.push(q);
    for(var i=1;i<q.attempts.length;i++){
      if(q.attempts[i-1].outcome!=="wrong" && q.attempts[i].outcome==="wrong"){ regress.push(q); break; }
    }
  });
  var passRows=Object.keys(byPass).sort().map(function(p){
    var b=byPass[p]; return '<div class="row-top"><span class="sm">Pass '+p+'</span>'+
      '<span class="muted sm">'+b.right+'/'+b.n+' \u00b7 '+Math.round(b.right/b.n*100)+'%</span></div>'; }).join("");
  var topWrong=Object.keys(wrongReasons).sort(function(a,b){return wrongReasons[b]-wrongReasons[a];})[0];
  var topRight=Object.keys(rightReasons).sort(function(a,b){return rightReasons[b]-rightReasons[a];})[0];
  var guessedRight=rightReasons.guessed||0, totalRight=Object.values(rightReasons).reduce(function(a,b){return a+b;},0)||0;
  var out=card('<div class="eyebrow">Accuracy by pass</div>'+passRows+
    (topWrong?'<p class="muted sm" style="margin-top:8px">Dominant reason for wrong: '+esc(reasonLabel(topWrong))+' ('+wrongReasons[topWrong]+').</p>':'')+
    (topRight&&topRight!=="confident"?'<p class="muted sm">Dominant reason for right: '+esc(reasonLabel(topRight))+' ('+rightReasons[topRight]+').</p>':''),null);
  /* The way to improve, not just the diagnosis \u2014 one line, tied to whichever
     reason actually dominates, reused verbatim from the same map Coach uses so
     the advice never contradicts itself between screens. */
  if(topWrong) out+=card('<div class="eyebrow">Way to improve</div><p class="sm">'+esc(SM.REMEDY[topWrong])+'</p>');
  else if(guessedRight>=3 && totalRight) out+=card('<div class="eyebrow amber">Way to improve</div><p class="sm">'+
    Math.round(guessedRight/totalRight*100)+'% of your correct answers here were guesses. '+esc(SM.REMEDY.guessed)+'</p>',"amber");
  if(repeats.length)
    out+=card('<div class="eyebrow rust">Wrong more than once ('+repeats.length+')</div>'+
      repeats.slice(0,10).map(function(q){
        var last=q.attempts[q.attempts.length-1];
        return '<div class="trow"><div class="row-top"><span class="sm">'+esc(q.app)+' \u203a '+
          esc(q.subtopic||"\u2014")+' \u203a Q'+esc(q.number)+'</span></div>'+
          (last.reason?'<p class="muted sm">'+esc(SM.REMEDY[last.reason]||reasonLabel(last.reason))+'</p>':'')+'</div>'; }).join(""),"rust");
  if(regress.length)
    out+=card('<div class="eyebrow amber">Right once, then wrong ('+regress.length+')</div>'+
      '<p class="muted sm">Worse than a plain miss \u2014 this looked learned and was not.</p>'+
      regress.slice(0,10).map(function(q){
        return '<div class="row-top"><span class="sm">'+esc(q.app)+' \u203a '+
          esc(q.subtopic||"\u2014")+' \u203a Q'+esc(q.number)+'</span></div>'; }).join(""),"amber");
  return out;
}
var diagResults=null;
var backupMsg="";
/* No cloud sync, by an earlier and deliberate decision \u2014 it caused real
   failures on an iPad before. A downloaded file is the honest substitute: it
   survives independently of this app's own storage, and carrying it to a
   second device (AirDrop, iCloud Drive) is a real, if manual, path to the
   same outcome without ever adding a network dependency this app relies on. */
function markBackedUp(){ state.prefs.lastBackupAt=Date.now(); save(); }
function backupReminder(){
  var last=state.prefs.lastBackupAt;
  var days=last?Math.floor((Date.now()-last)/SM.DAY):null;
  /* Counts what would actually be LOST, not a vague "heavy usage" guess: every
     logged question, note and write-up lives in one browser's storage on one
     device. iOS evicts storage from apps left unopened, and clearing website
     data takes it all with no warning and no undo. This is the only failure
     in the app that is catastrophic rather than annoying, so the threshold is
     deliberately impatient: 7 days, not 10, and it appears on Today. */
  var qs=Object.keys(state.mcq||{}).length;
  var notes=(state.notes||[]).length;
  var misses=(state.misses||[]).length;
  var atRisk=qs+notes+misses;
  if(atRisk<8) return "";      /* nothing meaningful to lose yet */
  var what=[]; 
  if(qs) what.push(qs+" logged question"+(qs===1?"":"s"));
  if(notes) what.push(notes+" note"+(notes===1?"":"s"));
  if(misses) what.push(misses+" write-up"+(misses===1?"":"s"));
  var list=what.join(", ");
  if(last===undefined || last===null)
    return card('<div class="eyebrow rust">Not backed up yet</div>'+
      '<p class="sm">'+esc(list)+' exist only on this device. If Safari clears its storage \u2014 which it does on its own \u2014 it is gone with no undo.</p>'+
      '<div class="btnrow"><button class="btn solid f1" data-gobackup="1">Back up now</button></div>',"rust");
  if(days!==null && days>=7)
    return card('<div class="eyebrow amber">'+days+' days since your last backup</div>'+
      '<p class="sm">Everything logged since then exists only on this device.</p>'+
      '<div class="btnrow"><button class="btn f1" data-gobackup="1">Back up now</button></div>',"amber");
  return "";
}

/* Runs the same class of check used to build this app, but against the app
   exactly as it sits right now \u2014 live settings, live data, live date \u2014 by
   calling the real render functions directly and inspecting what they return,
   rather than a separate simulation of them. A future edit to this file that
   breaks something can be caught here without needing an external test
   harness at all. */
function runDiagnostics(){
  var results=[];
  function check(name,fn){
    try{ var r=fn(); results.push({name:name, ok:r===true, detail:r===true?"":String(r)}); }
    catch(e){ results.push({name:name, ok:false, detail:"THREW: "+e.message}); }
  }
  check("Curriculum totals match source (679 lec / 26,969 min / 9,603 bank / 4,126 speed)",function(){
    var L=0,M=0,B=0,S=0; SM.CURRICULUM.forEach(function(t){L+=t.nlec;M+=t.lecmin;B+=t.dtq;S+=t.spq;});
    return (L===679&&M===26969&&B===9603&&S===4126)||(L+"/"+M+"/"+B+"/"+S);
  });
  check("All seven phases present",function(){
    var ph={}; SM.CURRICULUM.forEach(function(t){ph[t.phase]=1;});
    var k=Object.keys(ph).map(Number).sort(function(a,b){return a-b;});
    return k.join(",")==="1,2,3,4,5,6,7"||k.join(",");
  });
  check("Current plan covers every question in three passes",function(){
    /* Reads from blocks, not slots \u2014 a replanned day has no .slots at all
       (it is built directly from repacked blocks), and blocks are the more
       authoritative source for "how many questions are actually scheduled"
       regardless of which path built the day. */
    var a=0,b=0,c=0;
    plan.content.forEach(function(d){ (d.blocks||[]).forEach(function(bl){
      (bl.items||[]).forEach(function(e){
        if(bl.kind==="bank"||bl.kind==="speed"||bl.kind==="image") a+=e.use;
        else if(bl.kind==="repass") b+=e.use;
        else if(bl.kind==="repass3") c+=e.use;
      });
    }); });
    var want=SM.CURRICULUM.reduce(function(x,t){return x+t.dtq+t.spq;},0);
    /* Strict equality when the original build is active (no rounding enters
       the picture there); a small tolerance when a re-plan is \u2014 fractional
       credit on half-done blocks rounds per block, and this should not
       re-litigate what the dedicated re-plan check already verifies. */
    var tol = (state.replan && state.replan.asOf) ? 60 : 0;
    return (Math.abs(a-want)<=tol&&Math.abs(b-want)<=tol&&Math.abs(c-want)<=tol)||(a+"/"+b+"/"+c+" of "+want);
  });
  check("No day in the plan is blockless",function(){
    var bad=plan.content.filter(function(d){return !d.blocks||!d.blocks.length;}).length;
    return bad===0||(bad+" empty day(s)");
  });
  check("ICS export is well-formed",function(){
    var r=SM.buildICS(plan,{detail:"block",alarm:10,from:plan.content[0].date,
      to:plan.content[Math.min(10,plan.content.length-1)].date});
    var lines=r.text.split("\r\n");
    if(lines[0]!=="BEGIN:VCALENDAR") return "missing header";
    if(!r.text.trim().endsWith("END:VCALENDAR")) return "missing footer";
    if(/[^\r]\n/.test(r.text)) return "a bare line feed was found";
    var enc=(typeof TextEncoder!=="undefined")?new TextEncoder():null;
    if(enc){ var long=lines.find(function(l){return enc.encode(l).length>75;}); if(long) return "a line exceeds 75 octets"; }
    return true;
  });
  check("Backup export round-trips your current data",function(){
    var p=SM.exportPayload(state), r=SM.parseBackup(p);
    return (r.ok && r.misses.length===state.misses.length)||"mismatch after round-trip";
  });
  check("Today renders on every day-kind in the plan without error",function(){
    var seen={}, savedCursor=state.cursor, savedOpen=openBlock, bad=[];
    plan.CAL.forEach(function(c){ if(seen[c.kind]) return; seen[c.kind]=1;
      state.cursor=c.date; openBlock=null;
      try{ renderToday(); }catch(e){ bad.push(c.kind+": "+e.message); } });
    state.cursor=savedCursor; openBlock=savedOpen;
    return bad.length===0||bad.join("; ");
  });
  check("No tab shows NaN, undefined, or [object Object] right now",function(){
    var bad=[];
    [["today",renderToday],["practise",renderPractice],["schedule",renderPlan],["settings",renderSettings]].forEach(function(t){
      var h; try{ h=t[1](); }catch(e){ bad.push(t[0]+" threw: "+e.message); return; }
      var stripped=h.replace(/<[^>]*>/g," ");
      var m=stripped.match(/\bNaN\b|\bundefined\b|\[object Object\]/);
      if(m) bad.push(t[0]+": "+m[0]);
    });
    return bad.length===0||bad.join("; ");
  });
  check("Study time never exceeds what the clock allows",function(){
    var u=SM.usableWork(state.prefs);
    return u<=state.prefs.dailyHours*60+1||(u+" min for a "+(state.prefs.dailyHours*60)+"-min setting");
  });
  check("Re-plan would conserve every question, dry run",function(){
    var r=replanFromToday();
    if(!r.ok) return true;    /* nothing left to replan is not a failure */
    var remA=0,remB=0,remC=0;
    r.content.forEach(function(d){ d.blocks.forEach(function(bl){
      (bl.items||[]).forEach(function(e){
        if(bl.kind==="bank"||bl.kind==="speed"||bl.kind==="image") remA+=e.use;
        else if(bl.kind==="repass") remB+=e.use;
        else if(bl.kind==="repass3") remC+=e.use;
      });
    });});
    var doneA=0,doneB=0,doneC=0;
    plan.content.forEach(function(c){
      if(c.date>r.asOf) return;              /* nothing on an unreached day is "done" yet */
      var rr=state.days[c.date], ch=(rr&&rr.checks)||{};
      (c.blocks||[]).forEach(function(b){
        if(["lunch","buffer","protected","recall"].indexOf(b.kind)>=0) return;
        var v=ch[b.i], f=(v===true)?1:(v===0.5?0.5:0);
        if(f<=0||!b.items) return;
        b.items.forEach(function(e){
          var u=e.use*f;
          if(b.kind==="bank"||b.kind==="speed"||b.kind==="image") doneA+=u;
          else if(b.kind==="repass") doneB+=u;
          else if(b.kind==="repass3") doneC+=u;
        });
      });
    });
    var want=SM.CURRICULUM.reduce(function(x,t){return x+t.dtq+t.spq;},0);
    /* Math.round(odd*0.5) always rounds up, so every half-credited block adds
       up to +0.5 of accumulated, benign rounding bias \u2014 confirmed against a
       heavily-fragmented 60-day mixed-completion scenario, which alone
       produced +24. The tolerance reflects that reality rather than chasing
       rounding noise as if it were the 600+ item structural loss the earlier
       version of this check (rightly) caught. */
    var tol=60;
    var okA=Math.abs((remA+doneA)-want)<=tol, okB=Math.abs((remB+doneB)-want)<=tol, okC=Math.abs((remC+doneC)-want)<=tol;
    return (okA&&okB&&okC)||("pass1 "+Math.round(remA+doneA)+" pass2 "+Math.round(remB+doneB)+" pass3 "+Math.round(remC+doneC)+" of "+want);
  });
  check("Re-plan preserves phase order, dry run",function(){
    var r=replanFromToday();
    if(!r.ok) return true;
    /* Phase order is a property of DAYS, not of block sequence within a day.
       Since interleaving deliberately alternates topics inside a day, a
       later-phase block can legitimately precede an earlier-phase one in the
       same day's list. What must never happen is a day whose phases sit
       entirely below a previous day's. */
    var maxPhase=0, bad=[];
    r.content.forEach(function(d){
      var phases=[];
      d.blocks.forEach(function(b){ if(b.ti!=null) phases.push(SM.CURRICULUM[b.ti].phase); });
      if(!phases.length) return;
      var hi=Math.max.apply(null,phases), lo=Math.min.apply(null,phases);
      if(hi<maxPhase) bad.push(d.date+" all phases below "+maxPhase);
      maxPhase=Math.max(maxPhase,lo);
    });
    return bad.length===0||bad.slice(0,3).join(" | ");
  });
  return results;
}

/* Reads what is already stored rather than asking you to write anything twice:
   each wrong attempt in the ledger, plus its reason and any note saved on that
   topic the same day. */
function mistakeDiary(){
  var rows=[];
  Object.keys(state.mcq||{}).forEach(function(k){
    var q=state.mcq[k];
    q.attempts.forEach(function(a){
      if(a.outcome!=="wrong") return;
      rows.push({d:a.d, t:a.t, topicId:q.topicId, app:q.app, sub:q.subtopic,
        num:q.number, reason:a.reason, chose:a.chose, pass:a.pass});
    });
  });
  rows.sort(function(x,y){ return y.t-x.t; });
  if(!rows.length)
    return card('<div class="eyebrow">Mistake diary</div>'+
      '<p class="muted sm">Empty. Every question you mark Wrong appears here with the reason — nothing extra to write.</p>');
  var byDay={};
  rows.slice(0,60).forEach(function(r){ (byDay[r.d]=byDay[r.d]||[]).push(r); });
  var body=Object.keys(byDay).sort().reverse().slice(0,7).map(function(d){
    return '<div class="eyebrow" style="margin-top:10px">'+esc(SM.shortDate(d))+' · '+byDay[d].length+' wrong</div>'+
      byDay[d].map(function(r){
        var t=SM.CURRICULUM[r.topicId];
        return '<div class="trow"><div class="row-top"><span class="sm">'+esc(t?t.n:"")+
          (r.sub?' › '+esc(r.sub):'')+' › Q'+esc(r.num)+'</span>'+
          '<span class="muted sm">pass '+r.pass+'</span></div>'+
          (r.reason?'<div class="muted sm">'+esc(reasonLabel(r.reason))+'</div>':'')+
          (r.chose?'<div class="muted sm">you chose: '+esc(r.chose)+'</div>':'')+'</div>';
      }).join("");
  }).join("");
  return card('<div class="row-top"><span class="eyebrow">Mistake diary</span>'+
    '<span class="muted sm">'+rows.length+' total</span></div>'+body+
    (rows.length>60?'<p class="muted sm">Showing the last 60.</p>':''));
}
function renderLog(){
  var date=activeDate(), entry=plan.byDate[date];
  var sugg=(entry&&!entry.rest&&entry.slots)?entry.slots.map(function(s){return s.ti;}):[];
  var out='<div class="seg">'+[["tally","Log"],["backup","Backup"]].map(function(x){
    return '<button class="segb'+(logMode===x[0]?" on":"")+'" data-lmode="'+x[0]+'">'+x[1]+'</button>'; }).join("")+'</div>';
  if(msg) out+=card('<p class="sm">'+esc(msg)+'</p>',"drape");

  if(logMode==="tally"){
    var list=SM.CURRICULUM.filter(function(t){
      return sugg.indexOf(t.i)>=0 || (state.tallies[t.i]&&Object.keys(state.tallies[t.i]).length)
        || (state.scores[t.i]&&(state.scores[t.i].ba||state.scores[t.i].sa)); });

    var nudgeF=coachFacts();
    if(nudgeF.repeatMisses && nudgeF.repeatMisses.length)
      out+=card('<div class="eyebrow rust">Focus here first</div><p class="sm">'+
        SM.CURRICULUM[nudgeF.repeatMisses[0].topicId].n+' has a question wrong on two separate passes. '+
        'New attempts there are worth more right now than fresh ground elsewhere.</p>',"rust");
    else if(nudgeF.weak.length && nudgeF.weak[0].acc<0.5)
      out+=card('<div class="eyebrow amber">Weakest logged topic</div><p class="sm">'+
        SM.CURRICULUM[nudgeF.weak[0].ti].n+' at '+Math.round(nudgeF.weak[0].acc*100)+'% over '+nudgeF.weak[0].n+' attempts. '+
        'Worth weighting today\u2019s questions toward it.</p>',"amber");
    /* Recently logged topics, most recent first — one tap straight back into
       where you were, instead of scanning a 39-item list every session. The
       cursor already remembers the question number, so this makes resuming a
       single tap rather than a scan plus two fields. */
    var recent=[];
    Object.keys(state.mcq||{}).map(function(k){return state.mcq[k];})
      .forEach(function(qq){
        var last=qq.attempts[qq.attempts.length-1];
        recent.push({ti:qq.topicId,t:last?last.t:0});
      });
    recent.sort(function(a,b){return b.t-a.t;});
    var seenT={}, rlist=[];
    recent.forEach(function(x){ if(!seenT[x.ti]&&rlist.length<4){ seenT[x.ti]=1; rlist.push(x.ti); } });
    if(rlist.length)
      out+=card('<div class="eyebrow">Pick up where you left off</div>'+
        '<div class="btnrow" style="flex-wrap:wrap">'+rlist.map(function(ti){
          return '<button class="btn sm" data-qopen="'+ti+'">'+esc(SM.CURRICULUM[ti].n)+'</button>';
        }).join("")+'</div>');
    out+=card('<p class="muted sm">Every question, every pass \u2014 app, subtopic and number identify it, so the same question is recognised again next pass instead of starting over. Right is one tap; Wrong adds why and stays open on the same question for a second pass later.</p>'+
      '<div class="btnrow"><button class="btn sm f1" data-nav="revise">See analysis across every topic</button></div>'+
      '<div class="btnrow"><button class="btn sm'+(showAll?"":" solid")+'" data-showall="0">Today\u2019s topics</button>'+
      '<button class="btn sm'+(showAll?" solid":"")+'" data-showall="1">All '+SM.CURRICULUM.length+'</button></div>'+
      /* Filters by hiding nodes rather than re-rendering, so the field keeps
         focus and the caret while you type — a re-render on every keystroke
         would drop the cursor after the first letter. Searching always looks
         across all 39, whichever list mode is showing, because that is the
         point of searching. */
      '<div style="margin-top:10px"><textarea id="topicFind" rows="1" aria-label="Search topics, notes and mistakes" placeholder="Search topics, notes, mistakes\u2026"></textarea></div>'+
      '<p class="muted sm" id="findMsg"></p>'+
      /* One box across everything the app actually holds: topic names, the
         notes you wrote, and the fragile items the revision book assembles.
         Each result says where it lives, because a hit you cannot act on is
         not a result. */
      (searchQ.trim()? (function(){
        var q=searchQ.trim().toLowerCase(), hits=[];
        (state.notes||[]).forEach(function(n){
          if(n.text.toLowerCase().indexOf(q)>=0)
            hits.push({where:"Notebook \u00b7 "+(SM.CURRICULUM[n.topicId]||{n:""}).n, text:n.text, tone:n.kind==="trap"?"amber":"drape"});
        });
        revisionItems(0).forEach(function(x){
          if(x.note) return;
          if(String(x.text).toLowerCase().indexOf(q)>=0)
            hits.push({where:"Revision book \u00b7 "+x.kind, text:x.text, tone:x.tone});
        });
        if(!hits.length) return "";
        return '<div class="eyebrow" style="margin-top:10px">Also found</div>'+
          hits.slice(0,8).map(function(h){
            return '<div class="trow"><div class="row-top"><span class="sm '+h.tone+'">'+esc(h.where)+'</span></div>'+
              '<div class="sm">'+esc(h.text)+'</div></div>'; }).join("")+
          (hits.length>8?'<p class="muted sm">'+(hits.length-8)+' more.</p>':'');
      })() : ""));
    (searchQ.trim()
      ? SM.CURRICULUM.filter(function(t){ return t.n.toLowerCase().indexOf(searchQ.trim().toLowerCase())>=0; })
      : (showAll?SM.CURRICULUM:list)).forEach(function(t){
      var sc=state.scores[t.i]||{ba:0,bc:0,sa:0,sc:0};
      var att=sc.ba+sc.sa, acc=att?Math.round((sc.bc+sc.sc)/att*100):null;
      var open=(qlog.ti===t.i);
      var key = open ? SM.mcqKey(qlog.app,t.i,qlog.subtopic,qlog.number) : null;
      var prior = (open && qlog.number.trim()) ? state.mcq[key] : null;
      var passN = prior ? prior.attempts.length+1 : 1;
      var lastAtt = prior ? prior.attempts[prior.attempts.length-1] : null;
      out+=card('<div class="row-top"><span class="lbl">'+esc(t.n)+'</span>'+
          '<span class="muted sm">'+att+' logged'+(acc!==null?" \u00b7 "+acc+"%":"")+'</span></div>'+
        /* Accuracy as a coloured bar, not just a number \u2014 scanning a list of
           39 topics for the weak ones should not require reading every
           percentage. Colour thresholds match accColour() used elsewhere so a
           topic does not look "amber" here and "red" on another screen. */
        (acc!==null? bar(acc, accColour(acc/100), 5) : '')+
        (open?
          '<div class="seg sm2 mb">'+[["DocTutorials","bank"],["Speed","speed"],["Other","bank"]].map(function(p){
            return '<button class="segb'+(qlog.app===p[0]?" on":"")+'" data-qapp="'+p[0]+'" data-qpool="'+p[1]+'">'+p[0]+'</button>'; }).join("")+'</div>'+
          (qlog.app!=="DocTutorials"&&qlog.app!=="Speed"?
            '<textarea id="qAppName" rows="1" placeholder="Which app or source?" style="margin-bottom:10px">'+esc(qlog.app==="Other"?"":qlog.app)+'</textarea>':'')+
          '<div class="g2 mb">'+
            '<textarea id="qSub" rows="1" placeholder="Subtopic, e.g. Achalasia">'+esc(qlog.subtopic)+'</textarea>'+
            '<textarea id="qNum" rows="1" placeholder="Q number, e.g. 17">'+esc(qlog.number)+'</textarea>'+
          '</div>'+
          '<div id="qPassBadge">'+passBadgeHTML(t.i)+'</div>'
          :'')+
        /* Logging happens dozens of times a session, often one-handed with a
           question open in another app. These are the most-tapped controls in
           the whole thing and were the same size as everything else. */
        '<div class="g3">'+
          '<button class="pick lg" data-qlog="'+t.i+'" data-qr="right">Right</button>'+
          '<button class="pick lg" data-qlog="'+t.i+'" data-qr="fragile">Fragile</button>'+
          '<button class="pick lg" data-qlog="'+t.i+'" data-qr="wrong">Wrong</button>'+
        '</div>'+
        /* Real tutoring, not motivation \u2014 the moment you would reach for this
           is right after marking a question Wrong and realising you do not
           actually understand the topic, so it sits directly under the
           three buttons rather than buried somewhere else. */
        (open?'<div class="btnrow" style="margin-top:8px"><button class="btn sm" data-stuck="'+t.i+'">'+
          (coachDraft.stuckCopied?"Copied \u2014 now paste":"I\u2019m stuck on this \u2014 ask Claude")+'</button></div>':'')+
        (open&&qlog.stage==="fragile"?
          '<div class="eyebrow" style="margin-top:12px">How did you get there?</div>'+
          '<div class="g2">'+[["guessed",1],["eliminated",1],["partial",2],["effort",2]].map(function(o){
            var lbl=SM.RIGHT_TYPES.find(function(r){return r[0]===o[0];})[1];
            return '<button class="pick sm2" data-qfrag="'+o[0]+'" data-qc="'+o[1]+'" data-qreason="'+o[0]+'">'+lbl+'</button>'; }).join("")+'</div>'
          :"")+
        (open&&qlog.stage==="wrong"?
          '<div class="eyebrow" style="margin-top:12px">How sure were you?</div><div class="g3 mb">'+
          [[3,"&#128994; Certain"],[2,"&#128993; Unsure"],[1,"&#128308; Guessed"]].map(function(c){
            return '<button class="pick'+(qlog.conf===c[0]?" on":"")+'" data-qconf="'+c[0]+'">'+c[1]+'</button>'; }).join("")+'</div>'+
          '<div class="eyebrow">Why</div><div class="g2 mb">'+SM.ERR_TYPES.map(function(e){
            return '<button class="pick sm2'+(qlog.errType===e[0]?" on":"")+'" data-qerr="'+e[0]+'">'+e[1]+'</button>'; }).join("")+'</div>'+
          '<div class="eyebrow">What you chose <span class="muted">optional</span></div>'+
          '<textarea id="qChose" rows="1" placeholder="The option that pulled you in">'+esc(qlog.chose)+'</textarea>'+
          /* A confident wrong answer is more correctable than a hesitant one, but
             more likely to come back if nothing intervenes before you move on.
             An immediate test protects the correction — not another later
             review, right now, before this log even saves. Only for conf===3;
             a low-confidence miss was already a known gap and does not need it. */
          (qlog.conf===3?
            '<div class="eyebrow" style="margin-top:10px">You were sure \u2014 lock in the fix</div>'+
            '<textarea id="qRetest" rows="1" placeholder="Right here, write the correct answer from memory">'+esc(qlog.retest)+'</textarea>'+
            '<p class="muted sm">Confident mistakes are the ones most likely to resurface later if this step is skipped.</p>'
            :"")+
          '<div class="btnrow"><button class="btn solid f1" id="qSave"'+
            (qlog.conf&&qlog.errType&&(qlog.conf!==3||qlog.retest.trim())?"":" disabled")+'>Log it</button>'+
          '<button class="btn f1" id="qCancel">Cancel</button></div>'
          :"")+
        (open?
          /* Capture at the moment the explanation lands \u2014 the note is worth
             more now than reconstructed from a question number next month. */
          '<div class="eyebrow" style="margin-top:12px">Write down what you learned</div>'+
          '<textarea id="noteBox" rows="2" placeholder="The one line worth keeping \u2014 a fact, a cut-off, a trap">'+esc(noteDraft)+'</textarea>'+
          '<div class="btnrow"><button class="btn sm f1" data-note="fact|'+t.i+'">Save this</button>'+
          '<button class="btn sm f1" data-note="trap|'+t.i+'">Save as a trap to avoid</button></div>'
          :'')+
        (open?'<div class="btnrow" style="margin-top:8px"><button class="btn sm" id="qClose">Done with this topic for now</button>'+
          '<button class="btn sm" data-qanalyse="'+t.i+'">Analyse this topic</button></div>'
          :'<div class="btnrow" style="margin-top:8px"><button class="btn sm" data-qopen="'+t.i+'">Log an MCQ</button>'+
          '<button class="btn sm" data-qanalyse="'+t.i+'">Analyse this topic</button></div>')+
        (qAnalyse===t.i?topicAnalysis(t.i):""));
    });
    if(!showAll&&!list.length) out+=card('<p class="muted sm">No topics scheduled today. Tap "All '+SM.CURRICULUM.length+'".</p>');
    /* The mistake diary — asked for repeatedly and genuinely absent. Every
       wrong answer already produced a record; nothing showed them as a list
       you could read back. Newest first, with why it went wrong and the note
       you wrote, so a week of mistakes can be reviewed in one place. */
    out+=mistakeDiary();
    if(state.retiredCount>0)
      out+=card('<div class="row-top"><span class="muted sm">Skipped as mastered</span>'+
        '<span class="drape sm">'+state.retiredCount+'</span></div>'+
        '<p class="muted sm">Questions right twice on separate days that you chose not to redo \u2014 that time went to something that still needed it.</p>');
  }

  if(logMode==="backup"){
    out+=backupReminder();
    out+=card('<div class="eyebrow">Save a backup</div>'+
      '<div class="btnrow"><button class="btn solid f1" id="dlBackup">Download backup file</button></div>'+
      '<p class="muted sm">Saves a real file to Files / iCloud Drive \u2014 independent of this app\u2019s own storage, and the way to carry progress to a second device by hand (AirDrop or iCloud Drive to it, then Restore below).</p>'+
      (backupMsg?'<p class="muted sm drape">'+esc(backupMsg)+'</p>':'')+
      '<details style="margin-top:10px"><summary class="muted sm" style="cursor:pointer">Copy as text instead</summary>'+
      '<textarea id="expBox" rows="5" readonly class="mono" style="margin-top:8px">'+esc(SM.exportPayload(state))+'</textarea>'+
      '<div class="btnrow"><button class="btn sm" id="copyBtn">Copy</button><span id="copyMsg" class="muted sm"></span></div></details>'+
      '<p class="muted sm">'+state.misses.length+' write-ups, '+Object.keys(state.scores).length+
      ' scored topics, '+state.calib.length+' calibration points, '+Object.keys(state.tallies).length+' tallied topics.</p>');
    out+=card('<div class="eyebrow">Restore</div>'+
      '<div class="btnrow"><button class="btn f1" id="pickBackup">Choose a backup file</button></div>'+
      '<input type="file" id="fileBackup" accept="application/json,.json,.txt" style="display:none">'+
      '<details style="margin-top:10px"><summary class="muted sm" style="cursor:pointer">Paste text instead</summary>'+
      '<textarea id="impBox" rows="4" class="mono" placeholder="Paste a backup" style="margin-top:8px"></textarea>'+
      '<div class="btnrow"><button class="btn f1" id="mergeBtn">Merge it in</button></div></details>'+
      '<p class="muted sm">Merging never replaces. Scores only ever go up; on a conflict the more recently reviewed copy wins.</p>');
    out+='<details class="coachMore"><summary class="eyebrow" style="cursor:pointer">Diagnostics \u25be</summary>';
    out+=card('<p class="muted sm">Runs the same checks used to build this against the app exactly as it sits on your device right now \u2014 current settings, current data, current date. Nothing is sent anywhere.</p>'+
      '<div class="btnrow"><button class="btn f1" id="diagRun">Run diagnostics</button></div>'+
      (diagResults?diagResults.map(function(r){
        return '<div class="row-top" style="margin-top:8px"><span class="sm">'+
          (r.ok?"&#10003; ":"&#10005; ")+esc(r.name)+'</span></div>'+
          (r.ok?"":'<p class="muted sm rust">'+esc(r.detail)+'</p>');
      }).join(""):""));
    out+='</details>';
  }
  return out;
}

/* ---------- PROGRESS ---------- */
/* One wrapper so every path into Progress — including the two early returns
   when the review queue is empty — gets the same collapsed treatment. */
function renderProgress(){
  var P=plan.P, B=plan.B, st=styleNow(), ph=examStyleNow();
  var out="";
  var rd=SM.readiness(state.scores,st,ph);
  out+='<div class="eyebrow">Readiness &middot; '+st.label+'</div>';
  if(!rd){
    out+=card('<p class="muted sm">Score at least one topic (ten questions with a correct count) and a projection appears here.</p>');
  } else {
    var lo=Math.round(rd.lo*100), hi=Math.round(rd.hi*100), mid=Math.round(rd.mid*100);
    out+=card('<div class="gauge">'+
      '<div class="gtrack"><div class="gband" style="left:'+lo+'%;width:'+(hi-lo)+'%"></div>'+
      '<div class="gmid" style="left:'+mid+'%"></div>'+
      '<div class="gqual" style="left:50%"></div></div>'+
      '<div class="grow"><span class="muted sm">0</span><span class="muted sm">50% qualify</span><span class="muted sm">100</span></div></div>'+
      '<div class="row-top"><span class="big2 '+(rd.lo>=0.5?"drape":rd.hi<0.5?"rust":"amber")+'">'+lo+'–'+hi+'%</span>'+
      '<span class="muted sm" style="text-align:right">'+Math.round(rd.coverage*100)+'% of the paper<br>actually sampled</span></div>'+
      '<p class="muted sm">'+(rd.lo>=0.5
        ? "Above the qualifying bar even at the low end."
        : rd.hi<0.5 ? "Below the bar across the whole band. The marginal-gain list below is where to spend the next hour."
        : "The bar sits inside your band — too close to call yet. The band narrows as coverage rises.")+
      '</p>');
  }

  out+=attemptCard(st);
  var other = (st.key==="neet") ? SM.STYLES.ini : SM.STYLES.neet;
  out+=card('<div class="eyebrow">'+other.label+' \u2014 the other paper</div>'+
    '<p class="muted sm">Penalty '+(other.penalty===0.25?"a quarter":"a third")+', so a blind guess is worth <b>'+
    (SM.blindEV(other)>0.001?"+"+SM.blindEV(other).toFixed(2)+" \u2014 leave nothing blank":"exactly zero \u2014 a blank costs nothing")+
    '</b>. Break-even '+Math.round(SM.breakEven(other)*100)+'%, '+SM.paceTarget(other)+' s a question.</p>'+
    '<p class="sm amber">The two papers reward opposite behaviour on guessing. Know which one you are sitting.</p>');

  /* syllabus heat map */
  out+='<div class="eyebrow">Syllabus — accuracy by topic</div>';
  out+=card('<div class="heat">'+SM.CURRICULUM.map(function(t){
      var a=topicAcc(t.i), s=state.scores[t.i];
      var n=s?(s.ba+s.sa):0;
      return '<div class="ht" style="background:'+accColour(a)+';opacity:'+(a===null?0.32:1)+
        '" title="'+esc(t.n)+'"><span>'+esc(t.n.replace(/[^A-Za-z]/g,"").slice(0,3).toUpperCase())+'</span></div>';
    }).join("")+'</div>'+
    '<div class="legend"><span class="lg" style="background:#BE6B5F"></span>&lt;45'+
    '<span class="lg" style="background:#C98A55"></span>45'+
    '<span class="lg" style="background:#D6A441"></span>58'+
    '<span class="lg" style="background:#6FA98C"></span>68'+
    '<span class="lg" style="background:#3E8E7E"></span>80+%'+
    '<span class="lg" style="background:var(--line)"></span>no data</div>');

  /* marginal gain */
  var mg=SM.marginalGain(state.scores,st,ph).slice(0,8);
  out+='<div class="eyebrow">Where the next hour pays most</div>';
  out+=card(mg.map(function(x){
      return '<div class="mgr"><div class="row-top"><span class="lbl">'+
        (x.y===2?"&#127919; ":"")+esc(x.t.n)+'</span><span class="pillq">+'+x.gain.toFixed(1)+'</span></div>'+
        '<div class="muted sm">~'+x.expected.toFixed(1)+' questions expected &middot; '+
        (x.acc===null?"not sampled yet":Math.round(x.acc*100)+"% correct")+'</div></div>'; }).join("")+
    '<p class="muted sm">Expected marks recoverable, from topic size, yield for '+st.label+
    ', and how far your accuracy sits below perfect. The share estimate comes from bank volume, not an official blueprint.</p>');

  /* calibration */
  if(state.calib.length>=5){
    var lv=[[3,"&#128994; Certain"],[2,"&#128993; Unsure"],[1,"&#128308; Guessed"]];
    var worst=null;
    out+='<div class="eyebrow">Calibration</div>';
    out+=card(lv.map(function(L){
      var set=state.calib.filter(function(x){return x.c===L[0];});
      if(!set.length) return '<div class="mb"><div class="row-top"><span class="sm">'+L[1]+
        '</span><span class="muted sm">no data</span></div>'+bar(0,"var(--line2)",5)+'</div>';
      var acc=set.filter(function(x){return x.ok;}).length/set.length*100;
      if(L[0]===3&&acc<85) worst=Math.round(acc);
      return '<div class="mb"><div class="row-top"><span class="sm">'+L[1]+'</span><span class="muted sm">'+
        Math.round(acc)+'% &middot; n='+set.length+'</span></div>'+bar(acc,accColour(acc/100),5)+'</div>';
    }).join("")+'<p class="muted sm">'+(worst!==null
      ? "Right only "+worst+"% of the time when you feel certain. That gap is the exam risk — not the ones you know you are guessing on."
      : "Certainty is tracking accuracy, so your own sense of which topics are shaky can be trusted.")+'</p>');
  }

  /* per-topic detail: accuracy, trend, pace, criterion */
  var trows=SM.CURRICULUM.map(function(t){
    var sc=state.scores[t.i]; if(!sc||(sc.ba+sc.sa)<10) return null;
    return { t:t, b:sc.ba?sc.bc/sc.ba*100:null, s:sc.sa?sc.sc/sc.sa*100:null, n:sc.ba+sc.sa };
  }).filter(function(x){return x;}).sort(function(a,b){ return (a.b==null?101:a.b)-(b.b==null?101:b.b); });
  if(trows.length){
    out+='<div class="eyebrow">Topic detail &middot; weakest first</div>';
    out+=card(trows.slice(0,14).map(function(x){
      var drop=(x.b!=null&&x.s!=null&&x.b-x.s>=12);
      var h=state.hist[x.t.i]||[], rp=(state.repairs[x.t.i]||{}).reps||0;
      var crit=(x.b!=null&&x.b>=75&&rp>=2);
      var pc=state.pace[x.t.i], per=(pc&&pc.q)?Math.round(pc.sec/pc.q):null;
      var tg=SM.paceTarget(st), tr=trend(h);
      return '<div class="trow"><div class="row-top"><span class="lbl">'+esc(x.t.n)+'</span>'+spark(h)+'</div>'+
        '<div class="row-top" style="margin-bottom:5px"><span class="sm">bank '+(x.b==null?"\u2014":Math.round(x.b)+"%")+
        '</span><span class="sm '+(drop?"rust":"muted")+'">timed '+(x.s==null?"\u2014":Math.round(x.s)+"%")+
        (drop?" \u2193":"")+'</span></div>'+
        bar(x.b==null?0:x.b, x.b!=null&&x.b<60?"var(--rust)":"var(--sky)",5)+
        '<div class="muted sm">n='+x.n+
        (per!==null?' &middot; <span class="'+(per>tg*1.15?"rust":"drape")+'">'+per+' s/q</span>':'')+
        ' &middot; '+(crit?'<span class="drape">at criterion</span>':'repaired '+rp+'\u00d7')+
        (tr!==null?' &middot; '+(tr>2?'<span class="drape">rising '+tr+'pt</span>':tr<-2?'<span class="rust">falling '+Math.abs(tr)+'pt</span>':'flat'):'')+
        '</div></div>';
    }).join("")+
      '<p class="muted sm">Solid on the bank but well down under a clock is a speed problem, not a knowledge problem. "At criterion" means 75% or better and repaired at least twice.</p>');
  }


  var po=paceOverall();
  if(po!==null){
    var tg2=SM.paceTarget(st);
    out+='<div class="eyebrow">Pace</div>';
    out+=card('<div class="row-top"><span class="big2 '+(po>tg2*1.15?"rust":po<=tg2?"drape":"amber")+'">'+
      Math.round(po)+' s</span><span class="muted sm" style="text-align:right">per question<br>'+tg2+' s allowed in '+st.label+'</span></div>'+
      bar(Math.min(100,tg2/po*100), po<=tg2?"var(--drape)":"var(--amber)",6)+
      '<p class="muted sm">'+(po<=tg2
        ? "Inside the limit \u2014 accuracy is your constraint, not the clock."
        : "Over by "+Math.round(po-tg2)+" s a question. Across "+st.q+" questions that is "+
          Math.round((po-tg2)*st.q/60)+" minutes you do not have. Technique, not content.")+'</p>');
  }

  /* activity grid */
  var cells=plan.CAL.map(function(c){
    var r=state.days[c.date];
    var v=r?((r.bank||0)+(r.speed||0)):0;
    var lvl = !r?0 : v>=80?4 : v>=50?3 : v>=20?2 : v>0?1 : 0;
    return '<div class="ac l'+lvl+(c.date===todayISO()?" now":"")+'" title="'+c.date+'"></div>';
  }).join("");
  out+='<div class="eyebrow">Consistency</div>';
  out+=card('<div class="grid">'+cells+'</div>'+
    '<p class="muted sm">One square per day of the campaign, darker where more questions were attempted. Gaps matter more than any single heavy day.</p>');

  /* how you get things wrong */
  var totals={};
  SM.ERR_TYPES.forEach(function(e){ totals[e[0]]=0; });
  Object.keys(state.tallies).forEach(function(k){
    SM.ERR_TYPES.forEach(function(e){ totals[e[0]]+=(state.tallies[k][e[0]]||0); }); });
  var sum=SM.ERR_TYPES.reduce(function(a,e){return a+totals[e[0]];},0);
  if(sum>0){
    out+='<div class="eyebrow">How you get things wrong</div>';
    out+=card(SM.ERR_TYPES.map(function(e){
      return '<div class="mb"><div class="row-top"><span class="sm">'+e[1]+'</span><span class="muted sm">'+
        totals[e[0]]+'</span></div>'+bar(totals[e[0]]/sum*100,"var(--line2)",5)+'</div>'; }).join("")+
      (totals.misread>sum*0.2?'<p class="sm amber">A fifth of your misses are misread stems. That is a reading-speed and technique problem, and no amount of extra content fixes it.</p>':'')+
      (totals.confuse>sum*0.3?'<p class="sm violet">Nearly a third are confusions. Check the discrimination drills on Revise.</p>':''));
  }

  out+='<p class="muted sm">Every figure traces to the source catalogue: 679 lectures, 449 h 29 min listed, 9,603 bank and 4,126 speed questions across '+SM.CURRICULUM.length+' topics.</p>';
  return out;
}



/* ===== UI MODULE 4: ui-plan.part.js ===== */
/* ---------- PLAN ---------- */
/* Where the plan says you should be, against where the ticks say you are.
   Counted in days rather than percent: "four days behind" is actionable in a way
   that "97.2% adherence" is not. Half-ticked blocks count as half a day. */
/* Arrears. A block left unticked on a past content day is not written off and
   is not doubled onto tomorrow: it queues here, oldest first, and is offered at
   the top of every day until it is done. Whatever will not fit today simply
   stays in the queue, which is what makes the calendar adapt rather than the
   plan quietly falsifying itself. */
/* ---------- RE-PLAN FROM TODAY ---------- */
/* Genuine partial credit, not a blanket reshuffle. A block ticked done is
   dropped; a block ticked half survives at half its minutes AND half its item
   list (via the same trimItems machinery Empathy and fold-back already use);
   an untouched block \u2014 past, today, or still ahead \u2014 survives whole. Order is
   preserved exactly as already sequenced, which is what keeps phase-lock and
   pass-order correct without touching budget() or sequence() at all: this
   only ever repacks blocks the engine already sized, onto a fresh run of
   days, using the same layoutDay() that lays out the day normally. */
function collectRemainingWork(today){
  var out=[];
  plan.content.forEach(function(c){
    var r=state.days[c.date], ch=(r&&r.checks)||{};
    var isFuture=(c.date>today);
    (c.blocks||[]).forEach(function(b){
      if(["lunch","buffer","protected","recall"].indexOf(b.kind)>=0) return;
      var v=isFuture?undefined:ch[b.i];
      if(v===true) return;                       /* fully done \u2014 excluded */
      var frac = (v===0.5) ? 0.5 : 1;             /* half-done or fully untouched */
      var item={}; for(var k in b) item[k]=b[k];
      delete item.start; delete item.endMin; delete item.i; delete item.split;
      if(frac<1) item=SM.cutToTarget([item], Math.round(b.mins*frac), [b.kind], [])[0];
      if(item && item.mins>0.4) out.push(item);
    });
  });
  return out;
}
/* Packs the collected blocks onto a fresh skeleton starting today, filling
   each day to its usual capacity before moving to the next \u2014 the same target
   layoutDay() already lays days out against, just driven directly by minutes
   rather than by topic-slots, since there is no slot structure left to swap
   at this stage the way balance() has for a fresh build. A day or two may run
   a little less evenly than a from-scratch build for that reason; the trade
   is a self-contained repack that cannot touch the tested sizing engine. */
function replanFromToday(anchor){
  var today=anchor||todayISO();
  var remaining=collectRemainingWork(today);
  if(!remaining.length) return {ok:false, error:"Nothing left to replan \u2014 every block is already accounted for."};
  var P=plan.P;
  var Tm=remaining.reduce(function(a,b){return a+b.mins;},0);
  var dailyMin=SM.usableWork(P);
  var needed=Math.max(1, Math.ceil(Tm*1.06/dailyMin));   /* headroom for split/break overhead, matches buildPlan's own margin */
  var P2={}; for(var k in P) P2[k]=P[k];
  P2.startISO=today; P2.hardStartISO=null;
  var skel, contentDays, qi, guard=0;
  do{
    skel=SM.skeleton(P2, needed);
    contentDays=skel.filter(function(c){return !c.rest;});
    qi=0;
    contentDays.forEach(function(c){
      var cap=dailyMin, used=0, items=[];
      while(qi<remaining.length && used<cap){ var b=remaining[qi]; items.push(b); used+=b.mins; qi++; }
      c.rawItems=items;
    });
    if(qi<remaining.length) needed=Math.ceil(needed*1.15)+2;   /* rounding came up short \u2014 grow and retry */
    guard++;
  } while(qi<remaining.length && guard<8);
  /* Greedy packing alone leaves the same lumpiness a from-scratch build's
     balance() step exists to smooth out \u2014 but that function operates on
     topic-slots the repack no longer has. This does the same job at item
     granularity: day i's LAST item was, by construction, immediately BEFORE
     day i+1's FIRST item in the master sequence, so its phase can never
     exceed day i+1's \u2014 moving it forward is provably safe for phase order
     without checking anything, which is what makes this safe to run at all. */
  for(var pass=0; pass<25; pass++){
    var moved=false;
    for(var i=0; i<contentDays.length-1; i++){
      var cur=contentDays[i].rawItems, nxt=contentDays[i+1].rawItems;
      var curWork=cur.reduce(function(a,b){return a+b.mins;},0);
      var nxtWork=nxt.reduce(function(a,b){return a+b.mins;},0);
      if(curWork<=dailyMin || cur.length<2) continue;
      var last=cur[cur.length-1];
      if(nxtWork+last.mins>dailyMin) continue;
      if(curWork-last.mins < dailyMin*0.5) continue;   /* do not create a new problem to fix this one */
      cur.pop(); nxt.unshift(last); moved=true;
    }
    if(!moved) break;
  }
  contentDays.forEach(function(c){
    var laid=SM.layoutDay(c.rawItems,P2);
    c.blocks=laid.blocks; c.endMin=laid.endMin; c.work=laid.work; c.workEnd=laid.workEnd; c.pastBed=laid.pastBed||0;
    c.rawItems=SM.cloneItems(c.rawItems);
  });
  /* A day can have non-empty .blocks (gym, lunch, the evening off) while
     carrying zero actual study content, when the day-count estimate above
     over-provisions \u2014 checking .blocks.length alone let empty trailing days
     through, artificially extending the finish date with days that have
     nothing scheduled on them at all. */
  contentDays=contentDays.filter(function(c){return c.blocks&&c.blocks.length&&c.work>0;});
  contentDays.forEach(function(c,i){ c.n=i+1; });
  /* skel can run past the last day that actually has content \u2014 the same
     over-provisioning that produced empty trailing days also pads the raw
     skeleton, so both the reported finish date and the returned calendar are
     trimmed to the true last day of work rather than the padded estimate. */
  var lastReal = contentDays.length ? contentDays[contentDays.length-1].date : today;
  var trimmedSkel = skel.filter(function(c){ return c.date<=lastReal; });
  var byDate={}; trimmedSkel.forEach(function(c){ byDate[c.date]=c; });
  return { ok:true, CAL:trimmedSkel, content:contentDays, byDate:byDate,
    finish: lastReal,
    asOf:today, builtAt:Date.now(), remainingMin:Tm, shortBy: qi<remaining.length?(remaining.length-qi):0 };
}
/* Installs a computed re-plan as the plan everything else reads. arrears(),
   trajectory(), feasibility, Coach and the timeline all key off plan.content /
   plan.byDate / plan.CAL / plan.finish \u2014 swapping those four fields is the
   entire integration; nothing downstream needs to know a replan happened.
   Only the anchor date persists to state \u2014 the schedule itself is re-derived
   fresh from state.days on every load, so it always reflects whatever has
   actually been ticked since, not a stale snapshot from the moment of the tap. */
function applyReplan(r){
  plan.content=r.content; plan.byDate=r.byDate; plan.CAL=r.CAL; plan.finish=r.finish;
  state.replan={ asOf:r.asOf };
}
/* Called once at load, after the normal build, so a previously-chosen replan
   re-applies with today's actual completion state rather than being lost on
   reload or frozen at the moment it was first requested. Cursor is left
   untouched here \u2014 only the explicit "Apply" action jumps the viewed date,
   so reopening the app does not snap someone back to day one of the replan
   every time regardless of where they have since navigated to. */
/* ---------- CHOOSE TODAY'S TOPIC ----------
   Phase order is a good default, not a cage. If a topic is what you can face
   today, doing it beats doing nothing — especially restarting.
   Implemented as a SWAP of two whole slots between two days, never a
   substitution: both slots already carry their own allocated question ranges,
   so exchanging them conserves every question by construction. Rewriting a
   slot's contents instead would need the item-allocation surgery that has
   twice silently lost questions in this project.
   Swaps persist as dates and slot indices, re-applied after every rebuild, so
   a chosen day survives reload and any later re-plan. */
function applySwaps(){
  (state.swaps||[]).forEach(function(sw){
    var a=plan.byDate[sw.d], b=plan.byDate[sw.withD];
    if(!a||!b||!a.slots||!b.slots) return;
    if(a.slots[sw.i]===undefined||b.slots[sw.withI]===undefined) return;
    var tmp=a.slots[sw.i]; a.slots[sw.i]=b.slots[sw.withI]; b.slots[sw.withI]=tmp;
    /* dayBlocks() already lays the day out and returns the finished shape —
       calling layoutDay on its result was laying out an object rather than a
       block list. */
    [a,b].forEach(function(day){
      var laid=SM.dayBlocks(day,plan.P,plan.B);
      day.blocks=laid.blocks; day.endMin=laid.endMin; day.work=laid.work;
      day.workEnd=laid.workEnd; day.pastBed=laid.pastBed||0;
      day.rawItems=SM.cloneItems(laid.blocks);
    });
  });
}
/* Topics that could be brought forward: the next distinct topics scheduled
   after today, capped so the list stays choosable rather than exhaustive. */
function swapCandidates(date){
  var out=[], seen={}, cur=plan.byDate[date];
  if(!cur||!cur.slots) return out;
  cur.slots.forEach(function(s){ seen[s.ti]=1; });
  /* Every distinct upcoming topic, not the first eight — capping here meant a
     topic further out simply could not be chosen, which is exactly what
     search exists to solve. Callers cap for display instead. */
  for(var i=0;i<plan.content.length;i++){
    var c=plan.content[i];
    if(c.date<=date||!c.slots) continue;
    c.slots.forEach(function(s,si){
      if(seen[s.ti]) return;
      seen[s.ti]=1;
      out.push({ti:s.ti, d:c.date, i:si});
    });
  }
  return out;
}
function reapplyReplanIfAny(){
  if(!state.replan || !state.replan.asOf) return;
  var r=replanFromToday(state.replan.asOf);
  if(r.ok) applyReplan(r);
}

function arrears(before){
  var t=todayISO(), out=[], cap=60;
  for(var i=0;i<plan.content.length && out.length<cap;i++){
    var c=plan.content[i];
    if(c.date>=before || c.date>t) break;
    var r=state.days[c.date]; var ch=(r&&r.checks)||{};
    c.blocks.forEach(function(b){
      if(["lunch","buffer","protected","recall"].indexOf(b.kind)>=0) return;
      if(ch[b.i]===true) return;
      var part=(ch[b.i]===0.5);
      out.push({ date:c.date, b:b, mins: part?Math.round(b.mins/2):b.mins, part:part });
    });
  }
  return out;
}
function arrearsCard(date){
  var A=arrears(date);
  if(!A.length) return "";
  var mins=A.reduce(function(a,x){ return a+x.mins; },0);
  var show=A.slice(0,6);
  return card('<div class="eyebrow amber">Left over from before</div>'+
    '<div class="row-top"><span class="lbl">'+A.length+' block'+(A.length===1?"":"s")+' owed</span>'+
    '<span class="muted sm">'+Math.floor(mins/60)+'h '+(mins%60)+'m</span></div>'+
    '<p class="muted sm">Oldest first. These sit above today\u2019s own work and stay here until they are done \u2014 nothing is doubled onto tomorrow, and nothing is written off.</p>'+
    show.map(function(x){
      return '<div class="bh" style="margin-top:8px"><div class="box sm2'+(x.part?" half":"")+'" data-check="'+x.b.i+
        '" data-cdate="'+x.date+'" data-mins="'+x.b.mins+'">'+(x.part?"&#9680;":"")+'</div>'+
        '<div class="bt"><div class="lbl">'+esc(clip(x.b.head||x.b.label,80))+'</div>'+
        '<div class="muted sm">'+SM.shortDate(x.date)+' &middot; '+x.mins+' min'+(x.part?" left":"")+'</div></div></div>';
    }).join("")+
    (A.length>show.length?'<p class="muted sm">and '+(A.length-show.length)+' more.</p>':'')+
    (mins>SM.usableWork(state.prefs)
      ? '<p class="sm rust">That is more than a whole day on its own. Clear the oldest first and let the rest keep queueing \u2014 do not try to absorb it in one sitting.</p>'
      : '')+
    (mins>SM.usableWork(state.prefs)*3 && !(state.replan&&state.replan.asOf)
      ? '<div class="btnrow" style="margin-top:10px"><button class="btn f1" data-nav="plan">This is more than a bad week \u2014 start fresh from today instead</button></div>'
      : ''), "amber");
}

function trajectory(){
  var t=todayISO(), due=0, done=0;
  plan.content.forEach(function(c){
    if(c.date>t) return;
    due++;
    var r=state.days[c.date]; if(!r||!r.checks) return;
    var real=c.blocks.filter(function(b){
      return ["lunch","buffer","protected"].indexOf(b.kind)<0; });
    if(!real.length) return;
    var got=0;
    real.forEach(function(b){ var v=r.checks[b.i];
      if(v===true) got+=1; else if(v===0.5) got+=0.5; });
    done+=got/real.length;
  });
  return { due:due, done:Math.round(done*10)/10, drift:Math.round((done-due)*10)/10 };
}
/* The same day-by-day logic as trajectory(), kept as a running series instead
   of a single final number \u2014 the shape of the gap (opened gradually, or one
   bad week) matters as much as its current size, and only a graph shows that. */
function trajectorySeries(){
  var t=todayISO(), series=[], doneAcc=0, dueAcc=0;
  plan.content.forEach(function(c){
    if(c.date>t) return;
    dueAcc++;
    var r=state.days[c.date];
    var real=c.blocks.filter(function(b){ return ["lunch","buffer","protected"].indexOf(b.kind)<0; });
    if(r && r.checks && real.length){
      var got=0;
      real.forEach(function(b){ var v=r.checks[b.i]; if(v===true) got+=1; else if(v===0.5) got+=0.5; });
      doneAcc+=got/real.length;
    }
    series.push({date:c.date, actual:doneAcc, projected:dueAcc});
  });
  return series;
}
/* True while the diagnostic window is open: the first N content days exist to
   find out what you actually remember, and ahead/behind arithmetic computed
   from three days of data measures nothing except how recently you started. */
function inDiagnostic(){
  var n=state.prefs.diagnosticDays||0;
  if(!n) return false;
  var t=todayISO(), done=0;
  for(var i=0;i<plan.content.length;i++){ if(plan.content[i].date<=t) done++; else break; }
  return done<=n;
}
function trajCard(){
  if(inDiagnostic()) return "";
  var j=trajectory();
  if(!j.due) return "";
  var behind=j.drift<-0.05, ahead=j.drift>0.05;
  var tone= behind && j.drift<-3 ? "rust" : (ahead?"drape":null);
  var word= behind ? Math.abs(j.drift)+" days behind"
          : ahead  ? j.drift+" days ahead" : "level with the plan";
  return card('<div class="row-top"><span class="lbl">'+word+'</span>'+
    '<span class="muted sm">'+j.done+' of '+j.due+' days done</span></div>'+
    bar(Math.min(100,j.done/j.due*100), behind?"var(--rust)":"var(--drape)",6)+
    '<p class="muted sm">'+
    (behind ? "Behind is information, not failure. The fix is to cut scope on the next lighter day \u2014 never to lengthen a day."
    : ahead ? "Spend the surplus on repair sets and the topics still showing red, not on opening new material early."
    : "Holding the line. Nothing to change.")+'</p>', tone);
}

function feasCard(full){
  /* Suppressed on Today during the diagnostic window; the full panel stays
     available on Plan for anyone who deliberately goes looking for it. */
  if(!full && inDiagnostic()) return "";
  var f=SM.feasibility(prefsWithAcc());
  if(!f) return "";
  /* A configured exam date sitting in the past produces zero capacity by
     construction (no days remain before it), which then reads as an enormous,
     confusing deficit rather than what it actually is: a stale date nobody
     updated. Named plainly, with the fix one field away, instead of dressed up
     as hundreds of hours short. */
  if(f.exam.iso<todayISO())
    return card('<div class="eyebrow rust">This target date has passed</div>'+
      '<p class="sm">'+f.style.label+' was set to '+SM.pretty(f.exam.iso)+', which is now in the past. '+
      'Update it below \u2014 the deficit shown until then is not meaningful.</p>','rust');
  if(f.fits) return full ? card('<div class="eyebrow drape">Inside the target date</div>'+
    '<p class="sm">All '+f.needH+' hours land before '+SM.pretty(f.exam.iso)+', inside '+
    f.capH+' hours of capacity.</p>','drape') : "";
  var body='<div class="eyebrow amber">Behind the target date</div>'+
    '<div class="g3 mb">'+
    '<div><div class="big2 rust">'+f.deficitH+'h</div><div class="muted sm">short</div></div>'+
    '<div><div class="big3">'+f.needH+'h</div><div class="muted sm">needed</div></div>'+
    '<div><div class="big3">'+f.capH+'h</div><div class="muted sm">available</div></div></div>'+
    '<p class="sm">'+f.daysBefore+' study days remain before '+f.style.label+' on '+SM.pretty(f.exam.iso)+
    '. At '+f.dailyH.toFixed(2)+' h of real work a day that is '+f.capH+' hours. The syllabus, worked '+
    (state.prefs.passes||3)+' times, needs '+f.needH+'. The date is a target, not a wall \u2014 the plan keeps going past it rather than dropping content, and every question still gets its three passes. This is the size of the gap, measured, so you can decide what to do about it.</p>';
  if(full){
    body+='<div class="topline"><div class="eyebrow">What actually closes it</div>'+
      f.levers.map(function(l){
        return '<div class="mb"><div class="row-top"><span class="lbl'+(l.fits?"":" muted")+'">'+esc(l.label)+'</span>'+
          '<span class="sm '+(l.fits?"drape":"muted")+'">'+(l.fits?"closes it":"\u2212"+l.saves+"h, not enough")+'</span></div>'+
          '<p class="muted sm">'+esc(l.note)+'</p></div>'; }).join("")+
      '<p class="muted sm">Nothing here is chosen for you. Change passes, the rest day or the hours below and these numbers move with it.</p></div>';
  } else {
    body+='<p class="muted sm">Open Plan to see which levers close the gap.</p>';
  }
  return card(body, f.deficitH>120 ? "rust" : "amber");
}



/* ===== UI MODULE 5: ui-session.part.js ===== */
/* ---------------------------------------------------------------------------
   COACH. Everything here is computed from tracked data with no network at all:
   the diagnosis, the ranking of what is actually costing you, the debrief and
   the weekly review are arithmetic, not language modelling. An optional endpoint
   adds free-form conversation on top; when it is absent or offline the tab loses
   the chat box and nothing else. The rule is that no advice depends on the
   network, because a coach that goes quiet on a bad connection is worse than no
   coach at all.
   --------------------------------------------------------------------------- */
function coachFacts(){
  var t=todayISO(), P=state.prefs, F={};
  var j=trajectory(); F.due=j.due; F.done=j.done; F.drift=j.drift;
  F.arrears=arrears(t); F.arrearsMin=F.arrears.reduce(function(a,x){return a+x.mins;},0);
  var att=0, cor=0, conf=0, confWrong=0;
  Object.keys(state.scores||{}).forEach(function(k){ var sc=state.scores[k];
    att+=(sc.ba||0)+(sc.sa||0); cor+=(sc.bc||0)+(sc.sc||0); });
  F.att=att; F.acc= att? cor/att : null;
  F.ledgerCount=Object.keys(state.mcq||{}).length;
  (state.calib||[]).forEach(function(c){ if(c.c===3){ conf++; if(!c.ok) confWrong++; } });
  F.confident=conf; F.confidentWrong=confWrong;
  F.hyper = conf? confWrong/conf : null;
  var open=0, overdue=0, retired=0;
  (state.misses||[]).forEach(function(m){ if(m.done){retired++;return;} open++;
    if(m.due && m.due < Date.now()-SM.DAY) overdue++; });
  F.open=open; F.overdue=overdue; F.retired=retired;
  var tal={}; Object.keys(state.tallies||{}).forEach(function(k){
    Object.keys(state.tallies[k]||{}).forEach(function(e){ tal[e]=(tal[e]||0)+state.tallies[k][e]; }); });
  F.errors=tal;
  F.topError=Object.keys(tal).sort(function(a,b){ return tal[b]-tal[a]; })[0]||null;
  var weak=[]; Object.keys(state.scores||{}).forEach(function(k){ var sc=state.scores[k];
    var a=(sc.ba||0)+(sc.sa||0), c=(sc.bc||0)+(sc.sc||0);
    if(a>=25) weak.push({ti:+k, acc:c/a, n:a}); });
  weak.sort(function(a,b){ return a.acc-b.acc; });
  F.weak=weak.slice(0,3);
  var lay={normal:0,empathy:0};
  Object.keys(state.days||{}).forEach(function(d){ if(d>t) return;
    lay[(state.days[d].layer==="empathy")?"empathy":"normal"]++; });
  F.empathyDays=lay.empathy;
  /* Ledger-derived: the two findings an aggregate tally cannot produce, since
     they depend on recognising the SAME specific question across passes. */
  var repeatMisses=[], regressions=[];
  Object.keys(state.mcq||{}).forEach(function(k){
    var q=state.mcq[k];
    var wrongN=q.attempts.filter(function(a){return a.outcome==="wrong";}).length;
    if(wrongN>=2) repeatMisses.push(q);
    for(var i=1;i<q.attempts.length;i++){
      if(q.attempts[i-1].outcome!=="wrong" && q.attempts[i].outcome==="wrong"){ regressions.push(q); break; }
    }
  });
  F.repeatMisses=repeatMisses; F.regressions=regressions;
  var f=SM.feasibility(P); F.deficitH=f?f.deficitH:0; F.fits=f?f.fits:true;
  var idx=plan.content.map(function(c){return c.date;}).indexOf(activeDate());
  /* Not every day is a content day \u2014 rest, backup and mock days aren't in
     plan.content at all, which used to show as a nonsensical "Day 0". On one
     of those, report the nearest content day already completed instead, so
     the number always means something. */
  if(idx<0){
    var t=activeDate(), last=-1;
    for(var pi=0; pi<plan.content.length; pi++){ if(plan.content[pi].date<=t) last=pi; else break; }
    idx = (last>=0) ? last : 0;   /* before day 1 entirely (an opening rest day) -> reference day 1 */
  }
  F.dayNo=idx+1; F.days=plan.content.length;
  var e=plan.byDate[activeDate()];
  /* e.slots only exists on content-kind days — rest and backup days have
     none, and this used to assume every day did. Opening the Coach section on
     any of those threw partway through, blanking the entire Today page. */
  F.phase = e && e.slots && e.slots.length ? plan.B.topics[e.slots[0].ti].phase : null;
  return F;
}

/* Findings are ranked by what they cost, in hours or in questions, so the top
   item is the one worth acting on rather than the one easiest to phrase. */
function coachFindings(F){
  var out=[];
  /* The gap between "how many I've logged" and "how many have a full,
     path-identified record" is invisible unless something says so \u2014 nothing
     else in the app compares these two numbers. A large gap means most
     attempts are aggregate-only: they help the accuracy percentage but cannot
     ever be recognised again in pass 2, which is the entire point of logging
     with a path at all. */
  if(F.att>=30 && F.ledgerCount>0 && F.att>F.ledgerCount*2)
    out.push({w:250, sev:"amber", h:"Most logged questions have no path on record",
      b:F.att+" attempts logged, only "+F.ledgerCount+" with a subtopic and number attached. "+
        "Fill in Subtopic and Number when you log \u2014 without them a question can never be recognised again next pass, "+
        "which is the one thing an aggregate tally cannot do for you."});
  else if(F.att>=30 && F.ledgerCount===0)
    out.push({w:300, sev:"amber", h:"Nothing has a path on record yet",
      b:F.att+" attempts logged by outcome alone. Add Subtopic and Number when you log a question and this becomes "+
        "a real per-question history \u2014 pass 1 versus pass 2 on the exact same question, not just a topic accuracy percentage."});
  /* Arrears and drift are the same fact counted twice - being behind IS the
     unfinished blocks. Reporting both puts the same problem at ranks one and two
     and makes the list look longer than the number of things wrong with it. */
  if(F.arrears.length>3)
    out.push({w: F.arrearsMin+Math.abs(Math.min(0,F.drift))*300, sev:"rust", h:"Arrears are piling up",
      b: state.prefs.gentleMode ?
        F.arrears.length+" blocks and "+Math.floor(F.arrearsMin/60)+"h "+(F.arrearsMin%60)+"m are sitting unfinished from earlier days. "+
          "That's not a mark against you \u2014 it's just where things are. Whenever you're ready, starting with the oldest one tends to feel more manageable than the newest."
        : F.arrears.length+" blocks and "+Math.floor(F.arrearsMin/60)+"h "+(F.arrearsMin%60)+"m are owed from earlier days"+
        (F.drift<-1?", which is what the "+Math.abs(F.drift)+"-day gap actually consists of":"")+". "+
        "Everything else on this list is smaller. Clear the oldest three before starting anything new today."});
  if(F.hyper!==null && F.confident>=20 && F.hyper>0.12)
    out.push({w: F.hyper*2000, sev:"rust", h:"Confidence is miscalibrated",
      b: state.prefs.gentleMode ?
        F.confidentWrong+" of "+F.confident+" questions you felt sure about turned out wrong ("+Math.round(F.hyper*100)+"%). "+
          "That's useful to know, not a bad sign \u2014 it just means these specific ones are worth a closer look, written out in your own words, before the rest."
        : F.confidentWrong+" of "+F.confident+" questions you marked confident were wrong ("+Math.round(F.hyper*100)+"%). "+
        "That is not a knowledge gap, it is a belief you hold that is false, and it will survive ordinary revision. "+
        "These are the items to write out longhand before anything else."});
  if(F.repeatMisses && F.repeatMisses.length)
    out.push({w:F.repeatMisses.length*400, sev:"rust", h:F.repeatMisses.length+" specific question(s) wrong more than once",
      b:F.repeatMisses.slice(0,4).map(function(q){
        return q.app+" \u203a "+SM.CURRICULUM[q.topicId].n+
          (q.subtopic?" \u203a "+q.subtopic:"")+" \u203a Q"+q.number; }).join("; ")+
        (F.repeatMisses.length>4?"; and "+(F.repeatMisses.length-4)+" more":"")+
        ". Not the topic \u2014 these exact questions. A repair set only closes when both come back right on separate days."});
  if(F.regressions && F.regressions.length)
    out.push({w:F.regressions.length*350, sev:"amber", h:F.regressions.length+" question(s) got WORSE on a later pass",
      b:"Right once, then wrong \u2014 worse than a plain miss, since it means something that looked learned was not. "+
        F.regressions.slice(0,3).map(function(q){
          return q.app+" \u203a "+SM.CURRICULUM[q.topicId].n+
            (q.subtopic?" \u203a "+q.subtopic:"")+" \u203a Q"+q.number; }).join("; ")+"."});
  if(F.overdue>=8)
    out.push({w: F.overdue*30, sev:"amber", h:"The repair queue is slipping",
      b:F.overdue+" items are overdue for review. Adding new questions on top of an unserviced queue is how volume stops "+
        "turning into accuracy. Serve the queue first for two days."});
  if(F.acc!==null && F.att>=200 && F.acc<0.55)
    out.push({w:1200, sev:"amber", h:"Accuracy is below the useful band",
      b:"You are at "+Math.round(F.acc*100)+"% over "+F.att+" attempts. Under about 55% the bottleneck is understanding, "+
        "not exposure, so more questions will not move it. Slow down and read the explanations in full."});
  if(F.drift<-4 && F.arrears.length<=3)
    out.push({w:Math.abs(F.drift)*300, sev:"amber", h:Math.abs(F.drift)+" days behind the plan",
      b:"Cut scope on the next light day rather than lengthening a day. Lengthening is what produces the next Empathy day."});
  if(F.topError && F.errors[F.topError]>=10){
    var lbl={gap:"never learnt it",recall:"knew it, could not retrieve it",
             confuse:"mixed up two things",misread:"read the question wrong"}[F.topError]||F.topError;
    out.push({w:F.errors[F.topError]*20, sev:null, h:"Your errors have one dominant shape",
      b:'"'+lbl+'" accounts for '+F.errors[F.topError]+" logged mistakes \u2014 more than any other kind. "+
        (F.topError==="misread" ? "This one is free to fix: it is a process problem, not a knowledge problem. Read the last line of the stem twice."
         : F.topError==="confuse" ? "Confusions do not respond to re-reading. Build discrimination pairs: the two things side by side, one difference at a time."
         : F.topError==="recall" ? "The material is in there. This calls for retrieval, not more input \u2014 fewer lectures, more blank-page recall."
         : "Genuine gaps are the cheapest to fix. They need first exposure, not repair.")});
  }
  if(F.weak.length && F.weak[0].acc<0.5)
    out.push({w:600, sev:null, h:"Weakest topic: "+SM.CURRICULUM[F.weak[0].ti].n,
      b:Math.round(F.weak[0].acc*100)+"% over "+F.weak[0].n+" attempts. Two more topics behind it: "+
        F.weak.slice(1).map(function(x){ return SM.CURRICULUM[x.ti].n+" ("+Math.round(x.acc*100)+"%)"; }).join(", ")+"."});
  if(F.empathyDays>=5 && F.drift<-3)
    out.push({w:400, sev:"amber", h:"Empathy days are becoming the pattern",
      b:F.empathyDays+" so far. One is recovery; a run of them means the Normal day is mis-sized rather than that you are failing it. "+
        "Change the day in Plan instead of failing it daily."});
  if(!out.length)
    out.push({w:0, sev:"drape", h:"Nothing is wrong",
      b:"No arrears worth naming, calibration holding, queue serviced. Keep the day exactly as it is and stop reading dashboards."});
  return out.sort(function(a,b){ return b.w-a.w; });
}

function pushLine(F){
  if(state.prefs.gentleMode){
    if(F.arrears.length>3) return F.arrears.length+" blocks are sitting unfinished. No rush \u2014 open the oldest one when you're ready.";
    if(F.overdue>=8) return F.overdue+" items are due for another look. Whenever you have a stretch of focus, that's a good place to spend it.";
    if(F.drift<-4) return "You're "+Math.abs(F.drift)+" days behind the plan. That's just a number, not a verdict \u2014 pick up wherever you actually are.";
    if(F.dayNo<=7) return "Day "+F.dayNo+". Early days are for finding out what's actually still there \u2014 no pressure on the pace yet.";
    if(F.drift>2) return "You're "+F.drift+" days ahead. Worth spending that on the topics giving you trouble, if you feel up to it.";
    return "Nothing urgent today. Whatever you get to is enough.";
  }
  if(F.arrears.length>3) return "Stop reading this. "+F.arrears.length+" blocks are owed. Open the oldest one.";
  if(F.overdue>=8) return F.overdue+" items overdue. The queue does not care how you feel about it. Start it.";
  if(F.drift<-4) return "You are "+Math.abs(F.drift)+" days back. Not a crisis \u2014 a number. Do the next block, then the one after.";
  if(F.dayNo<=3) return "Day "+F.dayNo+". The only thing that matters this week is that day 4 also happens.";
  if(F.drift>2) return "Ahead by "+F.drift+" days. Spend it on the red topics, not on opening new material early.";
  return "Nothing is on fire. Do the next block.";
}

/* Coach as a separate tab was vague — a place you had to remember to visit,
   holding advice about work happening elsewhere. It is now one line wherever
   the relevant work actually is: the single most useful thing the app can say
   about THIS screen, plus a button that hands the right summary to Claude.
   Four contexts, four different asks. */
/* Between-block encouragement. Deliberately grounded in the numbers rather
   than generic hype: a trainer who knows your actual set count is worth more
   than one shouting. Rotates on a 20-minute clock so it changes as you work
   through a block, and every line is either a fact about today or a fact
   about the run you are on.
   Kept honest on purpose \u2014 nothing here claims a bad day was good. On a day
   with nothing done it says so plainly and points at the smallest next step,
   because false cheer from an app you built yourself is not motivating. */
function trainerLine(){
  var t=todayISO(), entry=plan.byDate[activeDate()], r=recFor(activeDate());
  var sk=streakDays();
  var b=progressBreakdown();
  var pct=b.all.total? b.all.done/b.all.total*100 : 0;
  var wb=(entry&&entry.blocks)?entry.blocks.filter(function(x){
    return ["lunch","buffer","protected"].indexOf(x.kind)<0; }):[];
  var done=0;
  wb.forEach(function(x){
    var sd=x.foldedFrom||activeDate(), sk2=x.foldedFrom?x.foldedBlockId:x.i;
    var sr=x.foldedFrom?(state.days[sd]||{}):r;
    if((sr.checks||{})[sk2]===true) done++;
  });
  var lines=[];
  if(!wb.length) lines.push("Nothing scheduled today. Rest counts \u2014 the spacing does its work while you are away from it.");
  else if(done===0) lines.push("Nothing ticked yet. One block. That is the whole ask right now.");
  else if(done===wb.length) lines.push("All "+wb.length+" done. Stop here \u2014 more today borrows from tomorrow.");
  else {
    lines.push(done+" of "+wb.length+" done. "+(wb.length-done)+" to go.");
    lines.push("You are past the hard part of starting. Keep the next one short and specific.");
    if(done>=Math.ceil(wb.length/2)) lines.push("Over halfway through the day. The back half is usually easier than it looks from here.");
  }
  if(sk.n>1) lines.push(sk.n+" days in a row. Consistency is the whole mechanism \u2014 it beats any single long day.");
  if(pct>0) lines.push(pct.toFixed(1)+"% of the syllabus behind you. It only goes one direction.");
  var logged=Object.keys(state.mcq||{}).length;
  if(logged>0) lines.push(logged+" questions logged. Every one is data the plan adapts to.");
  /* Reactive rather than a fixed 20-minute rotation: a message keyed to
     whether a block has ACTUALLY gone stale, or you have been in the same
     block long enough that a break would help, not one that changes on a
     clock regardless of what is happening. Takes priority over the rotating
     lines above when it applies, since it is more specific to right now
     than any of them. */
  if(wb.length && done<wb.length && state.lastActivityAt){
    var idleMin=(Date.now()-state.lastActivityAt)/60000;
    if(idleMin>=90) return "Been over an hour and a half since the last tick. If you are still working, that is fine \u2014 but check you have not drifted off the block entirely.";
    if(idleMin>=20) return Math.round(idleMin)+" minutes since the last tick. Worth checking whether you are still on this block or have quietly wandered.";
  }
  var slot=Math.floor(Date.now()/(20*60*1000));
  return lines[slot % lines.length];
}
function aiStrip(where){
  var F=coachFacts();
  var line, btn, label;
  if(where==="today"){
    line = pushLine(F);
    btn="cCopy"; label="Ask about this week";
  } else if(where==="log"){
    var w=F.weak && F.weak.length ? F.weak[0] : null;
    line = F.repeatMisses && F.repeatMisses.length
      ? F.repeatMisses.length+" question(s) keep coming back wrong \u2014 log those topics first."
      : (w && w.acc<0.6 ? SM.CURRICULUM[w.ti].n+" is your weakest at "+Math.round(w.acc*100)+"%. Worth more questions there."
                        : "Log every question, right and wrong. The right ones matter just as much.");
    btn="cDebrief"; label="Ask about today";
  } else if(where==="revise"){
    line = F.overdue ? F.overdue+" question(s) are due to redo. Those come before new ones."
                     : "Nothing due. Redo items appear here after you log a wrong answer.";
    btn="cDebrief"; label="Ask what to redo";
  } else {
    /* This read "Plan looks workable" on a campaign the engine had already
       measured as 120 hours short, because it consulted drift and nothing else.
       F.fits and F.deficitH are computed at the top of this file and were
       simply never used here. Being behind and not fitting are different
       problems: drift is recoverable by rebuilding, a deficit is not. */
    line = F.drift<-2 ? "You are "+Math.abs(F.drift)+" days behind. The plan can be rebuilt from today."
         : (F.fits===false && F.deficitH>0)
                      ? F.deficitH+"h more work than the days before the exam hold. The levers are below \u2014 nothing is chosen for you."
                      : "Plan looks workable. Swap any day if a topic suits you better.";
    btn="cCopy"; label="Ask about the plan";
  }
  var extra="";
  if(where==="today"){
    /* The ranked findings survived the Coach tab's removal as a function with
       no display. They are the app's single most useful output — what is
       actually costing marks, in order — so they belong under the day's task,
       shown only when there is something worth saying. */
    var find=coachFindings(F).slice(0,3);
    if(find.length)
      extra='<details style="margin-top:8px"><summary class="muted sm" style="cursor:pointer">What to fix \u25be</summary>'+
        find.map(function(f){
          return '<div class="trow"><div class="lbl sm">'+esc(f.h)+'</div>'+
            '<div class="muted sm">'+esc(f.b)+'</div></div>'; }).join("")+'</details>';
  }
  /* "Why is this scheduled now" \u2014 lets the AI explain the plan's reasoning
     rather than only report on it. Only offered on Today, and only when a
     topic is actually scheduled, since there is nothing to explain on a rest
     day or an out-of-plan date. */
  var entryHere=plan.byDate[activeDate()];
  var whyBtn = (where==="today" && entryHere && entryHere.slots && entryHere.slots.length)
    ? '<button class="btn sm" id="cWhy">'+(coachDraft.whyCopied?"Copied \u2014 now paste":"Why this, now?")+'</button>' : "";
  return card(extra+
    (where==="today"?'<p class="sm" style="margin-bottom:8px"><b>'+esc(trainerLine())+'</b></p>':'')+
    '<div class="row-top"><span class="eyebrow sky">Claude</span>'+
    '<div class="btnrow" style="gap:6px"><button class="btn sm" id="'+btn+'">'+esc(label)+'</button>'+whyBtn+'</div></div>'+
    '<p class="sm" style="margin-top:6px">'+esc(line)+'</p>');
}
var coachDraft={copied:false,copyFailed:false,shareErr:"",debriefed:false,whyCopied:false,stuckCopied:false};
function coachPayload(){
  var F=coachFacts();
  return { day:F.dayNo, of:F.days, phase:F.phase, daysDone:F.done, daysDue:F.due, driftDays:F.drift,
    arrearsBlocks:F.arrears.length, arrearsMinutes:F.arrearsMin,
    attempts:F.att, accuracy:F.acc, confidentAttempts:F.confident, confidentWrong:F.confidentWrong,
    openRepairs:F.open, overdueRepairs:F.overdue, retired:F.retired,
    errorCounts:F.errors, empathyDays:F.empathyDays,
    weakest:F.weak.map(function(w){ return {topic:SM.CURRICULUM[w.ti].n, accuracy:w.acc, attempts:w.n}; }),
    /* The per-question ledger, not just aggregate scores \u2014 this is what lets an
       external conversation reason about specific recurring gaps ("this exact
       question, three subtopics, one dominant error type") instead of only a
       topic-level accuracy percentage. */
    questionsLogged:Object.keys(state.mcq||{}).length,
    repeatMisses:F.repeatMisses.map(function(q){ return {
      app:q.app, topic:SM.CURRICULUM[q.topicId].n,
      subtopic:q.subtopic, number:q.number, timesWrong:q.attempts.filter(function(a){return a.outcome==="wrong";}).length,
      attempts:q.attempts.length }; }),
    regressions:F.regressions.map(function(q){ return {
      app:q.app, topic:SM.CURRICULUM[q.topicId].n,
      subtopic:q.subtopic, number:q.number }; }),
    targetGapHours:F.deficitH,
    hardRules:"seven phases in order, three passes over all 13,729 questions, no exceptions" };
}
/* A ready-to-send message, not a bare JSON blob \u2014 the point is that pasting
   this into any Claude chat with no further typing gets a real weekly review. */
function coachCopyText(){
  return "I use a self-built exam-prep scheduler called Dakshinamurthy. Here is my current performance data as JSON. "+
    "Give me a short, honest weekly review: what is actually going well, the single biggest problem, and one thing to change next week. "+
    "Hard rules that cannot be relaxed: seven phases in strict order, three passes over every question, no exceptions.\n\n"+
    JSON.stringify(coachPayload(),null,2);
}
/* Today's own data, not the campaign-wide summary — what actually happened
   today, specifically, including which logged questions were wrong today by
   name, so a debrief can be concrete ("this exact question") rather than a
   smaller version of the weekly review. */
function coachDebriefPayload(){
  var date=activeDate();
  var todayCalib=(state.calib||[]).filter(function(c){ return c.d===date; });
  var entry=plan.byDate[date], r=recFor(date);
  var wb=(entry&&entry.blocks)?entry.blocks.filter(function(b){ return ["lunch","buffer","protected"].indexOf(b.kind)<0; }):[];
  function checkFor(b){
    var sd=b.foldedFrom||date, sk=b.foldedFrom?b.foldedBlockId:b.i;
    var sr=b.foldedFrom?(state.days[sd]||{}):r;
    return (sr.checks||{})[sk];
  }
  var done=wb.filter(function(b){ return checkFor(b)===true; }).length;
  var half=wb.filter(function(b){ return checkFor(b)===0.5; }).length;
  var wrongToday=[];
  Object.keys(state.mcq||{}).forEach(function(k){
    var q=state.mcq[k];
    q.attempts.forEach(function(a){
      if(a.d===date && a.outcome==="wrong")
        wrongToday.push({ topic:SM.CURRICULUM[q.topicId].n, subtopic:q.subtopic, number:q.number, reason:a.reason });
    });
  });
  var F=coachFacts();
  return { date:date, blocksPlanned:wb.length, blocksDone:done, blocksHalfDone:half,
    blocksMissed:Math.max(0,wb.length-done-half), questionsLoggedToday:todayCalib.length,
    rightToday:todayCalib.filter(function(c){ return c.ok; }).length,
    wrongToday:todayCalib.filter(function(c){ return !c.ok; }).length,
    wrongQuestionsToday:wrongToday, arrearsCarriedIn:F.arrears.length, driftDays:F.drift,
    hardRules:"seven phases in order, three passes over all 13,729 questions, no exceptions" };
}
/* "Why is this scheduled now" \u2014 turns the AI into someone explaining the
   plan's own reasoning rather than only cheering it on. Hands Claude the
   actual structural facts (phase order, what today\u2019s topics build on, what
   comes after) rather than asking Claude to guess at a scheduler it cannot
   see. */
function whyScheduledText(){
  var entry=plan.byDate[activeDate()];
  var slots=(entry&&entry.slots)||[];
  var topics=slots.map(function(sl){ return SM.CURRICULUM[sl.ti]; });
  var upcoming=[];
  for(var i=0;i<plan.content.length && upcoming.length<3;i++){
    var c=plan.content[i]; if(c.date<=activeDate()||!c.slots) continue;
    c.slots.forEach(function(sl){ if(upcoming.length<3) upcoming.push(SM.CURRICULUM[sl.ti].n); });
  }
  return "I use a self-built exam-prep scheduler called Dakshinamurthy, ordered by exam blueprint weight within seven fixed phases "+
    "(earlier phases are prerequisite anatomy/physiology, later ones build on them; the order cannot be freely reordered without the app allowing an explicit swap). "+
    "Today's topic(s): "+(topics.map(function(t){return t.n+" (phase "+t.phase+")";}).join(", ")||"none scheduled")+". "+
    "Coming up next: "+(upcoming.join(", ")||"end of syllabus")+". "+
    "In plain terms, explain why THIS is a sensible place for today's topic(s) in a surgical curriculum \u2014 "+
    "what it depends on that should already be covered, and what it sets up for later. Keep it to a few sentences.";
}
/* "I'm stuck" \u2014 real tutoring on a specific topic, not motivation. Hands
   Claude the topic and the actual recent wrong answers logged against it,
   so the question is answerable rather than generic. */
function stuckText(ti){
  var t=SM.CURRICULUM[ti];
  var wrongs=[];
  Object.keys(state.mcq||{}).forEach(function(k){
    var q=state.mcq[k]; if(q.topicId!==ti) return;
    q.attempts.forEach(function(a){ if(a.outcome==="wrong") wrongs.push(a); });
  });
  wrongs.sort(function(a,b){return b.t-a.t;});
  var recent=wrongs.slice(0,6).map(function(a){
    return "- "+(a.reason?reasonLabel(a.reason):"wrong")+(a.chose?" (chose: "+a.chose+")":"");
  });
  return "I am stuck on "+t.n+" in a self-built surgical exam-prep app. "+
    (recent.length? "My recent wrong answers on this topic, by the reason logged for each:\n"+recent.join("\n")+"\n\n" : "") +
    "Explain "+t.n+" from the basics, as if I am starting fresh on it, and if my logged mistakes above suggest a specific misunderstanding, address that directly.";
}
function coachDebriefText(){
  return "I use a self-built exam-prep scheduler called Dakshinamurthy. Here is today's data as JSON. "+
    "Give me a short end-of-day debrief: what I accomplished, what I missed and why that might be, "+
    "and the one thing that matters most tomorrow.\n\n"+
    JSON.stringify(coachDebriefPayload(),null,2);
}

/* Moved here from Plan so target and exam dates live on Today, where the
   day-to-day decisions actually get made. */
/* What date would this actually fit into, without sleep loss? The answer is
   arithmetic, so the app can compute it rather than leaving you to guess and
   re-check by hand. Deliberately does NOT auto-apply: the INI-SS date is set
   by AIIMS, not by you, so a date that makes the schedule comfortable is only
   useful as information — either the real exam is later than the estimate
   here, or this is the gap you are choosing to absorb some other way. */
function fitDateCard(){
  var P=state.prefs, ex=SM.sortedExams(P);
  var ini=ex.filter(function(e){return e.style==="ini";})[0];
  if(!ini) return "";
  var cur=plan.content.filter(function(c){return c.pastBed>0;});
  if(!cur.length) return "";
  var found=null, probe=SM.fromISO(ini.iso);
  for(var wk=1; wk<=16 && !found; wk++){
    var d=new Date(probe.getTime()+wk*7*SM.DAY);
    var iso=SM.iso(d);
    var P2={}; for(var k in P) P2[k]=P[k];
    P2.exams=P.exams.map(function(e){ return e.style==="ini"?{style:"ini",iso:iso}:e; });
    var pl2;
    try{ pl2=SM.buildPlan(P2); }catch(e){ continue; }
    if(!pl2.content.filter(function(c){return c.pastBed>0;}).length) found={iso:iso, days:pl2.content.length};
  }
  if(!found) return "";
  var extra=SM.daysBetween(ini.iso,found.iso);
  return card('<div class="eyebrow">What would make this fit</div>'+
    '<p class="sm">With the target at '+esc(SM.pretty(ini.iso))+', '+cur.length+' days run past bedtime. '+
    'The whole syllabus fits with no sleep loss at all if the target is '+esc(SM.pretty(found.iso))+
    ' \u2014 '+extra+' days later, '+found.days+' study days instead of '+plan.content.length+'.</p>'+
    '<p class="muted sm">Shown as information, not applied. The INI-SS date is set by AIIMS, not by you \u2014 so this is only actionable if the real date is later than the estimate above, or if you are choosing between a later sitting and absorbing the difference. Edit the date above to see any option costed the same way.</p>',null);
}
/* Measured, not asserted: how long each phase sits untouched before the exam,
   next to how much that phase is worth. Under strict phase-lock these come out
   inverted \u2014 the highest-yield GI material goes coldest longest. Worth showing
   because the fix is NOT a scheduling tweak: relocating third-pass work into
   the back of the campaign was built and tested, and moved almost nothing,
   because the back third already averages more work than a day holds. With no
   slack anywhere, recency and sleep are the same problem wearing two faces. */
function recencyCard(){
  var ex=SM.sortedExams(state.prefs), ini=ex.filter(function(e){return e.style==="ini";})[0];
  if(!ini) return "";
  var last={};
  plan.content.forEach(function(c){ c.blocks.forEach(function(b){
    if(b.ti==null) return;
    var ph=SM.CURRICULUM[b.ti].phase;
    if(!last[ph]||c.date>last[ph]) last[ph]=c.date; }); });
  var rows=[1,2,3,4,5,6,7].filter(function(ph){return last[ph];}).map(function(ph){
    var gap=SM.daysBetween(last[ph],ini.iso);
    var ts=SM.CURRICULUM.filter(function(t){return t.phase===ph;});
    var hi=ts.filter(function(t){return t.yINI===2;}).length;
    var tone = gap>150 && hi/ts.length>=0.5 ? "rust" : (gap>150?"amber":"muted");
    return '<div class="row-top"><span class="sm">'+ph+'. '+esc((SM.PHASE_NAME[ph]||""))+'</span>'+
      '<span class="'+tone+' sm">'+Math.max(0,gap)+'d cold \u00b7 '+hi+'/'+ts.length+' high-yield</span></div>';
  }).join("");
  return card('<div class="eyebrow amber">Which topics go cold</div>'+rows+
    '<p class="muted sm">Days between a phase last being studied and the exam, against how much of it is high-yield. Under strict phase order these run backwards: the best GI material goes cold longest.</p>'+
    '<p class="muted sm">This is not fixable by rearranging. Moving third-pass work later was built and measured \u2014 it relocated almost nothing, because the back of the campaign is already fuller than a day holds. More days, or less work per question through mastery-based retirement, are the only two things that change it.</p>',"amber");
}
function examCard(hoisted){
  var P=plan.P, ex=SM.sortedExams(P);
  var out=hoisted ? "" : feasCard(true);
  out+='<div class="eyebrow">Both papers</div>';
  out+=card(ex.map(function(e,i){
      var s=SM.STYLES[e.style];
      var pre=plan.content.filter(function(c){return c.date<e.iso;}).length;
      return '<div class="exr"><div class="row-top"><span class="lbl">'+s.label+'</span>'+
        '<span class="muted sm">'+SM.pretty(e.iso)+'</span></div>'+
        '<div class="muted sm">'+s.q+' questions in '+s.mins+' min &middot; '+
        SM.paceTarget(s)+' s each &middot; penalty '+(s.penalty===0.25?"1/4":"1/3")+' &middot; blind guess '+
        (SM.blindEV(s)>0.001?"+"+SM.blindEV(s).toFixed(2):"0.00")+'</div>'+
        '<div class="muted sm">'+s.note+'</div>'+
        '<div class="muted sm drape">'+pre+' of '+plan.content.length+' content days ('+
        Math.round(pre/plan.content.length*100)+'%) fall before it.</div>'+
        '<div class="btnrow"><input type="date" data-exam="'+i+'" aria-label="Exam date" value="'+e.iso+'"></div></div>';
    }).join("")+
    '<p class="muted sm">Both dates are editable above. Spacing anchors to whichever paper is next. Content that does not fit is not dropped \u2014 it is scheduled past the exam, which is what the panel above is measuring. Yield weighting follows the same switch: general-surgery breadth leads before NEET-SS, GI depth after.</p>');
  return out;
}

var replanPreview=null, replanErr="";
/* Preview, then commit \u2014 not a one-tap action. Rebuilding the calendar is a
   large enough change that seeing the before/after first matters more than
   saving a second tap, and the undo path only clears the anchor, so it never
   needs to reconstruct the original algorithmic schedule from scratch. */
/* The schedule you can actually edit. Today's Now card lets you change today;
   this is the same swap across the next fortnight, so a week can be arranged
   around a rota or a bad stretch rather than only the day in front of you.
   Uses the identical swap mechanism — two whole slots trading places, which
   conserves every question by construction. */
/* 14 near-identical rows, all expanded, was the complexity \u2014 not the word
   count. Most visits do not involve changing anything; a list built for the
   rare edit was the default view for the common "just glance ahead" one.
   Now shows the next 3 days plainly, with the full fortnight \u2014 where the
   actual editing happens \u2014 one tap away instead of the whole scroll. */
function scheduleRow(c,t){
  var names=(c.slots||[]).map(function(sl){return SM.CURRICULUM[sl.ti].n;});
  var isOpen=(swapOpen===c.date);
  var head='<div class="row-top" style="margin-top:8px">'+
    '<span class="sm">'+esc(SM.shortDate(c.date))+(c.date===t?' \u00b7 today':'')+'</span>'+
    '<button class="btn sm" data-swapopen="'+esc(c.date)+'">'+(isOpen?"Close":"Change")+'</button></div>'+
    '<div class="muted sm">'+esc(names.join(" + ")||"\u2014")+'</div>';
  if(!isOpen) return head;
  var cands=swapCandidates(c.date);
  if(!cands.length) return head+'<p class="muted sm">Nothing later to swap with.</p>';
  var curPh=Math.max.apply(null,(c.slots||[]).map(function(x){return SM.CURRICULUM[x.ti].phase;}).concat([0]));
  return head+'<div class="btnrow" style="flex-wrap:wrap;margin-top:6px">'+
    cands.map(function(cd){
      var ph=SM.CURRICULUM[cd.ti].phase;
      return '<button class="btn sm" data-swap="'+esc(c.date)+'|0|'+esc(cd.d)+'|'+cd.i+'">'+
        esc(SM.CURRICULUM[cd.ti].n)+(ph>curPh?' \u2197':'')+'</button>';
    }).join("")+'</div>';
}
function scheduleEditor(){
  var t=todayISO();
  var days=plan.content.filter(function(c){return c.date>=t;}).slice(0,14);
  if(!days.length) return "";
  var soon=days.slice(0,3).map(function(c){ return scheduleRow(c,t); }).join("");
  var rest=days.slice(3);
  var note='<p class="muted sm" style="margin-top:10px">Swapping trades two days\u2019 work, so nothing is skipped or repeated. \u2197 marks a later phase \u2014 allowed, but you meet it before the ground it builds on.</p>'+
    ((state.swaps||[]).length?'<div class="btnrow"><button class="btn sm'+(armed==="swapclear"?" solid":"")+'" data-swapclear="1">'+
      (armed==="swapclear"?"Tap again to undo all "+state.swaps.length:"Undo all "+state.swaps.length+" swap"+(state.swaps.length===1?"":"s"))+
      '</button></div>':'');
  if(!rest.length) return card('<div class="eyebrow">Next few days</div>'+soon+note);
  return card('<div class="eyebrow">Next few days</div>'+soon+
    '<details style="margin-top:8px"><summary class="muted sm" style="cursor:pointer">See all '+days.length+' days, swap any of them \u25be</summary>'+
    rest.map(function(c){ return scheduleRow(c,t); }).join("")+note+'</details>');
}
function replanCard(){
  if(state.replan && state.replan.asOf){
    return card('<div class="eyebrow amber">Replanned</div>'+
      '<p class="sm">Running from '+esc(SM.pretty(state.replan.asOf))+
      ' with completed work excluded. Finishes '+esc(SM.pretty(plan.finish))+'.</p>'+
      '<div class="btnrow"><button class="btn f1" id="replanUndo">Undo \u2014 back to the original schedule</button></div>',
      "amber");
  }
  var out='<div class="eyebrow">Re-plan from today</div>';
  if(!replanPreview){
    out+=card('<p class="muted sm">Rebuilds the calendar from today forward using only what is actually left \u2014 every completed block excluded, a half-done block credited at half. Phase order and the three-pass rule are untouched; this only repacks work the engine already sized, it does not re-decide how much any topic needs.</p>'+
      '<div class="btnrow"><button class="btn f1" id="replanPreview">Preview</button></div>'+
      (replanErr?'<p class="sm rust">'+esc(replanErr)+'</p>':''));
  } else {
    var r=replanPreview, oldFinish=plan.finish, oldDays=plan.content.length;
    out+=card('<div class="g2 mb">'+
      '<div><div class="muted sm">Current finish</div><div class="lbl">'+esc(SM.pretty(oldFinish))+'</div></div>'+
      '<div><div class="muted sm">Replanned finish</div><div class="lbl'+(r.finish<oldFinish?" drape":r.finish>oldFinish?" amber":"")+'">'+esc(SM.pretty(r.finish))+'</div></div>'+
      '</div>'+
      '<p class="muted sm">'+r.content.length+' days remain from '+esc(SM.pretty(r.asOf))+
      ' (was '+oldDays+' from the original start), '+Math.round(r.remainingMin/60)+' hours of real work.</p>'+
      (r.shortBy>0?'<p class="sm amber">'+r.shortBy+' block(s) could not be placed and were dropped from this preview \u2014 apply is disabled until this is fixed.</p>':'')+
      '<div class="btnrow"><button class="btn solid f1" id="replanApply"'+(r.shortBy>0?" disabled":"")+'>Apply</button>'+
      '<button class="btn f1" id="replanCancel">Cancel</button></div>');
  }
  return out;
}

function renderPlan(){
  var P=plan.P, B=plan.B;
  var out=aiStrip("plan");
  /* The feasibility panel — how many hours short the campaign runs against the
     target date — used to render inside examCard(), inside a collapsed "About
     this plan" disclosure, below five other cards. A measured deficit is the
     most consequential number on the screen; it opens the screen now. When the
     plan does fit, it stays inside with the rest of the reference material. */
  var feasTop = SM.feasibility(prefsWithAcc());
  var hoistFeas = !!(feasTop && !feasTop.fits && feasTop.exam.iso>=todayISO());
  if(hoistFeas) out+=feasCard(true);
  /* Plan was 600 words across 8 sections. Only two of them are things you DO:
     swap a day, or rebuild the plan. The rest — exam dates, coverage totals,
     phase order, check-in days — is reference you read once and never again.
     Reference now lives behind one disclosure so the page opens on actions. */
  /* On Schedule the calendar is the point of the tab, so it opens expanded.
     On Today and Practise it is reference and stays collapsed. */
  out+=allocDonut(remainingBlocks(),"Time left, by activity","Everything still ahead of you. Shrinks as your accuracy data arrives and analysis time is booked against what you actually get wrong.");
  out+=topicLoadCard();
  out+=monthCal(activeDate());
  out+=scheduleEditor();
  out+=replanCard();
  out+='<details class="coachMore"><summary class="eyebrow" style="cursor:pointer">About this plan \u25be</summary>';
  out+=examCard(hoistFeas);
  var lateDays=plan.content.filter(function(c){return c.endMin>1439;}).length;
  var ends=plan.content.map(function(c){return c.endMin;}).sort(function(a,b){return a-b;});
  var medEnd=ends.length?ends[Math.floor(ends.length/2)]:0;
  var clock=function(m){ return SM.hhmm(m%1440)+(m>=1440?" next day":""); };
  var fits=B.shortfall<=0;
  /* This card used to report "days ending past midnight", which counted the
     evening wind-down block finishing at midnight by design and so read 170
     of 170 — technically true, entirely uninformative. What matters is when
     WORK ends: pastBed is minutes of study scheduled after bedtime, i.e.
     sleep actually lost. */
  var overDays=plan.content.filter(function(c){return c.pastBed>0;});
  var overMins=overDays.map(function(c){return c.pastBed;}).sort(function(a,b){return a-b;});
  var medOver=overMins.length?overMins[Math.floor(overMins.length/2)]:0;
  var totalOver=overMins.reduce(function(a,b){return a+b;},0);
  /* workEnd, not endMin: endMin includes the fixed evening wind-down that
     always finishes at bedtime by design, so it reads 00:00 on every single
     day and tells you nothing. */
  var wEnds=plan.content.map(function(c){return c.workEnd;}).sort(function(a,b){return a-b;});
  var medWorkEnd=wEnds.length?wEnds[Math.floor(wEnds.length/2)]:0;
  out+='<div class="eyebrow">Will this plan work?</div>';
  out+=card('<div class="eyebrow">Are the days too long?</div>'+
    '<div class="row-top"><span class="lbl">Median day\u2019s work ends</span><span class="muted sm">'+clock(medWorkEnd)+'</span></div>'+
    '<div class="row-top"><span class="lbl">Days running past bedtime</span><span class="'+
    (overDays.length>0?"amber":"muted")+' sm">'+overDays.length+' of '+plan.content.length+
    (overDays.length?' \u00b7 '+Math.round(overDays.length/plan.content.length*100)+'%':'')+'</span></div>'+
    (overDays.length?'<div class="row-top"><span class="lbl">Typical overrun</span><span class="muted sm">'+medOver+' min \u00b7 '+Math.round(totalOver/60)+'h total</span></div>':'')+
    (overDays.length?'<p class="muted sm">These are days where the syllabus genuinely does not fit the hours, not a layout quirk \u2014 the leveller moves whole topics between days, and when every nearby day is already full there is nowhere for one to go. The honest options are a later target date, or accepting Empathy days on some of these rather than the sleep loss. Nothing here silently steals the time; it is shown so the choice stays yours.</p>':'<p class="muted sm">Every day\u2019s work finishes before bedtime.</p>')+
    (overDays.length?dayLoadChart():''));

  /* Sleep-in-practice, what-would-make-this-fit and recency-vs-yield were
     three separate cards all answering one question: does this schedule
     actually work? Collapsed into one disclosure so Plan opens on the
     schedule rather than on three panels of diagnostics. */
  out+=fitDateCard();
  out+=recencyCard();

  out+=card('<div class="eyebrow drape">Everything is covered</div>'+
    '<div class="g3 mb">'+
    '<div><div class="big2 drape">679</div><div class="muted sm">lectures, all of them</div></div>'+
    '<div><div class="big2 drape">13,729</div><div class="muted sm">questions, all of them</div></div>'+
    '<div><div class="big2">'+B.passes+'\u00d7</div><div class="muted sm">spaced passes</div></div></div>'+
    '<p class="muted sm">Every lecture and every question, worked '+B.passes+
    ' times on an expanding gap. Repeat passes are priced faster ('+
    Math.round(100/1.25)+'% then '+Math.round(100*0.7/1.25)+'% of first-pass time) and need less write-up, '+
    'because fewer are wrong each time.</p>'+
    '<div class="g3 topline">'+
    '<div><div class="big3">'+Math.round(B.Lw/60)+'h</div><div class="muted sm">lectures</div></div>'+
    '<div><div class="big3">'+Math.round(B.Qw/60)+'h</div><div class="muted sm">attempting</div></div>'+
    '<div><div class="big3">'+Math.round(B.A/60)+'h</div><div class="muted sm">reviewing misses</div></div></div>'+
    '<p class="muted sm">'+Math.round(B.Tm/60)+' h in total, over '+plan.content.length+
    ' content days \u2014 the end date follows the work rather than the reverse.</p>',"drape");

  var PN=SM.PHASE_NAME;
  var pFirst={},pLast={},pCnt={};
  /* A replanned day has no .slots \u2014 derive the same first/last-date tracking
     from the day's blocks by topic instead, so this section degrades to the
     same information rather than throwing. */
  plan.content.forEach(function(c){
    if(c.slots && c.slots.length){
      c.slots.forEach(function(s){
        var ph=SM.CURRICULUM[s.ti].phase;
        if(pFirst[ph]===undefined) pFirst[ph]=c.date;
        pLast[ph]=c.date; pCnt[ph]=(pCnt[ph]||0)+1;
      });
    } else {
      var seen={};
      (c.blocks||[]).forEach(function(b){
        if(b.ti==null || seen[b.ti]) return; seen[b.ti]=1;
        var ph=SM.CURRICULUM[b.ti].phase;
        if(pFirst[ph]===undefined) pFirst[ph]=c.date;
        pLast[ph]=c.date; pCnt[ph]=(pCnt[ph]||0)+1;
      });
    }
  });
  out+=card('<div class="eyebrow">What comes when</div>'+
    [1,2,3,4,5,6,7].map(function(k){
      var n=SM.CURRICULUM.filter(function(t){return t.phase===k;}).length;
      return '<div class="trow"><div class="row-top"><span class="lbl">'+k+'. '+esc(PN[k]||("Phase "+k))+'</span>'+
        '<span class="pillq">'+n+' topics</span></div>'+
        '<div class="muted sm">'+(pFirst[k]?SM.shortDate(pFirst[k])+' \u2192 '+SM.shortDate(pLast[k]):'\u2014')+'</div></div>';
    }).join("")+
    '<p class="muted sm">Strictly sequential: nothing from a later phase starts until every topic in the current one is finished. '+
    'Inside a phase the topics still interleave, because telling look-alikes apart is exactly what the paper tests.</p>'+
    '<p class="muted sm">Second and third passes are held back rather than following straight on, so the spacing is real.</p>');

  out+=card('<div class="eyebrow">Check-in days</div>'+
    '<p class="muted sm">Every '+P.correctEvery+' content days the schedule stops for one: read the numbers, '+
    'decide whether you are ahead or behind in days, then change exactly one thing. '+
    plan.CAL.filter(function(c){return c.kind==="correct";}).length+' of them across the campaign.</p>');

  /* The full 39-topic list is reference material, not something read on a
     normal visit — it was roughly half of Plan's rendered weight. */
  out+='<div class="eyebrow">All '+B.topics.length+' topics</div>';
  [1,2,3,4,5,6,7].forEach(function(ph){
    out+='<div class="eyebrow">'+ph+'. '+esc(SM.PHASE_NAME[ph]||("Phase "+ph))+'</div>';
    out+=card(B.topics.filter(function(t){return t.phase===ph;}).map(function(t){
      var a=topicAcc(t.i);
      return '<div class="trow"><div class="row-top"><span class="lbl">'+esc(t.n)+'</span>'+
        '<span class="ydot" style="background:'+accColour(a)+'"></span></div>'+
        '<div class="muted sm">'+t.nlec+' lec &middot; '+Math.floor(t.lecmin/60)+'h '+(t.lecmin%60)+'m &middot; '+
        t.dtq.toLocaleString()+' bank'+(t.spq?' &middot; '+t.spq+' speed':'')+'</div>'+
        '<div class="muted sm">'+
        (t.nlec>0?('all '+t.nlec+' lectures · '):'')+
        (t.dtq+t.spq).toLocaleString()+' questions ×'+B.passes+' passes</div></div>';
    }).join(""));
  });
  out+='</details>';   /* closes "About this plan" */
  return out;
}

/* Settings: everything you set once and rarely revisit, moved off Plan so the
   schedule page is about the schedule. Plan was carrying 25k characters of
   rendered content — pacing controls, calendar export, tone toggle and the
   full topic list all in one scroll — which is the clutter, not any single
   card in it. */
function renderSettings(){
  var P=plan.P, B=plan.B;
  var out="";
  var vm=state.visualMode||"focus";
  out+=card('<div class="row-top"><span class="lbl">Visual mode</span><span class="muted sm">Reading comfort</span></div>'+
    '<p class="muted sm">Focus keeps the SurgiMaster maroon identity strong. Study switches long reading and MCQs to a warm-ivory surface. Night lowers intensity for late sessions.</p>'+
    '<div class="sm-v16-modes">'+
      '<button class="sm-v16-mode'+(vm==="focus"?" on":"")+'" data-visual-mode="focus">Focus<span>Dashboard</span></button>'+
      '<button class="sm-v16-mode'+(vm==="study"?" on":"")+'" data-visual-mode="study">Study<span>Reading</span></button>'+
      '<button class="sm-v16-mode'+(vm==="night"?" on":"")+'" data-visual-mode="night">Night<span>Low light</span></button>'+
    '</div>'+
    '<div class="sm-v16-reading-note">✦ Gold is reserved for progress and action; green/amber/red remain status signals. The reading surface is deliberately calmer than the dashboard.</div>',"drape");
  out+=card('<div class="row-top"><span class="lbl">Default day</span>'+
    '<button class="btn sm'+(P.defaultLayer==="empathy"?" solid":"")+'" id="cDefLayer">'+
    (P.defaultLayer==="empathy"?"Empathy \u00b7 7h15m":"Normal \u00b7 9h15m")+'</button></div>'+
    '<p class="muted sm">Which day you get unless you switch it that morning. Empathy is the sensible default when returning after a gap \u2014 7h15m is still a serious day, and a plan that assumes 9h15m from a standing start tends to break in week two. Change it whenever the shorter day starts feeling too easy.</p>');
  out+=card('<div class="row-top"><span class="lbl">Diagnostic window</span>'+
    '<button class="btn sm'+(P.diagnosticDays?" solid":"")+'" id="cDiag">'+
    (P.diagnosticDays?P.diagnosticDays+" days":"Off")+'</button></div>'+
    '<p class="muted sm">While this is on, Today hides ahead/behind and the target-date panel. Those are computed from data that does not exist yet in the first weeks, so early on they measure how recently you started rather than how you are doing. Everything is still tracked underneath \u2014 only the pressure is hidden. Tap to cycle 14 / 28 / off.</p>');
  out+=card('<div class="row-top"><span class="lbl">Gentle Coach tone</span>'+
    '<button class="btn sm'+(P.gentleMode?" solid":"")+'" id="cGentle">'+(P.gentleMode?"On":"Off")+'</button></div>'+
    '<p class="muted sm">Softer wording throughout Coach \u2014 arrears, confidence gaps, the daily line \u2014 and a "starting fresh" note for the first week. Nothing about the schedule itself changes; the pace, the three passes, the seven phases all stay the same.</p>');

  function row(label,val,note,ctrl){
    return '<div class="prow"><div class="row-top"><div class="lbl">'+label+'</div><div class="ctl">'+
      (val?'<span class="val">'+val+'</span>':"")+ctrl+'</div></div>'+
      (note?'<div class="muted sm">'+note+'</div>':"")+'</div>';
  }
  function step(k,d){ return '<button class="btn sm" data-set="'+k+'" data-d="'+(-d)+'" aria-label="Decrease">&minus;</button>'+
    '<button class="btn sm" data-set="'+k+'" data-d="'+d+'" aria-label="Increase">+</button>'; }
  var pc="";
  pc+=row("Hours a day","",(P.dailyHours*60-P.dayBuffer)+" min scheduled plus a "+P.dayBuffer+"-min buffer.",
    '<span class="val">'+P.dailyHours.toFixed(1)+'</span>'+step("dailyHours",0.5));
  pc+=row("Playback speed","","449 h 29 min of video becomes "+Math.round(B.Lw/60)+" h at this speed.",
    '<span class="val">'+P.playback.toFixed(2)+'\u00d7</span>'+step("playback",0.25));
  pc+=row("Pause &amp; note padding","","Separate from playback; the two multiply.",
    '<span class="val">'+P.pad.toFixed(2)+'\u00d7</span>'+step("pad",0.05));
  pc+=row("Minutes per bank question","",B.totalQ.toLocaleString()+" questions in total.",
    '<span class="val">'+P.bankPace.toFixed(1)+'</span>'+step("bankPace",0.1));
  pc+=row("Share on lectures","","The rest goes to questions, review and repair.",
    '<span class="val">'+Math.round(P.lectureShare*100)+'%</span>'+step("lectureShare",0.02));
  pc+=row("Daily buffer","","Protected slack, carved out before the split.",
    '<span class="val">'+P.dayBuffer+'m</span>'+step("dayBuffer",15));
  pc+=row("Gym","","Protected. The timeline stops for it rather than pretending it is not there.",
    '<select data-sel="gym" aria-label="Gym time">'+[0,960,1020,1080,1110,1140,1200,1260].map(function(m){
      return '<option value="'+m+'"'+(P.gym===m?" selected":"")+'>'+(m?SM.hhmm(m):"none")+'</option>'; }).join("")+'</select>');
  pc+=row("Day starts","","",'<select data-sel="dayStart" aria-label="Day starts at">'+
    [420,480,540,600,630,660,690,720,750,780].map(function(m){
      return '<option value="'+m+'"'+(P.dayStart===m?" selected":"")+'>'+SM.hhmm(m)+'</option>'; }).join("")+'</select>');
  pc+=row("Backup day","","Six protected hours of catch-up. No new content, ever.",
    '<select data-sel="backupDow" aria-label="Backup day of week">'+SM.DOW.map(function(d,i){
      return '<option value="'+i+'"'+(P.backupDow===i?" selected":"")+'>'+d+'</option>'; }).join("")+'</select>');
  pc+=row("Rest day","","Repair sets and a pre-mortem.",
    '<select data-sel="restDow" aria-label="Rest day of week">'+SM.DOW.map(function(d,i){
      return '<option value="'+i+'"'+(P.restDow===i?" selected":"")+'>'+d+'</option>'; }).join("")+'</select>');
  pc+=row("Start date","","",'<input type="date" data-date="startISO" aria-label="Campaign start date" value="'+P.startISO+'">');
  pc+='<div class="prow"><button class="btn sm" data-reset="1">Reset to defaults</button></div>';
  out+='<div class="eyebrow">Pacing</div>'+card(pc);

  /* Smart reminders, restored to a call site in 9.0.0 alongside the two other
     orphaned features. Setup is where every other device-level preference
     lives, and the card feature-detects Notification/PushManager support
     itself rather than assuming it. */
  try{ out+='<div class="eyebrow">Reminders</div>'+smNotificationsCard(); }catch(e){}

  /* System health. smSystemHealth() has existed and been correct for a long
     time but nothing ever called it — the checks it runs (is the stored study
     data valid, do recovery snapshots exist, is there storage headroom, is the
     service worker registered) are exactly what you need when the app starts
     misbehaving on a phone, and they were unreachable. Surfaced here in Setup
     in 9.0.0 rather than deleted as dead code. */
  try{
    var hc=smSystemHealth();
    out+='<div class="eyebrow">System health</div>'+card(
      hc.map(function(c){
        /* "Recovery snapshots" is absent until the SECOND save — the ring
           rotates the previous good state in, so a brand-new install has
           nothing to snapshot yet. That is expected, not a fault, so it
           reports as "Building" rather than "Check"; flagging it red on day
           one would send someone troubleshooting a system that is working. */
        var building = (!c.ok && /recovery/i.test(c.n) && hc.some(function(x){ return /study data/i.test(x.n) && x.ok; }));
        var word = c.ok ? 'OK' : (building ? 'Building' : 'Check');
        var cls  = c.ok ? 'sm-health-ok' : (building ? 'muted sm' : 'sm-health-bad');
        return '<div class="trow"><div class="row-top"><span class="lbl">'+esc(c.n)+'</span>'+
          '<span class="'+cls+'">'+word+'</span></div></div>';
      }).join('')+
      '<p class="muted sm">Local checks only \u2014 nothing is sent anywhere. If a row says Check, your study data is still on this device; take a backup from above before troubleshooting.</p>');
  }catch(e){}

  /* calendar export */
  var ic=state.ics, rng=icsRange();
  var prev=SM.buildICS(plan,{detail:ic.detail,alarm:ic.alarm,protect:ic.protect,from:rng.from,to:rng.to});
  out+='<div class="eyebrow">Add to your calendar</div>';
  out+=card('<div class="lbl">Detail</div><div class="g2 mb">'+
    '<button class="pick'+(ic.detail==="block"?" on":"")+'" data-ics="detail" data-v="block">Every block</button>'+
    '<button class="pick'+(ic.detail==="day"?" on":"")+'" data-ics="detail" data-v="day">One per day</button></div>'+
    '<div class="lbl">Alarm</div><div class="g3 mb">'+
    [[null,"None"],[0,"At start"],[5,"5 min"],[10,"10 min"],[15,"15 min"],[30,"30 min"]].map(function(a){
      return '<button class="pick'+(ic.alarm===a[0]?" on":"")+'" data-ics="alarm" data-v="'+
        (a[0]===null?"null":a[0])+'">'+a[1]+'</button>'; }).join("")+'</div>'+
    '<div class="lbl">Range</div><div class="g3 mb">'+
    [["14","2 weeks"],["90","3 months"],["all","Everything"]].map(function(k){
      return '<button class="pick'+(ic.range===k[0]?" on":"")+'" data-ics="range" data-v="'+k[0]+'">'+k[1]+'</button>'; }).join("")+'</div>'+
    '<div class="chk" data-ics="protect" style="border:none;padding-top:0"><div class="box'+(ic.protect?" on":"")+'">'+
    (ic.protect?"&#10003;":"")+'</div><div class="cf"><div class="lbl">Block out gym and dinner</div>'+
    '<div class="muted sm">Added as free time.</div></div></div>'+
    '<div class="muted sm">'+prev.events+' entries &middot; '+Math.round(prev.text.length/1024)+' KB</div>'+
    '<div class="btnrow"><button class="btn solid f1" id="icsDl">Download .ics</button>'+
    '<button class="btn" id="icsOpen">Open in Calendar</button></div>'+
    '<p class="muted sm" id="icsMsg">Make a calendar called SurgiMaster first, then everything can be hidden or removed in one go. A rolling two-week window is safest if you expect to change pacing.</p>');

  return out;
}

function icsRange(){
  var r=state.ics.range;
  if(r==="all") return {from:null,to:null};
  var t=todayISO();
  var from = t<state.prefs.startISO ? state.prefs.startISO : t;
  return { from:from, to:SM.iso(new Date(SM.fromISO(from).getTime()+Number(r)*DAY)) };
}
/* Real device reminders, honestly scoped. This app is a browser tab, not an
   installed app with background push \u2014 it cannot reliably notify you while
   closed. What it CAN do is generate a real calendar file with hourly
   VALARM entries for the rest of today, which your phone's own Calendar or
   Reminders app will fire even with Dakshinamurthy closed.
   Deliberately self-contained rather than reusing buildICS's icsStamp/
   icsFold/icsEsc helpers: those live in the pure, stateless engine half of
   this file and know nothing of todayISO()/state, which this function
   genuinely needs. Mixing the two caused exactly the kind of scope mismatch
   this comment is now warning against \u2014 found by testing the actual click,
   not by reading the code and assuming it was fine. The ICS content itself
   is trivial enough (fixed short text, no special characters) that it does
   not need the fold/escape machinery buildICS needs for long user-supplied
   labels. */
function scheduleReminderICS(){
  var r=icsRange();
  return SM.buildICS(plan,{
    detail:"block",
    alarm:0,
    protect:false,
    from:r.from,
    to:r.to
  });
}

function icsText(){
  var r=icsRange();
  return SM.buildICS(plan,{detail:state.ics.detail,alarm:state.ics.alarm,
    protect:state.ics.protect,from:r.from,to:r.to}).text;
}



/* ===== UI MODULE 6: ui-search.part.js ===== */
/* ===== Global search =====================================================

   A single search box, fixed above the navigation, that finds anything in the
   app from a vague memory of it. The design assumption is that you will not
   remember the exact wording: you will type "panc", "that biliary thing",
   "hpb", a date, or a typo, and it still has to land.

   Four things make vague input work, in decreasing order of usefulness:

   1. SUBSEQUENCE MATCHING. "gsp" finds "General Surgery Principles" and "crc"
      finds "Colorectal"; the letters only need to appear in order, not
      adjacently. This is what rescues half-remembered names.
   2. TYPO TOLERANCE. Levenshtein distance 1 for tokens of 4-6 characters and
      2 for longer ones, so "pancrease" and "colorectl" both work. Short tokens
      are matched strictly, because at 3 characters an edit distance of 1
      matches almost anything.
   3. DOMAIN SYNONYMS. Surgical shorthand is how you actually think about this
      material: "hpb" should reach Hepatobiliary, "ca" should reach cancer and
      carcinoma, "gb" gallbladder, "CBD" common bile duct. A literal matcher
      fails every one of those.
   4. FIELD WEIGHTING. A hit in a topic name beats a hit in a note body, and an
      exact or prefix match always outranks a fuzzy one, so the obvious answer
      stays at the top rather than being buried by a clever partial match.

   The index is built from live state each time the panel opens. It is small —
   39 topics, 7 phases, the screens, plus whatever the user has written — so
   rebuilding costs nothing and can never go stale, which a cached index would.

   The markup lives in index.html, NOT inside #app: render() replaces #app's
   innerHTML wholesale, so anything placed there is destroyed on first paint.
   That mistake is already recorded in LESSONS_LEARNED; this is the same trap.
   ========================================================================= */


/* Every destination in the app. With the bottom tab bar removed, this list is
   the navigation, so a screen missing from here is a screen with no route to
   it. `keys` carries the words someone might reach for that do not appear in
   the label — "dark" for night mode, "ics" for calendar export.
   `group` drives the browsable grid shown when the panel opens with an empty
   query, so the common five remain two taps away rather than requiring a
   search. */
var SEARCH_DESTINATIONS=[
  {group:'Main', label:'Today',      sub:'Your next step', keys:'home now start', action:{nav:'today'}},
  {group:'Main', label:'My Day',     sub:'Target, timeline, calibration', keys:'timeline schedule questions today plan', action:{nav:'myday'}},
  {group:'Main', label:'Learn',      sub:'Syllabus, lectures, topics', keys:'study syllabus library read', action:{nav:'study'}},
  {group:'Main', label:'Practice',   sub:'Repair, discrimination drills', keys:'revise recall redo', action:{nav:'revise'}},
  {group:'Main', label:'Log',        sub:'Record a question you answered', keys:'mcq entry add question wrong retrieve', action:{nav:'log'}},
  {group:'Main', label:'Progress',   sub:'Coverage, mastery, momentum', keys:'stats chart evidence', action:{nav:'progress'}},
  {group:'Main', label:'Plan',       sub:'The full campaign schedule', keys:'schedule calendar timetable', action:{nav:'plan'}},
  {group:'Main', label:'Coach',      sub:'Signals, AI study companion', keys:'ai assistant advice help reliability mastery retention', action:{nav:'ai'}},
  {group:'Main', label:'Setup',      sub:'Preferences and exam setup', keys:'options config settings', action:{nav:'settings'}},

  {group:'Setup',label:'Night mode',  sub:'Dark surface for late study', keys:'dark theme visual mode', action:{nav:'settings'}},
  {group:'Setup',label:'Study mode',  sub:'Warmer surface for long reading', keys:'light theme visual mode', action:{nav:'settings'}},
  {group:'Setup',label:'Focus mode',  sub:'The default surface', keys:'theme visual mode', action:{nav:'settings'}},
  {group:'Setup',label:'Backup and restore', sub:'Export or merge your study data', keys:'save export import merge json', action:{nav:'settings'}},
  {group:'Setup',label:'Calendar export', sub:'Send the schedule to your calendar', keys:'ics google apple subscribe', action:{nav:'settings'}},
  {group:'Setup',label:'Exam dates',  sub:'When each exam falls', keys:'ini neet date countdown', action:{nav:'settings'}},
  {group:'Setup',label:'Reminders',   sub:'Nudges and notifications', keys:'notify alarm push', action:{nav:'settings'}}
];

var SEARCH_SYNONYMS = {
  hpb:'hepatobiliary liver biliary pancreas', gi:'gastrointestinal',
  ugi:'upper gastrointestinal stomach oesophagus esophagus',
  lgi:'lower gastrointestinal colorectal colon rectum',
  crc:'colorectal colon rectum', ca:'cancer carcinoma malignancy oncology',
  gb:'gallbladder', cbd:'common bile duct biliary', ercp:'biliary pancreas endoscopy',
  ibd:'inflammatory bowel disease colitis crohn', gist:'stomach sarcoma tumour',
  cbt:'breast', tx:'transplant', vasc:'vascular', ctvs:'cardiothoracic vascular',
  neuro:'neurosurgery', paeds:'paediatrics children', peds:'paediatrics children',
  endo:'endocrine thyroid parathyroid adrenal', stats:'statistics biostatistics',
  nutri:'nutrition metabolic', periop:'perioperative preoperative postoperative',
  mcq:'question questions practice bank', sr:'spaced repetition revision',

  oesophagus:'esophagus', esophagus:'oesophagus', tumour:'tumor', tumor:'tumour'
};

function searchNormalize(s){
  return String(s==null?'':s).toLowerCase()
    .normalize ? String(s==null?'':s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim()
             : String(s==null?'':s).toLowerCase().replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
}

/* Each query token becomes a GROUP of alternatives: the word itself plus any
   synonyms. The token counts as matched if ANY alternative matches.

   The first version pushed synonyms into the token list as extra tokens, which
   combined with the every-token-must-match rule meant "hpb" expanded to
   hpb + hepatobiliary + liver + biliary + pancreas and then demanded all five
   appear in one entry. Nothing could satisfy that, so "hpb" and
   "log an mcq" all returned nothing — the synonym table was actively making
   search worse than no synonyms at all. */
var SEARCH_STOPWORDS={a:1,an:1,the:1,of:1,in:1,on:1,for:1,to:1,my:1,me:1,is:1,it:1,and:1,that:1,this:1,about:1,with:1};

function searchGroups(q){
  var toks=searchNormalize(q).split(' ').filter(Boolean);
  var kept=toks.filter(function(t){ return !SEARCH_STOPWORDS[t]; });
  if(!kept.length) kept=toks;                       // a query of only stopwords
  return kept.map(function(t){
    var alts=[t];
    if(SEARCH_SYNONYMS[t]) SEARCH_SYNONYMS[t].split(' ').forEach(function(x){ if(x!==t) alts.push(x); });
    return alts;
  });
}

/* Bounded Levenshtein: stops as soon as the best possible result exceeds the
   allowance, so a long haystack cannot make this slow. */
function searchEditDistance(a,b,max){
  if(a===b) return 0;
  if(Math.abs(a.length-b.length)>max) return max+1;
  var prev=[],cur=[],i,j;
  for(j=0;j<=b.length;j++) prev[j]=j;
  for(i=1;i<=a.length;i++){
    cur[0]=i; var best=i;
    for(j=1;j<=b.length;j++){
      cur[j]=Math.min(prev[j]+1, cur[j-1]+1, prev[j-1]+(a.charAt(i-1)===b.charAt(j-1)?0:1));
      if(cur[j]<best) best=cur[j];
    }
    if(best>max) return max+1;
    for(j=0;j<=b.length;j++) prev[j]=cur[j];
  }
  return prev[b.length];
}

function searchSubsequence(needle,hay){
  var i=0,j=0;
  while(i<needle.length && j<hay.length){ if(needle.charAt(i)===hay.charAt(j)) i++; j++; }
  return i===needle.length;
}

/* Score one query token against one haystack string. Higher is better; 0 means
   no match at all. The tiers are deliberately far apart so that an exact hit
   can never be outranked by an accumulation of fuzzy ones. */
function searchTokenScore(tok,hay){
  if(!tok||!hay) return 0;
  if(hay===tok) return 100;
  var words=hay.split(' ');
  for(var w=0;w<words.length;w++){
    if(words[w]===tok) return 90;
    if(words[w].indexOf(tok)===0) return 75;
  }
  if(hay.indexOf(tok)>=0) return 60;
  // Initials: "gsp" -> "general surgery principles"
  var initials=words.map(function(x){return x.charAt(0);}).join('');
  if(initials.indexOf(tok)>=0) return 55;
  if(tok.length>=3 && searchSubsequence(tok,hay)) return 40;
  if(tok.length>=4){
    var allow=tok.length>6?2:1;
    for(var k=0;k<words.length;k++){
      if(searchEditDistance(tok,words[k],allow)<=allow) return 35;
    }
  }
  return 0;
}

function searchScoreEntry(groups,entry){
  var total=0, matched=0, missed=0;
  for(var i=0;i<groups.length;i++){
    var alts=groups[i], best=0;
    for(var a=0;a<alts.length;a++){
      // A synonym match is genuine but weaker than the user's own word, so it
      // is discounted; otherwise "ca" would rank cancer topics above an exact
      // match on a topic actually called "CA".
      /* 0.72 was too generous: the generic "test" synonym prefix-matched
         "Testis" and pushed two unrelated topics above the actual mock days.
         A synonym is a guess about intent; the user's own word is evidence. */
      var penalty = (a===0) ? 1 : 0.55;
      for(var f=0;f<entry.fields.length;f++){
        var sc=searchTokenScore(alts[a], entry.fields[f].text) * entry.fields[f].weight * penalty;
        if(sc>best) best=sc;
      }
    }
    if(best===0){ missed++; } else { total+=best; matched++; }
  }
  if(matched===0) return 0;
  if(missed>0){
    // Graceful degradation for genuinely vague input. Strict all-tokens
    // matching is right when it finds something, but "stomach ca" describes a
    // concept this curriculum files under two different topics, and returning
    // nothing would be the least useful possible answer. Partial matches are
    // heavily discounted so they can never outrank a complete one.
    total = total * (matched/(matched+missed)) * 0.35;
  }
  /* Weight by what the result IS, not just how well it matched. There are 246
     scheduled days in the index against 39 topics, so without this the days
     drown everything: "stomach ca" was returning three November dates whose
     block list happened to contain both words, ahead of the Stomach topic
     itself. A topic is almost always the thing being looked for. */
  var KIND_WEIGHT={Topic:1, Phase:0.92, 'Go to':0.9, Note:0.82, Mistake:0.8, Day:0.5};
  return (total + (entry.boost||0)) * (KIND_WEIGHT[entry.kind]||0.7);
}

function buildSearchIndex(){
  var idx=[];
  function add(kind,title,sub,fields,action){
    idx.push({kind:kind,title:title,sub:sub||'',fields:fields,action:action,boost:0});
  }

  // --- Topics: the main thing anyone searches for ---
  (SM.CURRICULUM||[]).forEach(function(t){
    var phaseName=(SM.PHASE_NAME&&SM.PHASE_NAME[t.phase])||('Phase '+t.phase);
    add('Topic', t.n, 'Phase '+t.phase+' · '+phaseName+' · '+(t.dtq||0)+' questions',
      [{text:searchNormalize(t.n),weight:1},
       {text:searchNormalize(phaseName),weight:0.5},
       {text:searchNormalize('phase '+t.phase),weight:0.5}],
      {nav:'study', ti:t.i});
  });

  // --- Phases ---
  Object.keys(SM.PHASE_NAME||{}).forEach(function(k){
    add('Phase', k+'. '+SM.PHASE_NAME[k], 'Curriculum phase',
      [{text:searchNormalize(SM.PHASE_NAME[k]),weight:1},
       {text:searchNormalize('phase '+k),weight:1}],
      {nav:'study'});
  });

  // --- Destinations. This list IS the navigation now that the five-tab bar
  //     is gone, so it has to be exhaustive rather than a shortcut menu: if a
  //     screen is not here, there is no other way to reach it.
  SEARCH_DESTINATIONS.forEach(function(r){
    add('Go to', r.label, r.sub,
      [{text:searchNormalize(r.label),weight:1},
       {text:searchNormalize(r.sub),weight:0.6},
       {text:searchNormalize(r.keys||''),weight:0.8}], r.action);
  });

  // --- The user's own writing: notes and misses ---
  (state.notes||[]).forEach(function(n){
    var body=(n&&(n.text||n.body||n.note))||'';
    if(!body) return;
    add('Note', String(body).slice(0,60), n.date||'Your note',
      [{text:searchNormalize(body),weight:0.9},{text:searchNormalize(n.date||''),weight:0.4}],
      {nav:'progress'});
  });

  (state.misses||[]).forEach(function(m){
    var t=SM.CURRICULUM[m.topicId];
    var label=(m.q||m.text||m.note||'Logged mistake');
    add('Mistake', String(label).slice(0,60), t?t.n:'Logged mistake',
      [{text:searchNormalize(label),weight:0.8},{text:searchNormalize(t?t.n:''),weight:0.7}],
      {nav:'revise'});
  });

  // --- Scheduled days, so a date lands somewhere ---
  try{
    var byDate=plan.byDate||{};
    Object.keys(byDate).forEach(function(d){
      var e=byDate[d], kind=e.kind||'study';
      var names=(e.blocks||[]).filter(function(b){return b.ti!=null;})
        .map(function(b){ var t=SM.CURRICULUM[b.ti]; return t?t.n:''; }).join(' ');
      var dt=new Date(d+'T00:00:00');
      var pretty=isNaN(dt)?d:dt.toLocaleDateString(undefined,{day:'numeric',month:'long',year:'numeric'});
      add('Day', pretty, kind==='content'?(names.slice(0,48)||'Study day'):kind,
        [{text:searchNormalize(pretty+' '+d),weight:0.7},
         /* Full weight on the day's own kind. Days carry a 0.5 kind penalty so
            246 of them cannot drown 39 topics, and at 0.6 here an exact match
            on an old exam term scored below a generic synonym prefix-matching "Testis".
            A day IS its kind, so that field should not be discounted twice. */
         {text:searchNormalize(kind),weight:1},
         {text:searchNormalize(names),weight:0.5}],
        {goto:d});
    });
  }catch(e){}

  return idx;
}

function runSearch(q){
  var groups=searchGroups(q);
  if(!groups.length) return [];
  var idx=buildSearchIndex(), out=[];
  for(var i=0;i<idx.length;i++){
    var s=searchScoreEntry(groups, idx[i]);
    if(s>0) out.push({e:idx[i], s:s});
  }
  out.sort(function(a,b){ return b.s-a.s; });
  /* Drop the long tail. Anything scoring under 40% of the best hit is noise —
     a single weak subsequence match — and showing 40 of them buries the three
     results that are actually right. */
  var top=out.length?out[0].s:0;
  out=out.filter(function(x){ return x.s >= top*0.4; });
  return out.slice(0,12);
}

function renderSearchResults(q){
  var box=document.getElementById('smSearchResults');
  if(!box) return;
  var hits=runSearch(q);
  if(!q.trim()){
    /* An empty query shows every destination, grouped. This is what keeps the
       app navigable without a tab bar: open the panel and the whole app is on
       screen, so the five former tabs stay at two taps rather than requiring
       anyone to think of a search term first. */
    var groups=[], seen={};
    SEARCH_DESTINATIONS.forEach(function(d){ if(!seen[d.group]){ seen[d.group]=1; groups.push(d.group); } });
    box.innerHTML=groups.map(function(g){
      return '<div class="sm-search-group">'+esc(g)+'</div><div class="sm-search-grid">'
        + SEARCH_DESTINATIONS.filter(function(d){return d.group===g;}).map(function(d){
            var gi=SEARCH_DESTINATIONS.indexOf(d);
            return '<button class="sm-search-dest" data-sdest="'+gi+'" data-tab="'+esc((d.action&&d.action.nav)||'')+'">'
              + '<span class="sm-dest-label">'+esc(d.label)+'</span>'
              + '<span class="sm-dest-sub">'+esc(d.sub)+'</span></button>';
          }).join('')
        + '</div>';
    }).join('');
    box.__hits=null;
    return;
  }
  if(!hits.length){
    box.innerHTML='<div class="sm-search-hint">Nothing matched \u201c'+esc(q)+'\u201d. Try fewer words, or part of a topic name.</div>';
    return;
  }
  box.innerHTML=hits.map(function(h,i){
    var a=h.e.action||{};
    return '<button class="sm-search-hit" role="option" data-shit="'+i+'">'
      + '<span class="sm-search-kind">'+esc(h.e.kind)+'</span>'
      + '<span class="sm-search-title">'+esc(h.e.title)+'</span>'
      + '<span class="sm-search-sub">'+esc(h.e.sub)+'</span></button>';
  }).join('');
  box.__hits=hits;
}

function searchGo(hit){
  if(!hit) return;
  var a=hit.e.action||{};
  closeSearch();
  if(a.goto){ state.cursor=a.goto; openBlock=null; save(); tab='today'; render(); return; }
  if(a.nav){ tab=a.nav; msg=null; render(); }
  if(a.jump){
    setTimeout(function(){
      var t=document.getElementById(a.jump);
      if(t&&t.scrollIntoView) t.scrollIntoView({block:'start',behavior:'smooth'});
    },180);
  }
}

function openSearch(){
  var w=document.getElementById('smSearchWrap');
  var inp=document.getElementById('smSearchInput');
  if(!w||!inp) return;
  w.classList.add('open');
  w.setAttribute('aria-expanded','true');
  var lb=document.getElementById('smSearchLauncher');
  if(lb) lb.setAttribute('aria-expanded','true');
  document.body.classList.add('sm-search-open');
  renderSearchResults(inp.value||'');
  try{ inp.focus(); }catch(e){}
}

function closeSearch(){
  var w=document.getElementById('smSearchWrap');
  if(!w) return;
  w.classList.remove('open');
  w.setAttribute('aria-expanded','false');
  var lb2=document.getElementById('smSearchLauncher');
  if(lb2) lb2.setAttribute('aria-expanded','false');
  document.body.classList.remove('sm-search-open');
  var inp=document.getElementById('smSearchInput');
  if(inp) try{ inp.blur(); }catch(e){}
}

/* Wired once at boot, not per render: the search markup lives outside #app and
   is never destroyed, so re-binding on every render would stack duplicate
   listeners for the life of the session. */
function wireSearch(){
  var inp=document.getElementById('smSearchInput');
  var box=document.getElementById('smSearchResults');
  var back=document.getElementById('smSearchBackdrop');
  var clear=document.getElementById('smSearchClear');
  var launch=document.getElementById('smSearchLauncher');
  if(!inp||!box) return;
  if(launch) launch.addEventListener('click', function(){
    var w=document.getElementById('smSearchWrap');
    if(w&&w.classList.contains('open')) closeSearch(); else openSearch();
  });
  // The grid must exist in the DOM from boot, not only once the panel opens,
  // so that the app is navigable even if a render fails later.
  renderSearchResults('');

  var t=null;
  inp.addEventListener('focus', openSearch);
  inp.addEventListener('input', function(){
    if(t) clearTimeout(t);
    // Debounced so that every keystroke does not rebuild the index; 90ms is
    // below the threshold where typing feels laggy.
    t=setTimeout(function(){ renderSearchResults(inp.value||''); }, 90);
  });
  inp.addEventListener('keydown', function(e){
    if(e.key==='Escape'){ closeSearch(); return; }
    if(e.key==='Enter'){
      var hits=box.__hits;
      if(hits&&hits.length) searchGo(hits[0]);
      e.preventDefault();
    }
  });
  box.addEventListener('click', function(e){
    var t=e.target&&e.target.closest?e.target:null;
    if(!t) return;
    var d=t.closest('[data-sdest]');
    if(d){ searchGo({e:{action:SEARCH_DESTINATIONS[Number(d.dataset.sdest)].action}}); return; }
    var b=t.closest('[data-shit]');
    if(!b) return;
    var hits=box.__hits;
    if(hits) searchGo(hits[Number(b.dataset.shit)]);
  });
  if(back) back.addEventListener('click', closeSearch);
  if(clear) clear.addEventListener('click', function(){
    inp.value=''; renderSearchResults(''); try{ inp.focus(); }catch(e){}
  });
  document.addEventListener('keydown', function(e){
    if(e.key==='Escape') closeSearch();
  });
}


/* ===== UI MODULE 7: ui-render-ai.part.js ===== */
/* ---------- render ---------- */
var lastRenderedTab=null;

/* V17 visual language helpers — icons only; no study logic is changed. */
function smV17Svg(kind){
  var p={
    target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
    book:'<path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H20v16H7.5A3.5 3.5 0 0 0 4 21V5.5Z"/><path d="M4 5.5A3.5 3.5 0 0 1 7.5 9H20M8 13h7M8 16h5"/>',
    bolt:'<path d="m13 2-8 12h6l-1 8 8-12h-6l1-8Z"/>',
    check:'<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/>',
    brain:'<path d="M9.5 4.5A3 3 0 0 0 4 6.5a3.5 3.5 0 0 0 .5 6.7A3.2 3.2 0 0 0 9 18.5"/><path d="M14.5 4.5A3 3 0 0 1 20 6.5a3.5 3.5 0 0 1-.5 6.7 3.2 3.2 0 0 1-4.5 5.3"/><path d="M9 8.5c2 0 2 3 0 3s-2 3 0 3M15 8.5c-2 0-2 3 0 3s2 3 0 3M12 5v14"/>',
    mountain:'<path d="m3 19 6-8 3 4 3-6 6 10H3Z"/><path d="M16 8.5c2-1 3.5-.8 5 .2M16.5 12.5c1.5-.8 2.6-.7 3.8.1"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/>',
    moon:'<path d="M20 15.2A8.5 8.5 0 0 1 8.8 4 8.5 8.5 0 1 0 20 15.2Z"/>',
    graph:'<path d="M4 19V5M4 19h16"/><path d="m7 15 3-4 3 2 5-7"/>',
    scalpel:'<path d="m4 20 5-5"/><path d="m9 15 6-6 4 4-6 6Z"/><path d="m15 9 2-2 3 3-2 2"/><path d="M5 19h4"/>',
    loop:'<path d="M20 7v5h-5"/><path d="M4 17v-5h5"/><path d="M19 12a7 7 0 0 0-12-4L5 10M5 12a7 7 0 0 0 12 4l2-2"/>'
  };
  return '<svg viewBox="0 0 24 24" aria-hidden="true">'+(p[kind]||p.target)+'</svg>';
}
function smV17Polish(){
  var navIcons={today:'home-style3.png',study:'study-style3.png',revise:'practice-style3.png',progress:'revision-style3.png',more:'settings-style3.png'};
  document.querySelectorAll('.sm-v17-nav .navbtn').forEach(function(b){
    var k=b.dataset.tab, ni=b.querySelector('.nvi');
    if(ni && navIcons[k]) ni.innerHTML='<img src="'+navIcons[k]+'" alt="" aria-hidden="true">';
  });
  var brandMode=document.querySelector('.sm-v16-brand-mode');
  if(brandMode) brandMode.textContent=(state.visualMode||'focus').toUpperCase()+' MODE';
  /* Add recognisable icons to the most important next-action labels without touching data. */
  document.querySelectorAll('.sm-v14-next').forEach(function(x){
    if(x.querySelector('.sm-v17-iconchip')) return;
    var chip=document.createElement('span'); chip.className='sm-v17-iconchip'; chip.innerHTML=smV17Svg('bolt'); x.insertBefore(chip,x.firstChild);
  });
}

function smV21Icon(kind){
  var p={sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7 4.9 19.1"/>',book:'<path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H20v18H7.5A3.5 3.5 0 0 0 4 21V5.5Z"/><path d="M4 5.5A3.5 3.5 0 0 1 7.5 9H20"/>',target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',mountain:'<path d="m3 19 6-8 3 4 3-6 6 10H3Z"/><path d="m15 10 2-2 2 2"/>',more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',scalpel:'<path d="m4 20 5-5 6-6 4 4-6 6-5 1Z"/><path d="m15 9 2-2 3 3-2 2"/>'};
  return '<svg viewBox="0 0 24 24" aria-hidden="true">'+(p[kind]||p.more)+'</svg>';
}

function smV23Art(kind){
  var a={
    liver:'<path d="M11 8c-2-2-6-1-7 2-1 3 1 7 5 7 3 0 4-2 7-2 3 0 5-2 4-5-1-4-5-4-9-2Z"/><path class="soft" d="M10 9c2 2 2 5 0 7M14 8c1 2 1 4 0 6"/>',
    upper:'<path d="M7 5c-2 2-3 5-2 8l2 7h10l2-7c1-3 0-6-2-8"/><path class="soft" d="M9 7v6m6-6v6M7 15h10"/>',
    pancreas:'<path d="M4 14c4-5 9-7 16-5 1 1 0 3-2 3-5 0-8 2-11 4-2 1-4 0-3-2Z"/><circle class="fill" cx="18" cy="10" r="1.7"/>',
    colon:'<path d="M8 5H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h2"/><path d="M16 5h2a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-2"/><path d="M8 5c4 3 4 11 0 14M16 5c-4 3-4 11 0 14"/>',
    vessel:'<path d="M5 20c4-5 3-11 7-15 2-3 5-2 7 0"/><path class="soft" d="M7 17c3 0 5-2 6-5M12 8c2 1 4 1 6 0"/><circle class="fill" cx="19" cy="5" r="2"/>',
    oncology:'<circle cx="12" cy="12" r="7"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><circle class="fill" cx="12" cy="12" r="2"/>',
    transplant:'<path d="M12 20c-5-4-8-7-8-11a4 4 0 0 1 8-2 4 4 0 0 1 8 2c0 4-3 7-8 11Z"/><path class="soft" d="M8 11c2 2 6 2 8 0"/>',
    book:'<path d="M4 5c3-2 6-1 8 1v14c-2-2-5-3-8-1Z"/><path d="M20 5c-3-2-6-1-8 1v14c2-2 5-3 8-1Z"/><path class="soft" d="M6 8h3M15 8h3M6 11h3M15 11h3"/>',
    target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
    chart:'<path d="M4 19V5M4 19h16"/><path d="m7 16 4-5 3 2 5-7"/><circle class="fill" cx="19" cy="6" r="1.7"/>',
    tools:'<path d="M5 19 19 5M7 7l3 3M14 14l3 3"/><circle cx="7" cy="7" r="3"/><circle cx="17" cy="17" r="3"/>'
  };
  return '<div class="sm-v23-art"><svg viewBox="0 0 24 24" aria-hidden="true">'+(a[kind]||a.book)+'</svg></div>';
}
function smV24Picture(name){var m={
"hepatobiliary":"liver.svg","upper gi":"gi.svg","pancreas":"pancreas.svg","colorectal":"colon.svg","vascular":"vascular.svg","oncology":"oncology.svg","general surgery":"general.svg"};var k=String(name||"").toLowerCase();for(var key in m){if(k.indexOf(key)>=0)return m[key];}return "general.svg";}
function renderStudy(){
  var B=plan.B, topics=B.topics||[];
  var ph=curriculumPhaseNow();
  var phaseTopics=topics.filter(function(t){return t.phase===ph;});
  var recent=[]; var today=activeDate(), e=plan.byDate[today];
  if(e && e.blocks) e.blocks.forEach(function(b){if(recent.length<3 && b.ti!=null) recent.push(b);});
  var out='<div class="sm-v26-hero"><div class="hero-copy"><div class="sm-v26-kicker">ॐ · Learn</div><div class="sm-v26-title">Learn with a map.</div><div class="sm-v26-copy">Your syllabus library: find the source topic, lecture and question bank. Practice shows what needs repair.</div><div class="sm-v26-pill">Learn · Retrieve · Measure</div></div><img class="hero-art" src="sm-study.svg" alt="Open book and surgical anatomy illustration"></div>';
  out+='<div class="sm-v26-statbar"><div class="sm-v26-stat"><div class="icon">'+smV23Art('book')+'</div><b>Learn</b><span>Lectures & topics</span></div><div class="sm-v26-stat"><div class="icon">'+smV23Art('target')+'</div><b>Retrieve</b><span>Questions & revision</span></div><div class="sm-v26-stat"><div class="icon">'+smV23Art('chart')+'</div><b>Measure</b><span>Coverage & accuracy</span></div></div>';
  if(recent.length){out+='<div class="sm-v26-section">Continue learning <span class="small">from today\'s route</span></div><div class="sm-v21-grid">'+recent.map(function(b){var t=SM.CURRICULUM[b.ti];return '<button type="button" class="sm-v21-tile sm-action-tile" data-go-tab="today" aria-label="Open today for '+esc(t.n)+'"><div class="ico">'+smV21Icon('book')+'</div><div><div class="lbl">'+esc(t.n)+'</div><div class="muted sm">'+esc(b.kind||'study')+'</div></div></button>';}).join('')+'</div>';}
  out+='<div class="sm-v26-section">Current phase <span class="small">'+ph+'. '+esc(SM.PHASE_NAME[ph]||('Phase '+ph))+'</span></div><div class="sm-v26-topic-grid">'+phaseTopics.map(function(t){var a=topicAcc(t.i);return '<button type="button" class="sm-v26-topic sm-action-card" data-jump="phase-learn-'+t.phase+'" aria-label="Open '+esc(t.n)+' in the learning list"><div class="topic-top"><span class="topic-dot"></span><span class="topic-name">'+esc(t.n)+'</span></div><div class="topic-meta">'+t.nlec+' lectures · '+(t.dtq+t.spq).toLocaleString()+' questions</div><div class="topic-progress"><i style="width:'+Math.max(0,Math.min(100,a))+'%"></i></div><div class="topic-signal">'+Math.round(a)+'% logged signal</div><img class="sm-v26-topic-art" src="'+smV24Picture(t.n)+'" alt=""></button>';}).join('')+'</div>';
  out+='<div class="sm-v26-section">Learning map <span class="small">8 areas</span></div><div class="sm-v26-map"><button type="button" class="sm-v26-map-card sm-action-card" data-jump="phase-learn-1" aria-label="Jump to Foundation learning list"><div class="n">01</div><b>Foundation</b><span>Core surgical thinking</span><img src="general.svg" alt=""></button><button type="button" class="sm-v26-map-card sm-action-card" data-jump="phase-learn-2" aria-label="Jump to Upper GI learning list"><div class="n">02</div><b>Upper GI</b><span>Foregut & stomach</span><img src="gi.svg" alt=""></button><button type="button" class="sm-v26-map-card sm-action-card" data-jump="phase-learn-3" aria-label="Jump to Hepatobiliary learning list"><div class="n">03</div><b>Hepatobiliary</b><span>Liver & biliary</span><img src="liver.svg" alt=""></button><button type="button" class="sm-v26-map-card sm-action-card" data-jump="phase-learn-4" aria-label="Jump to Pancreas learning list"><div class="n">04</div><b>Pancreas</b><span>Pancreatic surgery</span><img src="pancreas.svg" alt=""></button><button type="button" class="sm-v26-map-card sm-action-card" data-jump="phase-learn-5" aria-label="Jump to Colorectal learning list"><div class="n">05</div><b>Colorectal</b><span>Colon & rectum</span><img src="colon.svg" alt=""></button><button type="button" class="sm-v26-map-card sm-action-card" data-jump="phase-learn-6" aria-label="Jump to Vascular learning list"><div class="n">06</div><b>Vascular</b><span>Flow & vessels</span><img src="vascular.svg" alt=""></button><button type="button" class="sm-v26-map-card sm-action-card" data-jump="phase-learn-7" aria-label="Jump to Oncology learning list"><div class="n">07</div><b>Oncology</b><span>Cancer principles</span><img src="oncology.svg" alt=""></button><button type="button" class="sm-v26-map-card sm-action-card" data-jump="phase-learn-1" aria-label="Jump to General learning list"><div class="n">08</div><b>General</b><span>Cross-cutting skills</span><img src="general.svg" alt=""></button></div>';
  out+='<div class="sm-v26-section">All subjects <span class="small">by phase</span></div><div class="card">'+[1,2,3,4,5,6,7].map(function(k){var arr=topics.filter(function(t){return t.phase===k;});return '<details id="phase-learn-'+k+'"><summary class="row-top" style="cursor:pointer"><span class="lbl">'+k+'. '+esc(SM.PHASE_NAME[k]||('Phase '+k))+'</span><span class="muted sm">'+arr.length+' topics</span></summary><div>'+arr.map(function(t){return '<div class="trow"><span class="lbl">'+esc(t.n)+'</span><div class="muted sm">'+t.nlec+' lectures · '+(t.dtq+t.spq).toLocaleString()+' questions</div></div>';}).join('')+'</div></details>';}).join('')+'</div>';
  return out;
}
function renderProgressTab(){
  var st=styleNow(), ph=examStyleNow(), due=SM.dueQueue(state.misses,Date.now(),60).total;
  var coverage=0, accN=0, accD=0;
  SM.CURRICULUM.forEach(function(t){ var sc=state.scores[t.i]||{}, n=(sc.ba||0)+(sc.sa||0); if(n){coverage++; accN+=(sc.bc||0)+(sc.sc||0); accD+=n;} });
  var acc=accD?Math.round(accN/accD*100):null, pace=paceOverall();
  var mg=SM.marginalGain(state.scores,st,ph).slice(0,5);
  var out='<div class="sm-v26-progress-head"><div class="sm-v26-progress-card"><div class="copy"><div class="sm-v26-kicker">Progress</div><div class="sm-v26-title">See the signal.</div><div class="sm-v26-copy">A compact dashboard for coverage, accuracy, pace and the next useful work. Details stay closed until you need them.</div><div class="sm-v26-pill">Coverage · Accuracy · Pace · Focus</div></div><img src="sm-progress.svg" alt="Rising learning path illustration"></div></div>';
  out+='<div class="sm-v26-section">At a glance <span class="small">your current evidence</span></div><div class="g4">'+
    '<div class="card"><div class="big2">'+coverage+'</div><div class="muted sm">of '+SM.CURRICULUM.length+' topics sampled</div></div>'+
    '<div class="card"><div class="big2">'+(acc===null?'—':acc+'%')+'</div><div class="muted sm">overall logged accuracy</div></div>'+
    '<div class="card"><div class="big2">'+(pace===null?'—':Math.round(pace)+'s')+'</div><div class="muted sm">average per question</div></div>'+
    '<div class="card"><div class="big2">'+due+'</div><div class="muted sm">retrieval items due</div></div></div>';
  out+='<div class="sm-v26-section">Where to focus <span class="small">next hour</span></div>'+card(mg.map(function(x){return '<div class="trow"><div class="row-top"><span class="lbl">'+(x.y===2?'&#127919; ':'')+esc(x.t.n)+'</span><span class="pillq">+'+x.gain.toFixed(1)+'</span></div><div class="muted sm">'+(x.acc===null?'Not sampled yet':Math.round(x.acc*100)+'% correct')+' · ~'+x.expected.toFixed(1)+' questions expected</div></div>';}).join('') || '<p class="muted sm">Log more questions to generate a focus list.</p>');
  out+='<details class="coachMore"><summary class="eyebrow" style="cursor:pointer">Detailed evidence ▾</summary>';
  out+=card('<div class="eyebrow">Syllabus heat map</div><div class="heat">'+SM.CURRICULUM.map(function(t){var a=topicAcc(t.i);return '<div class="ht" style="background:'+accColour(a)+';opacity:'+(a===null?0.32:1)+'" title="'+esc(t.n)+'"><span>'+esc(t.n.replace(/[^A-Za-z]/g,'').slice(0,3).toUpperCase())+'</span></div>';}).join('')+'</div>');
  if(state.calib.length>=5) out+=calibrationCard();
  if(pace!==null) out+=card('<div class="eyebrow">Pace</div><div class="row-top"><span class="big2">'+Math.round(pace)+' s</span><span class="muted sm">target '+SM.paceTarget(st)+' s/question</span></div>');
  out+=card('<div class="eyebrow">Consistency</div><div class="grid">'+plan.CAL.map(function(c){var r=state.days[c.date],v=r?((r.bank||0)+(r.speed||0)):0,lvl=!r?0:v>=80?4:v>=50?3:v>=20?2:v>0?1:0;return '<div class="ac l'+lvl+(c.date===todayISO()?' now':'')+'" title="'+c.date+'"></div>';}).join('')+'</div>');
  out+='</details>';
  return out;
}
/* ---------- Offline AI study companion (no API, no network) ----------
   This is intentionally deterministic: it never pretends a local rule engine is
   a generative model. It analyses the user's stored study signals, creates a
   focused micro-session, and can build a ready-to-paste prompt for any external
   AI/chat app without exposing an API key. */
function smAITopic(){
  var d=activeDate(), e=plan.byDate[d], ti=null;
  if(e&&e.blocks){ for(var i=0;i<e.blocks.length;i++){ if(e.blocks[i].ti!=null){ti=e.blocks[i].ti;break;} } }
  if(ti==null){
    var ks=Object.keys(state.scores||{}).filter(function(k){return topicAcc(+k)!==null;});
    ks.sort(function(a,b){return (topicAcc(+a)||1)-(topicAcc(+b)||1);});
    if(ks.length) ti=+ks[0];
  }
  var t=ti!=null?SM.CURRICULUM[ti]:null;
  return t?{ti:ti,t:t,date:d}:null;
}
function smAIStats(ti){
  var s=state.scores[ti]||{}, n=(s.ba||0)+(s.sa||0), a=n?((s.bc||0)+(s.sc||0))/n:null;
  var tall=tallyFor(ti)||{}, errors=Object.keys(tall).map(function(k){return [k,tall[k]||0];}).sort(function(x,y){return y[1]-x[1];});
  var misses=(state.misses||[]).filter(function(m){return +m.topicId===+ti&&!m.done;});
  return {n:n,acc:a,errors:errors,misses:misses};
}
function smAIMark(action,ti){
  state.aiProfile=state.aiProfile||{runs:0,topics:{},lastAction:null,history:[]};
  state.aiProfile.history=Array.isArray(state.aiProfile.history)?state.aiProfile.history:[];
  state.aiProfile.runs=(state.aiProfile.runs||0)+1;
  state.aiProfile.lastAction=action;
  if(ti!=null){ state.aiProfile.topics[ti]=state.aiProfile.topics[ti]||{}; state.aiProfile.topics[ti][action]=(state.aiProfile.topics[ti][action]||0)+1; }
  state.aiProfile.history.unshift({action:action,ti:ti,date:activeDate(),at:new Date().toISOString()});
  if(state.aiProfile.history.length>30) state.aiProfile.history.length=30;
  save();
}
function smAIWeakest(){
  var arr=[];
  SM.CURRICULUM.forEach(function(t){var a=topicAcc(t.i),s=state.scores[t.i]||{},n=(s.ba||0)+(s.sa||0);if(n>=10)arr.push({t:t,a:a,n:n});});
  arr.sort(function(x,y){return x.a-y.a||y.n-x.n;});
  return arr[0]||null;
}
function smAIPrompt(action){
  var x=smAITopic(), w=smAIWeakest(), t=x?x.t:null, st=x?smAIStats(x.ti):null;
  var topic=t?t.n:(w?w.t.n:'my current surgical topic');
  var perf=st&&st.n?Math.round(st.acc*100)+'% across '+st.n+' logged questions':'not enough logged data yet';
  var err=st&&st.errors.length?st.errors.slice(0,3).map(function(e){return e[0]+' ('+e[1]+')';}).join(', '):'no dominant error type recorded';
  var task={teach:'Teach me this topic progressively in 5 minutes.',mistake:'Analyse my likely misconception and show me how to repair it.',quiz:'Quiz me with active recall. Ask one question at a time and wait for my answer.',case:'Give me a difficult clinical case and make me reason step-by-step.',revision:'Give me a 5-minute high-yield revision session.',memory:'Help me build durable memory hooks for the facts I repeatedly forget.',next:'Decide the highest-value study action I should do next, given my performance.'}[action]||action;
  return 'I am preparing for NEET-SS / INI-SS surgical gastroenterology. Act as my concise, demanding but supportive surgical tutor. Current topic: '+topic+'. My logged performance: '+perf+'. Dominant recorded error signals: '+err+'. '+task+' Use exam-relevant surgical reasoning, distinguish commonly confused entities, and avoid overwhelming me. Do not invent facts or references. If evidence or exam conventions vary, say so. Use active recall rather than a long lecture. Start with the task immediately, ask one question at a time when appropriate, and finish with a short takeaway.';
}
function smAIRender(action){
  var x=smAITopic(), w=smAIWeakest(), target=x||w, t=target&&target.t, st=target?smAIStats(target.t.i):null;
  if(!t) return card('<div class="eyebrow drape">Offline AI</div><h2>No topic selected yet</h2><p class="muted sm">Log a question or open a scheduled study block, then ask again. The offline coach needs your app data to personalise the session.</p>','drape');
  var ti=t.i, stats=smAIStats(ti), acc=stats.acc==null?'—':Math.round(stats.acc*100)+'%';
  smAIMark(action,ti);
  var title='',body='',steps=[];
  if(action==='teach'){
    title='5-minute teaching plan · '+t.n;
    steps=['1 min — state the clinical problem and why it matters','2 min — build the core mechanism / anatomy / classification','1 min — compare the two most easily confused entities','1 min — close the notes and recall the algorithm aloud'];
    body='<p><b>Goal:</b> understand the structure before memorising details.</p><ol>'+steps.map(function(s){return '<li>'+esc(s.replace(/^\d+ min — /,''))+'</li>';}).join('')+'</ol><p class="muted sm">Then ask yourself: “What would change the management?”</p>';
  } else if(action==='mistake'){
    var err=stats.errors.length?stats.errors[0][0]:'general gap';
    title='Mistake repair · '+t.n;
    body='<p><b>Current signal:</b> '+acc+' from '+stats.n+' logged questions.</p><p><b>Most recorded error:</b> '+esc(err)+'.</p><p>Offline coach rule: stop broad revision and repair this distinction first. Review the concept for 3 minutes, explain it aloud in your own words, then do 3 fresh questions.</p>';
  } else if(action==='quiz'){
    title='Active-recall drill · '+t.n;
    body='<ol><li>Define the key problem without looking.</li><li>Give the classification / decision pathway from memory.</li><li>Name the most important management-changing exception.</li><li>Explain one common examiner trap.</li><li>Give yourself one clinical scenario and state the next step.</li></ol>';
  } else if(action==='case'){
    title='Clinical case framework · '+t.n;
    body='<p>Build a case mentally using this sequence:</p><ol><li>Presentation + red flags</li><li>Most likely diagnosis</li><li>Three useful differentials</li><li>Investigation that changes management</li><li>Definitive treatment</li><li>Complication / rescue pathway</li></ol><p class="muted sm">Write your answer before revealing any reference material.</p>';
  } else if(action==='revision'){
    title='5-minute revision · '+t.n;
    body='<p><b>Minute 1:</b> recall the framework.</p><p><b>Minutes 2–3:</b> retrieve the high-yield distinctions.</p><p><b>Minute 4:</b> state management-changing exceptions.</p><p><b>Minute 5:</b> answer three questions without notes.</p>';
  } else if(action==='memory'){
    title='Memory aid builder · '+t.n;
    body='<p>Create your own memory hook rather than receiving a random mnemonic:</p><ol><li>Choose the 3–5 facts you repeatedly forget.</li><li>Compress them into a vivid image, acronym, or contrast.</li><li>Test the hook after 10 minutes and again tomorrow.</li></ol>';
  } else if(action==='next'){
    title='Best next move';
    var focus=w&&w.t? w.t.n:t.n;
    body='<p><b>Recommended focus:</b> '+esc(focus)+'.</p><p>Use one short block: 20 minutes targeted learning + 10 minutes retrieval. If tired or overwhelmed, halve the block rather than borrowing from sleep.</p>';
  }
  return card('<div class="eyebrow drape">Offline AI study companion</div><h2>'+esc(title)+'</h2>'+body+'<div class="btnrow" style="margin-top:12px"><button type="button" class="btn sm" data-ai-copy="'+esc(action)+'">Copy AI prompt</button><button type="button" class="btn sm" data-ai-action="'+esc(action)+'">Run again</button></div><div id="smAIMsg" class="muted sm" style="margin-top:8px"></div>','drape');
}
function smAIProfile(){
  var weak=[], strong=[], recent=[];
  SM.CURRICULUM.forEach(function(t){
    var st=smAIStats(t.i); if(st.n>=5 && st.acc!=null){
      var row={i:t.i,n:t.n,acc:st.acc,q:st.n,errors:st.errors};
      if(st.acc<0.65) weak.push(row); else if(st.acc>=0.85) strong.push(row);
    }
  });
  weak.sort(function(a,b){return a.acc-b.acc||b.q-a.q;});
  strong.sort(function(a,b){return b.acc-a.acc||b.q-a.q;});
  recent=(state.aiProfile&&Array.isArray(state.aiProfile.history)?state.aiProfile.history:[]).slice(0,6);
  return {weak:weak.slice(0,5),strong:strong.slice(0,5),recent:recent};
}
function smAISession(action,mins){
  var x=smAITopic(), w=smAIWeakest(), target=x||w, t=target&&target.t;
  if(!t) return null;
  var profile=smAIProfile(), weak=profile.weak.length?SM.CURRICULUM[profile.weak[0].i]:t;
  var blocks=mins<=5?[
    '2 min — recall the framework aloud','2 min — identify one management-changing distinction','1 min — answer three rapid recall prompts'
  ]:mins<=15?[
    '5 min — focused concept repair on '+weak.n,'5 min — active recall without notes','5 min — review the two highest-yield traps'
  ]:[
    '15 min — targeted learning on '+weak.n,'10 min — active recall and closed-book explanation','10 min — fresh questions on the same concept','5 min — error review and one-sentence takeaway'
  ];
  return {title:mins+'-minute AI study session · '+weak.n,blocks:blocks,topic:weak};
}
function smAIPrompt(action){
  var x=smAITopic(), w=smAIWeakest(), t=x?x.t:null, st=x?smAIStats(x.ti):null;
  var profile=smAIProfile();
  if(!t && w) t=w.t;
  var topic=t?t.n:(w?w.t.n:'my current surgical topic');
  var perf=st&&st.n?Math.round(st.acc*100)+'% across '+st.n+' logged questions':'not enough logged data yet';
  var err=st&&st.errors.length?st.errors.slice(0,3).map(function(e){return e[0]+' ('+e[1]+')';}).join(', '):'no dominant error type recorded';
  var weak=profile.weak.slice(0,3).map(function(r){return SM.CURRICULUM[r.i].n+' '+Math.round(r.acc*100)+'%';}).join(', ')||'not enough data';
  var strong=profile.strong.slice(0,3).map(function(r){return SM.CURRICULUM[r.i].n+' '+Math.round(r.acc*100)+'%';}).join(', ')||'not enough data';
  var task={teach:'Teach me this topic progressively in 5 minutes.',mistake:'Analyse my likely misconception and show me how to repair it.',quiz:'Quiz me with active recall. Ask one question at a time and wait for my answer.',case:'Give me a difficult clinical case and make me reason step-by-step.',revision:'Give me a 5-minute high-yield revision session.',memory:'Help me build durable memory hooks for the facts I repeatedly forget.',next:'Decide the highest-value study action I should do next, given my performance.'}[action]||action;
  return 'I am preparing for NEET-SS / INI-SS surgical gastroenterology. Act as my concise, demanding but supportive surgical tutor. Current topic: '+topic+'. Current-topic performance: '+perf+'. Dominant recorded error signals: '+err+'. My weakest measured topics: '+weak+'. Strongest measured topics: '+strong+'. '+task+' Use exam-relevant surgical reasoning, distinguish commonly confused entities, and avoid overwhelming me. Do not invent facts or references. If evidence or exam conventions vary, say so. Use active recall rather than a long lecture. Start with the task immediately, ask one question at a time when appropriate, and finish with a short takeaway.';
}
function smAIRender(action){
  var x=smAITopic(), w=smAIWeakest(), target=x||w, t=target&&target.t, st=target?smAIStats(target.ti):null;
  if(!t) return card('<div class="eyebrow drape">Offline AI</div><h2>No topic selected yet</h2><p class="muted sm">Log a question or open a scheduled study block, then ask again. The offline coach needs your app data to personalise the session.</p>','drape');
  var ti=t.i, stats=smAIStats(ti), acc=stats.acc==null?'—':Math.round(stats.acc*100)+'%';
  smAIMark(action,ti);
  var title='',body='',steps=[];
  if(action==='teach'){
    title='5-minute teaching plan · '+t.n;
    steps=['1 min — state the clinical problem and why it matters','2 min — build the core mechanism / anatomy / classification','1 min — compare the two most easily confused entities','1 min — close the notes and recall the algorithm aloud'];
    body='<p><b>Goal:</b> understand the structure before memorising details.</p><ol>'+steps.map(function(s){return '<li>'+esc(s.replace(/^\d+ min — /,''))+'</li>';}).join('')+'</ol><p class="muted sm">Then ask yourself: “What would change the management?”</p>';
  } else if(action==='mistake'){
    var err=stats.errors.length?stats.errors[0][0]:'general gap';
    title='Mistake repair · '+t.n;
    body='<p><b>Current signal:</b> '+acc+' from '+stats.n+' logged questions.</p><p><b>Most recorded error:</b> '+esc(err)+'.</p><p>Offline coach rule: stop broad revision and repair this distinction first. Review the concept for 3 minutes, explain it aloud in your own words, then do 3 fresh questions.</p>';
  } else if(action==='quiz'){
    title='Active-recall drill · '+t.n;
    body='<ol><li>Define the key problem without looking.</li><li>Give the classification / decision pathway from memory.</li><li>Name the most important management-changing exception.</li><li>Explain one common examiner trap.</li><li>Give yourself one clinical scenario and state the next step.</li></ol>';
  } else if(action==='case'){
    title='Clinical case framework · '+t.n;
    body='<p>Build a case mentally using this sequence:</p><ol><li>Presentation + red flags</li><li>Most likely diagnosis</li><li>Three useful differentials</li><li>Investigation that changes management</li><li>Definitive treatment</li><li>Complication / rescue pathway</li></ol><p class="muted sm">Write your answer before revealing any reference material.</p>';
  } else if(action==='revision'){
    title='5-minute revision · '+t.n;
    body='<p><b>Minute 1:</b> recall the framework.</p><p><b>Minutes 2–3:</b> retrieve the high-yield distinctions.</p><p><b>Minute 4:</b> state management-changing exceptions.</p><p><b>Minute 5:</b> answer three questions without notes.</p>';
  } else if(action==='memory'){
    title='Memory aid builder · '+t.n;
    body='<p>Create your own memory hook rather than receiving a random mnemonic:</p><ol><li>Choose the 3–5 facts you repeatedly forget.</li><li>Compress them into a vivid image, acronym, or contrast.</li><li>Test the hook after 10 minutes and again tomorrow.</li></ol>';
  } else if(action==='next'){
    title='Best next move';
    var focus=w&&w.t? w.t.n:t.n;
    body='<p><b>Recommended focus:</b> '+esc(focus)+'.</p><p>Use one short block: 20 minutes targeted learning + 10 minutes retrieval. If tired or overwhelmed, halve the block rather than borrowing from sleep.</p>';
  }
  return card('<div class="eyebrow drape">Offline AI study companion</div><h2>'+esc(title)+'</h2>'+body+'<div class="btnrow" style="margin-top:12px"><button type="button" class="btn sm" data-ai-copy="'+esc(action)+'">Copy AI prompt</button><button type="button" class="btn sm" data-ai-action="'+esc(action)+'">Run again</button></div><div id="smAIMsg" class="muted sm" style="margin-top:8px"></div>','drape');
}
function smProceduralCard(){
  if(!SM.PROCEDURES) return '';
  state.procedures=state.procedures||{};
  var out='<div class="card"><div class="eyebrow drape">Procedural cognitive rehearsal</div><p class="muted sm">Rehearse sequence and critical steps. This is not a substitute for supervised hands-on training.</p>';
  out+=SM.PROCEDURES.map(function(pr){var ps=state.procedures[pr.id]||{},due=SM.procedureReviewDue(ps,Date.now());return '<div class="trow"><div class="row-top"><span class="sm"><b>'+esc(pr.title)+'</b></span><span class="pillq">'+(due?'Due':'Stable')+'</span></div><div class="muted sm">'+pr.steps.length+' steps · '+pr.critical.length+' critical</div><button class="btn sm" data-procedure="'+esc(pr.id)+'">'+(due?'Start rehearsal':'Review')+'</button></div>';}).join('');
  return out+'</div>';
}
function smNotificationsCard(){
  var n=state.notifications||{enabled:false,reminderMinutes:30,publicKey:'',subscription:null};
  var supported=('Notification' in window)&&('serviceWorker' in navigator)&&('PushManager' in window);
  return '<div class="card"><div class="row-top"><span class="eyebrow amber">Smart reminders</span><span class="muted sm">Meaningful only</span></div><p class="muted sm">No guilt messages. Reminders are for due or high-priority work. '+(supported?'Push delivery requires a configured VAPID public key and server;':'This browser does not expose Web Push;')+' calendar fallback works without a server.</p><div class="btnrow">'+(supported?'<button class="btn sm" id="enablePush">'+(n.subscription?'Refresh push subscription':'Enable push')+'</button>':'')+'<button class="btn sm" id="calendarReminder">Calendar reminder</button></div><p class="muted sm" id="notifyMsg">'+(n.subscription?'Subscription saved on this device.':'')+'</p></div>';
}
function renderAI(){
  var x=smAITopic(), w=smAIWeakest(), target=x||w, t=target&&target.t, st=target?smAIStats(target.ti):null;
  var topic=t?t.n:'Your current study topic';
  var acc=st&&st.acc!=null?Math.round(st.acc*100)+'%':'Not enough data';
  var localAI=(typeof navigator!=='undefined' && !!navigator.gpu);
  var runs=(state.aiProfile&&state.aiProfile.runs)||0, profile=smAIProfile();
  var out='<div class="sm-v26-hero"><div class="hero-copy"><div class="sm-v26-kicker">ॐ · AI study companion</div><div class="sm-v26-title">Optional study intelligence.</div><div class="sm-v26-copy">Offline-first. No API key. Your study engine remains the source of truth; this layer turns your local performance into focused teaching and AI-ready prompts.</div><div class="sm-v26-pill">Offline coach · Personal profile · AI handoff</div></div><img class="hero-art" src="sm-study.svg" alt="Study illustration"></div>';
  out+='<div class="card sm-ai-card"><div class="eyebrow drape">Current focus</div><h2>'+esc(topic)+'</h2><p class="muted sm">Logged accuracy: '+acc+(st?' · '+st.n+' questions':'')+' · AI sessions: '+runs+'</p><div class="sm-ai-grid">'+[
    ['teach','🧠 Teach me'],['mistake','❌ Repair my mistakes'],['quiz','🎯 Quiz me'],['case','🩺 Give me a case'],['revision','⚡ 5-minute revision'],['memory','🧩 Build a memory aid'],['next','🧭 What should I do now?']
  ].map(function(a){return '<button type="button" class="sm-ai-action" data-ai-action="'+a[0]+'">'+a[1]+'</button>';}).join('')+'</div></div>';
  out+='<div class="card sm-ai-card"><div class="eyebrow drape">AI study session</div><h2>Choose your available time</h2><p class="muted sm">The offline coach turns the time you have into one focused session. It never changes your schedule.</p><div class="sm-ai-grid">'+[[5,'⚡ 5 min'],[15,'🎯 15 min'],[30,'🔥 30 min'],[60,'🏔️ 60 min']].map(function(a){return '<button type="button" class="sm-ai-action" data-ai-session="'+a[0]+'">'+a[1]+'</button>';}).join('')+'</div><div id="smAISessionResult"></div></div>';
  out+='<div class="card sm-ai-card"><div class="eyebrow drape">Your AI learning profile</div><h2>What your data currently says</h2>';
  if(profile.weak.length) out+='<p><b>Needs repair:</b> '+profile.weak.map(function(r){return esc(SM.CURRICULUM[r.i].n)+' ('+Math.round(r.acc*100)+'%)';}).join(' · ')+'</p>'; else out+='<p class="muted sm">Not enough question data yet to call a topic weak.</p>';
  if(profile.strong.length) out+='<p><b>Strong:</b> '+profile.strong.map(function(r){return esc(SM.CURRICULUM[r.i].n)+' ('+Math.round(r.acc*100)+'%)';}).join(' · ')+'</p>';
  out+='<p class="muted sm">This is a measured study profile, not a diagnosis. More logged questions make it more reliable.</p></div>';
  out+='<div id="smAIResult"></div>';
  /* The 5 diagnostic cards below used to render on Today, interleaved with the
     one-tap action the screen exists for. They are advisory/coaching content
     — the same kind of thing as the profile card above — so they moved here
     in the 11-tab restructure rather than staying mixed in with "start this
     block now". */
  out+='<div class="eyebrow drape" style="margin-top:4px">Signals</div>';
  out+=smLearningReliabilityCard();
  out+=smAdaptiveCalibrationCard();
  out+=smAdaptiveMasteryCard();
  out+=smRetentionCheckCard();
  out+=smAdaptiveStopCard();
  out+='<div class="card sm-ai-handoff"><div class="eyebrow drape">AI integration · safe by design</div><h2>Use AI without giving up control</h2><p class="muted sm">SurgiMaster remains the source of truth for scheduling. AI receives a compact study context only when you choose to copy/open a prompt; nothing is silently uploaded.</p><div class="btnrow"><button type="button" class="btn sm" data-ai-copy="next">Copy personalised context</button><button type="button" class="btn sm" data-ai-open="next">Open ChatGPT</button></div><p class="muted sm" id="smAIHandoffMsg" style="margin-top:8px"></p></div><div class="card sm-ai-handoff"><div class="eyebrow drape">Generative AI — external</div><h2>Use ChatGPT when you want full generation</h2><p class="muted sm">Dakshinamurthy prepares the context; you choose the external AI. Nothing is sent automatically.</p><div class="btnrow"><button type="button" class="btn" data-ai-open="teach">Open ChatGPT with this study prompt</button><button type="button" class="btn sm" data-ai-copy="teach">Copy prompt</button></div><p class="muted sm" id="smAIHandoffMsg" style="margin-top:8px"></p></div>';
  out+='<div class="card"><div class="eyebrow drape">Optional local AI</div><h2>'+(localAI?'This browser exposes WebGPU':'Device/browser check')+'</h2><p class="muted sm">WebGPU support means a local model may be possible, but it does <b>not</b> mean a language model is installed. No model is downloaded silently.</p><div class="sm-ai-status"><span class="dot '+(localAI?'on':'')+'"></span>'+(localAI?'WebGPU available':'WebGPU not detected')+'</div></div>';
  return out;
}

function smIntelligenceCard(){
  if(!SM.todayPriority) return '';
  var rows=SM.todayPriority(state,{now:Date.now()}), top=rows.filter(function(x){return x.priority>0;}).slice(0,3), danger=SM.dangerList(state,3);
  var out='<div class="card"><div class="row-top"><span class="eyebrow rust">Today intelligence</span><span class="muted sm">Evidence-aware</span></div>';
  if(!top.length) return out+'<p class="muted sm">Log questions to unlock evidence-aware prioritisation.</p></div>';
  out+='<p class="lbl" style="font-size:22.5px;margin:6px 0">Highest-value next work</p>';
  out+=top.map(function(x,i){var t=SM.CURRICULUM[x.topicId], why=SM.explainPriority(x,state).slice(0,2).join(' · ');return '<div class="trow"><div class="row-top"><span class="sm"><b>'+(i+1)+'.</b> '+esc(t?t.n:'Question')+'</span><span class="pillq">'+x.priority+'</span></div><div class="muted sm">'+esc(why||x.reason)+'</div></div>';}).join('');
  if(danger.length) out+='<div class="eyebrow rust" style="margin-top:12px">Danger list</div>'+danger.map(function(x){return '<div class="trow"><div class="sm"><b>'+esc(x.topic?x.topic.n:'Topic')+'</b> · '+x.risk.confidentWrong+' confident error'+(x.risk.confidentWrong===1?'':'s')+'</div><div class="muted sm">Repeat from memory before moving on.</div></div>';}).join('');
  return out+'</div>';
}
function smProcedurePanel(id){
  var pr=SM.procedure(id); if(!pr)return '';
  state.procedures=state.procedures||{};var ps=state.procedures[id]||{},done=Array.isArray(ps.done)?ps.done.slice():Array(pr.steps.length).fill(false);
  return '<div class="card" id="procedurePanel" data-procedure-id="'+esc(pr.id)+'"><div class="eyebrow drape">'+esc(pr.domain)+'</div><h2>'+esc(pr.title)+'</h2><p class="muted sm">Think through each step before checking it.</p>'+pr.steps.map(function(st,i){var c=pr.critical.indexOf(i+1)>=0;return '<label class="trow" style="display:block"><input type="checkbox" data-pstep="'+i+'" '+(done[i]?'checked':'')+'> <span class="sm">'+(i+1)+'. '+esc(st)+(c?' <b class="rust">· critical</b>':'')+'</span></label>';}).join('')+'<div class="eyebrow" style="margin-top:12px">Confidence</div><div class="g3">'+[1,2,3].map(function(c){return '<button class="pick sm2 '+(Number(ps.confidence)===c?'on':'')+'" data-pconf="'+c+'">'+c+'/3</button>';}).join('')+'</div><div class="btnrow" style="margin-top:12px"><button class="btn solid f1" id="procedureSave">Complete rehearsal</button><button class="btn" id="procedureClose">Close</button></div><div id="procedureResult"></div></div>';
}
function smMakeICSReminder(){
  var d=new Date(Date.now()+Math.max(5,Number((state.notifications||{}).reminderMinutes)||30)*60000),e=new Date(d.getTime()+20*60000),z=function(x){return x.getFullYear()+String(x.getMonth()+1).padStart(2,'0')+String(x.getDate()).padStart(2,'0')+'T'+String(x.getHours()).padStart(2,'0')+String(x.getMinutes()).padStart(2,'0')+'00';};
  return 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//SurgiMaster//EN\r\nBEGIN:VEVENT\r\nUID:surgimaster-review-'+Date.now()+'@local\r\nDTSTAMP:'+z(new Date())+'\r\nDTSTART:'+z(d)+'\r\nDTEND:'+z(e)+'\r\nSUMMARY:SurgiMaster high-value review\r\nDESCRIPTION:Open SurgiMaster and complete the highest-priority recall.\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n';
}
function render(){
  var visual=state.visualMode||"focus";
  document.body.setAttribute("data-sm-mode",visual);
  document.body.setAttribute("data-sm-page",tab);
  var el=$("app");
  /* Every render replaces the whole page, which throws the scroll position
     back to the top \u2014 so ticking a block halfway down the day, or opening a
     topic near the end of a list, bounced you to the header every time. Keep
     the position across a re-render of the SAME tab; a genuine tab change
     should still start at the top, since that is a new screen. */
  var keepScroll = (lastRenderedTab===tab);
  var y = keepScroll ? (window.pageYOffset||document.documentElement.scrollTop||0) : 0;
  lastRenderedTab=tab;
  /* Keep the familiar navigation stable. Help is a first-class screen so the
     app can explain its workflow and provide the local feedback→AI handoff. */
  el.innerHTML = tab==="today" ? renderToday()
    : tab==="study" ? renderStudy()
    : tab==="revise" ? renderPractice()
    : tab==="progress" ? renderProgressTab()
    : tab==="more" ? renderMore()
    : tab==="log" ? renderLog()
    : tab==="myday" ? renderMyDay()
    : tab==="help" ? (typeof renderHelp==='function' ? renderHelp() : '<section class="card"><h2>Help</h2><p class="muted sm">Help is loading. Please reopen this screen.</p></section>')
    : tab==="plan" ? renderPlan()
    : tab==="settings" ? renderSettings()
    : tab==="ai" ? renderAI()
    : renderToday();
  if(!keepScroll && window.scrollTo) window.scrollTo(0,0);   /* real tab change starts at the top */
  if(keepScroll && y>0 && window.scrollTo){
    /* Restore after the browser has laid the new content out, otherwise the
       page is still its old height and the scroll is clamped. */
    if(window.requestAnimationFrame) window.requestAnimationFrame(function(){ window.scrollTo(0,y); });
    else window.scrollTo(0,y);
  }
  var dq=SM.dueQueue(state.misses,Date.now(),999).total;
  var rs=SM.repairSets(state.scores,state.repairs,Date.now(),capDays(),99).total;
  var b=$("badge"); if(b){ b.textContent=(dq+rs)>99?"99+":(dq+rs); b.hidden=!(dq+rs); }
  /* Home-screen icon badge, iOS 16.4+ and Chrome/Edge desktop and Android \u2014
     no server involved at all, unlike push. Feature-detected and silently
     skipped where unsupported rather than assumed. */
  if(navigator.setAppBadge){
    var n=dq+rs;
    if(n>0) navigator.setAppBadge(n).catch(function(){});
    else if(navigator.clearAppBadge) navigator.clearAppBadge().catch(function(){});
  }
  /* Nav highlight. Two things this used to get wrong, both found by the V35
     geometry test:
     1. It rebuilt className from scratch, which silently deleted the
        `secondary` class the More button is given in index.html — so More
        lost its styling on the very first render and never got it back.
        Use classList.toggle so unrelated classes survive.
     2. settings/plan/ai are sub-screens reached FROM More, not tabs of their
        own, so `x.dataset.tab===tab` matched nothing and the whole bar went
        unhighlighted — the user lost all sense of where they were. Those
        screens now light up More, which is how they were entered. */
  var SCREEN_NAME={today:"Today",study:"Learn",revise:"Practice",progress:"Progress",more:"More",
                   log:"Log",help:"Help",settings:"Setup",plan:"Plan",ai:"AI tools"};
  /* The app shipped with no <h1> on any screen. Screen-reader users had no
     top-level heading to navigate to and no spoken answer to "where am I".
     Hidden visually rather than promoting a hero <div>, which would inherit
     default UA heading sizing and collide with the visual layers. */
  /* insertAdjacentHTML, not innerHTML reassignment: the latter destroys and
     rebuilds every node already rendered, dropping directly-bound listeners
     and resetting open <details> and scroll position. */
  el.insertAdjacentHTML('afterbegin','<h1 class="sm-a11y-h1">'+esc(SCREEN_NAME[tab]||"Today")+'</h1>');

  /* settings/plan/ai were sub-screens of More when the nav had five tabs, so
     they were mapped onto More to keep the bar oriented. The rail gives each of
     them a button of its own, so that mapping now actively lies: opening Plan
     highlighted More. Map only what has no button. */
  /* Every tab has its own rail button in the 11-tab layout, so there is no
     longer a "More" to fall back onto for an orphaned tab value. Fall back to
     Today instead — the one screen guaranteed to exist and render cleanly —
     rather than silently highlighting nothing. */
  var navTab = tab;
  if(!document.querySelector('.railbtn[data-tab="'+tab+'"]')) navTab="more";
  Array.prototype.forEach.call(document.querySelectorAll(".navbtn,.railbtn"),function(x){
    var on = x.dataset.tab===navTab;
    x.classList.toggle("active",on);
    x.setAttribute("aria-current",on?"page":"false"); });
  /* This used to be an unconditional window.scrollTo(0,0) on EVERY render \u2014
     the actual cause of being thrown to the top of the page on every tick,
     toggle and disclosure. Scroll handling now lives at the top of render():
     hold position within a tab, reset only on a real tab change. */
  wire();
  smV17Polish();
  /* The visual-v20 module this bridged to was never loaded by index.html and
     is not in the service-worker shell; `smV20VisualRefresh` was permanently
     undefined and the guard permanently false. Module and bridge removed in
     6.4.0 along with ten other unloaded visual-v* files. */
  smV27ImageGuard();
}
/* render() is module-private inside this IIFE. help.js (a separate script)
   guarded its post-save refresh with `typeof render==='function'`, which was
   ALWAYS false from outside the closure — so saving feedback persisted the
   row but never repainted the list or enabled "Copy for AI" until a reload.
   Publish one explicit hook rather than leaking the whole closure. */
SM.rerender=function(){ render(); };
/* Public navigation bridge for static shell controls. This is deliberately tiny:
   it bypasses any event-delegation/cache edge case while keeping tab state private. */
window.SMNAV=function(next){
  if(!next) return false;
  next=String(next);
  /* Central navigation contract: validate the destination before rendering and
     keep navigation failures from becoming silent no-ops. */
  var allowed={today:1,study:1,revise:1,progress:1,more:1,log:1,myday:1,help:1,plan:1,settings:1,ai:1};
  if(!allowed[next]) return false;
  var previous=tab;
  tab=next; openBlock=null; msg=null;
  try{ render(); return true; }catch(e){
    tab=previous;
    try{ console.error("Navigation failed",e); }catch(x){}
    return false;
  }
};
/* Capture-phase navigation guard. It runs before older bubble listeners and
   before any generated control can accidentally stop propagation. This fixes
   the intermittent More/inner-More navigation failure on mobile Safari. */
(function(){
  if(document.documentElement.dataset.smNavCapture) return;
  document.documentElement.dataset.smNavCapture="1";
  document.addEventListener("click",function(e){
    var b=e.target&&e.target.closest ? e.target.closest("[data-go-tab],.railbtn[data-tab]") : null;
    if(!b) return;
    var next=b.getAttribute("data-go-tab")||b.getAttribute("data-tab");
    if(!next) return;
    e.preventDefault(); e.stopPropagation();
    if(window.SMNAV) window.SMNAV(next);
  },true);
})();
function smV27ImageGuard(){
  document.querySelectorAll("img[src^=\"sm-\"]").forEach(function(im){
    if(im.dataset.guard) return; im.dataset.guard="1";
    im.addEventListener("error",function(){ im.style.visibility="hidden"; im.setAttribute("aria-hidden","true"); });
  });
}
function on(sel,fn){ Array.prototype.forEach.call(document.querySelectorAll(sel),fn); }

function stepDay(n){
  var d=activeDate(), i=plan.CAL.map(function(c){return c.date;}).indexOf(d);
  var nx=plan.CAL[i+n];
  if(nx){ state.cursor=nx.date; openBlock=null; save(); render(); }
}

function wire(){
  (function(){
    var el=$("topicFind"); if(!el) return;
    el.value=searchQ;
    el.oninput=function(){
      var pos=el.selectionStart;
      searchQ=el.value;
      render();
      var again=$("topicFind");
      if(again&&again.focus){
        again.focus();
        try{ if(again.setSelectionRange) again.setSelectionRange(pos,pos); }catch(e){}
      }
    };
    var msg=$("findMsg");
    if(msg) msg.textContent = searchQ.trim()
      ? (SM.CURRICULUM.filter(function(t){return t.n.toLowerCase().indexOf(searchQ.trim().toLowerCase())>=0;}).length+" match"+(SM.CURRICULUM.filter(function(t){return t.n.toLowerCase().indexOf(searchQ.trim().toLowerCase())>=0;}).length===1?"":"es"))
      : "";
  })();
  (function(){
    var el=$("swapFind"); if(!el) return;
    el.value=swapQ;
    el.oninput=function(){
      var pos=el.selectionStart;
      swapQ=el.value;
      render();
      var again=$("swapFind");
      if(again&&again.focus){
        again.focus();
        try{ if(again.setSelectionRange) again.setSelectionRange(pos,pos); }catch(e){}
      }
    };
  })();
  (function(){
    var el=$("noteBox"); if(!el) return;
    el.value=noteDraft;
    el.oninput=function(){ noteDraft=el.value; };
  })();
  on("#guideHide",function(b){ b.onclick=function(){
    state.prefs.guideSeen=true; save(); render(); }; });
  on("#qSkipMastered",function(b){ b.onclick=function(){
    state.retiredCount=(state.retiredCount||0)+1;
    if(/^\d+$/.test(qlog.number)) qlog.number=String(Number(qlog.number)+1);
    var badge=$("qPassBadge"); if(badge) badge.innerHTML=passBadgeHTML(qlog.ti);
    var numEl=$("qNum"); if(numEl) numEl.value=qlog.number;
    save(); }; });
  on("[data-note]",function(b){ b.onclick=function(){
    var v=(b.dataset.note||"").split("|");
    var el=$("noteBox"); var txt=el?el.value:noteDraft;
    if(!String(txt||"").trim()) return;
    addNote(Number(v[1]), txt, v[0], "log");
    noteDraft=""; msg="Saved to the high-yield notebook.";
    save(); render(); }; });
  on("[data-rbphase]",function(b){ b.onclick=function(){
    rbPhase=Number(b.dataset.rbphase); render(); }; });
  /* A note is gone for good once removed \u2014 a single accidental tap should
     not be able to do that. First tap arms it (the button restates itself as
     "tap again"); a second tap on the SAME button within the same render
     commits it. Tapping anything else disarms rather than deletes, since the
     safe failure here is "nothing happened", not "something happened by
     accident". */
  on("[data-notedel]",function(b){ b.onclick=function(){
    var key="note:"+b.dataset.notedel;
    if(armed===key){ state.notes=(state.notes||[]).filter(function(n){return n.id!==b.dataset.notedel;}); armed=null; save(); }
    else armed=key;
    render(); }; });
  on("[data-swapopen]",function(b){ b.onclick=function(){
    swapOpen = (swapOpen===b.dataset.swapopen) ? null : b.dataset.swapopen; render(); }; });
  on("[data-swap]",function(b){ b.onclick=function(){
    var v=(b.dataset.swap||"").split("|");
    if(v.length!==4) return;
    state.swaps=state.swaps||[];
    state.swaps.push({d:v[0], i:Number(v[1]), withD:v[2], withI:Number(v[3])});
    swapQ="";
    save(); rebuild(); render(); }; });
  on("[data-swapclear]",function(b){ b.onclick=function(){
    if(armed==="swapclear"){ state.swaps=[]; swapOpen=null; armed=null; save(); rebuild(); }
    else armed="swapclear";
    render(); }; });
  on("[data-jump]",function(b){ b.onclick=function(){
    var t=$(b.dataset.jump);
    /* Respects a person's reduce-motion setting rather than forcing an
       animated scroll on everyone \u2014 iOS surfaces this under Accessibility >
       Motion, and it exists for real vestibular and attention reasons, not
       as a preference to override. */
    var noMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(t&&t.scrollIntoView) t.scrollIntoView({behavior:noMotion?"auto":"smooth",block:"start"});
    else if(window.location) window.location.hash="#"+b.dataset.jump; }; });

  on("[data-procedure]",function(b){b.onclick=function(){var old=$('procedurePanel');if(old)old.remove();var w=document.createElement('div');w.innerHTML=smProcedurePanel(b.dataset.procedure);var n=w.firstChild;$('app').appendChild(n);n.scrollIntoView({behavior:'smooth',block:'start'});wire();};});
  on("[data-pconf]",function(b){b.onclick=function(){document.querySelectorAll('[data-pconf]').forEach(function(x){x.classList.remove('on');});b.classList.add('on');};});
  on("#procedureClose",function(b){b.onclick=function(){var p=$('procedurePanel');if(p)p.remove();};});
  on("#procedureSave",function(b){b.onclick=function(){var p=$('procedurePanel'),pr=SM.procedure(p&&p.dataset.procedureId);if(!p||!pr)return;var done=Array.prototype.map.call(p.querySelectorAll('[data-pstep]'),function(x){return !!x.checked;}),c=p.querySelector('[data-pconf].on'),conf=c?Number(c.dataset.pconf):0,a=SM.procedureAssess(pr,done,conf),prev=state.procedures[pr.id]||{},nx=SM.procedureNext(prev,a);state.procedures[pr.id]={done:done,confidence:conf,lastAt:Date.now(),intervalDays:nx.intervalDays,ef:nx.ef,reps:nx.reps,lastScore:a.score,lastStatus:a.status};save();var r=$('procedureResult');if(r)r.innerHTML='<p class="sm '+(a.criticalOK?'':'rust')+'">'+(a.criticalOK?'Recorded. ':'Critical step missed — repeat tomorrow. ')+a.completed+'/'+a.total+' steps · '+a.score+'% · next review '+state.procedures[pr.id].intervalDays+'d.</p>';};});
  on("#calendarReminder",function(b){b.onclick=function(){var blob=new Blob([smMakeICSReminder()],{type:'text/calendar'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='SurgiMaster_review_reminder.ics';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1000);var m=$('notifyMsg');if(m)m.textContent='Calendar reminder created.';};});
  function vapidKeyBytes(base64url){
    var s=String(base64url||"").replace(/-/g,"+").replace(/_/g,"/");
    while(s.length%4) s+="=";
    var raw=atob(s), out=new Uint8Array(raw.length);
    for(var i=0;i<raw.length;i++) out[i]=raw.charCodeAt(i);
    return out;
  }
  on("#enablePush",function(b){b.onclick=function(){var m=$("notifyMsg"),key=state.notifications&&state.notifications.publicKey;if(!("Notification" in window)||!("serviceWorker" in navigator)||!("PushManager" in window)){if(m)m.textContent="Push unavailable here. Use the calendar fallback.";return;}if(!key){if(m)m.textContent="Add your VAPID public key in state.notifications.publicKey before enabling push delivery.";return;}var applicationServerKey;try{applicationServerKey=vapidKeyBytes(key);if(applicationServerKey.length!==65||applicationServerKey[0]!==4)throw new Error("VAPID public key must be an uncompressed P-256 base64url key.");}catch(e){if(m)m.textContent="Push setup stopped safely: "+e.message;return;}Notification.requestPermission().then(function(p){if(p!=="granted")throw new Error("Permission not granted");return navigator.serviceWorker.ready;}).then(function(reg){return reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:applicationServerKey});}).then(function(sub){state.notifications=state.notifications||{};state.notifications.enabled=true;state.notifications.subscription=sub.toJSON?sub.toJSON():sub;save();if(m)m.textContent="Push subscription saved; your push provider must deliver scheduled messages.";}).catch(function(e){if(m)m.textContent="Push setup stopped safely: "+e.message;});};});
  /* Settings actions are delegated globally below. */
  on("[role=button][data-nav]",function(b){ b.onkeydown=function(e){ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); b.click(); } }; });
  on("[data-nav]",function(b){ b.onclick=function(){
    var dest=b.dataset.nav;
    if(dest==="log"){tab="revise";practiceMode="log";}
    else if(dest==="revise"){tab="revise";practiceMode="revise";}
    else if(dest==="myday"){tab="today";}
    else {tab=dest;if(dest!=="revise") practiceMode="hub";}
    render();
  }; });
  on("[data-practice]",function(b){ b.onclick=function(){ practiceMode=b.dataset.practice||"hub"; render(); }; });
  on("[data-now]",function(b){ b.onclick=function(){ state.cursor=null; openBlock=null; panel=null; save(); render(); }; });
  on("[data-goto]",function(b){ b.onclick=function(){ state.cursor=b.dataset.goto; openBlock=null; save(); render(); }; });
  on("[data-layer]",function(b){ b.onclick=function(){
    var r=recFor(activeDate()); r.layer=b.dataset.layer; r.checks={}; r.mins=0; openBlock=null; save(); render(); }; });
  /* Three states, one tap: empty -> done -> half done -> empty. A block you got
     halfway through is the common case and calling it "not done" throws away the
     work; calling it "done" is a lie the catch-up arithmetic then inherits.
     Minutes are recomputed from the day's blocks rather than nudged up and down,
     so the total cannot drift out of step with the ticks. */
  on("#replanPreview",function(b){ b.onclick=function(){
    var r=replanFromToday();
    if(!r.ok){ replanErr=r.error; render(); return; }
    replanErr=""; replanPreview=r; render(); }; });
  on("#replanApply",function(b){ b.onclick=function(){
    if(!replanPreview) return;
    applyReplan(replanPreview); state.cursor=replanPreview.asOf; replanPreview=null;
    save(); render(); }; });
  on("#replanCancel",function(b){ b.onclick=function(){
    replanPreview=null; render(); }; });
  on("#replanUndo",function(b){ b.onclick=function(){
    state.replan=null; save(); rebuild(); render(); }; });
  on("#diagRun",function(b){ b.onclick=function(){
    diagResults=runDiagnostics(); render(); }; });
  on("#cFast",function(b){ b.onclick=function(){
    state.prefs.fastClear=!state.prefs.fastClear; save(); rebuild(); render(); }; });
  on("#cGentle",function(b){ b.onclick=function(){
    state.prefs.gentleMode=!state.prefs.gentleMode; save(); rebuild(); render(); }; });
  on("#cDefLayer",function(b){ b.onclick=function(){
    state.prefs.defaultLayer = (state.prefs.defaultLayer==="empathy") ? "normal" : "empathy";
    save(); rebuild(); render(); }; });
  on("#cDiag",function(b){ b.onclick=function(){
    var d=state.prefs.diagnosticDays||0;
    state.prefs.diagnosticDays = d===14 ? 28 : (d===28 ? 0 : 14);
    save(); rebuild(); render(); }; });
  /* Copy and open together: the old flow needed two separate taps and it was
     easy to open Claude having forgotten to copy. window.open is called from
     inside the click handler so the browser still treats it as user-initiated
     and does not block it as a popup. */
  function copyAndOpen(text,flag){
    copyText(text, function(){
      coachDraft[flag]=true; coachDraft.copyFailed=false; render();
      try{ if(window.open) window.open("https://claude.ai/new","_blank"); }catch(e){}
      setTimeout(function(){ coachDraft[flag]=false; render(); },4000);
    }, function(){ coachDraft.copyFailed=true; render(); });
  }
  on("#cCopy",function(b){ b.onclick=function(){ copyAndOpen(coachCopyText(),"copied"); }; });
  on("#cDebrief",function(b){ b.onclick=function(){ copyAndOpen(coachDebriefText(),"debriefed"); }; });
  on("#cWhy",function(b){ b.onclick=function(){ copyAndOpen(whyScheduledText(),"whyCopied"); }; });
  on("#cAutoDebrief",function(b){ b.onclick=function(){ copyAndOpen(coachDebriefText(),"debriefed"); }; });
  on("#scheduleReminders",function(b){ b.onclick=function(){
    try{
      var r=scheduleReminderICS();
      var blob=new Blob([r.text],{type:"text/calendar;charset=utf-8"});
      var url=URL.createObjectURL(blob), a=document.createElement("a");
      a.href=url; a.download="Dakshinamurthy_schedule_"+todayISO()+".ics";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function(){URL.revokeObjectURL(url);},4000);
      var msgEl=$("scheduleReminderMsg");
      if(msgEl) msgEl.innerHTML="Schedule reminders downloaded. Open the file to add them to Calendar.";
    }catch(e){ var msgEl=$("scheduleReminderMsg"); if(msgEl) msgEl.innerHTML="Could not build the calendar file here."; } }; });
  on("[data-quicktopic]",function(b){ b.onclick=function(){
    quickMcqTopic=Number(b.dataset.quicktopic); render(); }; });
  on("[data-quickresult]",function(b){ b.onclick=function(){
    if(quickMcqTopic==null) return;
    var ti=quickMcqTopic, outcome=b.dataset.quickresult;
    qlogReset(); qlog.ti=ti; qlog.app="DocTutorials"; qlog.pool="bank";
    qlog.subtopic=SM.CURRICULUM[ti].n; qlog.number="";
    if(outcome==="right") qlogCommit("right",3,"confident",null);
    else if(outcome==="fragile") qlogCommit("fragile",2,"partial",null);
    else qlogCommit("wrong",2,"gap",null);
    msg="MCQ logged.";
    render();
  }; });
  on("[data-stuck]",function(b){ b.onclick=function(){ copyAndOpen(stuckText(Number(b.dataset.stuck)),"stuckCopied"); }; });

  on("#cShare",function(b){ b.onclick=function(){
    if(!navigator.share){ coachDraft.shareErr="Not available on this browser \u2014 use the buttons above instead."; render(); return; }
    navigator.share({ text: coachCopyText() })
      .then(function(){ coachDraft.shareErr=""; })
      .catch(function(e){
        if(e && e.name==="AbortError") return;    /* the person just closed the sheet */
        coachDraft.shareErr="Sharing did not go through \u2014 use the buttons above instead."; render();
      });
  }; });

  on("[data-check]",function(b){ b.onclick=function(e){
    e.stopPropagation();
    var d=b.dataset.cdate||activeDate(), r=recFor(d), k=b.dataset.check;
    r.checks=r.checks||{};
    var cur=r.checks[k];
    r.checks[k] = (cur===true) ? 0.5 : (cur===0.5 ? undefined : true);
    if(r.checks[k]===undefined) delete r.checks[k];
    var day=plan.byDate[d], mins=0;
    if(day&&day.blocks) day.blocks.forEach(function(bl){
      var v=r.checks[bl.i];
      if(bl.kind==="lunch"||bl.kind==="buffer"||bl.kind==="protected") return;
      if(v===true) mins+=bl.mins||0; else if(v===0.5) mins+=Math.round((bl.mins||0)/2);
    });
    r.mins=mins;
    /* A real timestamp of the last tick, not a fixed 20-minute rotation.
       This is what lets the trainer line react to an actual gap in activity
       rather than just cycling text on a clock regardless of what you are
       doing. */
    state.lastActivityAt=Date.now();
    save(); render(); }; });
  on("[data-open]",function(b){ b.onclick=function(){
    var i=Number(b.dataset.open); openBlock=(openBlock===i?null:i); render(); }; });
  on("[data-bump]",function(b){ b.onclick=function(){
    var r=recFor(activeDate()), s=b.dataset.bump, n=Number(b.dataset.n);
    r[s]=Math.max(0,(r[s]||0)+n);
    if(b.dataset.ti!==""&&b.dataset.ti!==undefined){
      var sc=scoreFor(Number(b.dataset.ti)), f=b.dataset.f;
      sc[f]=Math.max(0,(sc[f]||0)+n);
      var cf=f==="ba"?"bc":"sc";
      if(sc[cf]>sc[f]) sc[cf]=sc[f];
      snapshot(Number(b.dataset.ti));
    }
    save(); render(); }; });
  on("[data-score]",function(b){ b.onclick=function(){
    var sc=scoreFor(Number(b.dataset.score)), f=b.dataset.f, af=f==="bc"?"ba":"sa";
    sc[f]=Math.max(0,Math.min(sc[af],(sc[f]||0)+Number(b.dataset.n)));
    snapshot(Number(b.dataset.score));
    save(); render(); }; });
  on("[data-lec]",function(b){ b.onclick=function(){
    var k=b.dataset.lec; state.lecDone=state.lecDone||{};
    if(state.lecDone[k]) delete state.lecDone[k]; else state.lecDone[k]=1;
    save(); render(); }; });
  on("[data-adq]",function(b){ b.onclick=function(){
    var ti=Number(b.dataset.adq); qlogReset(); qlog.ti=ti; qlog.app=b.dataset.adqApp||qlog.app; qlog.pool='bank'; qlog.subtopic=b.dataset.adqSub||''; qlog.number=b.dataset.adqNum||''; tab='revise'; logMode='log'; render();
  }; });
  on("[data-qopen]",function(b){ b.onclick=function(){
    var ti=Number(b.dataset.qopen);
    if(qlog.ti!==ti){
      qlogReset(); qlog.ti=ti;
      /* Restore where this topic was left: subtopic AND its question number.
         This call was lost when Plan was un-nested from Today — the function
         survived, the only use of it did not, which is exactly what an
         orphan-function check is for. */
      var sub=lastSubtopic(qlog.app,ti);
      if(sub){ qlog.subtopic=sub; var c=recallCursor(); if(c) qlog.number=c; }
    }
    render(); }; });
  on("#qClose",function(b){ b.onclick=function(){ qlogReset(); render(); }; });
  on("[data-qanalyse]",function(b){ b.onclick=function(){
    var ti=Number(b.dataset.qanalyse); qAnalyse=(qAnalyse===ti)?null:ti; render(); }; });
  (function(){
    var el=$("qRetest"); if(!el) return;
    el.value=qlog.retest;
    el.oninput=function(){
      qlog.retest=el.value;
      var save=$("qSave"); if(save) save.disabled=!(qlog.conf&&qlog.errType&&qlog.retest.trim());
    };
  })();
  on("[data-qapp]",function(b){ b.onclick=function(){ qlog.app=b.dataset.qapp; qlog.pool=b.dataset.qpool; render(); }; });
  ["qSub","qNum","qAppName"].forEach(function(id){
    var el=$(id); if(el) el.oninput=function(){
      if(id==="qAppName") qlog.app=el.value;
      else qlog[id==="qSub"?"subtopic":"number"]=el.value;
      /* Typing a subtopic you have logged before restores where you'd reached,
         but only while the number field is still empty — never overwrite a
         number being deliberately typed. */
      if(id==="qSub" && !qlog.number.trim()){
        var c=recallCursor();
        if(c){ qlog.number=c; var nEl=$("qNum"); if(nEl) nEl.value=c; }
      }
      var badge=$("qPassBadge"); if(badge) badge.innerHTML=passBadgeHTML(qlog.ti); }; });
  /* Every outcome writes the ledger entry keyed by app+topic+subtopic+number,
     which is what lets the SAME question be recognised again next pass \u2014 an
     aggregate tally has no way to know pass 2's question 17 is the same one
     pass 1 already saw. app is now free text (DocTutorials/Speed are quick
     taps, anything else \u2014 Surgtest, Marrow, a textbook \u2014 is typed); pool is a
     separate field that only decides which score counter it feeds, since
     "which app" and "does this pace like a bank question or a timed one" are
     different questions. */
  function qlogCommit(outcome,conf,reason,chose){
    state.lastActivityAt=Date.now();
    var ti=qlog.ti, sc=scoreFor(ti), pool=qlog.pool||"bank";
    if(outcome==="wrong"){ if(pool==="speed") sc.sa++; else sc.ba++; }
    else { if(pool==="speed"){ sc.sa++; sc.sc++; } else { sc.ba++; sc.bc++; } }
    state.calib.push({c:conf,ok:outcome!=="wrong",d:todayISO()});
    /* Every attempt carries a reason now, whichever outcome it was \u2014 "right"
       defaults to "confident" without a prompt, since that is overwhelmingly the
       common case and asking every time would undo the one-tap speed the fast
       path exists for. Tallies (which Coach's dominant-error-type finding
       reads) still only count reasons that represent an actual gap. */
    if(outcome==="wrong" && reason)
      tallyFor(ti)[reason]=(tallyFor(ti)[reason]||0)+1;
    var appName=(qlog.app||"DocTutorials").trim()||"DocTutorials";
    var mKey=null;
    if(qlog.number.trim()){
      mKey=SM.mcqKey(appName,ti,qlog.subtopic,qlog.number);
      if(!state.mcq[mKey]) state.mcq[mKey]={key:mKey,topicId:ti,app:appName,subtopic:qlog.subtopic.trim(),number:qlog.number.trim(),attempts:[]};
      state.mcq[mKey].attempts.push({pass:state.mcq[mKey].attempts.length+1,t:Date.now(),d:todayISO(),
        outcome:outcome,conf:conf,reason:reason||null,chose:(chose||"").trim(),
        /* Whether the immediate re-test ran, not what was written — the value
           itself is never graded, since the point is the retrieval attempt
           happening now, not correctness of a self-check with no answer key
           in front of it. */
        retested: conf===3 ? !!(qlog.retest||"").trim() : null});
      if(outcome==="wrong"){
        var t=SM.CURRICULUM[ti];
        state.misses.unshift(SM.newMiss({ topicId:ti,
          stem:appName+" \u203a "+(qlog.subtopic.trim()||t.n)+" \u203a Q"+qlog.number.trim(),
          right:"", why:reason?SM.ERR_TYPES.find(function(e){return e[0]===reason;})[1]:"",
          errType:reason||"gap", conf:conf, chose:(chose||"").trim(), mcqKey:mKey,
          path:appName+" \u203a "+t.n+(qlog.subtopic.trim()?" \u203a "+qlog.subtopic.trim():"")+" \u203a Q"+qlog.number.trim() }));
      }
    }
    qlogAdvance(); save();
  }
  on("[data-qlog]",function(b){ b.onclick=function(){
    var ti=Number(b.dataset.qlog), qr=b.dataset.qr;
    if(qlog.ti!==ti){ qlogReset(); qlog.ti=ti; }
    if(qr==="right") qlogCommit("right",3,"confident",null);
    else if(qr==="fragile") qlog.stage="fragile";
    else if(qr==="wrong") qlog.stage="wrong";
    render(); }; });
  on("[data-qfrag]",function(b){ b.onclick=function(){
    qlogCommit("fragile",Number(b.dataset.qc),b.dataset.qreason,null); render(); }; });
  on("[data-qconf]",function(b){ b.onclick=function(){ qlog.conf=Number(b.dataset.qconf); render(); }; });
  on("[data-qerr]",function(b){ b.onclick=function(){ qlog.errType=b.dataset.qerr; render(); }; });
  on("#qCancel",function(b){ b.onclick=function(){ qlog.stage=null; qlog.conf=null; qlog.errType=null; qlog.chose=""; qlog.retest=""; render(); }; });
  on("#qSave",function(b){ b.onclick=function(){
    /* Matches the disabled condition exactly \u2014 the button being disabled
       is a display detail, not the actual guard, so a stray onclick() cannot
       bypass the retest requirement. */
    if(!qlog.conf||!qlog.errType) return;
    if(qlog.conf===3 && !qlog.retest.trim()) return;
    qlogCommit("wrong",qlog.conf,qlog.errType,qlog.chose); render(); }; });
  var qc=$("qChose"); if(qc) qc.oninput=function(){ qlog.chose=qc.value; };
  on("[data-panel]",function(b){ b.onclick=function(){
    panel = (panel===b.dataset.panel) ? null : b.dataset.panel; render(); }; });
  on("[data-call]",function(b){ b.onclick=function(){
    var d=todayISO();
    state.calls[d]=Math.max(0,(state.calls[d]||0)+Number(b.dataset.call));
    save(); render(); }; });
  on("[data-session-start]",function(b){ b.onclick=function(){
    var _ti=smTodayBridge(activeDate(),plan.byDate[activeDate()],recFor(activeDate())), sp=smSessionPlan(activeDate(),30,_ti.anchor,_ti);
    state.session={date:activeDate(),startedAt:Date.now(),mins:sp.mins,blocks:sp.blocks,mode:"standard",current:0,strategy:sp.decision&&sp.decision.strategy||"focused",baselineAccuracy:sp.decision&&sp.decision.target?sp.decision.target.accuracy:null};
    state.lastActivityAt=Date.now(); save(); msg="Session started — one 30-minute block at a time. The engine reassesses as you complete blocks."; render();
  }; });
  on("[data-session-next]",function(b){ b.onclick=function(){
    if(!state.session) return;
    var i=Number(state.session.current)||0;
    if(i < state.session.blocks.length-1){
      var _td=smAdaptiveDecision(activeDate(),30,false), _ga=(_td.target&&_td.target.accuracy!=null&&state.session.baselineAccuracy!=null)?(_td.target.accuracy-state.session.baselineAccuracy):0;
      state.adaptive4=state.adaptive4||{strategies:{},runs:0}; if(SM.adaptiveStrategyObserve) state.adaptive4.strategies=SM.adaptiveStrategyObserve(state.adaptive4.strategies,state.session.strategy,_ga); state.adaptive4.runs=(state.adaptive4.runs||0)+1;
      state.session.current=i+1;
      var nd=smSessionPlan(activeDate(),30), nb=nd.blocks[0];
      if(nb){ state.session.blocks[i+1]={mins:30,label:nb.label,type:nb.type}; }
      state.session.decision=nd.decision;
      state.lastActivityAt=Date.now(); save(); msg="Block complete. The engine reassessed your evidence and prepared the next 30-minute move."; render(); }
    else { var _td2=smAdaptiveDecision(activeDate(),30,false), _ga2=(_td2.target&&_td2.target.accuracy!=null&&state.session.baselineAccuracy!=null)?(_td2.target.accuracy-state.session.baselineAccuracy):0; state.adaptive4=state.adaptive4||{strategies:{},runs:0}; if(SM.adaptiveStrategyObserve) state.adaptive4.strategies=SM.adaptiveStrategyObserve(state.adaptive4.strategies,state.session.strategy,_ga2); state.adaptive4.runs=(state.adaptive4.runs||0)+1; var wasRecovery=!!state.session.recovery; state.recoveryLog=state.recoveryLog||{}; if(wasRecovery) state.recoveryLog[activeDate()]={status:"completed",at:Date.now(),minutes:Number(state.session.mins)||30}; state.session.completedAt=Date.now(); state.session=null; state.lastActivityAt=Date.now(); save(); msg=wasRecovery?"Recovery block complete. No catch-up debt has been added; today’s campaign remains protected.":"Adaptive session complete. Your next recommendation will use the new evidence you logged."; render(); }
  }; });
  on("[data-session-stop]",function(b){ b.onclick=function(){
    if(state.session){ var _td2=smAdaptiveDecision(activeDate(),30,false), _ga2=(_td2.target&&_td2.target.accuracy!=null&&state.session.baselineAccuracy!=null)?(_td2.target.accuracy-state.session.baselineAccuracy):0; state.adaptive4=state.adaptive4||{strategies:{},runs:0}; if(SM.adaptiveStrategyObserve) state.adaptive4.strategies=SM.adaptiveStrategyObserve(state.adaptive4.strategies,state.session.strategy,_ga2); state.adaptive4.runs=(state.adaptive4.runs||0)+1; var wasRecovery=!!state.session.recovery; state.recoveryLog=state.recoveryLog||{}; if(wasRecovery) state.recoveryLog[activeDate()]={status:"stopped",at:Date.now(),minutes:Number(state.session.mins)||30}; state.session.completedAt=Date.now(); state.session=null; state.lastActivityAt=Date.now(); save(); msg=wasRecovery?"Recovery stopped. You won’t be prompted again today; no catch-up debt has been created.":"Session finished. The campaign remains unchanged; your logged work is what feeds the next session."; render(); }
  }; });
  on("[data-recovery-skip]",function(b){ b.onclick=function(){
    var date=activeDate(); state.recoveryLog=state.recoveryLog||{}; state.recoveryLog[date]={status:"dismissed",at:Date.now(),minutes:0}; state.lastActivityAt=Date.now(); save(); msg="Recovery set aside for today. Your normal plan is unchanged and no catch-up debt is created."; render();
  }; });
  on("[data-recovery-start]",function(b){ b.onclick=function(){
    var date=activeDate(), rs=smRecoveryChoice(date);
    if(!rs) return;
    var action=rs.action||'retrieve', label=(action==='repair'?'Repair':(action==='retrieve'||action==='recall'?'Retrieve':'Learn'))+' · '+rs.topic;
    state.session={date:date,startedAt:Date.now(),mins:Math.min(30,rs.summary.totalMins||30),blocks:[{mins:Math.min(30,rs.summary.totalMins||30),label:label,type:'recovery',topicId:rs.topicId||null}],mode:'recovery',current:0,recovery:true,recoveredMinutes:Math.min(30,rs.summary.totalMins||30),recoveryTarget:{topicId:rs.topicId||null,action:action,sourceDate:rs.sourceDate||null}};
    state.lastActivityAt=Date.now(); save(); msg="Recovery block started. No additional catch-up has been added to your campaign."; render();
  }; });
  on("[data-minimum-start]",function(b){ b.onclick=function(){
    var sp=smMinimumSession(); state.minimumDay=true; state.minimumDayDate=activeDate();
    state.session={date:activeDate(),startedAt:Date.now(),mins:15,blocks:sp.blocks,mode:"minimum",current:0};
    state.lastActivityAt=Date.now(); save(); msg="15-minute minimum day started. No catch-up is owed."; render();
  }; });
  on("[data-timer]",function(b){ b.onclick=function(){
    var id=activeDate()+"#"+b.dataset.timer;
    if(!timer||timer.blockId!==id) timer={blockId:id,start:Date.now(),base:0,running:true};
    else if(timer.running){ timer.base=timerElapsed(); timer.running=false; }
    else { timer.start=Date.now(); timer.running=true; }
    persistTimer(); render(); }; });
  on("[data-timerstop]",function(b){ b.onclick=function(){
    var secs=timerElapsed(), ti=b.dataset.ti;
    var r=recFor(activeDate()); r.mins=(r.mins||0)+Math.round(secs/60);
    timer=null; persistTimer();
    pendingPace=(ti!==""&&ti!==undefined)?{ti:Number(ti),secs:secs,q:0}:null;
    save(); render(); }; });
  on("[data-cal]",function(b){ b.onclick=function(){
    state.calib.push({c:Number(b.dataset.cal),ok:b.dataset.ok==="1",d:todayISO(),t:Date.now()});
    save(); render(); }; });
  on("[data-repair]",function(b){ b.onclick=function(){
    var ti=Number(b.dataset.repair);
    var r=state.repairs[ti]||{last:0,reps:0};
    state.repairs[ti]={last:Date.now(),reps:(r.reps||0)+1};
    msg="Repair logged. That topic will not come back for at least "+SM.REPAIR_MIN_GAP+" days.";
    save(); render(); }; });
  on("[data-tally]",function(b){ b.onclick=function(){
    var ti=Number(b.dataset.tally), k=b.dataset.k, t=tallyFor(ti);
    if(!k) return;
    t[k]=(t[k]||0)+1;
    state.lastActivityAt=Date.now();
    save(); render();
  }; });
  on("[data-untally]",function(b){ b.onclick=function(){
    var ti=Number(b.dataset.untally), t=tallyFor(ti);
    Object.keys(t).forEach(function(k){ if(t[k]>0) t[k]--; if(t[k]<=0) delete t[k]; });
    save(); render();
  }; });
  on("[data-show]",function(b){ b.onclick=function(){ reviewShown=b.dataset.show; render(); }; });
  on("[data-grade]",function(b){ b.onclick=function(){
    var m=SM.dueQueue(state.misses,Date.now(),60).queue[0]; if(!m) return;
    var e=SM.nextExam(state.prefs,todayISO());
    var dte=e?SM.daysBetween(todayISO(),e.iso):null;
    var grade=b.dataset.grade;
    /* Active-recall interval is an isolated, bounded SM-2 record. The mature
       campaign scheduler keeps its existing FSRS-style topic/miss logic; SM-2
       here provides a durable item-level retrieval clock with hard boundaries. */
    var qmap={again:1,almost:3,got:4,easy:5}, q=Object.prototype.hasOwnProperty.call(qmap,grade)?qmap[grade]:1;
    var prev=m.sm2||{ef:2.5,interval:1,reps:0};
    var sm2=SM.calculateNextInterval(q,prev.ef,prev.interval,prev.reps);
    sm2.nextDueDate=Date.now()+sm2.interval*DAY;
    state.misses=state.misses.map(function(x){
      if(x.id!==m.id) return x;
      var y=SM.review(x,grade,Date.now(),dte); y.sm2=sm2; return y;
    });
    if(window.SMStorage&&SMStorage.putRecall){
      SMStorage.putRecall({id:m.id,topicId:m.topicId,stem:m.stem||'',right:m.right||'',sm2:sm2,updatedAt:Date.now()}).catch(function(){});
    }
    /* A retrieval attempt in Revise is still an attempt at the same question \u2014
       extending its ledger history here is what lets "wrong in Log, then wrong
       again on retrieval three separate times" show up as the repeat-miss
       finding it actually is, instead of Revise and Log keeping two silent,
       disconnected records of the same question. Scores are untouched: those
       count real MCQs done in the source apps, not internal spaced review. */
    if(m.mcqKey && state.mcq[m.mcqKey]){
      var outcome = grade==="again" ? "wrong" : (grade==="almost" ? "fragile" : "right");
      var reason = grade==="again" ? (m.errType||"recall") : (grade==="almost" ? "effort" : "confident");
      var q=state.mcq[m.mcqKey];
      q.attempts.push({pass:q.attempts.length+1,t:Date.now(),d:todayISO(),outcome:outcome,
        conf:grade==="easy"?3:(grade==="got"?3:(grade==="almost"?2:1)),reason:reason,chose:""});
    }
    reviewShown=null; save(); render(); }; });
  /* Lands on the backup screen itself. Sending someone to the tab and leaving
     them to find a segmented control is how a one-tap safety net becomes a
     three-tap one nobody uses. */
  on("[data-gobackup]",function(b){ b.onclick=function(){
    tab="revise"; logMode="backup"; msg=null; render(); }; });
  on("[data-lmode]",function(b){ b.onclick=function(){ logMode=b.dataset.lmode; msg=null; render(); }; });
  on("[data-showall]",function(b){ b.onclick=function(){ showAll=b.dataset.showall==="1"; render(); }; });
  /* data-set is delegated globally below. */
  /* data-sel is delegated globally below. */
  /* data-date is delegated globally below. */
  /* data-exam is delegated globally below. */
  /* data-reset is delegated globally below. */
  /* data-ics is delegated globally below. */

  on("[data-shot]",function(el){
    shotGet(el.dataset.shot).then(function(b){ if(b) el.src=URL.createObjectURL(b); })
      .catch(function(){ el.replaceWith(document.createTextNode("image unavailable")); });
  });
  var cb=$("copyBtn"); if(cb) cb.onclick=function(){
    var box=$("expBox"); box.focus(); box.select(); var m=$("copyMsg");
    if(navigator.clipboard&&navigator.clipboard.writeText)
      navigator.clipboard.writeText(box.value).then(function(){m.textContent="Copied."; markBackedUp();},
        function(){m.textContent="Select all and copy manually.";});
    else { try{ document.execCommand("copy"); m.textContent="Copied."; markBackedUp(); }
      catch(e){ m.textContent="Select all and copy manually."; } } };
  var dlb=$("dlBackup"); if(dlb) dlb.onclick=function(){
    try{
      var blob=new Blob([SM.exportPayload(state)],{type:"application/json"});
      var url=URL.createObjectURL(blob), a=document.createElement("a");
      a.href=url; a.download="Dakshinamurthy_backup_"+todayISO()+".json";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function(){URL.revokeObjectURL(url);},4000);
      backupMsg="Downloaded. Move it to iCloud Drive so it survives even if this device is lost.";
      markBackedUp(); render();
    }catch(e){ backupMsg="Download did not work here \u2014 use Copy as text below instead."; render(); } };
  var pkb=$("pickBackup"); if(pkb) pkb.onclick=function(){ var f=$("fileBackup"); if(f) f.click(); };
  var fb=$("fileBackup"); if(fb) fb.onchange=function(){
    var file=fb.files&&fb.files[0]; if(!file) return;
    var reader=new FileReader();
    reader.onload=function(){
      var r=SM.parseBackup(String(reader.result||""));
      if(!r.ok){ msg=r.error; render(); return; }
      snapshotState(localStorage.getItem(KEY)||JSON.stringify(state));
    var m=SM.mergeBackup(state.misses,state.days,r.misses,r.days);
      state.misses=m.misses; state.days=m.days;
      state.scores=SM.mergeScores(state.scores,r.scores);
      state.calib=SM.mergeCalib(state.calib,r.calib);
      state.tallies=SM.mergeTallies(state.tallies,r.tallies);
      state.repairs=SM.mergeRepairs(state.repairs,r.repairs);
        state.mcq=SM.mergeMcq(state.mcq,r.mcq);
      state.procedures=state.procedures||{}; Object.keys(r.procedures||{}).forEach(function(k){
        var a=state.procedures[k]||{}, b=r.procedures[k]||{};
        if(!a.lastAt || Number(b.lastAt||0)>Number(a.lastAt||0)) state.procedures[k]=b;
      });
      /* Later cursor wins; watched lectures union. Neither can be un-done
         by a restore, which matches how the rest of merging behaves. */
      Object.keys(r.cursors||{}).forEach(function(k){
        var a=+(state.cursors||{})[k]||0, b=+r.cursors[k]||0;
        state.cursors=state.cursors||{}; if(b>a) state.cursors[k]=r.cursors[k]; });
      state.lecDone=state.lecDone||{};
      Object.keys(r.lecDone||{}).forEach(function(k){ state.lecDone[k]=1; });
      /* adaptiveProfile: merge per topic, newest wins, never wholesale replace
         — the same rule the rest of restore follows, so an older backup can
         never erase learning the engine has done since. */
      if(r.adaptiveProfile && r.adaptiveProfile.topics){
        state.adaptiveProfile=state.adaptiveProfile||{topics:{},lastUpdate:null};
        state.adaptiveProfile.topics=state.adaptiveProfile.topics||{};
        Object.keys(r.adaptiveProfile.topics).forEach(function(k){
          var mine=state.adaptiveProfile.topics[k], theirs=r.adaptiveProfile.topics[k];
          if(!mine || Number(theirs&&theirs.lastUpdate||0)>Number(mine.lastUpdate||0))
            state.adaptiveProfile.topics[k]=theirs;
        });
        state.adaptiveProfile.lastUpdate=Math.max(
          Number(state.adaptiveProfile.lastUpdate||0),
          Number(r.adaptiveProfile.lastUpdate||0))||state.adaptiveProfile.lastUpdate;
      }
      /* adaptive4: per-strategy, newest wins; run count takes the max so a
         restore can only ever add evidence, never discard it. */
      if(r.adaptive4 && r.adaptive4.strategies){
        state.adaptive4=state.adaptive4||{strategies:{},runs:0};
        state.adaptive4.strategies=state.adaptive4.strategies||{};
        Object.keys(r.adaptive4.strategies).forEach(function(k){
          var mine=state.adaptive4.strategies[k], theirs=r.adaptive4.strategies[k];
          if(!mine || Number(theirs&&theirs.lastUpdate||0)>Number(mine.lastUpdate||0))
            state.adaptive4.strategies[k]=theirs;
        });
        state.adaptive4.runs=Math.max(Number(state.adaptive4.runs||0),Number(r.adaptive4.runs||0));
      }
      /* ics settings are adopted only where the user has none, so a restore
         never overwrites export preferences set on this device. */
      if(r.ics && !state.ics) state.ics=r.ics;
      state.retiredCount=Math.max(state.retiredCount||0, r.retiredCount||0);
      /* pace and calls are cumulative counters, same as a score \u2014 merging
         means adding, not choosing one side. hist is a [date,accuracy] trend
         per topic, capped at 40 points; merge by date so the SAME day logged
         on two devices does not double up, then re-sort and re-cap exactly
         as snapshot() does when writing a single new point. */
      state.pace=state.pace||{};
      Object.keys(r.pace||{}).forEach(function(k){
        var a=state.pace[k]||{sec:0,q:0}, b2=r.pace[k]||{sec:0,q:0};
        state.pace[k]={sec:a.sec+b2.sec, q:a.q+b2.q};
      });
      state.calls=state.calls||{};
      Object.keys(r.calls||{}).forEach(function(k){
        state.calls[k]=(state.calls[k]||0)+(r.calls[k]||0);
      });
      state.hist=state.hist||{};
      Object.keys(r.hist||{}).forEach(function(k){
        var byDate={};
        (state.hist[k]||[]).concat(r.hist[k]||[]).forEach(function(pt){ byDate[pt[0]]=pt[1]; });
        var merged=Object.keys(byDate).sort().map(function(d){ return [d,byDate[d]]; });
        state.hist[k]=merged.slice(-40);
      });
      msg=m.added+" added, "+m.updated+" updated, "+m.kept+" kept, from "+esc(file.name)+".";
      save(); render();
    };
    reader.onerror=function(){ msg="Could not read that file."; render(); };
    reader.readAsText(file);
    fb.value="";
  };
  var mb=$("mergeBtn"); if(mb) mb.onclick=function(){
    var r=SM.parseBackup($("impBox").value);
    if(!r.ok){ msg=r.error; render(); return; }
    snapshotState(localStorage.getItem(KEY)||JSON.stringify(state));
    var m=SM.mergeBackup(state.misses,state.days,r.misses,r.days);
    state.misses=m.misses; state.days=m.days;
    state.scores=SM.mergeScores(state.scores,r.scores);
    state.calib=SM.mergeCalib(state.calib,r.calib);
    state.tallies=SM.mergeTallies(state.tallies,r.tallies);
    state.repairs=SM.mergeRepairs(state.repairs,r.repairs);
    state.mcq=SM.mergeMcq(state.mcq,r.mcq);
    state.procedures=state.procedures||{}; Object.keys(r.procedures||{}).forEach(function(k){
      var a=state.procedures[k]||{}, b=r.procedures[k]||{};
      if(!a.lastAt || Number(b.lastAt||0)>Number(a.lastAt||0)) state.procedures[k]=b;
    });
    Object.keys(r.cursors||{}).forEach(function(k){
      var a=+(state.cursors||{})[k]||0, b=+r.cursors[k]||0;
      state.cursors=state.cursors||{}; if(b>a) state.cursors[k]=r.cursors[k]; });
    state.lecDone=state.lecDone||{};
    Object.keys(r.lecDone||{}).forEach(function(k){ state.lecDone[k]=1; });
      state.retiredCount=Math.max(state.retiredCount||0, r.retiredCount||0);
      /* pace and calls are cumulative counters, same as a score \u2014 merging
         means adding, not choosing one side. hist is a [date,accuracy] trend
         per topic, capped at 40 points; merge by date so the SAME day logged
         on two devices does not double up, then re-sort and re-cap exactly
         as snapshot() does when writing a single new point. */
      state.pace=state.pace||{};
      Object.keys(r.pace||{}).forEach(function(k){
        var a=state.pace[k]||{sec:0,q:0}, b2=r.pace[k]||{sec:0,q:0};
        state.pace[k]={sec:a.sec+b2.sec, q:a.q+b2.q};
      });
      state.calls=state.calls||{};
      Object.keys(r.calls||{}).forEach(function(k){
        state.calls[k]=(state.calls[k]||0)+(r.calls[k]||0);
      });
      state.hist=state.hist||{};
      Object.keys(r.hist||{}).forEach(function(k){
        var byDate={};
        (state.hist[k]||[]).concat(r.hist[k]||[]).forEach(function(pt){ byDate[pt[0]]=pt[1]; });
        var merged=Object.keys(byDate).sort().map(function(d){ return [d,byDate[d]]; });
        state.hist[k]=merged.slice(-40);
      });
    msg=m.added+" added, "+m.updated+" updated, "+m.kept+" kept. Scores, tallies and calibration merged.";
    save(); render(); };
  var dl=$("icsDl"); if(dl) dl.onclick=function(){
    try{
      var blob=new Blob([icsText()],{type:"text/calendar;charset=utf-8"});
      var url=URL.createObjectURL(blob), a=document.createElement("a");
      a.href=url; a.download="SurgiMaster_"+state.ics.detail+"_"+state.ics.range+".ics";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function(){URL.revokeObjectURL(url);},4000);
      $("icsMsg").innerHTML="Downloaded. Open it from Files and it goes to Calendar.";
    }catch(e){ $("icsMsg").innerHTML="Download failed here — try <b>Open in Calendar</b>."; } };
  var op=$("icsOpen"); if(op) op.onclick=function(){
    try{
      var blob=new Blob([icsText()],{type:"text/calendar;charset=utf-8"});
      var url=URL.createObjectURL(blob), w=window.open(url,"_blank");
      if(!w) window.location.href=url;
      setTimeout(function(){URL.revokeObjectURL(url);},20000);
      $("icsMsg").innerHTML="Opened the calendar file. If nothing happened, use <b>Download .ics</b>.";
    }catch(e){ $("icsMsg").innerHTML="This browser would not hand the file over. Use <b>Download .ics</b>."; } };
}


/* swipe between days */
(function(){
  var x0=null,y0=null;
  document.addEventListener("touchstart",function(e){
    if(e.touches.length!==1) return; x0=e.touches[0].clientX; y0=e.touches[0].clientY; },{passive:true});
  document.addEventListener("touchend",function(e){
    if(x0===null||tab!=="today") { x0=null; return; }
    var t=e.changedTouches[0], dx=t.clientX-x0, dy=t.clientY-y0;
    x0=null;
    if(Math.abs(dx)>60 && Math.abs(dx)>Math.abs(dy)*2) stepDay(dx<0?1:-1);
  },{passive:true});
})();

setInterval(function(){
  if(!timer||!timer.running) return;
  var el=document.querySelector(".tclock");
  if(!el) return;
  var s=timerElapsed();
  el.textContent=String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");
},1000);

/* The browser can discard a backgrounded tab without warning, and iPadOS does
   it routinely. Saving on the way out costs nothing and is the difference
   between losing a tick and losing a day. */
(function(){
  function flush(){ try{ save(); }catch(e){} }
  document.addEventListener("visibilitychange",function(){
    if(document.visibilityState==="hidden") flush(); });
  window.addEventListener("pagehide",flush);
  window.addEventListener("blur",flush);
})();

/* Settings delegation: Settings is re-rendered as a whole screen, so its controls
   must not depend on per-node onclick/onchange wiring surviving a render cycle.
   Capture-phase delegation also wins over accidental bubbling handlers and makes
   every visible settings control a real, deterministic action. */
(function(){
  if(document.documentElement.dataset.smSettingsDelegated) return;
  document.documentElement.dataset.smSettingsDelegated="1";
  document.addEventListener("click",function(e){
    var b=e.target&&e.target.closest ? e.target.closest("[data-visual-mode],[data-set],[data-reset],[data-ics]") : null;
    if(!b) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if(b.dataset.visualMode){
      var m=b.dataset.visualMode;
      if(m==="focus"||m==="study"||m==="night"){ state.visualMode=m; save(); render(); }
      return;
    }
    if(b.dataset.set){
      var k=b.dataset.set, v=state.prefs[k]+Number(b.dataset.d);
      var lim={dailyHours:[3,14],dayBuffer:[0,180],playback:[1,2.5],pad:[1,2],bankPace:[0.5,3],lectureShare:[0.15,0.6]}[k];
      if(lim){ state.prefs[k]=Math.min(lim[1],Math.max(lim[0],Math.round(v*100)/100)); rebuild(); state.cursor=null; save(); render(); }
      return;
    }
    if(b.dataset.reset!==undefined){
      if(!window.confirm("Reset planning settings to defaults? Your logged study history, questions and notes will be kept.")) return;
      state.prefs=merge(SM.DEFAULTS,{}); rebuild(); state.cursor=null; save(); render();
      return;
    }
    if(b.dataset.ics){
      var ik=b.dataset.ics, iv=b.dataset.v;
      if(ik==="protect") state.ics.protect=!state.ics.protect;
      else if(ik==="alarm") state.ics.alarm=(iv==="null"?null:Number(iv));
      else state.ics[ik]=iv;
      save(); render();
    }
  },true);
  document.addEventListener("change",function(e){
    var s=e.target&&e.target.closest ? e.target.closest("[data-sel],[data-date],[data-exam]") : null;
    if(!s) return;
    e.stopImmediatePropagation();
    if(s.dataset.sel){ state.prefs[s.dataset.sel]=Number(s.value); rebuild(); state.cursor=null; save(); render(); return; }
    if(s.dataset.date){ if(s.value){ state.prefs[s.dataset.date]=s.value; rebuild(); state.cursor=null; save(); render(); } return; }
    if(s.dataset.exam){
      if(!s.value) return;
      var i=Number(s.dataset.exam); state.prefs.exams=state.prefs.exams.slice();
      state.prefs.exams[i]={style:state.prefs.exams[i].style,iso:s.value};
      rebuild(); state.cursor=null; save(); render();
    }
  },true);
})();

/* Navigation/action delegation: these controls are rendered dynamically on every
   tab change. Delegate at document level so More and every other generated
   action remains clickable even after a full render replacement. */
(function(){
  if(document.documentElement.dataset.smDelegatedActions) return;
  document.documentElement.dataset.smDelegatedActions="1";
  document.addEventListener("click",function(e){
    var route=e.target&&e.target.closest ? e.target.closest("[data-go-tab]") : null;
    if(route){
      var nextRoute=route.getAttribute("data-go-tab");
      if(nextRoute){
        e.preventDefault(); e.stopPropagation();
        tab=nextRoute; openBlock=null; msg=null; render();
        return;
      }
    }
    var moreTool=e.target&&e.target.closest ? e.target.closest("[data-more-tools]") : null;
    if(moreTool){
      e.preventDefault(); e.stopPropagation();
      var det=document.querySelector(".sm-v29-more-simple") && document.querySelector(".coachMore");
      if(det){ det.open=true; det.scrollIntoView({behavior:"auto",block:"start"}); }
      return;
    }
    var ab=e.target&&e.target.closest ? e.target.closest("[data-ai-action],[data-ai-copy]") : null;
    if(ab){
      e.preventDefault();
      var action=ab.dataset.aiAction||ab.dataset.aiCopy;
      if(ab.dataset.aiCopy!==undefined){
        var txt=smAIPrompt(action);
        (navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(txt):Promise.reject()).then(function(){var m=$("smAIMsg");if(m)m.textContent="Prompt copied. Paste it into your AI app.";}).catch(function(){var m=$("smAIMsg");if(m)m.textContent=txt;});
      } else {
        var r=$("smAIResult"); if(r){r.innerHTML=smAIRender(action); r.scrollIntoView({behavior:"smooth",block:"start"});}
      }
      return;
    }
    var sess=e.target&&e.target.closest ? e.target.closest("[data-ai-session]") : null;
    if(sess){
      e.preventDefault();
      var mins=Number(sess.dataset.aiSession)||15, planS=smAISession("session",mins), sr=$("smAISessionResult");
      if(sr && planS){ sr.innerHTML=card('<div class="eyebrow drape">Offline AI session</div><h2>'+esc(planS.title)+'</h2><ol>'+planS.blocks.map(function(b){return '<li>'+esc(b.replace(/^\d+ min — /,''))+'</li>';}).join('')+'</ol><p class="muted sm">When finished, log the questions or learning block normally. This session plan does not alter your schedule.</p><div class="btnrow"><button type="button" class="btn sm" data-ai-copy="next">Copy AI handoff prompt</button></div>','drape'); sr.scrollIntoView({behavior:"smooth",block:"nearest"}); smAIMark("session",planS.topic.i); }
      return;
    }
    var openAI=e.target&&e.target.closest ? e.target.closest("[data-ai-open]") : null;
    if(openAI){
      e.preventDefault();
      var ap=smAIPrompt(openAI.dataset.aiOpen||"teach");
      var url="https://chatgpt.com/?q="+encodeURIComponent(ap);
      var win=window.open(url,"_blank","noopener,noreferrer");
      var hm=$("smAIHandoffMsg");
      if(!win && navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(ap).then(function(){if(hm)hm.textContent="ChatGPT could not be opened here, so the prompt was copied instead.";}); }
      else if(hm) hm.textContent="Prompt prepared for ChatGPT. Nothing was sent automatically.";
      return;
    }
    var b=e.target&&e.target.closest ? e.target.closest("[data-go-tab],[data-more-tools],.navbtn,.railbtn") : null;
    if(!b) return;
    if(b.classList && b.classList.contains("railbtn") && b.dataset.tab==="more"){
      e.preventDefault(); e.stopPropagation();
      tab="more"; openBlock=null; msg=null; render();
      return;
    }
    if(b.dataset.moreTools!==undefined){
      var d=document.querySelector(".coachMore");
      if(d){ d.open=true; d.scrollIntoView({behavior:(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)?"auto":"smooth",block:"start"}); }
      return;
    }
    var next=b.getAttribute("data-go-tab") || b.dataset.tab;
    if(!next) return;
    e.preventDefault();
    tab=next; openBlock=null; msg=null; render();
  },false);
})();
try{
  render();
  /* Wired once, after first render. The search markup lives outside #app so it
     survives every re-render; binding it per render would stack duplicate
     listeners for the life of the session. Failure here must never take down
     startup, so it is caught separately from the render above. */
  try{ wireSearch(); }catch(se){ try{console.warn("Search failed to initialise",se);}catch(x){} }
}catch(e){
  try{console.error("Dakshinamurthy startup render failed",e);}catch(x){}
  var be=document.getElementById("sm8BootError"), bm=document.getElementById("sm8BootMsg");
  if(be){ be.style.display="block"; }
  if(bm){ bm.textContent=String(e&&e.stack||e&&e.message||e||"Unknown startup error"); }
}

})();


/* ===== UI MODULE 8: ui-simple-v14.part.js ===== */
/* v13.2.4 — Simplified five-tab presentation layer.
   The adaptive engine stays intact; the interface deliberately exposes fewer
   decisions. Primary workflow: Today → Learn → Practice → Progress → More. */

function smSimpleHeader(kicker,title,copy){
  return '<div class="dm24-header"><div class="dm24-kicker">'+esc(kicker)+'</div><h2>'+esc(title)+'</h2>'+
    (copy?'<p>'+esc(copy)+'</p>':'')+'</div>';
}
function smSimpleStat(label,value,note){
  return '<div class="dm24-stat"><div class="dm24-stat-value">'+esc(String(value))+'</div><div class="dm24-stat-label">'+esc(label)+'</div>'+
    (note?'<div class="dm24-stat-note">'+esc(note)+'</div>':'')+'</div>';
}
function smSimpleTodayStats(entry,date,r){
  var f=entry&&entry.kind==='content'?shapeToday(entry,date,plan.P,r):null;
  var blocks=f?(f.shaped.blocks||[]):(entry&&entry.blocks||[]);
  var work=blocks.filter(function(b){return ['lunch','buffer','protected'].indexOf(b.kind)<0;});
  var done=0;
  work.forEach(function(b){var d=b.foldedFrom?(state.days[b.foldedFrom]||{}):r;var key=b.foldedFrom?b.foldedBlockId:b.i;var v=(d.checks||{})[key];if(v===true)done++;});
  return {blocks:work,done:done,total:work.length};
}

/* v14.4.4: recovery stays calm. A single small miss is not automatically turned
   into another task; the offer appears only when there is a meaningful recent
   pattern (2+ affected days) or at least 60 minutes of missed study. The engine
   still chooses the target, but the UI explains why the signal crossed the threshold. */
/* v14.4.2: recovery remains bounded, adds signal-to-noise filtering and makes the
   chosen recovery target explicit. Small misses stay invisible rather than becoming
   another task on an already protected day. */
/* v14.4.1: recovery remains bounded, but now has a clear lifecycle.
   A recovery offer is shown at most once per day; completing, stopping, or
   dismissing it prevents the same offer from nagging the user repeatedly. */
function smRecoveryStatus(date){
  var x=state.recoveryLog&&state.recoveryLog[date];
  return x&&x.status?x.status:null;
}
function smRecoverySummary(date){
  var out=[], days=0, totalMins=0;
  for(var k=1;k<=7;k++){
    var d=new Date(date+'T12:00:00'); d.setDate(d.getDate()-k);
    var iso=d.toISOString().slice(0,10), e=plan.byDate[iso], r=recFor(iso);
    if(!e) continue;
    var ts=smSimpleTodayStats(e,iso,r);
    var missed=0, mins=0;
    (ts.blocks||[]).forEach(function(b){
      var bd=b.foldedFrom?(state.days[b.foldedFrom]||{}):r;
      var key=b.foldedFrom?b.foldedBlockId:b.i;
      if((bd.checks||{})[key]!==true){ missed++; mins+=Math.max(15,Number(b.mins)||30); }
    });
    if(missed){ days++; totalMins+=mins; out.push({date:iso,missed:missed,mins:mins}); }
  }
  return {days:days,totalMins:totalMins,items:out};
}
function smTodayRecoveryTarget(date,ad){
  var topics=[];
  try{ topics=smAdaptiveTopics(date)||[]; }catch(e){ topics=[]; }
  /* Recovery is still a Today decision: when a repair signal exists, prefer
     the most defensible repair target rather than allowing the generic adaptive
     learner to drift back to broad new learning. Ties remain deterministic. */
  var repair=topics.filter(function(t){return t.repair||t.recentMiss||t.confidentWrong;}).sort(function(a,b){
    return (Number(b.repair)-Number(a.repair)) || (Number(b.confidentWrong)-Number(a.confidentWrong)) ||
      (Number(b.retentionRisk||0)-Number(a.retentionRisk||0)) || (Number(b.due||0)-Number(a.due||0)) ||
      ((a.name||'').localeCompare(b.name||''));
  })[0];
  if(repair) return {target:repair,action:repair.repair||repair.recentMiss||repair.confidentWrong?'repair':(ad.action||'retrieve'),reason:'Today is using the strongest repair signal before opening new learning.'};
  return {target:ad.target||{},action:ad.action||'retrieve',reason:'Today is using current retention and mastery evidence to choose the bridge back.'};
}
function smRecoveryChoice(date){
  if(smRecoveryStatus(date)) return null;
  var rs=smRecoverySummary(date);
  if(!rs.days || (rs.days<2 && rs.totalMins<60)) return null;
  var ad=smAdaptiveDecision(date,30,false), picked=smTodayRecoveryTarget(date,ad), t=picked.target||{};
  var action=picked.action||'retrieve';
  var source=rs.items.slice().sort(function(a,b){return (b.mins-a.mins)||(b.date.localeCompare(a.date));})[0]||{};
  var signal=rs.days>=2?'a repeated recent miss pattern':(rs.totalMins+' minutes of recent missed study');
  var engineReason=(ad.reason&&ad.reason.length)?ad.reason.join(' · '):picked.reason;
  return {summary:rs, topic:t.name||'your highest-value weak topic', topicId:t.i, action:action, sourceDate:source.date, sourceMinutes:source.mins, signal:signal, reason:engineReason, bridgeReason:picked.reason};
}

function smTodayPrimaryBlock(ts,date){
  if(!ts||!ts.blocks) return null;
  for(var i=0;i<ts.blocks.length;i++){
    var b=ts.blocks[i], bd=b.foldedFrom?(state.days[b.foldedFrom]||{}):null, key=b.foldedFrom?b.foldedBlockId:b.i;
    var checks=(bd||{}).checks||((state.days[date]||{}).checks||{});
    if(checks[key]!==true) return {block:b,index:i,label:b.label||'Next scheduled block',mins:Number(b.mins)||30,type:b.kind||'planned'};
  }
  return null;
}

/* v14.4.8: Today is the single director. When a scheduled block remains, repair
   is an overlay on that block rather than a competing destination. Repair and retrieval signals are folded into this unfinished Today block; the same
   decision object is used by the card and the session start handler, so the
   user sees one recommendation and then receives that exact recommendation. */
function smTodayBridge(date,entry,r){
  var ts=smSimpleTodayStats(entry,date,r), anchor=smTodayPrimaryBlock(ts,date), ad=smAdaptiveDecision(date,30,false);
  var recovery=smRecoveryChoice(date), repairTotal=0, due=0;
  try{ repairTotal=SM.repairSets(state.scores,state.repairs,Date.now(),capDays(),4).total||0; }catch(e){}
  try{ due=(SM.dueQueue(state.misses,Date.now(),60).queue||[]).length; }catch(e){}
  if(anchor){
    var topicId=anchor.block&&(anchor.block.ti!=null?anchor.block.ti:(anchor.block.topicId!=null?anchor.block.topicId:null));
    var target=ad.target||{}, overlay='planned';
    /* Only call it a repair overlay when the evidence points at the same
       scheduled topic. Otherwise preserve the campaign block and merely use
       retrieval/repair technique inside it. */
    if(topicId!=null && target.i!=null && Number(topicId)===Number(target.i) &&
       (ad.action==='repair'||ad.action==='recall'||ad.action==='retrieve')) overlay=ad.action;
    return {mode:'today',anchor:anchor,overlay:overlay,target:target,ad:ad,recovery:null,
      label:anchor.label||'Next scheduled block',reason:overlay==='repair'?'Repair evidence points to this scheduled topic.':
        overlay==='recall'||overlay==='retrieve'?'Today keeps the scheduled block and uses retrieval evidence inside it.':
        'Today stays anchored to the campaign; adaptive evidence shapes the method, not the topic; the schedule remains the anchor.',
      signals:(ts.total-ts.done)+' block'+(ts.total-ts.done===1?'':'s')+' remaining'};
  }
  if(recovery) return {mode:'recovery',anchor:null,overlay:'recovery',target:recovery,recovery:recovery,ad:ad,
    label:recovery.topic,reason:recovery.bridgeReason,signals:recovery.summary.days+' recent miss'+(recovery.summary.days===1?'':'es')};
  return {mode:(repairTotal||due)?'practice':'today',anchor:null,overlay:(repairTotal?'repair':'retrieve'),target:ad.target||{},recovery:null,
    label:(ad.target&&ad.target.name)||'the next useful topic',reason:(repairTotal||due)?'Today is clear, so the next block can absorb the strongest repair/retrieval signal.':'The campaign is clear here; use the next evidence-aware move.',
    signals:(due?due+' due item'+(due===1?'':'s'):'')+(due&&repairTotal?' · ':'')+(repairTotal?repairTotal+' repair set'+(repairTotal===1?'':'s'):'')};
}

function smTodayIntelligence(date,entry,r){
  var ts=smSimpleTodayStats(entry,date,r), repairTotal=0, due=0;
  try{ repairTotal=SM.repairSets(state.scores,state.repairs,Date.now(),capDays(),4).total||0; }catch(e){}
  try{ due=(SM.dueQueue(state.misses,Date.now(),60).queue||[]).length; }catch(e){}
  var bridge=smTodayBridge(date,entry,r), recovery=bridge.recovery, ad=bridge.ad, t=ad.target||{}, primaryBlock=bridge.anchor;
  var action=ad.action||'learn', label=t.name||'the next useful topic';
  var primary='today', button='Start next block →', kicker='TODAY · INTELLIGENT NEXT STEP', note='The normal plan stays in charge.';
  if(bridge.mode==='today'){
    /* The schedule anchors Today. Adaptive evidence changes the method only. */
    if(primaryBlock) label=primaryBlock.label;
    action=bridge.overlay;
    note=bridge.reason;
    kicker='TODAY · '+(bridge.overlay==='repair'?'REPAIR INSIDE TODAY':bridge.overlay==='retrieve'||bridge.overlay==='recall'?'RETRIEVAL INSIDE TODAY':'SCHEDULE ANCHOR');
  } else if(recovery){
    primary='recovery'; kicker='TODAY · RECOVERY + REPAIR'; button='Do one '+Math.min(30,recovery.summary.totalMins)+'-min recovery block →';
    note='The recovery block is the bridge between missed work and today — bounded, optional, and never added as catch-up debt. '+recovery.bridgeReason;
    label=recovery.topic; action=recovery.action;
  } else if(repairTotal||due){
    primary='repair'; kicker='TODAY · REPAIR + RETRIEVAL';
    note='Today has no unfinished campaign block, so the engine can use this space for repair/retrieval instead of creating extra catch-up work.';
  }
  var actionLabel=ts.total>ts.done?'Today':(action==='retrieve'||action==='recall'?'Retrieve':action==='repair'?'Repair':action==='retain'?'Retention':'Learn');
  var signals=[];
  if(ts.total>ts.done) signals.push((ts.total-ts.done)+' today block'+(ts.total-ts.done===1?'':'s')+' remaining');
  if(due) signals.push(due+' due retrieval item'+(due===1?'':'s'));
  if(repairTotal) signals.push(repairTotal+' repair set'+(repairTotal===1?'':'s'));
  if(recovery) signals.push(recovery.summary.days+' recent miss'+(recovery.summary.days===1?'':'es'));
  return {primary:primary,button:button,kicker:kicker,note:note,label:label,action:action,actionLabel:actionLabel,anchor:primaryBlock,signals:signals,recovery:recovery,ts:ts,repairTotal:repairTotal,due:due,reason:(ad.reason||[]).join(' · ')||'Based on your recent study evidence.'};
}

function renderToday(){
  var date=activeDate(), entry=plan.byDate[date], r=recFor(date), P=plan.P;
  var nx=SM.nextExam(P,date), ts=smSimpleTodayStats(entry,date,r);
  var out=smSimpleHeader('ॐ · TODAY','What do I do today?','Your schedule is already planned. Just take the next unfinished block.');
  out+='<div class="dm24-today-meta">'+
    '<span>'+esc(date)+'</span>'+
    (nx?'<span>Exam · '+esc(nx.iso)+'</span>':'')+
    '<span>'+(state.layer==='empathy'||r.layer==='empathy'?'Empathy mode':'Normal mode')+'</span></div>';
  out+='<div class="dm24-stats">'+smSimpleStat('Blocks',ts.done+' / '+ts.total,'completed')+smSimpleStat('Study target',r.layer==='empathy'?(P.empathyHours||7.25)+' h':P.dailyHours.toFixed(2)+' h','scheduled')+'</div>';
  if(!entry){ out+=card('<div class="eyebrow drape">Today</div><p class="lbl">No scheduled work on this date.</p><p class="muted sm">Use the calendar in Plan when you need to inspect the campaign.</p>','drape'); return out; }
  /* v14.3: if an adaptive session is already active, Today becomes a session
     cockpit. This makes the app recoverable after an accidental reload/background
     suspension and prevents the user from being shown a fresh recommendation
     while an unfinished session is already in progress. */
  var activeSession=state.session&&state.session.date===date?state.session:null;
  if(activeSession){
    var si=Math.min(Math.max(0,Number(activeSession.current)||0),(activeSession.blocks||[]).length-1);
    var sb=(activeSession.blocks||[])[si]||{mins:30,label:'Current adaptive block'};
    var totalBlocks=(activeSession.blocks||[]).length||1, doneBlocks=Math.min(si,totalBlocks);
    out+='<div class="dm24-session-active" role="region" aria-label="Active adaptive session">'+
      '<div class="dm24-session-kicker">ACTIVE SESSION · RESUMED</div>'+
      '<div class="dm24-session-title">'+esc(sb.label)+'</div>'+
      '<div class="dm24-session-meta">Block '+(si+1)+' of '+totalBlocks+' · '+esc(String(sb.mins||30))+' min · '+esc(activeSession.mode==='minimum'?'Minimum day':(activeSession.mode==='recovery'?'Recovery':'Adaptive'))+'</div>'+
      '<div class="dm24-session-track" aria-label="Session progress"><span style="width:'+Math.round((doneBlocks/totalBlocks)*100)+'%"></span></div>'+
      '<div class="btnrow"><button type="button" class="dm24-next-button" data-session-next="1">'+(si<totalBlocks-1?'Complete block →':'Complete final block')+'</button><button type="button" class="dm24-session-stop" data-session-stop="1">Finish session</button></div>'+
      '<p class="dm24-session-note">Your session is saved locally. You can leave the app and return without losing the current block.</p>'+
      '</div>';
  }
  /* v14.3: Today is the command centre. The adaptive engine decides the next
     useful move from actual evidence, but the UI presents only one decision:
     start the recommended 30-minute block. No extra dashboard interpretation. */
  var todayIntel=smTodayIntelligence(date,entry,r);
  out+='<div class="dm24-next-action" role="region" aria-label="Today intelligent next step">'+
    '<div class="dm24-next-kicker">'+esc(todayIntel.kicker)+'</div>'+
    '<div class="dm24-next-title">'+esc(todayIntel.actionLabel)+' · '+esc(todayIntel.label)+'</div>'+
    '<div class="dm24-next-meta">'+esc(todayIntel.button.replace('Do one ','').replace('Start next block →','30 min'))+
      (todayIntel.signals.length?' · '+esc(todayIntel.signals.join(' · ')):'')+'</div>'+
    '<div class="dm24-next-reason">'+esc(todayIntel.reason)+' '+esc(todayIntel.note)+'</div>'+
    '<div class="btnrow"><button type="button" class="dm24-next-button" '+(todayIntel.primary==='recovery'?'data-recovery-start="1"':'data-session-start="1"')+'>'+esc(todayIntel.button)+'</button>'+
      (todayIntel.primary==='recovery'?'<button type="button" class="dm24-session-stop" data-recovery-skip="1">Not today</button>':'')+'</div>'+ 
    (todayIntel.primary!=='recovery'?'<button type="button" class="dm24-next-small" data-minimum-start="1">Only 15 minutes available</button>':'')+
    '</div>';
  out+=renderTodaySchedule(entry,date,r,P);
  out+='<div class="dm24-divider"></div>';
  out+=quickMcqCard(entry,date);
  return out;
}

function renderStudy(){
  var B=plan.B, ph=curriculumPhaseNow(), topics=B.topics||[];
  var phaseTopics=topics.filter(function(t){return t.phase===ph;});
  var out=smSimpleHeader('LEARN','Learn the syllabus.','Phase → topic → lecture. Nothing else is required here.');
  out+='<div class="dm24-focus"><b>Current phase</b><span>'+ph+'. '+esc(SM.PHASE_NAME[ph]||('Phase '+ph))+'</span></div>';
  out+='<div class="dm24-section-title">Current phase topics</div><div class="dm24-topic-list">'+phaseTopics.map(function(t){
    var a=topicAcc(t.i); return '<div class="dm24-topic-row"><div><b>'+esc(t.n)+'</b><span>'+t.nlec+' lectures · '+(t.dtq+t.spq).toLocaleString()+' questions</span></div>'+
      '<span class="dm24-topic-pct">'+(a==null?'—':Math.round(a*100)+'%')+'</span></div>'; }).join('')+'</div>';
  out+='<div class="dm24-section-title">All phases</div><div class="dm24-phase-list">'+[1,2,3,4,5,6,7].map(function(k){
    var arr=topics.filter(function(t){return t.phase===k;});
    return '<details><summary><b>'+k+'. '+esc(SM.PHASE_NAME[k]||('Phase '+k))+'</b><span>'+arr.length+' topics</span></summary><div class="dm24-phase-topics">'+arr.map(function(t){return '<div><b>'+esc(t.n)+'</b><span>'+t.nlec+' lectures · '+(t.dtq+t.spq).toLocaleString()+' questions</span></div>';}).join('')+'</div></details>'; }).join('')+'</div>';
  return out;
}

function renderPractice(){
  if(practiceMode==='revise') return renderRevise();
  if(practiceMode==='log') return renderSimpleQuickLog();
  var due=SM.dueQueue(state.misses,Date.now(),60).total;
  var sets=SM.repairSets(state.scores,state.repairs,Date.now(),capDays(),4).total;
  var entry=plan.byDate[activeDate()];
  var out=smSimpleHeader('PRACTICE','Questions without the paperwork.','Log the result in one tap. The adaptive engine handles the rest.');
  out+='<div class="dm24-action-grid"><button class="dm24-primary-action" data-practice="log"><b>Log an MCQ</b><span>Topic → Right · Fragile · Wrong</span></button><button class="dm24-primary-action" data-practice="revise"><b>Revise due</b><span>'+(due?due+' item'+(due===1?'':'s')+' due':'Nothing due')+'</span></button></div>';
  out+='<div class="dm24-stats">'+smSimpleStat('Due',due,'retrieval')+smSimpleStat('Repair sets',sets,'needs another look')+smSimpleStat('Logged',Object.keys(state.mcq||{}).length,'question records')+'</div>';
  return out;
}
function renderSimpleQuickLog(){
  var entry=plan.byDate[activeDate()], out=smSimpleHeader('PRACTICE · LOG','Log an MCQ','Choose a topic, then tap the outcome. That is all.');
  out+=quickMcqCard(entry,activeDate());
  out+='<div class="dm24-back"><button class="btn sm" data-practice="hub">← Back to Practice</button></div>';
  return out;
}

function renderProgressTab(){
  var b=progressBreakdown(), due=SM.dueQueue(state.misses,Date.now(),60).total, pace=paceOverall();
  var cov=b.all.total?Math.round(b.all.done/b.all.total*100):0;
  var qPct=b.questions.total?Math.round(b.questions.done/b.questions.total*100):0;
  var lPct=b.lectures.total?Math.round(b.lectures.done/b.lectures.total*100):0;
  var acc=b.accuracy==null?'—':Math.round(b.accuracy*100)+'%';
  var out=smSimpleHeader('PROGRESS','How am I doing?','A small dashboard. Open the detail only when you actually need it.');
  out+='<div class="dm24-progress-grid">'+
    smSimpleStat('Syllabus',cov+'%',b.all.done+' / '+b.all.total+' min')+
    smSimpleStat('Lectures',lPct+'%',b.lectures.done+' / '+b.lectures.total+' min')+
    smSimpleStat('MCQs',qPct+'%',b.questions.done+' / '+b.questions.total+' min')+
    smSimpleStat('Accuracy',acc,'logged questions')+
    smSimpleStat('Due',due,'retrieval items')+
    smSimpleStat('Pace',pace==null?'—':Math.round(pace)+' s','per question')+'</div>';
  var nx=SM.nextExam(plan.P,todayISO());
  out+='<div class="dm24-focus"><b>Exam</b><span>'+(nx?esc(nx.iso):'Not set')+'</span></div>';
  out+='<details class="dm24-detail"><summary>Detailed progress</summary>';
  out+=card('<div class="eyebrow">Accuracy by topic</div><div class="dm24-mini-list">'+SM.CURRICULUM.map(function(t){var a=topicAcc(t.i);return '<div><span>'+esc(t.n)+'</span><span>'+(a==null?'—':Math.round(a*100)+'%')+'</span></div>';}).join('')+'</div>');
  out+='</details>';
  return out;
}

function renderMore(){
  return smSimpleHeader('MORE','Tools & support','Less-frequent actions live here. Pick one thing, then use the back control to return.')+
    '<div class="dm24-more-group"><div class="dm24-section-title">Study</div><div class="dm24-more-list">'+
    '<button type="button" data-go-tab="study"><b>Learn</b><span>Open phases, topics and lectures</span></button>'+
    '<button type="button" data-go-tab="log"><b>Log an MCQ</b><span>Record a question without leaving the study flow</span></button>'+
    '<button type="button" data-go-tab="plan"><b>Plan</b><span>Inspect or change the campaign</span></button>'+
    '</div></div>'+
    '<div class="dm24-more-group"><div class="dm24-section-title">App</div><div class="dm24-more-list">'+
    '<button type="button" data-go-tab="settings"><b>Setup</b><span>Modes, exam date, reminders and backup</span></button>'+
    '<button type="button" data-go-tab="help"><b>Help & feedback</b><span>Learn the workflow and send structured feedback</span></button>'+
    '<button type="button" data-go-tab="ai"><b>AI tools</b><span>Optional study support and handoff prompts</span></button>'+
    '</div></div>'+
    '<div class="dm24-more-tip">Tip: <b>Today</b> tells you what to do now; <b>Practice</b> handles questions; <b>Progress</b> shows the signal.</div>';
}
