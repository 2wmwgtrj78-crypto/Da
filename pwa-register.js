/* Dakshinamurthy PWA registration — update safely without surprising mid-session reloads. */
(function(){
  if(!('serviceWorker' in navigator) || location.protocol.indexOf('http')!==0) return;
  navigator.serviceWorker.register('sw.js').then(function(reg){
    /* Ask for an update when the app returns to the foreground. The new worker
       installs in the background; it never interrupts a study session. */
    var refresh=function(){ try{ reg.update(); }catch(e){} };
    navigator.serviceWorker.addEventListener('controllerchange',function(){
      try{ if(sessionStorage.getItem('surgimaster:active-timer')) return; }catch(e){}
      /* A new worker is active; next navigation gets the new shell. Do not force-reload an active study timer. */
    });
    document.addEventListener('visibilitychange',function(){ if(document.visibilityState==='visible') refresh(); });
    window.addEventListener('online',refresh);
    refresh();
  }).catch(function(){ /* offline/static file use remains fully functional */ });
})();
