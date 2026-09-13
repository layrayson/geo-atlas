# Quick Start

## Just the data

`getBoundaries` returns a validated, RFC-7946-correct `BoundaryFeatureCollection` for a country. Accepts an ISO 3166-1 alpha-2 or alpha-3 code.

```ts
import { getBoundaries } from "@geo-atlas/core";

const boundaries = await getBoundaries({ country: "KE" });
// boundaries.features -> one GeoJSON Feature per admin1 region (Kenya's counties)
// boundaries.meta     -> { provider, license, sourceName, sourceUrl, ... }
```

`level` defaults to `"admin1"` (the only other option today is `"country"`, the outline with no subdivisions) and `resolution` defaults to `"simplified"` — pass `resolution: "full"` for higher-detail geometry, at 10–70x the file size.

```ts
await getBoundaries({ country: "KE", level: "country" });
await getBoundaries({ country: "KE", resolution: "full" });
```

## A rendered map

`<BoundaryMap />` takes the boundaries plus a value per region and a color scale — it auto-fits a Mercator projection to whatever country you pass in, so the same component works unmodified for any of them.

```tsx
import { BoundaryMap, useBoundaries } from "@geo-atlas/react";

function KenyaMap() {
  const { boundaries, loading, error } = useBoundaries({ country: "KE" });

  if (loading) return <p>Loading…</p>;
  if (error) return <p>{error.message}</p>;
  if (!boundaries) return null;

  return (
    <BoundaryMap
      boundaries={boundaries}
      data={boundaries.features.map((f) => ({
        id: f.properties.shapeISO,
        value: Math.random() * 100, // swap in your real per-region data
      }))}
      colorScale={(value) => (value === undefined ? "#eee" : value < 50 ? "#f4a" : "#4a8")}
      width={700}
      height={550}
      onRegionClick={(region) => console.log(region.shapeName, region.value)}
    />
  );
}
```

`data` is matched to features by `id` against each feature's `shapeISO` first, falling back to `shapeName` — use whichever your own dataset keys on.

## What's next

- [Browser & CORS](/browser-cors) — required reading before shipping a client-only app that needs countries outside the CDN mirror.
- The [live demo](https://layrayson.github.io/geo-atlas/) is this same `useBoundaries` + `BoundaryMap` pair, wired up to a country picker.
