const CACHE = 'brenner-v2-8';
const FILES = ['./index.html', './manifest.json'];

// Cache App-Dateien beim ersten Laden
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => clients.claim())
  );
});

// Cache-first: aus Cache laden, sonst Netzwerk
self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    e.respondWith(
      caches.match('./index.html').then(r => r || fetch(e.request))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(response => {
      const clone = response.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return response;
    }))
  );
});

// Notification click
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({type:'window', includeUncontrolled:true}).then(cs => {
      const c = cs.find(x => x.url.includes('index.html') || x.url.endsWith('/'));
      if (c) return c.focus();
      return clients.openWindow('./index.html');
    })
  );
});

// Notification via postMessage
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SHOW_NOTIFICATION') {
    const d = e.data;
    self.registration.showNotification(d.title, {
      body: d.body, tag: d.tag || 'brenner', renotify: true,
      silent: d.silent || false, vibrate: d.vibrate || [300,100,300,100,300]
    });
  }
});
