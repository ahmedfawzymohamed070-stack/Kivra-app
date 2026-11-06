// Service worker بسيط لتفعيل التثبيت كتطبيق. مفيش تخزين مؤقت عمداً عشان الأرقام والطلبات تفضل دايماً محدّثة.
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
