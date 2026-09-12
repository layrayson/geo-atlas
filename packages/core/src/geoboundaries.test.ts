import { describe, expect, it, vi } from "vitest";
import { fetchFromGeoBoundaries, toIso3 } from "./geoboundaries.js";

describe("toIso3", () => {
  it("passes through a valid alpha-3 code, upper-cased", () => {
    expect(toIso3("nga")).toBe("NGA");
    expect(toIso3("NGA")).toBe("NGA");
  });

  it("resolves a valid alpha-2 code to alpha-3", () => {
    expect(toIso3("ng")).toBe("NGA");
    expect(toIso3("DE")).toBe("DEU");
  });

  it("throws on an unrecognized alpha-2 code", () => {
    expect(() => toIso3("XX")).toThrow(/Unknown country code/);
  });

  // Unlike alpha-2 codes, a 3-letter input is passed through as-is without
  // being checked against the known ISO3 list - an invalid one only surfaces
  // later as a 404 from the API, with a less specific error. Documenting
  // current behavior here rather than silently treating it as correct.
  it("passes a 3-letter code through unchecked, even an invalid one", () => {
    expect(toIso3("ZZZ")).toBe("ZZZ");
  });
});

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

describe("fetchFromGeoBoundaries", () => {
  const validFeatureCollection = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          shapeName: "Lagos",
          shapeISO: "",
          shapeID: "1",
          shapeGroup: "NGA",
          shapeType: "ADM1",
        },
        // Wound counter-clockwise (RFC 7946's exterior-ring convention) -
        // fetchFromGeoBoundaries must rewind it clockwise for d3-geo
        // consumers (see spike 04).
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, 1],
              [0, 0],
            ],
          ],
        },
      },
    ],
  };

  const meta = {
    boundaryName: "Nigeria",
    boundarySource: "GRID3",
    boundaryLicense: "CC BY 4.0",
    sourceDataUpdateDate: "2023-01-01",
    sourceDataURL: "https://example.com/source",
    boundarySourceURL: "https://example.com/source",
    gjDownloadURL: "https://example.com/full.geojson",
    simplifiedGeometryGeoJSON: "https://example.com/simplified.geojson",
  };

  it("fetches meta then geometry, validates, rewinds, and attaches source metadata", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(meta))
      .mockResolvedValueOnce(jsonResponse(validFeatureCollection));

    const result = await fetchFromGeoBoundaries("NGA", "admin1", "simplified", fetchImpl as any);

    expect(fetchImpl).toHaveBeenNthCalledWith(1, "https://www.geoboundaries.org/api/current/gbOpen/NGA/ADM1/");
    expect(fetchImpl).toHaveBeenNthCalledWith(2, meta.simplifiedGeometryGeoJSON);
    expect(result.type).toBe("FeatureCollection");
    expect(result.meta).toEqual({
      provider: "geoBoundaries",
      license: meta.boundaryLicense,
      sourceName: meta.boundarySource,
      sourceDataUpdateDate: meta.sourceDataUpdateDate,
      sourceUrl: meta.boundarySourceURL,
    });
    // Rewound to clockwise exterior ring (d3-geo convention) - reversed from input.
    const ring = (result.features[0].geometry as GeoJSON.Polygon).coordinates[0];
    expect(ring).toEqual([
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 0],
      [0, 0],
    ]);
  });

  it("requests the full-resolution download URL when resolution is 'full'", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(meta))
      .mockResolvedValueOnce(jsonResponse(validFeatureCollection));

    await fetchFromGeoBoundaries("NGA", "admin1", "full", fetchImpl as any);

    expect(fetchImpl).toHaveBeenNthCalledWith(2, meta.gjDownloadURL);
  });

  it("throws when the meta request fails", async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(new Response(null, { status: 404 }));

    await expect(fetchFromGeoBoundaries("VAT", "admin1", "simplified", fetchImpl as any)).rejects.toThrow(
      /failed with status 404/
    );
  });

  it("throws on malformed boundary data instead of silently returning it", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(meta))
      .mockResolvedValueOnce(jsonResponse({ type: "FeatureCollection", features: [] }));

    await expect(fetchFromGeoBoundaries("NGA", "admin1", "simplified", fetchImpl as any)).rejects.toThrow(
      /no features/
    );
  });
});
