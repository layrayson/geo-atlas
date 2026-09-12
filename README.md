# geo-atlas

Open-source npm library idea: normalized, validated GeoJSON boundary data (countries/continents/states) plus customizable map components — so building something like a choropleth scan-rate map doesn't mean hunting across random file hosts for boundary data that might just be wrong.

Status: early spike phase. Nothing published yet.

## Planned shape

- `packages/core` — fetch + validate normalized boundary data (`getBoundaries({ country, level, resolution })`), sourced from geoBoundaries.org (CC BY family) and Natural Earth (public domain). GADM is intentionally excluded — its license blocks redistribution.
- `packages/react` — `<BoundaryMap />` and friends, wrapping `react-simple-maps`/d3-geo, for countries and continents.

## Spikes

- [01 — geoBoundaries survey](./spikes/01-geoboundaries-survey/README.md): validated schema consistency, license spread, and file size across 10 diverse countries. **Result: green light.**
- [02 — ADM2 scale check](./spikes/02-adm2-scale/README.md): district-level data is 10-20x larger; deferred past v1.
- [03 — disputed territories](./spikes/03-disputed-territories/README.md): source data has inherent contradictions (e.g. Taiwan as both independent and a China province); library will pass through source data faithfully rather than editorialize.

## Setup

```bash
pnpm install
pnpm spike:geoboundaries   # re-run the data source spike
```
