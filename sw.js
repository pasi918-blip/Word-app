const C='doc-editor-v4';
const FILES=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png',
'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.4.2/mammoth.browser.min.js',
'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.allSettled(FILES.map(f=>c.add(f)))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method==='POST'&&u.pathname.endsWith('/share-target')){
    e.respondWith((async()=>{try{const f=(await e.request.formData()).get('file');
      if(f){const c=await caches.open('shared');await c.put('shared-file',new Response(f,{headers:{'X-Name':encodeURIComponent(f.name||'Unbenannt.docx')}}))}}catch(err){}
      return Response.redirect(new URL('./?shared=1',self.registration.scope).href,303)})());
    return}
  if(e.request.method!=='GET')return;
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{
    if(r.ok&&(new URL(e.request.url).origin===location.origin||e.request.url.startsWith('https://cdnjs.cloudflare.com/'))){const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp))}
    return r}).catch(()=>caches.match('index.html'))));
});
