export type BoundaryLevel = "country" | "admin1";
export type Resolution = "simplified" | "full";

export interface BoundaryQuery {
  /** ISO 3166-1 alpha-2 or alpha-3 country code, e.g. "NG" or "NGA" */
  country: string;
  level?: BoundaryLevel;
  resolution?: Resolution;
}

export interface BoundarySource {
  provider: "geoBoundaries";
  license: string;
  sourceName: string;
  sourceDataUpdateDate: string;
  sourceUrl: string;
}

export interface BoundaryFeatureProperties {
  shapeName: string;
  shapeISO: string;
  shapeID: string;
  shapeGroup: string;
  shapeType: string;
}

export interface BoundaryFeatureCollection {
  type: "FeatureCollection";
  features: GeoJSON.Feature<GeoJSON.Geometry, BoundaryFeatureProperties>[];
  meta: BoundarySource;
}
