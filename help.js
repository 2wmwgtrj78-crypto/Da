/* Dakshinamurthy v13.1.0 — Help & Feedback, fully local/offline. */
(function(){
  'use strict';
  var KEY='dakshinamurthy.feedback.v2';
  function aiText(rows){
    var tab=(document.body&&document.body.getAttribute('data-sm-page'))||'unknown';
    var lines=['DAKSHINAMURTHY AI IMPROVEMENT PACKET','App version: 13.1.0','Current tab: '+tab,'Generated: '+new Date().toISOString(),'','INSTRUCTION FOR AI','Act as a product QA and study-app improvement analyst. Review the feedback below. Group recurring issues, identify likely bugs, identify usability problems, propose concrete changes, and produce a short prioritised action list. Separate confirmed observations from suggestions. Do not invent missing information. Preserve the user’s wording where useful.',''];
    rows.slice().reverse().forEach(function(r,i){lines.push('FEEDBACK '+(i+1)+' ['+(r.id||'local')+']');lines.push('Type: '+r.type);lines.push('Date: '+r.date);lines.push('Screen: '+(r.screen||'unknown'));lines.push('Issue: '+r.text);lines.push('');});
    return lines.join('\n');
  }
  function downloadPacket(rows){
    var payload={app:'Dakshinamurthy',version:'13.1.0',generatedAt:new Date().toISOString(),purpose:'AI improvement feedback',feedback:rows.slice().reverse(),instruction:'Group recurring issues, identify bugs/usability problems, propose concrete changes, and return a prioritised implementation list. Do not invent missing information.'};
    var blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),a=document.createElement('a');
    a.href=URL.createObjectURL(blob);a.download='dakshinamurthy-ai-feedback.json';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href);},1000);
  }
  function sharePacket(rows){
    var text=aiText(rows);
    if(navigator.share){navigator.share({title:'Dakshinamurthy AI Feedback',text:text}).catch(function(){});return true;}
    if(navigator.clipboard){navigator.clipboard.writeText(text);return true;}
    return false;
  }
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];});}
  function load(){try{return JSON.parse(localStorage.getItem(KEY)||'[]');}catch(e){return [];}}
  function save(rows){try{localStorage.setItem(KEY,JSON.stringify(rows.slice(-30)));return true;}catch(e){return false;}}
  window.renderHelp=function(){
    var rows=load(), out='';
    out+='<section class="card help-hero drape"><div class="eyebrow">Start here</div><h2>How to use Dakshinamurthy</h2><p class="muted">This is your quick guide to the app. Follow the daily flow; let the adaptive engine decide what deserves attention next.</p></section>';
    out+='<div class="eyebrow">The simple daily flow</div><section class="card help-steps">'+[
      ['1','Today','Open Today first. See your schedule, protected time and the highest-value next action.'],
      ['2','Learn','Watch the planned lectures at your configured playback speed and complete the learning blocks.'],
      ['3','Practice','Do Bank, Targeted and Speed MCQs. Use <b>Log a question</b> when recording a question outside the normal practice flow.'],
      ['4','Review','Use Revise for retrieval and repairs. Mistakes feed the adaptive engine and future FSRS reviews.'],
      ['5','Progress','Check mastery, accuracy and what needs attention. You do not need to manually plan every next step.']
    ].map(function(x){return '<div class="help-step"><span class="help-num">'+x[0]+'</span><div><div class="lbl">'+x[1]+'</div><div class="muted sm">'+x[2]+'</div></div></div>';}).join('')+'</section>';
    out+='<div class="eyebrow">Where things live</div><section class="card help-grid">'+[
      ['Today','Your daily mission and adaptive next action.'],['My Day','Your detailed day view and completion controls.'],['Log','Record work that happened outside the normal session.'],['Practice','MCQs, targeted practice and retrieval work.'],['Progress','A compact view of mastery and weak areas.'],['Learn / Plan','Syllabus and campaign schedule.'],['Coach','AI-assisted study guidance and interpretation.'],['Setup','Pacing, exam dates, reminders, backup and diagnostics.']
    ].map(function(x){return '<div class="help-item"><b>'+x[0]+'</b><span class="muted sm">'+x[1]+'</span></div>';}).join('')+'</section>';
    out+='<div class="eyebrow">Feedback & problems</div><section class="card"><p class="muted sm">Store feedback on this device while offline. It stays in the app until you export/copy it or clear app data. Nothing is sent automatically.</p><label class="lbl" for="smFeedbackText">What should I improve?</label><textarea id="smFeedbackText" rows="4" class="help-feedback" placeholder="Example: Log a question is still hard to find on the Practice screen."></textarea><div class="row-top help-feedback-actions"><select id="smFeedbackType" aria-label="Feedback type"><option>Usability</option><option>Bug</option><option>Study engine</option><option>Content</option><option>Other</option></select><button class="btn solid" id="smSaveFeedback">Save feedback</button></div><div id="smFeedbackStatus" class="muted sm" aria-live="polite"></div></section>';
    out+='<section class="card help-ai-card"><div class="lbl">Easy transfer to AI</div><p class="muted sm">When you want improvements, use <b>Copy for AI</b> or <b>Share</b> to send a structured feedback packet to ChatGPT or another AI system. Download gives you a reusable JSON file. All three work offline; nothing is uploaded automatically.</p></section>';
    out+='<section class="card"><div class="row-top"><div><div class="lbl">Saved feedback</div><div class="muted sm">'+rows.length+' item'+(rows.length===1?'':'s')+' stored locally</div></div><div class="row-top help-export-actions"><button class="btn sm" id="smAiFeedback"'+(rows.length?'':' disabled')+'>Copy for AI</button><button class="btn sm" id="smShareFeedback"'+(rows.length?'':' disabled')+'>Share</button><button class="btn sm" id="smDownloadFeedback"'+(rows.length?'':' disabled')+'>Download</button></div></div><div class="help-saved">'+(rows.length?rows.slice().reverse().map(function(r){return '<div class="help-saved-row"><div><b>'+esc(r.type)+'</b><span class="muted sm"> · '+esc(r.date)+'</span></div><div class="muted sm">'+esc(r.text)+'</div></div>';}).join(''):'<div class="muted sm">No feedback saved yet.</div>')+'</div></section>';
    return out;
  };
  function bind(){
    var saveBtn=document.getElementById('smSaveFeedback');
    if(saveBtn&&!saveBtn.dataset.bound){saveBtn.dataset.bound='1';saveBtn.addEventListener('click',function(){var ta=document.getElementById('smFeedbackText'),sel=document.getElementById('smFeedbackType'),msg=document.getElementById('smFeedbackStatus'),text=(ta.value||'').trim();if(!text){msg.textContent='Write a short note first.';ta.focus();return;}var rows=load();rows.push({id:'F'+Date.now().toString(36).toUpperCase(),type:sel.value,text:text,date:new Date().toLocaleString(),screen:(document.body&&document.body.getAttribute('data-sm-page'))||'unknown'});if(save(rows)){ta.value='';msg.textContent='Saved on this device. Nothing was sent.';if(window.SM&&typeof SM.rerender==='function'){SM.rerender();var m2=document.getElementById('smFeedbackStatus');if(m2)m2.textContent='Saved on this device. Nothing was sent.';}}else msg.textContent='Could not save. Check available storage.';});}
    var ai=document.getElementById('smAiFeedback');
    if(ai&&!ai.dataset.bound){ai.dataset.bound='1';ai.addEventListener('click',function(){var rows=load(),text=aiText(rows);if(navigator.clipboard)navigator.clipboard.writeText(text).then(function(){ai.textContent='Copied for AI';setTimeout(function(){ai.textContent='Copy for AI';},1400);});});}
    var aip=document.getElementById('smAiPrompt');
    if(aip&&!aip.dataset.bound){aip.dataset.bound='1';aip.addEventListener('click',function(){var rows=load();var prompt='Analyse this Dakshinamurthy feedback packet. Group recurring issues, separate bugs from usability suggestions, identify the highest-impact fixes, and return a concise implementation plan. Do not invent information.\n\n'+aiText(rows);if(navigator.clipboard)navigator.clipboard.writeText(prompt).then(function(){aip.textContent='Prompt copied';setTimeout(function(){aip.textContent='AI prompt';},1400);});});}
    var sh=document.getElementById('smShareFeedback');
    if(sh&&!sh.dataset.bound){sh.dataset.bound='1';sh.addEventListener('click',function(){var ok=sharePacket(load());sh.textContent=ok?'Ready to share':'Share unavailable';setTimeout(function(){sh.textContent='Share';},1400);});}
    var dl=document.getElementById('smDownloadFeedback');
    if(dl&&!dl.dataset.bound){dl.dataset.bound='1';dl.addEventListener('click',function(){downloadPacket(load());dl.textContent='Downloaded';setTimeout(function(){dl.textContent='Download';},1400);});}
  }
  new MutationObserver(bind).observe(document.body,{childList:true,subtree:true});
})();
