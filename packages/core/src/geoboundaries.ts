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

async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request to ${url} failed with status ${res.status}`);
  }
  return res.json();
}

export async function fetchFromGeoBoundaries(
  countryCode: string,
  level: BoundaryLevel,
  resolution: Resolution
): Promise<BoundaryFeatureCollection> {
  const iso3 = toIso3(countryCode);
  const gbType = LEVEL_TO_GB_TYPE[level];

  const meta: GBMetaResponse = await fetchJson(`${API_BASE}/${iso3}/${gbType}/`);
  const geoUrl = resolution === "full" ? meta.gjDownloadURL : meta.simplifiedGeometryGeoJSON;
  const raw = await fetchJson(geoUrl);

  validateBoundaryFeatureCollection(raw);

  return {
    ...raw,
    meta: {
      provider: "geoBoundaries",
      license: meta.boundaryLicense,
      sourceName: meta.boundarySource,
      sourceDataUpdateDate: meta.sourceDataUpdateDate,
      sourceUrl: meta.boundarySourceURL,
    },
  };
}
