import { validateBoundaryFeatureCollection } from "./validate.js";
import type { BoundaryFeatureCollection, BoundaryLevel, Resolution } from "./types.js";
import type { FetchFn } from "./geoboundaries.js";

const MIRROR_BASE = "https://cdn.jsdelivr.net/gh/layrayson/geo-atlas-data@main/data";

/**
 * Countries mirrored onto our own CDN (github.com/layrayson/geo-atlas-data,
 * served via jsDelivr) instead of fetched live from geoBoundaries.org. This
 * exists because geoBoundaries' download URLs fail CORS when called directly
 * from a browser (see geoboundaries.ts's doc comment, and
 * spikes/04-browser-cors) - the mirror has no such redirect, so countries
 * covered here work in a plain client-side app with zero extra setup, no
 * fetchImpl/proxy required. Countries not yet mirrored still work, but only
 * server-side (or with a caller-provided proxy), same as before.
 *
 * Each mirrored file is already validated and ring-rewound (see
 * scripts/build-mirror.ts) - it's a complete, ready-to-use
 * BoundaryFeatureCollection, including its own `meta`.
 */
const MIRRORED: ReadonlySet<string> = new Set([
  "NGA:admin1:simplified",
  "KEN:admin1:simplified",
  "GBR:admin1:simplified",
  "USA:admin1:simplified",
  "IND:admin1:simplified",
  "BRA:admin1:simplified",
  "CHN:admin1:simplified",
  "ZAF:admin1:simplified",
  "AUS:admin1:simplified",
  "FRA:admin1:simplified",
]);

export function isMirrored(iso3: string, level: BoundaryLevel, resolution: Resolution): boolean {
  return MIRRORED.has(`${iso3}:${level}:${resolution}`);
}

export async function fetchFromMirror(
  iso3: string,
  level: BoundaryLevel,
  resolution: Resolution,
  fetchImpl: FetchFn
): Promise<BoundaryFeatureCollection> {
  const url = `${MIRROR_BASE}/${iso3}/${level}-${resolution}.geojson`;
  const res = await fetchImpl(url);
  if (!res.ok) {
    throw new Error(`Mirror request to ${url} failed with status ${res.status}`);
  }
  const data = await res.json();
  validateBoundaryFeatureCollection(data);
  return data;
}
