const CACHE_NAME = "npflood-shell-v4";

const SHELL_PATHS = [
	"/",
	"/en/",
	"/zh/",
	"/status/",
	"/en/status/",
	"/zh/status/",
	"/kerung/",
	"/en/kerung/",
	"/zh/kerung/",
	"/trek/",
	"/en/trek/",
	"/zh/trek/",
];

self.addEventListener("install", (event) => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(CACHE_NAME);
			for (const path of SHELL_PATHS) {
				const response = await fetch(path);
				if (response.ok === false) {
					continue;
				}
				await cache.put(path, response.clone());
				const html = await response.text();
				const assets = html.matchAll(/(?:src|href)="(\/_astro\/[^"]+)"/g);
				for (const match of assets) {
					const asset = match[1];
					if (asset === undefined) {
						continue;
					}
					const assetResponse = await fetch(asset);
					if (assetResponse.ok === true) {
						await cache.put(asset, assetResponse.clone());
					}
				}
			}
			await self.skipWaiting();
		})(),
	);
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

function isShellPath(pathname) {
	if (SHELL_PATHS.includes(pathname) === true) {
		return true;
	}
	if (pathname.endsWith("/") === false) {
		return SHELL_PATHS.includes(`${pathname}/`);
	}
	return false;
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

function markSavedCopy(html) {
	return html.replace('data-saved-copy="true"', 'data-saved-copy="shown"');
}

async function networkFirstHtml(request) {
	const cache = await caches.open(CACHE_NAME);
	try {
		const response = await fetch(request);
		if (response.ok) {
			cache.put(request, response.clone());
		}
		return response;
	} catch (error) {
		const cached = await cache.match(request);
		if (cached === undefined) {
			const url = new URL(request.url);
			const fallback = await cache.match(url.pathname);
			if (fallback === undefined) {
				throw error;
			}
			const html = markSavedCopy(await fallback.text());
			return new Response(html, {
				headers: { "Content-Type": "text/html; charset=utf-8" },
			});
		}
		const html = markSavedCopy(await cached.text());
		return new Response(html, {
			headers: { "Content-Type": "text/html; charset=utf-8" },
		});
	}
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
	if (isHtmlRequest(request) === true) {
		if (isShellPath(url.pathname) === true) {
			event.respondWith(networkFirstHtml(request));
			return;
		}
		event.respondWith(networkFirst(request));
	}
});
