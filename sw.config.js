
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
function warn(e) {
      var swLogStyle = `padding: 5px;
                        background-color: #a07904;
                        color: #fff;
                        border-radius: 8px;
                        font-weight: 800;
                        margin: 2px;
                        margin-top: 1px;`;
      if (isLog)
            console.warn("%cService Worker", swLogStyle, e);
}
// urlBase64ToUint8Array function
function urlBase64ToUint8Array(base64String) { if (!base64String) return; const padding = "=".repeat((4 - base64String.length % 4) % 4); const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/"); const rawData = window.atob(base64); const outputArray = new Uint8Array(rawData.length); for (let i = 0; i < rawData.length; ++i) { outputArray[i] = rawData.charCodeAt(i); } return outputArray; }


var ServiceWorker = class {

      constructor(props) {
            if (!"serviceWorker" in navigator) {
                  error('Service Worker is not suported in your browser');
                  this.browserSupport = false;
                  return;
            } else {
                  this.browserSupport = true;
            }

            if (!props) error("No Configuration Found");
            log("Configured");
            log(props);

            this.registration = null;
            this.pushSubscription = null;
            this.path = props?.path !== undefined ? props.path : '/sw.js';
            this.scope = props?.scope !== undefined ? props.scope : '/';
            this.preCaches = props?.preCaches !== undefined ? props.preCaches : [];
            this.cacheName = props?.cacheName !== undefined ? props.cacheName : 'serviceWorker';
            this.cacheFirst = props?.cacheFirst !== undefined ? props.cacheFirst : true;
            this.cacheAll = props?.cacheAll !== undefined ? props.cacheAll : false;
            if (this.cacheAll) {
                  warn("'cacheAll' is not recomanded! It May become a bug to your app");
            }
            this.offlineHTML = props?.offlineHTML !== undefined ? props.offlineHTML : null;
            if (!this.preCaches.includes(this.offlineHTML)) {
                  this.preCaches = this.preCaches.concat(this.offlineHTML);
            }
            this.push = {
                  enableOnRegistration: props?.push?.enableOnRegistration !== undefined ? props.push.enableOnRegistration : false,
                  testPath: props?.push?.testPath !== undefined ? props.push.testPath : false,
                  publicVapidKey: props?.push?.publicVapidKey !== undefined ? props.push.publicVapidKey : null,
                  userVisibleOnly: props?.push?.userVisibleOnly !== undefined ? props.push.userVisibleOnly : true,
            }

            isLog = props?.log !== undefined ? props.log : true;
      }

      async register() {
            if (!this.browserSupport) return;
            // Register
            await navigator.serviceWorker.register(this.path, {
                  scope: this.scope
            }).then(async registration => {
                  this.registration = registration;

                  if (this.push.enableOnRegistration) {

                        await registration.pushManager.subscribe({
                              userVisibleOnly: this.push.userVisibleOnly,
                              applicationServerKey: urlBase64ToUint8Array(this.push.publicVapidKey)
                        }).then(async subscription => {
                              this.pushSubscription = subscription;
                              await fetch(this.push.testPath, {
                                    method: "POST",
                                    body: JSON.stringify(subscription),
                                    headers: {
                                          "content-type": "application/json"
                                    }
                              });
                        }).catch(error);

                  }

            }).then(subscription => {
                  this.registration.active?.postMessage(JSON.stringify({
                        cacheName: this.cacheName,
                        preCaches: this.preCaches,
                        isLog,
                        cacheFirst: this.cacheFirst,
                        cacheAll: this.cacheAll,
                        offlineHTML: this.offlineHTML,
                  }));
            }).catch(err => {
                  error(err);
                  this.registration = null;
            })

      }

      unRegister() {
            if (!this.browserSupport) return;
            navigator.serviceWorker.getRegistrations()
                  .then(registrations => {
                        registrations.forEach(registration => {
                              registration.unregister();
                        });
                  }).catch(error);
      }

      async registerPush() {
            if (!this.push.enableOnRegistration && this.registration) {

                  await this.registration.pushManager.subscribe({
                        userVisibleOnly: this.push.userVisibleOnly,
                        applicationServerKey: urlBase64ToUint8Array(this.push.publicVapidKey)
                  }).then(async subscription => {
                        this.pushSubscription = subscription;
                        await fetch(this.push.testPath, {
                              method: "POST",
                              body: JSON.stringify(subscription),
                              headers: {
                                    "content-type": "application/json"
                              }
                        });
                  }).catch(error);

            }
      }

      addInstallButton(buttonId) {
            let deferredPrompt;
            const button = document.querySelector(`#${buttonId}`);
            if (!button) {
                  error(`Id ${buttonId} is not found`);
                  return;
            }
            button.style.display = 'none';
            window.addEventListener('beforeinstallprompt', (e) => {
                  e.preventDefault();
                  deferredPrompt = e;
                  button.style.display = 'block';
                  button.addEventListener('click', (e) => {
                        button.style.display = 'none';
                        deferredPrompt.prompt();
                        deferredPrompt.userChoice.then((choiceResult) => {
                              if (choiceResult.outcome === 'accepted') {
                                    log('User accepted the A2HS prompt');
                              } else {
                                    error('User dismissed the A2HS prompt');
                              }
                              deferredPrompt = null;
                        });
                  });
            });
      }

      getDisplayMode() {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
            if (document.referrer.startsWith('android-app://')) {
                  return 'twa';
            } else if (navigator.standalone || isStandalone) {
                  return 'standalone';
            }
            return 'browser';
      }
}