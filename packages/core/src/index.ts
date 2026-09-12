import { fetchFromGeoBoundaries } from "./geoboundaries.js";
import type { BoundaryFeatureCollection, BoundaryQuery } from "./types.js";

export * from "./types.js";
export { InvalidBoundaryDataError } from "./validate.js";
export { toIso3 } from "./geoboundaries.js";

const cache = new Map<string, Promise<BoundaryFeatureCollection>>();

/**
 * Fetch normalized, validated GeoJSON boundary data for a country.
 * Defaults to admin1 (state/province) level at simplified resolution —
 * full resolution can be 10-70x larger (see spikes/01-geoboundaries-survey)
 * and should be requested explicitly.
 */
export function getBoundaries(query: BoundaryQuery): Promise<BoundaryFeatureCollection> {
  const level = query.level ?? "admin1";
  const resolution = query.resolution ?? "simplified";
  const cacheKey = `${query.country.toUpperCase()}:${level}:${resolution}`;

  if (!cache.has(cacheKey)) {
    cache.set(cacheKey, fetchFromGeoBoundaries(query.country, level, resolution));
  }
  return cache.get(cacheKey)!;
}

/** Clears the in-memory response cache. Mainly useful in tests. */
export function clearBoundaryCache(): void {
  cache.clear();
}
