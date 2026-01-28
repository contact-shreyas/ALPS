export type RegionLevel = "state" | "district";

export type RegionShape = {
  code: string;
  name: string;
  geomGeoJSON: GeoJSON.Feature | GeoJSON.FeatureCollection | any;
};

export type RegionMetric = {
  code: string;
  year: number;
  radiance: number;
  hotspots: number;
};
