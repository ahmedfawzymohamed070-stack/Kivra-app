// Service worker بسيط لتفعيل التثبيت كتطبيق. مفيش تخزين مؤقت عمداً عشان الأرقام والطلبات تفضل دايماً محدّثة.
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});

// استقبال الإشعارات (Web Push) وعرضها بصوت الإشعارات الافتراضي للموبايل
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Kivra', {
    body: d.body || '',
    icon: '/icon-192.png',
    tag: d.tag || 'kivra',
    renotify: true,
    vibrate: [200, 100, 200],
    data: { url: d.url || '/' }
  }));
});

// الضغط على الإشعار يفتح التطبيق
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) { if ('focus' in c) return c.focus(); }
    return self.clients.openWindow(url);
  }));
});
