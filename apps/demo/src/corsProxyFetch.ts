/**
 * geoBoundaries' download URLs redirect through a Git-LFS hop that fails CORS
 * when called directly from a browser (see @geo-atlas/core's geoboundaries.ts
 * doc comment, and spikes/04-browser-cors). This app has no real backend, so
 * instead we route those requests through the Vite dev server's own Node
 * process via a tiny proxy middleware (see vite.config.ts) — same trick a
 * real app would implement as a one-route API endpoint.
 */
export const corsProxyFetch: typeof fetch = (input, init) => {
  const url = typeof input === "string" ? input : input.toString();
  if (url.startsWith("http")) {
    return fetch(`/api/proxy?url=${encodeURIComponent(url)}`, init);
  }
  return fetch(input, init);
};
