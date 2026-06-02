// Service Worker – Brennersteuerung v2.1
const CACHE = 'brenner-v2';

self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(clients.claim()); });
self.addEventListener('fetch', e => { e.respondWith(fetch(e.request).catch(() => caches.match(e.request))); });

// Notification click → App in Vordergrund bringen
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({type:'window', includeUncontrolled:true}).then(cs => {
      const c = cs.find(x => x.url.includes('index.html') || x.url.endsWith('/'));
      if (c) return c.focus();
      return clients.openWindow('./');
    })
  );
});

// Empfange Nachrichten von der App → zeige Notification
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SHOW_NOTIFICATION') {
    const d = e.data;
    self.registration.showNotification(d.title, {
      body:   d.body,
      tag:    d.tag    || 'brenner',
      renotify: true,
      silent: d.silent || false,
      vibrate: d.vibrate || [300, 100, 300, 100, 300],
      icon:   './icon.png',
      badge:  './icon.png'
    });
  }
});
