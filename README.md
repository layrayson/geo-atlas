# geo-atlas

Open-source npm library idea: normalized, validated GeoJSON boundary data (countries/continents/states) plus customizable map components — so building something like a choropleth scan-rate map doesn't mean hunting across random file hosts for boundary data that might just be wrong.

Status: working proof of concept. Nothing published yet.

## Shape

- `packages/core` — `getBoundaries({ country, level, resolution })` fetches, validates, and normalizes boundary data from geoBoundaries.org (CC BY family; Natural Earth for lower-detail views is a planned addition). GADM is intentionally excluded — its license blocks redistribution.
- `packages/react` — `<BoundaryMap />` + `useBoundaries()`, wrapping `react-simple-maps`/d3-geo.
- `apps/demo` — a working example: a Nigeria scan-rate choropleth (mock data) with country switching (NG/KE/GB/US).

## Spikes

- [01 — geoBoundaries survey](./spikes/01-geoboundaries-survey/README.md): schema consistency, license spread, file size across 10 countries. **Green light.**
- [02 — ADM2 scale check](./spikes/02-adm2-scale/README.md): district-level data is 10-20x larger; deferred past v1.
- [03 — disputed territories](./spikes/03-disputed-territories/README.md): source data has inherent contradictions (e.g. Taiwan as both independent and a China province); library passes through source data faithfully rather than editorializing.
- [04 — browser CORS + ring winding](./spikes/04-browser-cors/README.md): two real bugs only found by building the demo — a Git-LFS CORS redirect issue, and a d3-geo/RFC7946 winding-order mismatch that made every feature render as its own inverse. Both fixed in `@geo-atlas/core`.

## Try it

```bash
pnpm install
pnpm --filter demo dev
```

Then open the printed `localhost` URL. Switch between NG/KE/GB/US with the buttons — Nigeria has mock scan-rate data and is clickable; the others just show boundaries.

## Other scripts

```bash
pnpm spike:geoboundaries   # re-run the spike 01 data source survey
```
