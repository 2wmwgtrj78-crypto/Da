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

