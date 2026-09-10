(() => {
  const ROOT = "/services/hermes-connect/repair-shops/booking";
  const path = window.location.pathname.replace(/\/+$/, "");
  if (path !== ROOT || window.__hcRepairShopPublicReadDeduperInstalled) return;
  window.__hcRepairShopPublicReadDeduperInstalled = true;

  const nativeFetch = window.fetch.bind(window);
  const reads = new Map();

  window.fetch = (input, init) => {
    let url;
    let method = String(init?.method || "GET").toUpperCase();
    try {
      if (input instanceof Request) {
        url = new URL(input.url, window.location.origin);
        if (!init?.method) method = String(input.method || "GET").toUpperCase();
      } else {
        url = new URL(String(input), window.location.origin);
      }
    } catch {
      return nativeFetch(input, init);
    }

    const isPublicShopRead = method === "GET"
      && url.origin === window.location.origin
      && url.pathname === "/api/public/repair-shop"
      && Boolean(url.searchParams.get("slug"));
    if (!isPublicShopRead) return nativeFetch(input, init);

    const key = `${url.pathname}?${url.searchParams.toString()}`;
    if (!reads.has(key)) {
      const request = nativeFetch(input, init).catch((error) => {
        reads.delete(key);
        throw error;
      });
      reads.set(key, request);
    }
    return reads.get(key).then((response) => response.clone());
  };
})();
