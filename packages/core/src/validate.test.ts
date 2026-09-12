import { describe, expect, it } from "vitest";
import { InvalidBoundaryDataError, validateBoundaryFeatureCollection } from "./validate.js";

function validFeature(overrides: Record<string, unknown> = {}) {
  return {
    type: "Feature",
    properties: {
      shapeName: "Lagos",
      shapeISO: "",
      shapeID: "1",
      shapeGroup: "NGA",
      shapeType: "ADM1",
      ...(overrides.properties as object),
    },
    geometry: { type: "Polygon", coordinates: [[[0, 0]]] },
    ...overrides,
  };
}

describe("validateBoundaryFeatureCollection", () => {
  it("accepts a well-formed FeatureCollection", () => {
    expect(() =>
      validateBoundaryFeatureCollection({ type: "FeatureCollection", features: [validFeature()] })
    ).not.toThrow();
  });

  it("rejects non-object input", () => {
    expect(() => validateBoundaryFeatureCollection(null)).toThrow(InvalidBoundaryDataError);
    expect(() => validateBoundaryFeatureCollection("a string")).toThrow(InvalidBoundaryDataError);
  });

  it("rejects a response that isn't a GeoJSON FeatureCollection", () => {
    expect(() => validateBoundaryFeatureCollection({ type: "Feature" })).toThrow(/not a GeoJSON FeatureCollection/);
    expect(() => validateBoundaryFeatureCollection({ type: "FeatureCollection" })).toThrow(
      /not a GeoJSON FeatureCollection/
    );
  });

  it("rejects an empty FeatureCollection", () => {
    expect(() => validateBoundaryFeatureCollection({ type: "FeatureCollection", features: [] })).toThrow(
      /no features/
    );
  });

  it("rejects a feature with null or empty geometry", () => {
    const feature = validFeature({ geometry: null });
    expect(() =>
      validateBoundaryFeatureCollection({ type: "FeatureCollection", features: [feature] })
    ).toThrow(/null or empty geometry/);
  });

  it("rejects a feature missing required properties", () => {
    const feature = validFeature();
    delete (feature.properties as any).shapeGroup;
    expect(() =>
      validateBoundaryFeatureCollection({ type: "FeatureCollection", features: [feature] })
    ).toThrow(/missing expected properties: shapeGroup/);
  });
});
