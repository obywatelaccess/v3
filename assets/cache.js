var params = new URLSearchParams(window.location.search);

window.onload = async () => {
  const files = ["https://unpkg.com/html5-qrcode"];
  const pages = [
    "card",
    "document",
    "documents",
    "home",
    "id",
    "more",
    "pesel",
    "qr",
    "scan",
    "services",
    "shortcuts",
    "show",
  ];

  pages.forEach((page) => {
    files.push(new URL(page + ".html?" + params, window.location.href).toString());
  });

  const image = params.get("image");
  if (image) {
    files.push(image);
  }

  const index = files.indexOf("./assets/cache.js");
  if (index !== -1) {
    files.splice(index, 1);
  }

  const cacheName = "cwelObywatel";

  const cache = await caches.open(cacheName);
  await Promise.all(
    files.map(async (file) => {
      try {
        await cache.add(file);
      } catch (error) {
        console.warn("Unable to cache:", file, error);
      }
    }),
  );

  const cachedRequests = await cache.keys();

  cachedRequests.forEach((request) => {
    checkElement(request, cache).catch((error) => {
      console.warn("Unable to refresh cached request:", request.url, error);
    });
  });

  navigator.serviceWorker.register("./worker.js");
};

async function checkElement(request, cache) {
  const cachedResponse = await cache.match(request);
  if (!cachedResponse) return;

  const url = new URL(request.url);
  const modifiedUrl = new URL(url);

  modifiedUrl.searchParams.append("date", new Date());

  const networkResponse = await fetch(modifiedUrl);
  if (!networkResponse.ok) return;

  const cachedText = await cachedResponse.clone().text();
  const networkText = await networkResponse.clone().text();

  if (cachedText !== networkText) {
    cache.put(url, networkResponse);
  }
}

