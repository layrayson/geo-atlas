import { afterEach, describe, expect, it, vi } from "vitest";
import { clearBoundaryCache, getBoundaries } from "./index.js";

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

const geoBoundariesMeta = {
  boundaryName: "test",
  boundarySource: "test",
  boundaryLicense: "test",
  sourceDataUpdateDate: "test",
  sourceDataURL: "test",
  boundarySourceURL: "test",
  gjDownloadURL: "https://example.com/full.geojson",
  simplifiedGeometryGeoJSON: "https://example.com/simplified.geojson",
};

afterEach(() => {
  clearBoundaryCache();
  vi.restoreAllMocks();
});

describe("getBoundaries", () => {
  it("routes a mirrored country straight to the jsDelivr CDN, not geoBoundaries", async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify(validFeatureCollection)));

    await getBoundaries({ country: "NGA" }, { fetchImpl: fetchImpl as any });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl).toHaveBeenCalledWith(expect.stringContaining("cdn.jsdelivr.net"));
  });

  it("routes a non-mirrored country to a live geoBoundaries fetch", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(geoBoundariesMeta)))
      .mockResolvedValueOnce(new Response(JSON.stringify(validFeatureCollection)));

    await getBoundaries({ country: "VAT" }, { fetchImpl: fetchImpl as any });

    expect(fetchImpl).toHaveBeenNthCalledWith(1, expect.stringContaining("geoboundaries.org"));
  });

  it("preferLive bypasses the mirror even for a covered country", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(geoBoundariesMeta)))
      .mockResolvedValueOnce(new Response(JSON.stringify(validFeatureCollection)));

    await getBoundaries({ country: "NGA" }, { fetchImpl: fetchImpl as any, preferLive: true });

    expect(fetchImpl).toHaveBeenNthCalledWith(1, expect.stringContaining("geoboundaries.org"));
  });

  it("caches identical queries so a repeat call doesn't refetch", async () => {
    const fetchImpl = vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify(validFeatureCollection))));

    await getBoundaries({ country: "NGA" }, { fetchImpl: fetchImpl as any });
    await getBoundaries({ country: "NGA" }, { fetchImpl: fetchImpl as any });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("treats mirror and preferLive requests for the same country as separate cache entries", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(validFeatureCollection)))
      .mockResolvedValueOnce(new Response(JSON.stringify(geoBoundariesMeta)))
      .mockResolvedValueOnce(new Response(JSON.stringify(validFeatureCollection)));

    await getBoundaries({ country: "NGA" }, { fetchImpl: fetchImpl as any });
    await getBoundaries({ country: "NGA" }, { fetchImpl: fetchImpl as any, preferLive: true });

    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it("clearBoundaryCache forces a fresh fetch on the next call", async () => {
    const fetchImpl = vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify(validFeatureCollection))));

    await getBoundaries({ country: "NGA" }, { fetchImpl: fetchImpl as any });
    clearBoundaryCache();
    await getBoundaries({ country: "NGA" }, { fetchImpl: fetchImpl as any });

    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});
