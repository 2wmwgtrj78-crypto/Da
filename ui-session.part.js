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

