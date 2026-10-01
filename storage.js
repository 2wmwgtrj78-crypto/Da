/* Dakshinamurthy storage adapter — presentation never owns database details.
   Zero dependency. Recall metadata and operational logs are mirrored in IndexedDB;
   the mature localStorage state remains the scheduler-compatible source for
   the synchronous campaign model. IndexedDB is not a hidden second scheduler. */
(function(){
  'use strict';
  var DB_NAME='dakshinamurthy-data-v1', DB_VERSION=1, dbPromise=null;
  function open(){
    if(dbPromise) return dbPromise;
    dbPromise=new Promise(function(resolve,reject){
      if(!window.indexedDB) return reject(new Error('IndexedDB unavailable'));
      var r=indexedDB.open(DB_NAME,DB_VERSION);
      r.onupgradeneeded=function(){
        var d=r.result;
        if(!d.objectStoreNames.contains('recall')) d.createObjectStore('recall',{keyPath:'id'});
        if(!d.objectStoreNames.contains('logs')) d.createObjectStore('logs',{keyPath:'id',autoIncrement:true});
      };
      r.onsuccess=function(){resolve(r.result);};
      r.onerror=function(){reject(r.error||new Error('IndexedDB open failed'));};
    });
    return dbPromise;
  }
  function put(store,value){return open().then(function(d){return new Promise(function(resolve,reject){
    var tx=d.transaction(store,'readwrite'); tx.objectStore(store).put(value);
    tx.oncomplete=function(){resolve(true);}; tx.onerror=function(){reject(tx.error);};
  });});}
  function get(store,id){return open().then(function(d){return new Promise(function(resolve,reject){
    var tx=d.transaction(store,'readonly'),q=tx.objectStore(store).get(id);
    q.onsuccess=function(){resolve(q.result||null);}; q.onerror=function(){reject(q.error);};
  });});}
  function all(store){return open().then(function(d){return new Promise(function(resolve,reject){
    var tx=d.transaction(store,'readonly'),q=tx.objectStore(store).getAll();
    q.onsuccess=function(){resolve(q.result||[]);}; q.onerror=function(){reject(q.error);};
  });});}
  function log(entry){
    entry=entry||{}; entry.at=entry.at||Date.now(); entry.msg=String(entry.msg||'Unknown error');
    return put('logs',entry).then(function(){
      return open().then(function(d){return new Promise(function(resolve){
        var tx=d.transaction('logs','readwrite'),s=tx.objectStore('logs'),q=s.getAll();
        q.onsuccess=function(){
          var rows=(q.result||[]).sort(function(a,b){return (a.at||0)-(b.at||0);});
          while(rows.length>50){ try{s.delete(rows.shift().id);}catch(e){break;} }
        };
        tx.oncomplete=function(){resolve(true);}; tx.onerror=function(){resolve(false);};
      });});
    });
  }
  window.SMStorage={
    ready:open,
    putRecall:function(item){return put('recall',item);},
    getRecall:function(id){return get('recall',id);},
    allRecall:function(){return all('recall');},
    logError:log,
    getLogs:function(){return all('logs');}
  };
})();
