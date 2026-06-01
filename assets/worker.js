self.addEventListener('fetch', (event) => {
    const req = event.request;
    try {
        const reqUrl = new URL(req.url);
        // If request is cross-origin, bypass cache handling to avoid worker fetch issues
        if (reqUrl.origin !== self.location.origin) {
            event.respondWith(fetch(req).catch(() => new Response(null, { status: 502 })));
            return;
        }
    } catch (e) {
        // If URL parsing fails for any reason, fallback to normal behavior
    }

    event.respondWith(
        caches.match(req).then((response) => {
            return response || fetch(req);
        }).catch(() => fetch(req))
    );
});