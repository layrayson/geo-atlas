import { clearBoundaryCache, type BoundaryFeatureCollection } from "@geo-atlas/core";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useBoundaries } from "./useBoundaries.js";

const boundaries: BoundaryFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { shapeName: "Lagos", shapeISO: "NG-LA", shapeID: "1", shapeGroup: "NGA", shapeType: "ADM1" },
      geometry: { type: "Polygon", coordinates: [[[0, 0]]] },
    },
  ],
  meta: {
    provider: "geoBoundaries",
    license: "test",
    sourceName: "test",
    sourceDataUpdateDate: "test",
    sourceUrl: "test",
  },
};

afterEach(() => {
  clearBoundaryCache();
});

describe("useBoundaries", () => {
  it("starts loading, then resolves with the fetched boundaries", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify(boundaries)));
    const { result } = renderHook(() => useBoundaries({ country: "NGA" }, { fetchImpl: fetchImpl as any }));

    expect(result.current.loading).toBe(true);
    expect(result.current.boundaries).toBeUndefined();
    expect(result.current.error).toBeUndefined();

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.boundaries).toEqual(boundaries);
    expect(result.current.error).toBeUndefined();
  });

  it("surfaces a fetch failure as `error`, not a thrown exception", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status: 404 }));
    const { result } = renderHook(() => useBoundaries({ country: "VAT" }, { fetchImpl: fetchImpl as any }));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toMatch(/failed with status 404/);
    expect(result.current.boundaries).toBeUndefined();
  });

  it("refetches when the query changes", async () => {
    const fetchImpl = vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify(boundaries))));
    const { result, rerender } = renderHook(
      ({ country }: { country: string }) => useBoundaries({ country }, { fetchImpl: fetchImpl as any }),
      { initialProps: { country: "NGA" } }
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetchImpl).toHaveBeenCalledTimes(1);

    rerender({ country: "KEN" });

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("ignores a stale response after unmount instead of updating state on an unmounted component", async () => {
    let resolveFetch!: (res: Response) => void;
    const fetchImpl = vi.fn().mockReturnValue(new Promise<Response>((resolve) => (resolveFetch = resolve)));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result, unmount } = renderHook(() => useBoundaries({ country: "NGA" }, { fetchImpl: fetchImpl as any }));
    unmount();

    await act(async () => {
      resolveFetch(new Response(JSON.stringify(boundaries)));
      await Promise.resolve();
    });

    // No React "update on unmounted component" warning, and no crash - the
    // hook's `cancelled` guard did its job.
    expect(errorSpy).not.toHaveBeenCalled();
    expect(result.current.boundaries).toBeUndefined();
    errorSpy.mockRestore();
  });
});
