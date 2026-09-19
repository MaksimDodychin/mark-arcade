// Scoped offline application updater; version changes with the payload and updater.
const VERSION = 'ad18852208';
const PREFIX = "markgames-";
const CACHE = PREFIX + VERSION;
const SCOPE = new URL(self.registration.scope);
const INDEX = new URL('index.html', SCOPE).href;
const ASSETS = ["./manifest.webmanifest","./apple-touch-icon.png","./favicon-64.png","./icon-192.png","./icon-512-maskable.png","./icon-512.png","./img/adventure-1.jpg","./img/adventure-2.jpg","./img/adventure-icon.png","./img/bitva-1.jpg","./img/bitva-2.jpg","./img/bitva-icon.png","./img/brain-1.jpg","./img/brain-icon.png","./img/draw-1.jpg","./img/draw-2.jpg","./img/draw-icon.png","./img/duel3d-1.jpg","./img/duel3d-2.jpg","./img/duel3d-3.jpg","./img/duel3d-icon.png","./img/dustmaze-1.jpg","./img/dustmaze-2.jpg","./img/dustmaze-3.jpg","./img/dustmaze-icon.png","./img/emoplanet-1.jpg","./img/emoplanet-2.jpg","./img/emoplanet-3.jpg","./img/emoplanet-4.jpg","./img/emoplanet-icon.png","./img/ghostlife-1.jpg","./img/ghostlife-2.jpg","./img/ghostlife-3.jpg","./img/ghostlife-icon.png","./img/kart-1.jpg","./img/kart-2.jpg","./img/kart-3.jpg","./img/kart-icon.png","./img/matshtorm-1.jpg","./img/matshtorm-2.jpg","./img/matshtorm-3.jpg","./img/matshtorm-icon.png","./img/nightshift-1.jpg","./img/nightshift-2.jpg","./img/nightshift-3.jpg","./img/nightshift-icon.png","./img/obzhora-1.jpg","./img/obzhora-2.jpg","./img/obzhora-icon.png","./img/party-1.jpg","./img/party-2.jpg","./img/party-icon.png","./img/phantom-1.jpg","./img/phantom-2.jpg","./img/phantom-icon.png","./img/spider-1.jpg","./img/spider-2.jpg","./img/spider-icon.png","./img/technobunt-1.jpg","./img/technobunt-2.jpg","./img/technobunt-3.jpg","./img/technobunt-icon.png"];
const belongs = url => url.origin === SCOPE.origin && url.pathname.startsWith(SCOPE.pathname);
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    // Installation must fail if the new HTML is missing, stale, or only half deployed.
    const response = await fetch(new Request(INDEX, { cache: 'reload' }));
    if (!response.ok) throw new Error('New application document unavailable');
    const match = (await response.clone().text()).match(/window\.__APP_VER\s*=\s*["']([^"']+)["']/);
    if (!match || match[1] !== VERSION) throw new Error('New application version not deployed yet');
    const cache = await caches.open(CACHE);
    await cache.put(INDEX, response.clone());
    await cache.put(SCOPE.href, response);
    await Promise.all(ASSETS.map(async asset => {
      try {
        const url = new URL(asset, SCOPE).href;
        const result = await fetch(new Request(url, { cache: 'reload' }));
        if (result.ok) await cache.put(url, result);
      } catch (_) {} // An optional icon never invalidates the already verified game document.
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    // ⚠️ ЖАЛОБА МАРКА 19.09.2026: при ПЕРВОМ заходе воркер перезагружал страницу
    //    на ?v=…, и созданная комната тут же пропадала. Перезагружаем окна ТОЛЬКО
    //    если действительно заменили старую версию, а не поставили первую.
    const hadOld = names.some(name => name.startsWith(PREFIX) && name !== CACHE);
    await Promise.all(names.filter(name => name.startsWith(PREFIX) && name !== CACHE).map(name => caches.delete(name)));
    await self.clients.claim();
    const windows = hadOld ? await self.clients.matchAll({ type: 'window' }) : [];
    for (const client of windows) {
      const url = new URL(client.url);
      if (!belongs(url) || url.searchParams.get('v') === VERSION) continue;
      url.searchParams.set('v', VERSION);
      // Do not await navigation: it can wait for this activation to finish.
      client.navigate(url.href).catch(() => {});
    }
  })());
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (!belongs(url) || url.pathname === new URL('version.json', SCOPE).pathname) return;
  const doc = event.request.mode === 'navigate' || event.request.destination === 'document';
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(doc ? INDEX : event.request, { ignoreSearch: true });
    if (hit) return hit;
    try {
      const result = await fetch(event.request);
      if (result.ok) await cache.put(event.request, result.clone());
      return result;
    } catch (_) {
      return doc ? (await cache.match(INDEX)) || Response.error() : Response.error();
    }
  })());
});
