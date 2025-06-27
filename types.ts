export type TravelMode = "drive" | "approximated_transit" | "bicycle" | "walk";
import {
  FeatureCollection,
  Feature,
  MultiPolygon,
  Polygon,
} from 'geojson';

export interface ResponseProperties {
  lat: number;
  lon: number;
  mode: TravelMode;        
  type: 'time';        
  range: number;
  id: string;
}

export type ResponseFeature = Feature<MultiPolygon | Polygon, ResponseProperties>;

export type ResponseGeoJson = FeatureCollection<MultiPolygon | Polygon, ResponseProperties>;
