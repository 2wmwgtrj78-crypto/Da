/* Dakshinamurthy V2.9: separated cache strategies with safe offline fallback. */
var CACHE_NAME='dakshinamurthy-v15.0.0';
var SHELL=['./','./index.html','./surgimaster.css','./visual-v33-ui.js','./v34-intelligence.js','./v34-ui.js','./engine.js','./intelligence.js','./ui.js','./storage.js','./pwa-register.js','./error-handler.js','./manifest.webmanifest','./icon.png','./icon512.png','./icon180.png','./sm-today.svg','./sm-study.svg','./sm-practice.svg','./sm-progress.svg','./sm-more.svg','./home-style3.png','./study-style3.png','./practice-style3.png','./revision-style3.png','./settings-style3.png','./liver.svg','./gi.svg','./pancreas.svg','./colon.svg','./vascular.svg','./oncology.svg','./general.svg'];
var CORE=['engine.js','ui.js','storage.js','pwa-register.js','error-handler.js'];
var RELEASE='15.0.0';
function pathName(req){try{return new URL(req.url).pathname.split('/').pop()||'index.html';}catch(e){return '';}}
function cachePut(req,resp){if(!resp||!resp.ok) return; return caches.open(CACHE_NAME).then(function(c){return c.put(req,resp.clone());}).catch(function(){});}
self.addEventListener('install',function(e){e.waitUntil(caches.open(CACHE_NAME).then(function(c){return Promise.all(SHELL.map(function(a){return c.add(a).catch(function(){});}));}).then(function(){return self.skipWaiting();}));});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(keys){return Promise.all(keys.filter(function(k){return k!==CACHE_NAME;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));});
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET') return;
  var u=new URL(e.request.url), n=pathName(e.request);
  if(u.origin!==self.location.origin) return;
  var isHTML=e.request.mode==='navigate'||n==='index.html'||n==='';
  var isCore=CORE.indexOf(n)>=0;
  var isUI=n.endsWith('.js')||n.endsWith('.css');
  var isStatic=/\.(svg|png|webp|jpg|jpeg|woff2?)$/i.test(n);
  if(isHTML){
    e.respondWith(fetch(e.request).then(function(r){cachePut(new Request('./index.html'),r);return r;}).catch(function(){return caches.match('./index.html');}));
    return;
  }
  if(isCore){
    /* Core logic: network-first, because stale scheduling logic is more dangerous
       than waiting briefly when connectivity exists. Offline falls back to cache. */
    e.respondWith(fetch(e.request).then(function(r){cachePut(e.request,r);return r;}).catch(function(){return caches.match(e.request);}));
    return;
  }
  if(isUI){
    /* UI: stale-while-revalidate. The current cached screen is immediate while a
       background fetch prepares the next visit. */
    e.respondWith(caches.match(e.request).then(function(cached){
      var fresh=fetch(e.request).then(function(r){cachePut(e.request,r);return r;}).catch(function(){return cached;});
      return cached||fresh;
    }));
    return;
  }
  if(isStatic){
    e.respondWith(caches.match(e.request).then(function(cached){return cached||fetch(e.request).then(function(r){cachePut(e.request,r);return r;});}));
  }
});
self.addEventListener('push',function(e){
  var data={};
  try{data=e.data?e.data.json():{};}catch(err){try{data={body:e.data?e.data.text():''};}catch(ignore){data={};}}
  var options={body:data.body||'Your highest-value review is ready.',icon:'./icon512.png',badge:'./icon.png',tag:data.tag||'dakshinamurthy-review',renotify:false,data:{url:data.url||'./index.html#revise'}};
  e.waitUntil(self.registration.showNotification(data.title||'SurgiMaster Review',options));
});
self.addEventListener('notificationclick',function(e){
  e.notification.close();
  var target=(e.notification.data&&e.notification.data.url)||'./index.html#revise';
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(function(list){
    for(var i=0;i<list.length;i++){
      var c=list[i];
      if('focus' in c){try{if(new URL(c.url).origin===self.location.origin){return c.navigate(target).then(function(){return c.focus();});}}catch(err){}}
    }
    if(clients.openWindow) return clients.openWindow(target);
  }));
});

/* Release marker: the shell is versioned as a single deployable unit. */
self.addEventListener('message',function(e){if(e.data&&e.data.type==='GET_RELEASE'&&e.ports&&e.ports[0])e.ports[0].postMessage({release:RELEASE,cache:CACHE_NAME});});
