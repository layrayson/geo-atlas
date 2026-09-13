# @geo-atlas/react

[![npm version](https://img.shields.io/npm/v/@geo-atlas/react)](https://www.npmjs.com/package/@geo-atlas/react)
[![npm downloads](https://img.shields.io/npm/dw/@geo-atlas/react)](https://www.npmjs.com/package/@geo-atlas/react)
[![license](https://img.shields.io/npm/l/@geo-atlas/react)](../../LICENSE)

React map components for [@geo-atlas/core](https://www.npmjs.com/package/@geo-atlas/core) — `<BoundaryMap />` and `useBoundaries()`, wrapping [react-simple-maps](https://www.react-simple-maps.io/)/[d3-geo](https://d3js.org/d3-geo).

![geo-atlas demo: selecting a region on Nigeria, Kenya, and the US choropleth map](../../assets/demo.gif)

Try it live: [Boundary Explorer](https://layrayson.github.io/geo-atlas/) · [Documentation](https://layrayson.github.io/geo-atlas/docs/)

## Install

```bash
npm install @geo-atlas/react @geo-atlas/core react
```

## Usage

```tsx
import { useBoundaries, BoundaryMap } from "@geo-atlas/react";

function ScanRateMap() {
  const { boundaries, loading, error } = useBoundaries({ country: "NG" });
  const data = [
    { id: "NG-LA", value: 82 }, // matched by shapeISO first, then shapeName
    { id: "Kano", value: 45 },
  ];

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error.message}</p>;

  return (
    <BoundaryMap
      boundaries={boundaries!}
      data={data}
      colorScale={(value) => (value === undefined ? "#eee" : `rgba(200,50,50,${value / 100})`)}
      onRegionClick={(region) => console.log(region.shapeName, region.value)}
    />
  );
}
```

`useBoundaries` accepts the same query/options shape as `@geo-atlas/core`'s `getBoundaries` — including `fetchImpl` for CORS-proxying and `preferLive` for bypassing the CDN mirror. See [@geo-atlas/core](https://www.npmjs.com/package/@geo-atlas/core)'s README for the details on both.

`BoundaryMap` auto-fits a Mercator projection to whatever boundaries you pass it by default (each country's raw coordinate range differs, so a fixed projection tuned for one country misrenders another). Pass your own `projection` prop (e.g. a composite `geoAlbersUsa()` for the US) when the default auto-fit isn't what you want.

## License

MIT.
