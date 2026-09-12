import { fetchFromGeoBoundaries, toIso3, type FetchFn } from "./geoboundaries.js";
import { fetchFromMirror, isMirrored } from "./mirror.js";
import type { BoundaryFeatureCollection, BoundaryQuery } from "./types.js";

export * from "./types.js";
export { InvalidBoundaryDataError } from "./validate.js";
export { toIso3 } from "./geoboundaries.js";
export type { FetchFn } from "./geoboundaries.js";

export interface GetBoundariesOptions {
  /**
   * Override for the fetch call. Defaults to the global `fetch`, which works
   * fine server-side (Node, SSR, API routes). In a browser with no backend,
   * geoBoundaries' GitHub-LFS-backed URLs will fail CORS on the redirect hop
   * (see fetchFromGeoBoundaries' doc comment) — pass a fetchImpl here that
   * routes through a same-origin proxy to work around it.
   */
  fetchImpl?: FetchFn;
}

const cache = new Map<string, Promise<BoundaryFeatureCollection>>();

/**
 * Fetch normalized, validated GeoJSON boundary data for a country.
 * Defaults to admin1 (state/province) level at simplified resolution —
 * full resolution can be 10-70x larger (see spikes/01-geoboundaries-survey)
 * and should be requested explicitly.
 */
export function getBoundaries(
  query: BoundaryQuery,
  options: GetBoundariesOptions = {}
): Promise<BoundaryFeatureCollection> {
  const level = query.level ?? "admin1";
  const resolution = query.resolution ?? "simplified";
  const iso3 = toIso3(query.country);
  const cacheKey = `${iso3}:${level}:${resolution}`;
  const fetchImpl = options.fetchImpl ?? fetch;

  if (!cache.has(cacheKey)) {
    // Prefer the mirror when this country/level/resolution is covered - it
    // works from a plain browser with no proxy, unlike a live geoBoundaries
    // fetch (see mirror.ts). Falls back to fetching geoBoundaries directly
    // for anything not yet mirrored.
    const promise = isMirrored(iso3, level, resolution)
      ? fetchFromMirror(iso3, level, resolution, fetchImpl)
      : fetchFromGeoBoundaries(iso3, level, resolution, fetchImpl);
    cache.set(cacheKey, promise);
  }
  return cache.get(cacheKey)!;
}

/** Clears the in-memory response cache. Mainly useful in tests. */
export function clearBoundaryCache(): void {
  cache.clear();
}
