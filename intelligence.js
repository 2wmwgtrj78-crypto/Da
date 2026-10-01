/* SurgiMaster Intelligence Layer 4.2
   Evidence-aware prioritisation, topic health, dangerous misconceptions,
   procedural cognitive rehearsal, session strategy learning and diagnostics.
   This layer is deterministic and offline-first; it never invents question text. */
(function(w){
  'use strict';
  var SM=w.SM;
  if(!SM) return;
  var DAY=SM.DAY||86400000;
  function num(v,d){v=Number(v);return isFinite(v)?v:(d||0);}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function arr(v){return Array.isArray(v)?v:[];}

  function classifyOutcome(outcome,conf){
    outcome=String(outcome||'').toLowerCase(); conf=num(conf,0);
    if(outcome==='right') return conf>=3?'stable':(conf===2?'stable-medium':'fragile');
    if(outcome==='wrong') return conf>=3?'dangerous':'knowledge-gap';
    if(outcome==='fragile') return 'fragile';
    return 'unknown';
  }
  function questionRisk(q){
    q=q||{}; var a=arr(q.attempts), wrong=0,cw=0,recentWrong=0,reg=0,last=null;
    a.forEach(function(x,i){
      if(x.outcome==='wrong'){wrong++; if(num(x.conf)>=3) cw++; if(i>=Math.max(0,a.length-4)) recentWrong++;}
      if(i>0 && a[i-1].outcome!=='wrong' && x.outcome==='wrong') reg++;
      last=x;
    });
    var clinical=num(q.clinicalWeight,1), exam=num(q.examWeight,1);
    var score=cw*22+Math.min(30,wrong*7)+recentWrong*8+reg*10+(a.length>1?Math.min(10,a.length-1)*2:0);
    score*=1+Math.max(0,clinical-1)*.15+Math.max(0,exam-1)*.10;
    return {score:Math.round(clamp(score,0,100)),wrong:wrong,confidentWrong:cw,recentWrong:recentWrong,regressions:reg,last:last,
      state:cw>0?'dangerous':(wrong>0?'weak':'unknown')};
  }
  function topicHealth(topicId,state){
    state=state||{}; var q=Object.keys(state.mcq||{}).map(function(k){return state.mcq[k];}).filter(function(x){return x&&Number(x.topicId)===Number(topicId);});
    var attempts=0,right=0,wrong=0,cw=0,fragile=0,guesses=0,recent=[];
    q.forEach(function(x){arr(x.attempts).forEach(function(a){attempts++; if(a.outcome==='wrong') wrong++; else if(a.outcome==='right') right++; else fragile++; if(a.outcome==='wrong'&&num(a.conf)>=3) cw++; if(a.outcome==='right'&&a.reason==='guessed') guesses++; recent.push(a);});});
    recent.sort(function(a,b){return num(b.t)-num(a.t);});
    var acc=attempts?right/attempts:null;
    var coverage=Math.min(1,q.length/20);
    var risk=clamp((cw*0.12)+(wrong*0.025)+(fragile*0.015)+(guesses*0.02),0,1);
    var recentAcc=recent.slice(0,10); var rAcc=recentAcc.length?recentAcc.filter(function(a){return a.outcome!=='wrong';}).length/recentAcc.length:null;
    var stateName='unknown';
    if(cw>=2 || (cw>=1 && wrong>=3)) stateName='danger';
    else if(acc!==null && acc<.5) stateName='weak';
    else if(acc!==null && acc<.72) stateName='fragile';
    else if(acc!==null && coverage>=.75 && risk<.08) stateName='ready';
    else if(acc!==null) stateName='watch';
    return {topicId:Number(topicId),attempts:attempts,questions:q.length,accuracy:acc,recentAccuracy:rAcc,coverage:coverage,
      wrong:wrong,confidentWrong:cw,fragile:fragile,guesses:guesses,risk:risk,state:stateName};
  }
  function topicImportance(topicId){
    /* Uses the curriculum's own curated exam-yield weights (yINI/yNEET, each
       0-2) instead of guessing importance from keywords in the topic name.
       The old regex approach could and did diverge from the real data \u2014
       e.g. Bariatric Surgery has the lowest yINI in the whole curriculum (0)
       but matched neither keyword list, so it silently got the same default
       weight as most other topics. examWeight follows yINI specifically
       (INI-SS is this app's stated primary target exam); clinicalWeight
       blends both exams' yield as a broader relevance signal. Mapped onto
       the same roughly-1-to-4 range the rest of this file already expects,
       so no downstream multiplier needed retuning. */
    var t=SM.CURRICULUM[Number(topicId)]; if(!t) return {clinicalWeight:1,examWeight:1};
    var yi=clamp(num(t.yINI,1),0,2), yn=clamp(num(t.yNEET,1),0,2);
    return {clinicalWeight:1+((yi+yn)/2)*1.5, examWeight:1+yi*1.5};
  }
  function dangerList(state,limit){
    state=state||{}; limit=Number(limit)||8; var out=[];
    Object.keys(state.mcq||{}).forEach(function(k){
      var q=state.mcq[k], r=questionRisk(q);
      if(r.confidentWrong>0){ var imp=topicImportance(q.topicId); r.score=clamp(r.score*(1+(imp.clinicalWeight-1)*.08),0,100); out.push({key:k,q:q,risk:r,importance:imp,topic:SM.CURRICULUM[q.topicId]}); }
    });
    out.sort(function(a,b){return b.risk.score-a.risk.score;}); return out.slice(0,limit);
  }
  function todayPriority(state,opts){
    state=state||{}; opts=opts||{}; var now=num(opts.now,Date.now()), rows=[];
    Object.keys(state.mcq||{}).forEach(function(k){
      var q=state.mcq[k], r=questionRisk(q), last=r.last, age=last?Math.max(0,(now-num(last.t,now))/DAY):999;
      var p=r.score+(age>1?Math.min(18,age*2):0)+(r.recentWrong*8);
      if(r.confidentWrong) p+=25;
      if(last&&last.outcome==='fragile') p+=15;
      rows.push({type:'question',key:k,topicId:q.topicId,priority:Math.round(clamp(p,0,140)),reason:r.confidentWrong?'confident error':(r.recentWrong?'recent miss':'review evidence'),risk:r});
    });
    SM.CURRICULUM.forEach(function(t){
      var h=topicHealth(t.i,state), imp=topicImportance(t.i), p=0;
      if(h.attempts===0) p+=8; else {p+=Math.max(0,(.72-(h.accuracy||.5))*55); p+=h.confidentWrong*16; p+=h.wrong*2; p+=(1-h.coverage)*12;}
      p+=imp.examWeight*2;
      rows.push({type:'topic',topicId:t.i,priority:Math.round(clamp(p,0,100)),reason:h.state,health:h});
    });
    return rows.sort(function(a,b){return b.priority-a.priority||a.topicId-b.topicId;});
  }
  function explainPriority(row,state){
    var out=[]; if(!row) return out;
    if(row.type==='question'){var r=row.risk; if(r.confidentWrong) out.push(r.confidentWrong+' confident error'+(r.confidentWrong===1?'':'s')); if(r.recentWrong) out.push(r.recentWrong+' recent miss'+(r.recentWrong===1?'':'es')); if(r.regressions) out.push(r.regressions+' regression'); if(r.last) out.push('last attempt '+Math.round(Math.max(0,(Date.now()-num(r.last.t,Date.now()))/DAY))+'d ago');}
    else {var h=row.health, imp=topicImportance(row.topicId); if(h.confidentWrong) out.push(h.confidentWrong+' confident error'+(h.confidentWrong===1?'':'s')); if(h.accuracy!=null) out.push(Math.round(h.accuracy*100)+'% logged accuracy'); out.push(Math.round(h.coverage*100)+'% evidence coverage'); out.push('exam weight '+imp.examWeight+'/4');}
    return out;
  }
  function strategyProfile(state){return (state&&state.adaptive4&&state.adaptive4.strategies)||{};}
  function observeStrategy(state,strategy,gain){state.adaptive4=state.adaptive4||{strategies:{},runs:0};state.adaptive4.strategies=SM.adaptiveStrategyObserve(state.adaptive4.strategies,strategy,gain);state.adaptive4.runs=(num(state.adaptive4.runs)+1);return state;}

  function confidenceCalibration(state){
    state=state||{}; var total=0,correct=0,certain=0,certainCorrect=0,uncertain=0,uncertainCorrect=0;
    Object.keys(state.mcq||{}).forEach(function(k){arr(state.mcq[k]&&state.mcq[k].attempts).forEach(function(a){
      if(a.outcome!=='right'&&a.outcome!=='wrong') return; total++;
      var c=num(a.conf,0); if(a.outcome==='right') correct++;
      if(c>=3){certain++;if(a.outcome==='right') certainCorrect++;}
      else if(c>0){uncertain++;if(a.outcome==='right') uncertainCorrect++;}
    });});
    var accuracy=total?correct/total:null, certainAccuracy=certain?certainCorrect/certain:null, uncertainAccuracy=uncertain?uncertainCorrect/uncertain:null;
    var calibrationRisk=certain?clamp(1-certainAccuracy,0,1):0;
    return {total:total,accuracy:accuracy,certain:certain,certainAccuracy:certainAccuracy,uncertain:uncertain,uncertainAccuracy:uncertainAccuracy,risk:calibrationRisk,state:!certain?'unknown':(certainAccuracy<.65?'overconfident':(certainAccuracy>=.85?'well-calibrated':'mixed'))};
  }
  function nextBestAction(state,opts){
    opts=opts||{}; var mins=clamp(num(opts.minutes,30),5,240), rows=todayPriority(state,{now:num(opts.now,Date.now())});
    var q=rows.filter(function(x){return x.type==='question'&&x.priority>0;})[0], topic=rows.filter(function(x){return x.type==='topic'&&x.priority>0;})[0];
    var d=dangerList(state,1)[0]; var chosen=d?{type:'danger',topicId:d.q.topicId,priority:d.risk.score,reason:'confident error needs corrective retrieval'}:(q?{type:'question',topicId:q.topicId,priority:q.priority,reason:q.reason}:{type:'topic',topicId:topic?topic.topicId:null,priority:topic?topic.priority:0,reason:topic?topic.reason:'build evidence'});
    var t=chosen.topicId!=null?SM.CURRICULUM[chosen.topicId]:null;
    var action=chosen.type==='danger'||chosen.type==='question'?'retrieve':(topic&&topic.health&&topic.health.accuracy!=null&&topic.health.accuracy<.65?'repair':'learn');
    var block=Math.min(mins, action==='retrieve'?15:action==='repair'?20:30);
    var rationale=[]; if(d) rationale.push('confident error'); if(topic&&topic.health){if(topic.health.confidentWrong) rationale.push(topic.health.confidentWrong+' confident error(s)'); if(topic.health.accuracy!=null) rationale.push(Math.round(topic.health.accuracy*100)+'% accuracy');} if(opts.examSoon) rationale.push('exam runway');
    return {topic:t||null,topicId:chosen.topicId,action:action,minutes:block,priority:chosen.priority,rationale:rationale,reason:chosen.reason,confidenceCalibration:confidenceCalibration(state)};
  }
  /* Adaptive Engine 2.0 — v15 decision layer.  It converts the existing
     evidence streams into one deterministic, explainable decision. It never
     mutates the campaign and never invents question identities. */
  function adaptiveEvidenceProfile(state,opts){
    state=state||{}; opts=opts||{}; var now=num(opts.now,Date.now()), rows=[];
    var due={};
    try{ var dq=SM.dueQueue?SM.dueQueue(state.misses,now,999):{queue:[]};
      arr(dq.queue).forEach(function(x){var id=Number(x.topicId); if(isFinite(id)) due[id]=(due[id]||0)+1;}); }catch(e){}
    var repairs={};
    try{ var rs=SM.repairSets?SM.repairSets(state.scores,state.repairs,now,opts.capDays||90,999):{sets:[]};
      arr(rs.sets).forEach(function(x){var id=Number(x.ti!=null?x.ti:x.topicId); if(isFinite(id)) repairs[id]=(repairs[id]||0)+1;}); }catch(e){}
    SM.CURRICULUM.forEach(function(t){
      var h=topicHealth(t.i,state), imp=topicImportance(t.i), d=due[t.i]||0, rp=repairs[t.i]||0;
      var rec=h.recentAccuracy==null?null:h.recentAccuracy;
      var mastery=rec!=null?rec:(h.accuracy!=null?h.accuracy:0);
      var freshness=h.attempts?Math.min(1,h.attempts/20):0;
      var evidence=h.attempts?Math.min(1,h.attempts/10):0;
      var priority=0;
      priority+=(1-mastery)*32;
      priority+=h.confidentWrong*18;
      priority+=h.wrong*3;
      priority+=d*7;
      priority+=rp*10;
      priority+=(1-freshness)*10;
      priority+=imp.examWeight*3;
      if(h.state==='ready') priority-=12;
      priority=clamp(priority,0,140);
      rows.push({topicId:t.i,topic:t,mastery:Math.round(mastery*100)/100,accuracy:h.accuracy,recentAccuracy:rec,
        attempts:h.attempts,wrong:h.wrong,confidentWrong:h.confidentWrong,due:d,repair:rp,risk:Math.round(priority),
        evidence:Math.round(evidence*100)/100,coverage:h.coverage,state:h.state,examWeight:imp.examWeight});
    });
    rows.sort(function(a,b){return b.risk-a.risk||a.topicId-b.topicId;});
    return {version:'5.0',generatedAt:new Date(now).toISOString(),topics:rows};
  }
  function adaptiveEngineV15(state,opts){
    opts=opts||{}; var mins=clamp(num(opts.minutes,30),5,240), profile=adaptiveEvidenceProfile(state,opts), rows=profile.topics;
    var eligible=rows.filter(function(x){return x.state!=='ready';});
    var target=eligible[0]||rows[0]||null;
    var action='learn', confidence=0, reasons=[];
    if(target){
      confidence=Math.min(1,(target.evidence*.45)+(target.recentAccuracy==null?0:.25)+(target.attempts>=5?.15:0)+(target.due||target.repair||target.confidentWrong?.15:0));
      if(target.confidentWrong>0 || target.due>0){ action='recall'; reasons.push(target.confidentWrong+' confident error'+(target.confidentWrong===1?'':'s')); if(target.due) reasons.push(target.due+' due retrieval item'+(target.due===1?'':'s')); }
      else if(target.repair>0 || target.wrong>=2){ action='repair'; reasons.push(target.repair+' repair signal'+(target.repair===1?'':'s')); if(target.wrong>=2) reasons.push(target.wrong+' logged misses'); }
      else if(target.recentAccuracy!=null && target.recentAccuracy>=.78 && target.coverage>=.5){ action='transfer'; reasons.push('retrieval is established enough to test application'); }
      else reasons.push(target.attempts?'evidence is incomplete or fragile':'new evidence is needed');
      if(target.recentAccuracy!=null) reasons.push(Math.round(target.recentAccuracy*100)+'% recent accuracy');
      if(target.examWeight>=3.5) reasons.push('high exam-yield topic');
    }
    var energy=String(opts.energy||'focused'); if(energy==='overwhelmed'||energy==='low') mins=Math.min(mins,15); else if(energy==='tired') mins=Math.min(mins,25);
    var block=Math.min(mins,action==='recall'?15:action==='repair'?20:action==='transfer'?30:30);
    return {version:'5.0',topicId:target?target.topicId:null,topic:target?target.topic:null,action:action,minutes:block,
      confidence:Math.round(confidence*100)/100,reasons:reasons,profile:profile,protectPlan:true,createsDebt:false,
      decisionKey:(target?target.topicId:'none')+'|'+action+'|'+block};
  }

  function aiContext(state,opts){
    opts=opts||{}; var n=nextBestAction(state,opts), cal=n.confidenceCalibration, danger=dangerList(state,5).map(function(x){return {topicId:x.q.topicId,topic:x.topic?x.topic.n:null,score:x.risk.score,confidentWrong:x.risk.confidentWrong};});
    return {version:'4.2',generatedAt:new Date().toISOString(),objectives:{adaptiveStudy:true,ai:true,usability:true,stability:true,viability:true},nextBestAction:{topic:n.topic?n.topic.n:null,action:n.action,minutes:n.minutes,priority:n.priority,reason:n.reason,rationale:n.rationale},calibration:cal,dangerList:danger};
  }
  function decisionQualityGuard(result){
    result=result||{}; if(!result||typeof result!=='object') return {ok:false,reason:'invalid decision'};
    if(!isFinite(Number(result.minutes))||Number(result.minutes)<5||Number(result.minutes)>240) return {ok:false,reason:'unsafe duration'};
    if(result.topicId!=null && !SM.CURRICULUM[Number(result.topicId)]) return {ok:false,reason:'unknown topic'};
    return {ok:true};
  }
  var PROCEDURES=[
    {id:'lap_suture_01',title:'Laparoscopic square knot',domain:'Procedural cognitive rehearsal',critical:[2,4],steps:['Confirm needle orientation and safe instrument position.','Retrieve the needle with a controlled, reproducible grip.','Pass the needle through the intended tissue plane without excessive force.','Form and secure the knot sequence while maintaining appropriate tension.','Confirm the final knot is seated and the tissue has not been strangulated.']},
    {id:'central_line_01',title:'Ultrasound-guided central venous access',domain:'Procedural cognitive rehearsal',critical:[1,3,5],steps:['Confirm indication, patient identity, consent and monitoring.','Position the patient and identify the target vessel with ultrasound.','Maintain sterile technique and keep the needle tip visualised.','Advance the guidewire only after confirming appropriate access.','Complete catheter placement and verify position/complications according to local protocol.']},
    {id:'drain_01',title:'Surgical drain decision and review',domain:'Procedural cognitive rehearsal',critical:[1,4],steps:['Define the indication and the question the drain is intended to answer.','Choose the appropriate drain strategy and safe anatomical route.','Document output, character and trend rather than a single reading.','Reassess whether the drain remains necessary and whether complications are emerging.']},
    {id:'acute_abdomen_01',title:'Acute abdomen assessment sequence',domain:'Clinical procedural rehearsal',critical:[1,3],steps:['Assess physiological stability and immediate threats first.','Take a focused history and perform a targeted examination.','Form a ranked differential and identify red flags requiring urgent escalation.','Select investigations that answer a specific clinical question.','Reassess after initial treatment and update the working diagnosis.']}
  ];
  function procedure(id){for(var i=0;i<PROCEDURES.length;i++)if(PROCEDURES[i].id===id)return PROCEDURES[i];return null;}
  function procedureAssess(item,done,confidence){
    item=item||{}; done=arr(done); var total=arr(item.steps).length, completed=0; done.forEach(function(v){if(v)completed++;});
    var criticalOK=arr(item.critical).every(function(i){return !!done[Number(i)-1];});
    var sequence=total?completed/total:0, conf=clamp(num(confidence,0)/3,0,1);
    return {completed:completed,total:total,sequence:sequence,criticalOK:criticalOK,confidence:conf,score:Math.round((sequence*.55+(criticalOK?1:0)*.3+conf*.15)*100),status:!criticalOK?'critical-step-fail':(sequence<1?'incomplete':(conf<.67?'rehearse':'ready'))};
  }
  function procedureReviewDue(pstate,now){
    pstate=pstate||{}; now=num(now,Date.now()); var last=num(pstate.lastAt,0); if(!last)return true; var iv=Math.max(1,num(pstate.intervalDays,1)); return now-last>=iv*DAY; }
  function procedureNext(pstate,assessment){
    /* Unified onto the same SM-2 engine every other spaced item in this app
       uses (SM.calculateNextInterval), rather than a second, separately-tuned
       growth curve. A critical-step miss maps to a hard reset (quality 0),
       exactly like a "wrong" answer resets a missed question. */
    pstate=pstate||{}; assessment=assessment||{};
    var quality = assessment.status==='critical-step-fail' ? 0
      : assessment.status==='incomplete' ? 2
      : assessment.status==='rehearse' ? 3
      : (assessment.confidence>=.9 ? 5 : 4);
    var ef=num(pstate.ef,2.5), iv=Math.max(1,num(pstate.intervalDays,1)), reps=Math.max(0,Math.floor(num(pstate.reps,0)));
    var r=SM.calculateNextInterval(quality,ef,iv,reps);
    return {intervalDays:r.interval,ef:r.ef,reps:r.reps};
  }

  SM.classifyOutcome=classifyOutcome;
  SM.questionRisk=questionRisk;
  SM.topicHealth=topicHealth;
  SM.topicImportance=topicImportance;
  SM.dangerList=dangerList;
  SM.todayPriority=todayPriority;
  SM.explainPriority=explainPriority;
  SM.observeStrategy=observeStrategy;
  SM.strategyProfile=strategyProfile;
  SM.confidenceCalibration=confidenceCalibration;
  SM.nextBestAction=nextBestAction;
  SM.adaptiveEvidenceProfile=adaptiveEvidenceProfile;
  SM.adaptiveEngineV15=adaptiveEngineV15;
  SM.aiContext=aiContext;
  SM.decisionQualityGuard=decisionQualityGuard;
  SM.PROCEDURES=PROCEDURES;
  SM.procedure=procedure;
  SM.procedureAssess=procedureAssess;
  SM.procedureReviewDue=procedureReviewDue;
  SM.procedureNext=procedureNext;
  SM.VERSION='5.0.0';
})(window);
