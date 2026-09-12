import rewind from "geojson-rewind";
import { ISO2_TO_ISO3 } from "./iso-codes.js";
import { validateBoundaryFeatureCollection } from "./validate.js";
import type { BoundaryFeatureCollection, BoundaryLevel, Resolution } from "./types.js";

const API_BASE = "https://www.geoboundaries.org/api/current/gbOpen";

const LEVEL_TO_GB_TYPE: Record<BoundaryLevel, string> = {
  country: "ADM0",
  admin1: "ADM1",
};

interface GBMetaResponse {
  boundaryName: string;
  boundarySource: string;
  boundaryLicense: string;
  sourceDataUpdateDate: string;
  sourceDataURL: string;
  boundarySourceURL: string;
  gjDownloadURL: string;
  simplifiedGeometryGeoJSON: string;
}

export function toIso3(code: string): string {
  const upper = code.toUpperCase();
  if (upper.length === 3) return upper;
  const iso3 = ISO2_TO_ISO3[upper];
  if (!iso3) {
    throw new Error(`Unknown country code "${code}" — expected an ISO 3166-1 alpha-2 or alpha-3 code`);
  }
  return iso3;
}

export type FetchFn = typeof fetch;

async function fetchJson(fetchFn: FetchFn, url: string): Promise<any> {
  const res = await fetchFn(url);
  if (!res.ok) {
    throw new Error(`Request to ${url} failed with status ${res.status}`);
  }
  return res.json();
}

/**
 * geoBoundaries' download URLs point at github.com/.../raw/... paths. Every
 * release file is Git-LFS tracked, so those URLs 302 to media.githubusercontent.com.
 * That redirect response itself carries an empty Access-Control-Allow-Origin
 * header, which browsers (correctly) treat as a CORS failure even though the
 * final response has a valid one — Node's fetch has no CORS enforcement, so
 * this only surfaces when called directly from a browser. See
 * spikes/04-browser-cors for the full writeup.
 *
 * Fix: run getBoundaries() server-side (SSR, an API route, build-time), or
 * pass a `fetchImpl` that routes through a same-origin proxy in the browser.
 */
export async function fetchFromGeoBoundaries(
  countryCode: string,
  level: BoundaryLevel,
  resolution: Resolution,
  fetchImpl: FetchFn = fetch
): Promise<BoundaryFeatureCollection> {
  const iso3 = toIso3(countryCode);
  const gbType = LEVEL_TO_GB_TYPE[level];

  const meta: GBMetaResponse = await fetchJson(fetchImpl, `${API_BASE}/${iso3}/${gbType}/`);
  const geoUrl = resolution === "full" ? meta.gjDownloadURL : meta.simplifiedGeometryGeoJSON;
  const raw = await fetchJson(fetchImpl, geoUrl);

  validateBoundaryFeatureCollection(raw);

  // geoBoundaries ships RFC 7946-compliant (counter-clockwise exterior ring)
  // GeoJSON, but d3-geo's spherical polygon clipping — which react-simple-maps
  // and any other d3-geo-based renderer relies on — expects the opposite
  // (clockwise exterior) convention. Left unrewound, every feature renders as
  // its own inverse: a shape covering nearly the whole map instead of the
  // actual small region. Confirmed by direct testing while building the demo
  // (apps/demo) — see spikes/04-browser-cors for the full writeup. Rewinding
  // here in core means every consumer gets correct geometry regardless of
  // which rendering library they use.
  const normalized = rewind(raw, true);

  return {
    ...normalized,
    meta: {
      provider: "geoBoundaries",
      license: meta.boundaryLicense,
      sourceName: meta.boundarySource,
      sourceDataUpdateDate: meta.sourceDataUpdateDate,
      sourceUrl: meta.boundarySourceURL,
    },
  };
}
