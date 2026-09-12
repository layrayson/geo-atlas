import type { BoundaryFeatureCollection } from "@geo-atlas/core";
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
  projectionConfig?: { scale?: number; center?: [number, number] };
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
  projectionConfig = { scale: 800, center: [0, 0] },
  width = 800,
  height = 600,
  onRegionClick,
}: BoundaryMapProps) {
  return (
    <ComposableMap projection="geoMercator" projectionConfig={projectionConfig} width={width} height={height}>
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
