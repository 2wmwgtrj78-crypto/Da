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
