/**
 * geoBoundaries' download URLs redirect through a Git-LFS hop that fails CORS
 * when called directly from a browser (see @geo-atlas/core's geoboundaries.ts
 * doc comment, and spikes/04-browser-cors). This app has no real backend, so
 * for countries NOT covered by the geo-atlas-data CDN mirror, we route
 * through the Vite dev server's own Node process via a tiny proxy middleware
 * (see vite.config.ts) — same trick a real app would implement as a one-route
 * API endpoint.
 *
 * Requests to our own mirror (cdn.jsdelivr.net) are passed straight through,
 * unproxied — that's the whole point of the mirror: jsDelivr serves plain
 * committed files with correct CORS headers directly, no workaround needed.
 * This is what makes the 10 mirrored countries work with zero setup, exactly
 * like a real consumer of @geo-atlas/core would experience it.
 */
export const corsProxyFetch: typeof fetch = (input, init) => {
  const url = typeof input === "string" ? input : input.toString();
  if (url.startsWith("https://cdn.jsdelivr.net/")) {
    return fetch(url, init);
  }
  if (url.startsWith("http")) {
    return fetch(`/api/proxy?url=${encodeURIComponent(url)}`, init);
  }
  return fetch(input, init);
};
