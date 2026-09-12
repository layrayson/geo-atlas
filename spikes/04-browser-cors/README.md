# Spike 04 — browser rendering: CORS and ring winding

Found while building the first real demo app (`apps/demo`), not planned in advance — the kind of thing that only surfaces once you actually try to render something in a browser.

## Bug 1 — CORS failure on every browser fetch

**Symptom:** `getBoundaries()` worked perfectly in every Node spike but failed with a CORS error the moment it ran in an actual browser.

**Cause:** every geoBoundaries release file is Git-LFS tracked. Their metadata API returns download URLs like `github.com/wmgeolab/geoBoundaries/raw/<sha>/...`, which 302-redirect to `media.githubusercontent.com`. That redirect *response itself* carries an empty `Access-Control-Allow-Origin` header. Browsers correctly fail the whole request on that — even though the final destination has a valid header — because redirect hops are CORS-checked too. Node's `fetch` never hits this since CORS is a browser-only concept, which is exactly why every earlier spike (all run in Node) looked fine.

Two dead ends before finding a real fix:
- `raw.githubusercontent.com` directly (skipping the redirect) — returns a Git-LFS pointer stub, not the real file, for every single geoBoundaries release file (confirmed: even a 167KB GBR file is LFS-tracked, not just huge ones).
- jsDelivr's GitHub proxy (`cdn.jsdelivr.net/gh/...`) — same problem, it proxies the raw git blob, which is the LFS pointer.

**Fix:** `getBoundaries()` now takes an optional `fetchImpl` ([types.ts](../../packages/core/src/types.ts), threaded through in [geoboundaries.ts](../../packages/core/src/geoboundaries.ts)). Server-side callers (SSR, API routes, build scripts) need nothing extra. A pure client-side app with no backend must route through a same-origin proxy — `apps/demo` implements the minimal version of this as a Vite dev-server middleware ([vite.config.ts](../../apps/demo/vite.config.ts) + [corsProxyFetch.ts](../../apps/demo/src/corsProxyFetch.ts)), restricted to an allowlist of the three relevant hosts.

**Open question for v1:** a real published package can't ask every consumer to run their own proxy. The actual fix is probably to mirror the data onto our own CDN at publish time (this was already the long-term plan) rather than fetching geoBoundaries live from the browser at all.

## Bug 2 — every feature renders as its own inverse

**Symptom:** after fixing CORS, the map rendered as one flat rectangle in a single color, no visible state borders.

**Cause:** confirmed by testing pure d3-geo directly in the browser console, bypassing react-simple-maps entirely — every one of Nigeria's 37 states, without exception, computed to the exact same full-canvas bounding box `[75, 0, 625, 550]` regardless of true size (Abuja FCT, a tiny territory, matched Cross River exactly). Manually reversing one state's (Lagos, confirmed independently as correctly RFC 7946-wound via the shoelace formula) ring order collapsed its extent from the full canvas down to its real, small area. geoBoundaries ships spec-correct (RFC 7946, counter-clockwise exterior ring) GeoJSON — but d3-geo's spherical polygon clipping was built around the older, opposite (clockwise-exterior) convention, and doesn't auto-correct. Every feature was rendering as its own geometric inverse: nearly the whole map, minus the real shape.

**Fix:** normalize every FeatureCollection with [`geojson-rewind`](https://www.npmjs.com/package/geojson-rewind) (`outer: true`, i.e. force clockwise exterior rings) inside `@geo-atlas/core` itself ([geoboundaries.ts](../../packages/core/src/geoboundaries.ts)), right after schema validation. This fixes it once for every consumer, regardless of which d3-geo-based renderer they use — not just `@geo-atlas/react`.

## Why this spike matters

Neither bug showed up in any Node-based spike (01-03) or in `tsc` type-checking — both only exist at the intersection of "real browser" + "real rendering library." This is exactly the kind of gap a real demo app catches that isolated data spikes can't, and exactly the sort of "some sources were flat-out wrong" experience that motivated this whole project — except here the geoBoundaries *data* was correct; the incompatibility was between two correct-but-conflicting conventions (RFC 7946 vs. d3-geo), which is arguably worse to debug because nothing is simply "broken."
