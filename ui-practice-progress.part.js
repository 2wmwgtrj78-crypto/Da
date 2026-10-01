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

