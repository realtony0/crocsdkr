self.addEventListener('push', function (event) {
  if (!event.data) return;
  try {
    const data = event.data.json();
    const title = data.title || 'Crocsdkr';
    const options = {
      body: data.body || 'Nouvelle commande',
      icon: '/logo-noir.png',
      badge: '/logo-noir.png',
      tag: 'crocsdkr-order',
      renotify: true,
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {
    event.waitUntil(
      self.registration.showNotification('Crocsdkr', {
        body: event.data.text(),
        icon: '/logo-noir.png',
      })
    );
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      const url = '/amdycrcwst';
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.indexOf(url) !== -1 && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
