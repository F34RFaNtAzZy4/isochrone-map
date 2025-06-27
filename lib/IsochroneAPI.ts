import { ResponseGeoJson, TravelMode } from "@/types";
import { Polygon, MultiPolygon, GeoJsonObject, FeatureCollection } from "geojson";

export class IsochroneAPI {
  constructor(
    private address: string,
    private travelMode: TravelMode,
    private travelTimeInSeconds: number
  ) {
    this.address = address.trim();
  }

  private getGeocode = async () => {
    const res = await fetch("/api/geocode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address: this.address,
        mode: this.travelMode,
        range: this.travelTimeInSeconds,
      }),
    });
    const data = await res.json();
    if (!res.ok)
      throw new Error(data.message || `Geocoding failed for "${this.address}"`);
    const [lon, lat] = data.features[0].geometry.coordinates;
    return {
      coords: [lat, lon] as [number, number],
      name: data.features[0].properties.formatted as string,
    };
  };

  public async getIsochrone():Promise<ResponseGeoJson> {
    const geocode = await this.getGeocode();
    const body = {
      lat: geocode.coords[0],
      lon: geocode.coords[1],
      mode: this.travelMode,
      range: this.travelTimeInSeconds,
      type: "time"
    };

    const res = await fetch("/api/isochrone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to fetch isochrone");
    }

    return await res.json() as ResponseGeoJson;
  }
}
