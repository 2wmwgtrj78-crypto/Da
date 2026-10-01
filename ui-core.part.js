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

