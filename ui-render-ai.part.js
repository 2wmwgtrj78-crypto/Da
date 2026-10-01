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
