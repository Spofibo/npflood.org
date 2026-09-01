const CACHE_NAME = "npflood-shell-v3";

self.addEventListener("install", (event) => {
	event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((keys) =>
			Promise.all(
				keys.map((key) => {
					if (key !== CACHE_NAME) {
						return caches.delete(key);
					}
					return undefined;
				}),
			),
		).then(() => self.clients.claim()),
	);
});

function isAssetRequest(request) {
	const dest = request.destination;
	return dest === "style" || dest === "script" || dest === "font" || dest === "image";
}

function isHtmlRequest(request) {
	if (request.mode === "navigate") {
		return true;
	}
	const accept = request.headers.get("accept");
	return accept !== null && accept.includes("text/html");
}

function isHashedAstroAsset(request) {
	const url = new URL(request.url);
	return url.pathname.startsWith("/_astro/");
}

async function cacheFirst(request) {
	const cached = await caches.match(request);
	if (cached !== undefined) {
		return cached;
	}
	const response = await fetch(request);
	if (response.ok) {
		const cache = await caches.open(CACHE_NAME);
		cache.put(request, response.clone());
	}
	return response;
}

async function networkFirst(request) {
	const cache = await caches.open(CACHE_NAME);
	try {
		const response = await fetch(request);
		if (response.ok) {
			cache.put(request, response.clone());
		}
		return response;
	} catch (error) {
		const cached = await cache.match(request);
		if (cached !== undefined) {
			return cached;
		}
		throw error;
	}
}

self.addEventListener("fetch", (event) => {
	const request = event.request;
	if (request.method !== "GET") {
		return;
	}
	const url = new URL(request.url);
	if (url.origin !== self.location.origin) {
		return;
	}
	if (isAssetRequest(request)) {
		if (isHashedAstroAsset(request) === true) {
			event.respondWith(cacheFirst(request));
			return;
		}
		event.respondWith(networkFirst(request));
		return;
	}
	if (isHtmlRequest(request)) {
		event.respondWith(networkFirst(request));
	}
});
