import type { BoundaryFeatureCollection } from "@geo-atlas/core";
import { BoundaryMap, useBoundaries } from "@geo-atlas/react";
import { geoAlbersUsa } from "d3-geo";
import { useMemo, useState } from "react";
import { ALL_COUNTRIES } from "./countries.js";
import { corsProxyFetch } from "./corsProxyFetch.js";
import { mockScanRatesFor } from "./mockData.js";

/**
 * US territories span ~150° of longitude (Guam at +145°E to American Samoa
 * at -170°) - fitting that whole span makes the mainland+Alaska (the only
 * part anyone actually looks at) shrink to a sliver in the canvas with lots
 * of empty space. This is the standard "US is absurdly spread out" problem
 * every real US choropleth map solves with a composite projection
 * (geoAlbersUsa) instead of true-position fitting. geoAlbersUsa only knows
 * how to place the 50 states + DC, so those territories are filtered out
 * before fitting/rendering when this projection is used.
 */
const US_TERRITORY_SHAPE_ISO = new Set(["US-PR", "US-VI", "US-GU", "US-MP", "US-AS"]);

function excludeUsTerritories(boundaries: BoundaryFeatureCollection): BoundaryFeatureCollection {
  return {
    ...boundaries,
    features: boundaries.features.filter((f) => !US_TERRITORY_SHAPE_ISO.has(f.properties.shapeISO)),
  };
}

function scanRateColor(value: number | undefined): string {
  if (value === undefined) return "#EEEEEE";
  if (value < 40) return "#F4AEB2";
  if (value < 70) return "#FFE099";
  return "#B7E1C1";
}

export default function App() {
  const [country, setCountry] = useState("NG");
  const { boundaries, loading, error } = useBoundaries(
    { country, level: "admin1" },
    { fetchImpl: corsProxyFetch }
  );
  const [selected, setSelected] = useState<string>();

  // Gate on the *loaded* data's own country code (shapeGroup), not the
  // `country` select-state. `country` updates synchronously on select, but
  // `boundaries` only catches up once the async fetch resolves - gating on
  // `country` created a window where a just-selected "US" would pair the
  // AlbersUSA projection with the *previous* country's still-loaded geometry
  // (e.g. Kenya's coordinates run through a projection that only recognizes
  // US points), producing NaN paths for every feature until the real US data
  // arrived. Checking the data itself removes the possibility of that
  // mismatch entirely, regardless of fetch timing.
  const isUsData = boundaries?.features[0]?.properties.shapeGroup === "USA";

  const displayBoundaries = useMemo(() => {
    if (!boundaries) return undefined;
    return isUsData ? excludeUsTerritories(boundaries) : boundaries;
  }, [boundaries, isUsData]);

  const usProjection = useMemo(
    () => (displayBoundaries && isUsData ? geoAlbersUsa().fitSize([700, 550], displayBoundaries) : undefined),
    [displayBoundaries, isUsData]
  );

  const mockData = useMemo(
    () => (displayBoundaries ? mockScanRatesFor(displayBoundaries) : []),
    [displayBoundaries]
  );

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1>geo-atlas demo</h1>
      <p>
        Country: <code>{country}</code> · Level: <code>admin1</code> · Source:{" "}
        {boundaries ? `${boundaries.meta.sourceName} (${boundaries.meta.license})` : "loading..."}
      </p>

      <div style={{ marginBottom: 16 }}>
        <select value={country} onChange={(e) => setCountry(e.target.value)}>
          {ALL_COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading boundary data...</p>}
      {error && <p style={{ color: "red" }}>Error: {error.message} (this country may not have admin1-level data in geoBoundaries)</p>}

      {displayBoundaries && (
        <BoundaryMap
          // Forces a clean remount instead of an in-place patch when the
          // country changes, so react-simple-maps' internal geometry cache
          // (updated via its own useEffect, separate from the projection)
          // never gets reused across two entirely different countries.
          key={country}
          boundaries={displayBoundaries}
          data={mockData}
          colorScale={scanRateColor}
          width={700}
          height={550}
          projection={usProjection}
          onRegionClick={(region) => setSelected(`${region.shapeName}: ${region.value ?? "no data"}`)}
        />
      )}

      {selected && <p>Selected: {selected}</p>}
    </div>
  );
}
