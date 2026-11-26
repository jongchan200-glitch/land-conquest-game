/* Wagu Wagu — release-scoped offline cache. Never match JS/CSS ignoring its version. */
'use strict';
const BUILD='v0.2.44';
const CACHE='wagu-land-conquest-044';
const absolute=path=>new URL(path,self.registration.scope).href;
const SHELL=absolute('./index.html');
const HOME=absolute('./');
const ASSETS=[
  "./home.css?v=044",
  "./ww-theme.css?v=044",
  "./ww-ui.js?v=044",
  "./home3d.js?v=044",
  "./home.js?v=044",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./assets/worm_expressions.png",
  "./assets/bgm/wagjak-approved-4tracks.zip",
  "./assets/cards/amara-v042/amara_01.webp",
  "./assets/cards/amara-v042/amara_02.webp",
  "./assets/cards/amara-v042/amara_03.webp",
  "./assets/cards/amara-v042/amara_04.webp",
  "./assets/cards/amara-v042/amara_05.webp",
  "./assets/cards/amara-v042/amara_06.webp",
  "./assets/cards/amara-v042/amara_07.webp",
  "./assets/cards/amara-v042/amara_08.webp",
  "./assets/cards/collection-v043/in_01.webp",
  "./assets/cards/collection-v043/in_02.webp",
  "./assets/cards/collection-v043/in_03.webp",
  "./assets/cards/collection-v043/in_04.webp",
  "./assets/cards/collection-v043/in_05.webp",
  "./assets/cards/collection-v043/in_06.webp",
  "./assets/cards/collection-v043/in_07.webp",
  "./assets/cards/collection-v043/in_08.webp",
  "./assets/cards/collection-v043/kr_01.webp",
  "./assets/cards/collection-v043/kr_02.webp",
  "./assets/cards/collection-v043/kr_03.webp",
  "./assets/cards/collection-v043/kr_04.webp",
  "./assets/cards/collection-v043/kr_05.webp",
  "./assets/cards/collection-v043/kr_06.webp",
  "./assets/cards/collection-v043/kr_07.webp",
  "./assets/cards/collection-v043/kr_08.webp",
  "./assets/cards/collection-v043/kr_back_01.svg",
  "./assets/cards/collection-v043/kr_back_02.svg",
  "./assets/cards/collection-v043/kr_back_03.svg",
  "./assets/cards/collection-v043/kr_back_04.svg",
  "./assets/cards/collection-v043/kr_back_05.svg",
  "./assets/cards/collection-v043/kr_back_06.svg",
  "./assets/cards/collection-v043/kr_back_07.svg",
  "./assets/cards/collection-v043/kr_back_08.svg",
  "./assets/cards/collection-v043/in_back_01.svg",
  "./assets/cards/collection-v043/in_back_02.svg",
  "./assets/cards/collection-v043/in_back_03.svg",
  "./assets/cards/collection-v043/in_back_04.svg",
  "./assets/cards/collection-v043/in_back_05.svg",
  "./assets/cards/collection-v043/in_back_06.svg",
  "./assets/cards/collection-v043/in_back_07.svg",
  "./assets/cards/collection-v043/in_back_08.svg",
  "./assets/cards/collection-v043/ug_back_01.svg",
  "./assets/cards/collection-v043/ug_back_02.svg",
  "./assets/cards/collection-v043/ug_back_03.svg",
  "./assets/cards/collection-v043/ug_back_04.svg",
  "./assets/cards/collection-v043/ug_back_05.svg",
  "./assets/cards/collection-v043/ug_back_06.svg",
  "./assets/cards/collection-v043/ug_back_07.svg",
  "./assets/cards/collection-v043/ug_back_08.svg"
];
const KNOWN=new Set(ASSETS.map(absolute));
const marker='<meta name="wagu-build" content="'+BUILD+'">';
const ownCache=name=>name.startsWith('wagu-land-conquest-')||name.startsWith('wagu-v');
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    const page=await fetch(SHELL,{cache:'no-store'});
    if(!page.ok||!(await page.clone().text()).includes(marker))throw new Error('Release shell mismatch');
    await cache.addAll(ASSETS.map(path=>new Request(absolute(path),{cache:'reload'})));
    await cache.put(SHELL,page);
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    for(const name of await caches.keys())if(name!==CACHE&&ownCache(name))await caches.delete(name);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(!url.href.startsWith(self.registration.scope))return;
  const path=url.origin+url.pathname;
  if(req.mode==='navigate'&&(path===HOME||path===SHELL)){
    event.respondWith((async()=>{
      try{
        const response=await fetch(req,{cache:'no-store'});
        if(response.ok)return response;
        throw new Error('Navigation unavailable');
      }catch(error){
        const cached=await (await caches.open(CACHE)).match(SHELL);
        return cached||new Response('와구와구 연결이 필요합니다.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
      }
    })());
    return;
  }
  if(!KNOWN.has(url.href))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const cached=await cache.match(req);
    if(cached)return cached;
    const response=await fetch(req,{cache:'no-store'});
    if(response.ok)await cache.put(req,response.clone());
    return response;
  })());
});
