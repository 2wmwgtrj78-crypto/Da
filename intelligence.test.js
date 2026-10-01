const assert=require('assert');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
global.window={};
require(path.join(root,'engine.js'));
require(path.join(root,'intelligence.js'));
const SM=global.window.SM;
assert.equal(SM.VERSION,'5.0.0','intelligence release must be 5.0.0');
assert.equal(SM.PROCEDURES.length,4,'procedural rehearsal catalogue must be present');

// topicImportance must be driven by the curriculum's own curated yield data
// (yINI/yNEET), not a keyword guess against the topic name. This is the
// exact bug that was found and fixed: Bariatric Surgery has the lowest yINI
// in the whole curriculum but matched no keyword in the old regex, so it
// silently got a default (mid-range) weight instead of a low one.
const bariatric=SM.CURRICULUM.filter(function(t){return t.n==='Bariatric Surgery';})[0];
const trauma=SM.CURRICULUM.filter(function(t){return t.n==='Trauma & Burns';})[0];
assert(bariatric && trauma,'expected curriculum topics not found — has CURRICULUM changed shape?');
const impLow=SM.topicImportance(bariatric.i), impHigh=SM.topicImportance(trauma.i);
assert(impHigh.examWeight>impLow.examWeight,'a topic with real low exam yield must score lower than a real high-yield topic');
assert.equal(impLow.examWeight,1+bariatric.yINI*1.5,'examWeight must derive directly from yINI, not a name guess');

const state={mcq:{
  a:{topicId:11,attempts:[{t:1,outcome:'right',conf:3},{t:2,outcome:'wrong',conf:3},{t:3,outcome:'wrong',conf:3}]},
  b:{topicId:11,attempts:[{t:4,outcome:'wrong',conf:1}]},
  c:{topicId:0,attempts:[{t:5,outcome:'right',conf:3}]}
}};
const danger=SM.dangerList(state,10);
assert(danger.length>=1,'danger list must identify confident wrong questions');
assert.equal(danger[0].risk.state,'dangerous','confident wrong must be dangerous');
assert(SM.questionRisk(state.mcq.a).regressions>=1,'regression must be detected');
const h=SM.topicHealth(11,state);
assert.equal(h.confidentWrong,2,'topic health must count confident errors');
assert.equal(h.state,'danger','repeated confident errors must elevate topic to danger');
const pr=SM.procedure('lap_suture_01');
let a=SM.procedureAssess(pr,[true,false,true,true,false],3);
assert.equal(a.criticalOK,false,'missed critical step must fail critical integrity');
assert.equal(a.status,'critical-step-fail');
assert.equal(SM.procedureNext({},a).intervalDays,1,'critical-step failure must return tomorrow');
a=SM.procedureAssess(pr,[true,true,true,true,true],3);
assert(a.criticalOK&&a.score>=90,'complete confident rehearsal must score highly');
/* Interval logic is now the app's single shared SM.calculateNextInterval (SM-2),
   not a separate hand-tuned growth curve. A continuing item (reps already >=1,
   e.g. this is its second successful rehearsal) must extend spacing on success,
   the same way a well-known question's interval grows. */
assert(SM.procedureNext({intervalDays:3,ef:2.5,reps:1},a).intervalDays>=5,'successful rehearsal should extend spacing');
const rows=SM.todayPriority(state,{now:10*SM.DAY});
assert(rows.length>0 && rows[0].priority>=rows[rows.length-1].priority,'today priority must be ordered');
const why=SM.explainPriority(rows[0],state);
assert(Array.isArray(why),'priority explanation must be inspectable');


const cal=SM.confidenceCalibration(state);
assert(cal.total>=1 && cal.certain>=1,'confidence calibration must be measurable');
const nba=SM.nextBestAction(state,{minutes:30,examSoon:true,now:10*SM.DAY});
assert(nba.action && nba.minutes>=5 && nba.minutes<=30,'next best action must be bounded');
assert(SM.decisionQualityGuard(nba).ok,'adaptive decision must pass safety guard');
const ctx=SM.aiContext(state,{minutes:20});
assert(ctx.objectives.adaptiveStudy && ctx.objectives.ai && ctx.nextBestAction,'AI context must preserve product objectives');


// Adaptive Engine 2.0: one deterministic, explainable decision from existing evidence.
const v15=SM.adaptiveEngineV15(state,{minutes:30,now:10*SM.DAY,energy:'focused'});
assert(v15 && ['recall','repair','transfer','learn'].includes(v15.action),'v15 must choose a bounded learning action');
assert(v15.minutes>=5 && v15.minutes<=30,'v15 action must be bounded');
assert(v15.protectPlan===true && v15.createsDebt===false,'v15 must protect the campaign and create no catch-up debt');
assert(v15.decisionKey && v15.profile && v15.profile.version==='5.0','v15 decision must be stable and evidence-backed');
const profile=SM.adaptiveEvidenceProfile(state,{now:10*SM.DAY});
assert(profile.version==='5.0' && profile.topics.length===SM.CURRICULUM.length,'v15 evidence profile must cover the curriculum');
assert(profile.topics[0].risk>=profile.topics[profile.topics.length-1].risk,'v15 evidence profile must be deterministically ordered');
console.log('ADAPTIVE ENGINE 2.0 PASS: evidence profile, explainable action, bounded duration, plan protection and deterministic decision key verified.');

const ui=fs.readFileSync(path.join(root,'ui.js'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert(ui.includes('Today intelligence'),'UI must expose evidence-aware intelligence');
assert(ui.includes('Procedural cognitive rehearsal'),'UI must expose procedural rehearsal');
assert(ui.includes('Smart reminders'),'UI must expose smart reminders');
assert(sw.includes("'./intelligence.js'"),'service worker must cache intelligence layer');
assert(index.includes('<script src="intelligence.js"></script>'),'index must load intelligence layer');
console.log('INTELLIGENCE PASS: danger detection, topic health, procedural critical-step scoring, priority explanations, UI integration and PWA shell verified.');
