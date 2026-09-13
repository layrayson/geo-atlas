# geo-atlas

[![deploy status](https://github.com/layrayson/geo-atlas/actions/workflows/deploy-site.yml/badge.svg)](https://github.com/layrayson/geo-atlas/actions/workflows/deploy-site.yml)
[![@geo-atlas/core](https://img.shields.io/npm/v/@geo-atlas/core?label=%40geo-atlas%2Fcore)](https://www.npmjs.com/package/@geo-atlas/core)
[![@geo-atlas/react](https://img.shields.io/npm/v/@geo-atlas/react?label=%40geo-atlas%2Freact)](https://www.npmjs.com/package/@geo-atlas/react)
[![license](https://img.shields.io/github/license/layrayson/geo-atlas)](./LICENSE)

Open-source npm library: normalized, validated GeoJSON boundary data (countries/continents/states) plus customizable map components — so building something like a choropleth scan-rate map doesn't mean hunting across random file hosts for boundary data that might just be wrong.

[**Live demo**](https://layrayson.github.io/geo-atlas/) · [**Documentation**](https://layrayson.github.io/geo-atlas/docs/) · [`@geo-atlas/core`](https://www.npmjs.com/package/@geo-atlas/core) · [`@geo-atlas/react`](https://www.npmjs.com/package/@geo-atlas/react)

![geo-atlas demo: selecting a region on Nigeria, Kenya, and the US choropleth map](./assets/demo.gif)

## Shape

- `packages/core` — `getBoundaries({ country, level, resolution })` fetches, validates, and normalizes boundary data. For the 197 countries covered by [geo-atlas-data](https://github.com/layrayson/geo-atlas-data) (a CDN mirror), it works directly in a browser with zero setup; everything else — mostly dependent territories and microstates geoBoundaries doesn't publish ADM1 data for (Bermuda, Hong Kong, Puerto Rico, Vatican, etc.) — falls back to a live geoBoundaries.org fetch, which needs a same-origin proxy in a pure client-side app (server-side/SSR needs nothing extra either way). GADM is intentionally excluded as a source — its license blocks redistribution.
- `packages/react` — `<BoundaryMap />` + `useBoundaries()`, wrapping `react-simple-maps`/d3-geo.
- `apps/demo` — a working example: a scan-rate choropleth (mock data, generated per-region so it works for any country) with a full ~195-country dropdown.
- `apps/docs` — [VitePress documentation site](https://layrayson.github.io/geo-atlas/docs/): installation, quick start, and the browser/CORS/proxy details.

## Spikes

- [01 — geoBoundaries survey](./spikes/01-geoboundaries-survey/README.md): schema consistency, license spread, file size across 10 countries. **Green light.**
- [02 — ADM2 scale check](./spikes/02-adm2-scale/README.md): district-level data is 10-20x larger; deferred past v1.
- [03 — disputed territories](./spikes/03-disputed-territories/README.md): source data has inherent contradictions (e.g. Taiwan as both independent and a China province); library passes through source data faithfully rather than editorializing.
- [04 — browser CORS + ring winding](./spikes/04-browser-cors/README.md): two real bugs only found by building the demo — a Git-LFS CORS redirect issue, and a d3-geo/RFC7946 winding-order mismatch that made every feature render as its own inverse. Both fixed in `@geo-atlas/core`.

## Try it

```bash
pnpm install
pnpm --filter @geo-atlas/core build   # packages/core and packages/react ship compiled
pnpm --filter @geo-atlas/react build  # output (dist/), so build both before running the demo
pnpm --filter demo dev
```

Then open the printed `localhost` URL. Pick any country from the dropdown — every region gets a mock scan-rate color. 197 countries load instantly from the CDN mirror with no proxy (see [geo-atlas-data/manifest.json](https://github.com/layrayson/geo-atlas-data/blob/main/manifest.json) for the full list); everything else falls back through the demo's local dev-server proxy (standing in for a real app's own backend route).

## Tests

```bash
pnpm test
```

38 tests (Vitest) across `packages/core` (ISO code resolution, GeoJSON validation, mirror-vs-live routing, caching, the ring-winding fix), `packages/react` (`useBoundaries`, `BoundaryMap`), and the demo's CORS-proxy routing. All mocked - no network calls.

## Other scripts

```bash
pnpm spike:geoboundaries        # re-run the spike 01 data source survey
pnpm exec tsx scripts/build-mirror.ts   # regenerate/extend the CDN mirror data (writes to ../geo-atlas-data)
```
