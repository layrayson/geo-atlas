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
 *
 * The DJB2 accumulation alone clusters badly when every id in a country
 * shares a prefix (every Nigerian shapeISO starts "NG-", every Kenyan one
 * "KE-", etc.) - checked against real data, Nigeria's 37 states all landed
 * in a 34-42 band (zero would ever render green) and Kenya's 47 counties
 * landed 100% in the middle band. A Murmur3-style finalizer (xor-shift /
 * multiply passes) after the accumulation fixes this by decorrelating
 * outputs that started from near-identical inputs, at the cost of no longer
 * being a "named" textbook hash - verified against several countries to
 * spread across low/mid/high instead of collapsing onto one band.
 */
function hashToUnitInterval(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  hash = hash >>> 0;
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x85ebca6b);
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 0xc2b2ae35);
  hash ^= hash >>> 16;
  return (hash >>> 0) / 4294967296;
}

export function mockScanRatesFor(boundaries: BoundaryFeatureCollection): RegionValue[] {
  return boundaries.features.map((f) => {
    const id = f.properties.shapeISO || f.properties.shapeName;
    return { id, value: Math.round(hashToUnitInterval(id) * 100) };
  });
}
