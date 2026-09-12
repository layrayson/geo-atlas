import type { BoundaryFeatureCollection } from "@geo-atlas/core";
import type { RegionValue } from "@geo-atlas/react";

/**
 * Deterministic per-region mock scan rate, derived from a hash of the
 * region's own shapeISO (falling back to shapeName if that's ever missing) -
 * not a hardcoded per-country lookup table. This is what makes the demo work
 * identically for any of the ~195 countries in the selector, not just a
 * handful that were hand-curated: whatever regions actually load get a
 * value, same formula every time (stable across reloads, not re-randomized
 * per render).
 */
function hashToUnitInterval(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return ((hash >>> 0) % 10000) / 10000;
}

export function mockScanRatesFor(boundaries: BoundaryFeatureCollection): RegionValue[] {
  return boundaries.features.map((f) => {
    const id = f.properties.shapeISO || f.properties.shapeName;
    return { id, value: Math.round(hashToUnitInterval(id) * 100) };
  });
}
