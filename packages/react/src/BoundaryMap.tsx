import type { BoundaryFeatureCollection } from "@geo-atlas/core";
import { geoMercator, type GeoProjection } from "d3-geo";
import { useMemo } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

export interface RegionValue {
  /** Matched against feature.properties.shapeISO first, then shapeName */
  id: string;
  value: number;
}

export interface RegionClickInfo {
  shapeName: string;
  shapeISO: string;
  value: number | undefined;
}

export interface BoundaryMapProps {
  boundaries: BoundaryFeatureCollection;
  data: RegionValue[];
  colorScale: (value: number | undefined) => string;
  strokeColor?: string;
  /**
   * Optional pre-built d3 projection (e.g. geoMercator().rotate(...)). When
   * omitted, the map auto-fits a Mercator projection to `boundaries` — this
   * is deliberate: geoBoundaries' raw coordinate ranges vary per country and
   * per source, so a hardcoded scale/center tuned for one country's data
   * will misrender for another (confirmed while building the demo — see
   * apps/demo, the very bug this auto-fit exists to avoid).
   */
  projection?: GeoProjection;
  width?: number;
  height?: number;
  onRegionClick?: (region: RegionClickInfo) => void;
}

function findValue(data: RegionValue[], shapeISO: string, shapeName: string): number | undefined {
  const match = data.find((d) => d.id === shapeISO || d.id === shapeName);
  return match?.value;
}

export function BoundaryMap({
  boundaries,
  data,
  colorScale,
  strokeColor = "#FFFFFF",
  projection,
  width = 800,
  height = 600,
  onRegionClick,
}: BoundaryMapProps) {
  const fittedProjection = useMemo(
    () => projection ?? geoMercator().fitSize([width, height], boundaries),
    [projection, boundaries, width, height]
  );

  return (
    // @types/react-simple-maps mistypes `projection` as a (width, height, config) =>
    // GeoProjection factory. At runtime it just checks typeof projection === "function"
    // and uses it directly as the projection (see react-simple-maps/dist/index.js) — a
    // d3 GeoProjection is itself callable, so a ready-made one works fine here.
    <ComposableMap projection={fittedProjection as unknown as string} width={width} height={height}>
      <Geographies geography={boundaries}>
        {({ geographies }) =>
          geographies.map((geo) => {
            const shapeISO = geo.properties.shapeISO as string;
            const shapeName = geo.properties.shapeName as string;
            const value = findValue(data, shapeISO, shapeName);

            return (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill={colorScale(value)}
                stroke={strokeColor}
                strokeWidth={0.5}
                onClick={() => onRegionClick?.({ shapeName, shapeISO, value })}
                style={{
                  default: { outline: "none" },
                  hover: { outline: "none", cursor: onRegionClick ? "pointer" : "default" },
                  pressed: { outline: "none" },
                }}
              >
                <title>{`${shapeName}${value !== undefined ? `: ${value}` : ""}`}</title>
              </Geography>
            );
          })
        }
      </Geographies>
    </ComposableMap>
  );
}
