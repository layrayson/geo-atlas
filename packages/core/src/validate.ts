import type { BoundaryFeatureCollection } from "./types.js";

export class InvalidBoundaryDataError extends Error {}

const REQUIRED_PROPERTY_KEYS = ["shapeName", "shapeISO", "shapeID", "shapeGroup", "shapeType"] as const;

/**
 * Validates the shape geoBoundaries is expected to return. Confirmed consistent
 * across a 10-country sample in spike 01 — see spikes/01-geoboundaries-survey.
 */
export function validateBoundaryFeatureCollection(data: unknown): asserts data is BoundaryFeatureCollection {
  if (typeof data !== "object" || data === null) {
    throw new InvalidBoundaryDataError("Response is not an object");
  }
  const fc = data as any;
  if (fc.type !== "FeatureCollection" || !Array.isArray(fc.features)) {
    throw new InvalidBoundaryDataError("Response is not a GeoJSON FeatureCollection");
  }
  if (fc.features.length === 0) {
    throw new InvalidBoundaryDataError("FeatureCollection has no features");
  }
  for (const feature of fc.features) {
    if (!feature.geometry || !feature.geometry.coordinates || feature.geometry.coordinates.length === 0) {
      throw new InvalidBoundaryDataError(`Feature "${feature.properties?.shapeName ?? "unknown"}" has null or empty geometry`);
    }
    const missing = REQUIRED_PROPERTY_KEYS.filter((key) => !(key in (feature.properties ?? {})));
    if (missing.length > 0) {
      throw new InvalidBoundaryDataError(`Feature is missing expected properties: ${missing.join(", ")}`);
    }
  }
}
