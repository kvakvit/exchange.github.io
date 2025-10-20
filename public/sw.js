const CACHE='kursna-v2';
const ASSETS=['./','./index.html','./styles.css','./script.js','./rates.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim())});
self.addEventListener('fetch',e=>{
  const u = new URL(e.request.url);
  if(u.pathname.endsWith('/rates.json')){
    e.respondWith(fetch(e.request).then(r=>{const copy=r.clone(); caches.open(CACHE).then(c=>c.put(e.request,copy)); return r;})
      .catch(()=>caches.match(e.request)));
  } else {
    e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request)));
  }
});