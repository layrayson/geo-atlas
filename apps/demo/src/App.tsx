import { isMirrored, toIso3, type BoundaryFeatureCollection } from "@geo-atlas/core";
import { BoundaryMap, useBoundaries } from "@geo-atlas/react";
import { geoAlbersUsa } from "d3-geo";
import { useMemo, useState } from "react";
import "./App.css";
import { ALL_COUNTRIES } from "./countries.js";
import { corsProxyFetch } from "./corsProxyFetch.js";
import { mockScanRatesFor } from "./mockData.js";

/**
 * The CORS-workaround proxy (see corsProxyFetch.ts) only exists as Vite
 * dev-server middleware - a built, statically-hosted copy of this app (e.g.
 * GitHub Pages) has no server process to run it on. Rather than let visitors
 * pick a country and hit a confusing proxy-not-found error, restrict the
 * built app's selector to countries the CDN mirror already covers, which
 * work from a plain static page with zero proxy. Dev keeps the full list
 * since the proxy is available there.
 */
const SELECTABLE_COUNTRIES = import.meta.env.PROD
  ? ALL_COUNTRIES.filter((c) => isMirrored(toIso3(c.code), "admin1", "simplified"))
  : ALL_COUNTRIES;

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

const SCALE = { low: "#c1603f", mid: "#cf9d3c", high: "#587f55", empty: "#d6cdb2" };

function scanRateColor(value: number | undefined): string {
  if (value === undefined) return SCALE.empty;
  if (value < 40) return SCALE.low;
  if (value < 70) return SCALE.mid;
  return SCALE.high;
}

/**
 * The library throws a plain Error with the raw request URL/status baked
 * into the message - useful in a console, not in a UI. A 404 here almost
 * always means one specific, explainable thing (geoBoundaries has no
 * admin1-level data for this place, typically because it's a microstate or
 * dependent territory with no such subdivisions), so recognize that shape
 * and rephrase it; anything else falls back to the raw message rather than
 * guessing.
 */
function friendlyError(message: string, countryName: string): string {
  if (/failed with status 404/.test(message)) {
    return `${countryName} has no admin1-level boundary data in geoBoundaries — common for microstates and dependent territories. Try another country.`;
  }
  return message;
}

export default function App() {
  const [country, setCountry] = useState("NG");
  const { boundaries, loading, error } = useBoundaries(
    { country, level: "admin1" },
    { fetchImpl: corsProxyFetch }
  );
  const [selected, setSelected] = useState<string>();
  const countryName = SELECTABLE_COUNTRIES.find((c) => c.code === country)?.name ?? country;

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
    <div className="atlas">
      <div className="atlas-frame">
        <span className="reg-mark reg-mark--tl" aria-hidden="true" />
        <span className="reg-mark reg-mark--br" aria-hidden="true" />

        <header className="atlas-header">
          <div className="stamp">
            <span className="stamp-dot" />
            Field survey · No. 001
          </div>
          <h1 className="atlas-title">
            Boundary
            <br />
            Explorer
          </h1>
          <p className="atlas-tagline">
            A mock scan-rate choropleth over live administrative boundaries, built with{" "}
            <span className="figure">@geo-atlas/core</span> + <span className="figure">@geo-atlas/react</span>.
          </p>
        </header>

        <div className="toolbar">
          <label className="field">
            <span className="field-label">01 — Select region</span>
            <select className="select" value={country} onChange={(e) => setCountry(e.target.value)}>
              {SELECTABLE_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <div className="meta-stamp">
            <span className="meta-stamp-line meta-stamp-line--tag">admin1</span>
            <span className="meta-stamp-line">
              {boundaries ? `${boundaries.meta.sourceName} · ${boundaries.meta.license}` : "loading…"}
            </span>
          </div>
        </div>

        <div className="stage-wrap">
          <span className="corner corner--tl" aria-hidden="true" />
          <span className="corner corner--tr" aria-hidden="true" />
          <span className="corner corner--bl" aria-hidden="true" />
          <span className="corner corner--br" aria-hidden="true" />

          <div className="stage">
            {loading && <p className="stage-status">Loading boundary data…</p>}
            {error && (
              <p className="stage-status stage-status--error">
                {friendlyError(error.message, countryName)}
              </p>
            )}
            {!loading && !error && displayBoundaries && (
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
          </div>
        </div>

        <div className="legend">
          <span className="legend-label">Scan rate</span>
          <div className="legend-item">
            <span className="swatch" style={{ background: SCALE.low }} />
            Below 40
          </div>
          <div className="legend-item">
            <span className="swatch" style={{ background: SCALE.mid }} />
            40–70
          </div>
          <div className="legend-item">
            <span className="swatch" style={{ background: SCALE.high }} />
            70 and above
          </div>
          {selected && (
            <span className="selection">
              Selected — <strong>{selected}</strong>
            </span>
          )}
        </div>

        <footer className="atlas-footer">
          <a href="https://github.com/layrayson/geo-atlas">Source on GitHub</a>
          <span>·</span>
          <a href="https://www.npmjs.com/package/@geo-atlas/react">@geo-atlas/react</a>
          <span>·</span>
          <a href="https://www.npmjs.com/package/@geo-atlas/core">@geo-atlas/core</a>
        </footer>
      </div>
    </div>
  );
}
