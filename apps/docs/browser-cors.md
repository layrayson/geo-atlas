---
description: Why geoBoundaries fails CORS in a plain browser, which countries need a proxy, and how to add one.
---

# Browser & CORS

Skip this page if you only need the [live demo](https://layrayson.github.io/geo-atlas/)'s ~197 mirrored countries in a client-only app — those work with zero setup. Read it if you need **every** country, or you're unsure which bucket a given country falls into.

## Why this exists

geoBoundaries' own download URLs are Git-LFS tracked and 302-redirect to `media.githubusercontent.com`. That redirect response carries an empty `Access-Control-Allow-Origin` header, which browsers correctly treat as a CORS failure — even though the final response, once followed, has a valid one. Node's `fetch` doesn't enforce CORS, so this only ever surfaces when `getBoundaries()` runs directly in a browser.

`@geo-atlas/core` mirrors ~197 countries' data onto its own CDN ([geo-atlas-data](https://github.com/layrayson/geo-atlas-data), served via jsDelivr) specifically to route around this — jsDelivr serves plain files with correct CORS headers, no redirect involved. Countries outside that mirror still work, just not from a bare client-side `fetch`.

## The three environments

| Where `getBoundaries()` runs | Mirrored countries | Everything else |
| --- | --- | --- |
| Server-side (SSR, API route, build script, Node) | ✅ works | ✅ works — no CORS enforcement outside a browser |
| Browser, no proxy | ✅ works | ❌ fails with a CORS error |
| Browser, with `fetchImpl` proxy | ✅ works | ✅ works |

## Checking ahead of time

`isMirrored` tells you whether a given country/level/resolution combination is covered, so you can decide in advance whether a plain browser fetch will work:

```ts
import { isMirrored, toIso3 } from "@geo-atlas/core";

isMirrored(toIso3("KE"), "admin1", "simplified"); // true  - works in any browser
isMirrored(toIso3("PR"), "admin1", "simplified"); // false - needs a proxy in the browser
```

This is exactly how the [live demo](https://layrayson.github.io/geo-atlas/) decides which countries to list — it's a static, backend-less deployment, so its country picker is filtered down to only what `isMirrored` confirms will work with no proxy at all.

## Adding a proxy for the rest

Pass a `fetchImpl` that routes through a same-origin route you control. The route just needs to fetch the upstream URL it's given and return the response — `@geo-atlas/core` only calls it for URLs it can't reach directly:

```ts
const proxyFetch: typeof fetch = (input, init) => {
  const url = typeof input === "string" ? input : input.toString();
  if (url.startsWith("https://cdn.jsdelivr.net/")) return fetch(url, init); // mirror - no proxy needed
  return fetch(`/api/geo-proxy?url=${encodeURIComponent(url)}`, init);
};

await getBoundaries({ country: "PR" }, { fetchImpl: proxyFetch });
```

Your `/api/geo-proxy` route (a Next.js route handler, an Express endpoint, a Vite dev-server middleware, etc.) fetches `url` server-side, where CORS doesn't apply, and streams the response back. The demo's own dev-only version of this is in [`apps/demo/vite.config.ts`](https://github.com/layrayson/geo-atlas/blob/main/apps/demo/vite.config.ts) if you want a working reference — restrict the allowed upstream hosts the way it does, so the route stays a narrow proxy rather than an open one.

## `preferLive`

`getBoundaries` accepts `preferLive: true` to skip the mirror entirely and always fetch straight from geoBoundaries, even for countries the mirror covers — useful if you need guaranteed-current data and the mirror's snapshot might lag behind an upstream update. It has no effect on countries the mirror doesn't cover, since those already go straight to geoBoundaries.
