// service worker «Планета игр» — версия по содержимому: c4f3cfadc1
const CACHE = 'markgames-c4f3cfadc1';
const ASSETS = ["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./apple-touch-icon.png","./img/adventure-1.jpg","./img/adventure-2.jpg","./img/adventure-icon.png","./img/bitva-1.jpg","./img/bitva-2.jpg","./img/bitva-icon.png","./img/brain-1.jpg","./img/brain-icon.png","./img/draw-1.jpg","./img/draw-2.jpg","./img/draw-icon.png","./img/emoplanet-1.jpg","./img/emoplanet-2.jpg","./img/emoplanet-3.jpg","./img/emoplanet-icon.png","./img/ghostlife-1.jpg","./img/ghostlife-2.jpg","./img/ghostlife-3.jpg","./img/ghostlife-icon.png","./img/kart-1.jpg","./img/kart-2.jpg","./img/kart-3.jpg","./img/kart-icon.png","./img/matshtorm-1.jpg","./img/matshtorm-2.jpg","./img/matshtorm-3.jpg","./img/matshtorm-icon.png","./img/nightshift-1.jpg","./img/nightshift-2.jpg","./img/nightshift-3.jpg","./img/nightshift-icon.png","./img/obzhora-1.jpg","./img/obzhora-2.jpg","./img/obzhora-icon.png","./img/party-1.jpg","./img/party-2.jpg","./img/party-icon.png","./img/phantom-1.jpg","./img/phantom-2.jpg","./img/phantom-icon.png","./img/spider-1.jpg","./img/spider-2.jpg","./img/spider-icon.png","./img/technobunt-1.jpg","./img/technobunt-2.jpg","./img/technobunt-3.jpg","./img/technobunt-icon.png"];
self.addEventListener('install', e => { e.waitUntil((async () => {
  const c = await caches.open(CACHE);
  await Promise.all(ASSETS.map(async u => { try { const r = await fetch(new Request(u, { cache:'reload' }));
    if (r.ok) await c.put(u, r); } catch (_) {} }));
  await self.skipWaiting();
})()); });
self.addEventListener('activate', e => { e.waitUntil((async () => {
  const ks = await caches.keys();
  await Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)));
  await self.clients.claim();
  try { const окна = await self.clients.matchAll({ type:'window' });
    for (const w of окна) await w.navigate(w.url.split('?')[0] + '?v=' + Date.now()); } catch (_) {}
})()); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).pathname.endsWith('version.json')) return;
  const isDoc = e.request.mode === 'navigate' || e.request.destination === 'document';
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const hit = await c.match(isDoc ? './index.html' : e.request, { ignoreSearch:true });
    if (hit) return hit;
    try { const r = await fetch(e.request); if (r.ok) c.put(e.request, r.clone()); return r; }
    catch (_) { return (await c.match('./index.html')) || Response.error(); }
  })());
});
