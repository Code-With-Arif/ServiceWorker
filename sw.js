
var cacheName, preCaches, cacheFirst, cacheAll, offlineHTML;
var isLog = true;
function log(e) {
      var swLogStyle = `padding: 5px;
                        background-color: #25832d;
                        color: #fff;
                        border-radius: 8px;
                        font-weight: 800;`;
      if (isLog)
            console.log("%cService Worker", swLogStyle, e);
}
function error(e) {
      var swLogStyle = `padding: 5px;
                        background-color: #a20909;
                        color: #fff;
                        border-radius: 8px;
                        font-weight: 800;
                        margin: 2px;
                        margin-top: 1px;`;
      if (isLog)
            console.error("%cService Worker", swLogStyle, e);
}

self.addEventListener('install', async e => {
      return self.addEventListener('message', async event => {
            var data = JSON.parse(event.data);
            cacheName = data.cacheName;
            preCaches = data.preCaches;
            isLog = data.isLog;
            cacheFirst = data.cacheFirst;
            cacheAll = data.cacheAll;
            offlineHTML = data.offlineHTML;

            // if (!preCaches.includes(offlineHTML)) {
            //       preCaches.concat(offlineHTML);
            // }

            if (Array.isArray(preCaches)) {
                  const cache = await caches.open(cacheName);
                  await cache.addAll(preCaches);
                  return self.skipWaiting();
            } else {
                  error("'preCaches' is not typeof Array");
            }
      });
});

// Executes once while registering service worker
self.addEventListener('activate', async e => {
      // Console if sw loaded.
      log(`ServiceWorker is Successfully Registered.`);
      self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', e => {
      if (cacheFirst) {
            e.respondWith(
                  caches.match(e.request)
                        .then(async response => {
                              try {
                                    if (response) return response;
                                    return await fetch(e.request).then(response => {
                                          if (cacheAll) {
                                                caches.open(cacheName).then(cache => {
                                                      cache.put(e.request, response.clone());
                                                      return response;
                                                })
                                          } else {
                                                return response;
                                          }
                                    });
                              } catch {
                                    return caches.match(offlineHTML).then(e => { return e });
                              }
                        })
            )
      } else {
            e.respondWith(
                  fetch(e.request).then(response => {
                        if (cacheAll) {
                              caches.open(cacheName).then(cache => {
                                    cache.put(e.request, response.clone());
                                    return response;
                              })
                        } else {
                              return response;
                        }
                  }).catch(e => {
                        caches.match(e.request).then(response => {
                              return response || caches.match(offlineHTML).then(e => { return e });
                        })
                  })
            )
      }
});

self.addEventListener("push", e => {
      const data = e.data.json();
      log("Push Receved");
      self.registration.showNotification(data.title, {
            actions: data.actions || [],
            badge: data.badge || "",
            body: data.body,
            data: data.data || undefined,
            dir: data.dir || "auto",
            icon: data.icon,
            image: data.image || "",
            lang: data.lang || "",
            renotify: data.renotify || false,
            requireInteraction: data.requireInteraction || false,
            silent: data.silent || false,
            tag: data.tag || "",
            timestamp: data.timestamp,
            vibrate: data.vibrate || 1000
      });
});