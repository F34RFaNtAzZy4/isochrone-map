import { ResponseGeoJson, TravelMode } from "@/types";

export class IsochroneAPI {
  constructor(
    private location: string | [number, number],
    private travelMode: TravelMode,
    private travelTimeInSeconds: number,
  ) {}

  private getGeocode = async () => {
    const res = await fetch("/api/geocode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: this.location as string }),
    });
    const data = await res.json();
    if (!res.ok)
      throw new Error(
        data.message || `Geocoding failed for "${this.location as string}"`,
      );
    const [lon, lat] = data.features[0].geometry.coordinates;
    return {
      coords: [lat, lon] as [number, number],
      name: data.features[0].properties.formatted as string,
    };
  };

  private async resolveLocation() {
    if (Array.isArray(this.location)) {
      return {
        coords: this.location as [number, number],
        name: `${this.location[0]},${this.location[1]}`,
      };
    }
    return await this.getGeocode();
  }

  public async getIsochrone(): Promise<{
    geojson: ResponseGeoJson;
    coords: [number, number];
    name: string;
  }> {
    const geocode = await this.resolveLocation();
    const body = {
      lat: geocode.coords[0],
      lon: geocode.coords[1],
      mode: this.travelMode,
      range: this.travelTimeInSeconds,
      type: "time",
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

    const geojson = (await res.json()) as ResponseGeoJson;
    return { geojson, coords: geocode.coords, name: geocode.name };
  }
}
