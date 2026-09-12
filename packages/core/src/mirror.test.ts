import { describe, expect, it, vi } from "vitest";
import { fetchFromMirror, isMirrored } from "./mirror.js";

describe("isMirrored", () => {
  it("is true for a country/level/resolution combo covered by the mirror", () => {
    expect(isMirrored("NGA", "admin1", "simplified")).toBe(true);
  });

  it("is false for a country not covered by the mirror", () => {
    expect(isMirrored("VAT", "admin1", "simplified")).toBe(false);
  });

  it("is false for a covered country at an uncovered resolution", () => {
    expect(isMirrored("NGA", "admin1", "full")).toBe(false);
  });
});

describe("fetchFromMirror", () => {
  const validFeatureCollection = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { shapeName: "Lagos", shapeISO: "", shapeID: "1", shapeGroup: "NGA", shapeType: "ADM1" },
        geometry: { type: "Polygon", coordinates: [[[0, 0]]] },
      },
    ],
  };

  it("fetches the expected jsDelivr URL and returns the parsed, validated data", async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify(validFeatureCollection)));

    const result = await fetchFromMirror("NGA", "admin1", "simplified", fetchImpl as any);

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://cdn.jsdelivr.net/gh/layrayson/geo-atlas-data@main/data/NGA/admin1-simplified.geojson"
    );
    expect(result).toEqual(validFeatureCollection);
  });

  it("throws a descriptive error on a non-ok response", async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(new Response(null, { status: 404 }));

    await expect(fetchFromMirror("XYZ", "admin1", "simplified", fetchImpl as any)).rejects.toThrow(
      /Mirror request .* failed with status 404/
    );
  });

  it("throws if the mirrored file itself fails validation", async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ type: "FeatureCollection", features: [] })));

    await expect(fetchFromMirror("NGA", "admin1", "simplified", fetchImpl as any)).rejects.toThrow(/no features/);
  });
});
