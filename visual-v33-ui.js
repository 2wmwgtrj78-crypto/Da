/* Dakshinamurthy V33 UI-only branch — presentation and UX safeguards only.
   Deliberately does not load, mount, or manipulate anatomy/clinical visual engines. */
(function(){
  "use strict";
  var UI={version:"33.6",active:true,mode:"ui-only"};
  function boot(){
    document.body.classList.add("dm-ui33");
    document.documentElement.classList.add("dm-ui33-root");
    var nav=document.querySelector("nav.sm-v17-nav");
    if(nav){ nav.setAttribute("aria-label","Primary navigation"); }
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot,{once:true});
  else boot();
  window.SurgiMasterVisualV33UI=UI;
})();
