const CACHE_NAME = 'zopiplan-cache-v6';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './support.js',
    './zopilote_icon.png',
    './zopilote_crest.png',
    './zopilote_crest.svg',
    './zopilote_crest_cut.png',
    './vulture_jovial.png',
    './vulture_jovial_cut.png',
    './victory_trophy.png',
    './kilinito_happy.png',
    './kilinito_sad.png',
    './leg_swings.png',
    './supported_squat.png',
    './australian_row.png',
    './basket.png',
    './bench_dip.png',
    './carrera.png',
    './dead_hang.png',
    './scapular_pull_up.png',
    './incline_pushup.png',
    './reverse_lunge.png',
    './sumo_squat.png',
    './support_isometric.png',
    './walk.png'
];

// Instalar el Service Worker y cachear recursos iniciales
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cacheando recursos estáticos de Zopiplan...');
                return cache.addAll(ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activar y limpiar cachés anteriores
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        console.log('Borrando caché antigua:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Interceptar peticiones
self.addEventListener('fetch', event => {
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, response.clone());
                        return response;
                    });
                })
                .catch(() => {
                    return caches.match(event.request);
                })
        );
    } else {
        event.respondWith(
            caches.match(event.request)
                .then(cachedResponse => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    return fetch(event.request).then(response => {
                        const isGet = event.request.method === 'GET';
                        const isHttp = event.request.url.startsWith('http');
                        if (isGet && isHttp && response && response.status === 200) {
                            return caches.open(CACHE_NAME).then(cache => {
                                cache.put(event.request, response.clone());
                                return response;
                            });
                        }
                        return response;
                    }).catch(() => {
                        // En caso de fallo de red absoluto, retornar nada
                    });
                })
        );
    }
});
