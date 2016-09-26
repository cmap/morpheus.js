var CACHE_NAME = 'morpheus';
var CACHED_FILES = [
	'/morpheus/css/morpheus-latest.min.css',
	'/morpheus/fonts/FontAwesome.otf',
	'/morpheus/fonts/fontawesome-webfont.eot',
	'/morpheus/fonts/fontawesome-webfont.svg',
	'/morpheus/fonts/fontawesome-webfont.ttf',
	'/morpheus/fonts/fontawesome-webfont.woff',
	'/morpheus/fonts/fontawesome-webfont.woff2',
	'/morpheus/js/morpheus-external-latest.min.js',
	'/morpheus/js/morpheus-latest.min.js',
	'/morpheus/',
	'/morpheus/index.html'
];
self.addEventListener('install', function (event) {
	event.waitUntil(
		caches.open(CACHE_NAME).then(function (cache) {
			cache.addAll(CACHED_FILES);
		})
	);
});

self.addEventListener('fetch', function (event) {
	event.respondWith(
		caches.open(CACHE_NAME).then(function (cache) {
			return cache.match(event.request).then(function (cachedResponse) {
				if (cachedResponse) {
					// try to get an updated version
					return fetch(event.request.clone()).then(function (response) {
						cache.put(event.request, response.clone());
						return response;
					}).catch(function () {
						return cachedResponse;
					})
				}
				return fetch(event.request).then(function (response) {
					return response;
				});
			}).catch(function (error) {
				// This catch() will handle exceptions that arise from the match() or fetch() operations.
				// Note that a HTTP error response (e.g. 404) will NOT trigger an exception.
				// It will return a normal response object that has the appropriate error code set.
				throw error;
			});
		})
	);
});
