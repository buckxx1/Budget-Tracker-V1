const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/css/styles.css",
    "/js/index.js",
    "/js/db.js",
    "/icons/icon-72x72.png",
    "/icons/icon-96x96.png",
    "/icons/icon-128x128.png",
    "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
    "https://cdn.jsdelivr.net/npm/chart.js@2.8.0"
];

const CACHE_NAME = "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

self.addEventListener("install", (evt) => {
    evt.waitUntil(
        chaches.open(CACHE_NAME).then((chache) => {
            return caches.addAll(FILES_TO_CACHE);
        })
    );

    self.skipWaiting();
});
//delete old caches 
self.addEventListener("activate", (evt) => {
    evt.waitUntil(
        chaches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

//GET requests for the api 
self.addEventListener("fetch", (evt) => {
    if (evt.request.url.includes("/api/") && evt.request.method === "GET") {
        evt.respondWith(
            caches
                .open(DATA_CACHE_NAME)
                .then((cache) => {
                    return fetch(evt.request)
                    //take response clone and store
                    .then((response) => {
                        if (response.status === 200) {
                            chache.put(evt.request, response.clone());
                        } 
                        return response;
                    })
                    //catch failed get info from cache 
                    .catch(() => {
                        return cache.match(evt.request);
                    });
                })
                .catch((err) => console.log(err))
        );
        //end the call back function 
        return;
    }
    //offline workaround 
    evt.responseWith(
        chaches.match(evt.request).then((response) => {
            return response || fetch(evt.request);
        })
    )
})