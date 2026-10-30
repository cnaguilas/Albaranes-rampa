const V='albaranes-v2';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
const PDFLIB='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(V).then(c=>Promise.all([
    c.addAll(FILES),
    fetch(PDFLIB,{mode:'no-cors'}).then(r=>c.put(PDFLIB,r)).catch(()=>{})
  ])).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(u.origin===location.origin){
    // red primero (para recibir actualizaciones), caché si no hay conexión
    e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(V).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request).then(m=>m||caches.match('./index.html'))));
  }else if(e.request.url===PDFLIB){
    e.respondWith(caches.match(PDFLIB).then(m=>m||fetch(e.request).then(r=>{const cp=r.clone();caches.open(V).then(c=>c.put(PDFLIB,cp));return r})));
  }
});
