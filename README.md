# Service Worker
Create [PWA (Progressive Web Application)](https://en.wikipedia.org/wiki/Progressive_web_application) or [TWA (Trusted Web Activity)](https://developer.chrome.com/docs/android/trusted-web-activity/) easily with pre-written javascript library. This is a javascript library you can use to create websites as PWA.

## Features : 
* [x] Offline Mode.
* [x] Choose your files to cache.
* [x] Caches First / Fetch First.
* [x] Cache All. (*__Not Recomanded__*)
* [x] Push Notification.
* [x] Add an install button to the dom. (*__BeforeInstallPrompt__*)
* [x] Get Display Mode.

## Installation :
Copy the ```sw.config.js``` & ```sw.js``` to your project. Put the ```sw.js``` file in the root directory of your project. Add ```sw.config.js``` script to your ```index.html``` or where ever you want.

Now add another script in your project after the ```sw.config.js``` and put the codes.
```js
const sw = new ServiceWorker({
      path: "/sw.js", // The path to the sw.js file.
      scope: '/',
      log: true, // You can make it false in Production.
      // Configure The Push.
      push: {
            enableOnRegistration: false, // This will enable push when you register service worker.
            testPath: "http://localhost:3000/subscribe/push", // add a testPath to store your subscriptions.
            publicVapidKey: "BL2qGxzlquJZHaygGl4ojf7GAl29_qF1yS218VH4IpW4a4WBg956xRBmaKPDbioyyAWhh5dKHLLCp8tIG49KpLE", // Add your own public vapid key.
            userVisibleOnly: true
      },
      preCaches: [], // Add files you want to cache.
      cacheName: "PWA", // add cache name.
      cacheFirst: true, // true / false
      // cacheAll: true, // Not recomanded.
      offlineHTML: "/offline.html" // Html file to be shown in offline.
});
```
Then register Service Worker.
```js
sw.register();
```
Or, un-register using.
```js
sw.unRegister();
```
If, ```enableOnRegistration``` inside ```push``` configuration is false, you can enable push using.
```js
sw.registerPush();
```
You can get the display mode of the current window using.
```js
sw.getDisplayMode(); // returns 'browser'/'standalone'/'twa'
```
## Create Push Server
Use Node package [web-push](https://www.npmjs.com/package/web-push) to register push on any device.
Get public and private vapid key using -
```cmd
npx web-push generate-vapid-keys
or,
.\node_modules\.bin\web-push generate-vapid-keys
```
Then in your express app, add -
```js
const webPush = require("web-push");

// use vapid keys
// get it using <.\node_modules\.bin\web-push generate-vapid-keys> command in cmd.
const vapidKey = { // Use Your Own
      public: "BL2qGxzlquJZHaygGl4ojf7GAl29_qF1yS218VH4IpW4a4WBg956xRBmaKPDbioyyAWhh5dKHLLCp8tIG49KpLE",
      private: "-Ul2EaR8M3ma_RyJar-8c8Z2Jv6UbIJ7uVsiCzxzQl0"
};
webPush.setVapidDetails( // set vapid keys in webpush
      "mailto:test@test.com",
      vapidKey.public,
      vapidKey.private
);
function pushNotification(subscription, payload) {
      webPush.sendNotification(subscription, JSON.stringify(payload))
            .catch(err => console.error(err));
}
// Use Set to make each unique.
var Subscriptions = new Set();
app.post("/subscribe/push", (req, res) => {
      Subscriptions.add(req.body);
      res.status(201).json({});
});
```
Now Send Notification Using - 
```js
pushNotification(Subscription[0], {
      title: "Your Title Here",
      body: "Body Of The Notification",
})
```
Options in Push Notification.
1. actions : Array,
2. badge : String,
3. body : String,
4. data : String,
5. dir : String,
6. icon : String,
7. image : String,
8. lang : String,
9. renotify : Boolean,
10. requireInteraction : Boolean,
11. silent : Boolean,
12. tag : String,
13. timestamp : Number,
14. title : String,
15. vibrate : Number || Array,
