import type { BoundaryFeatureCollection } from "@geo-atlas/core";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BoundaryMap } from "./BoundaryMap.js";

function feature(shapeISO: string, shapeName: string, coords: [number, number][]) {
  return {
    type: "Feature" as const,
    properties: { shapeName, shapeISO, shapeID: shapeISO, shapeGroup: "NGA", shapeType: "ADM1" },
    geometry: { type: "Polygon" as const, coordinates: [coords] },
  };
}

const boundaries: BoundaryFeatureCollection = {
  type: "FeatureCollection",
  features: [
    feature("NG-LA", "Lagos", [
      [3, 6],
      [4, 6],
      [4, 7],
      [3, 7],
      [3, 6],
    ]),
    feature("NG-AB", "Abia", [
      [7, 5],
      [8, 5],
      [8, 6],
      [7, 6],
      [7, 5],
    ]),
  ],
  meta: {
    provider: "geoBoundaries",
    license: "test",
    sourceName: "test",
    sourceDataUpdateDate: "test",
    sourceUrl: "test",
  },
};

describe("BoundaryMap", () => {
  it("renders one region per feature, matching data by shapeISO and falling back to shapeName", async () => {
    const colorScale = (value: number | undefined) => (value === undefined ? "#CCCCCC" : "#FF0000");
    const { container } = render(
      <BoundaryMap
        boundaries={boundaries}
        data={[
          { id: "NG-LA", value: 10 }, // matches Lagos by shapeISO
          { id: "Abia", value: 5 }, // matches Abia by shapeName fallback
        ]}
        colorScale={colorScale}
      />
    );

    const paths = await waitFor(() => {
      const found = container.querySelectorAll("path.rsm-geography");
      expect(found.length).toBe(2);
      return found;
    });

    Array.from(paths).forEach((path) => {
      expect(path.getAttribute("fill")).toBe("#FF0000");
    });
  });

  it("passes undefined to colorScale for a region with no matching data", async () => {
    const colorScale = vi.fn().mockReturnValue("#EEEEEE");
    const { container } = render(<BoundaryMap boundaries={boundaries} data={[]} colorScale={colorScale} />);

    await waitFor(() => {
      expect(container.querySelectorAll("path.rsm-geography").length).toBe(2);
    });

    expect(colorScale).toHaveBeenCalledWith(undefined);
    expect(colorScale).not.toHaveBeenCalledWith(10);
  });

  it("calls onRegionClick with the clicked region's name, ISO, and matched value", async () => {
    const onRegionClick = vi.fn();
    const { container } = render(
      <BoundaryMap
        boundaries={boundaries}
        data={[{ id: "NG-LA", value: 10 }]}
        colorScale={() => "#FF0000"}
        onRegionClick={onRegionClick}
      />
    );

    const paths = await waitFor(() => {
      const found = container.querySelectorAll("path.rsm-geography");
      expect(found.length).toBe(2);
      return found;
    });

    fireEvent.click(paths[0]);

    expect(onRegionClick).toHaveBeenCalledTimes(1);
    expect(onRegionClick).toHaveBeenCalledWith({ shapeName: "Lagos", shapeISO: "NG-LA", value: 10 });
  });

  it("renders without a click handler and does not throw when a region is clicked", async () => {
    const { container } = render(<BoundaryMap boundaries={boundaries} data={[]} colorScale={() => "#CCCCCC"} />);

    const paths = await waitFor(() => {
      const found = container.querySelectorAll("path.rsm-geography");
      expect(found.length).toBe(2);
      return found;
    });

    expect(() => fireEvent.click(paths[0])).not.toThrow();
  });
});
