/* Global boot/runtime boundary. Operational logs go to IndexedDB and are capped. */
(function(){
  function safeLog(err,kind){
    var entry={at:Date.now(),kind:kind||'error',msg:String(err&&err.message||err||'Unknown error'),stack:String(err&&err.stack||'').slice(0,4000)};
    try{ if(window.SMStorage&&SMStorage.logError) SMStorage.logError(entry).catch(function(){}); }catch(e){}
  }
  window.addEventListener('error',function(e){
    safeLog(e&&e.error||e&&e.message,'error');
    var be=document.getElementById('sm8BootError'),bm=document.getElementById('sm8BootMsg');
    if(!be||!bm) return;
    if(!document.getElementById('app')||!document.getElementById('app').innerHTML.trim()){
      be.style.display='block'; bm.textContent=String(e&&e.error&&e.error.stack||e&&e.message||'Unknown JavaScript error');
    }
  });
  window.addEventListener('unhandledrejection',function(e){safeLog(e&&e.reason,'unhandledrejection');});
})();
