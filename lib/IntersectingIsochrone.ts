import { ResponseFeature, ResponseProperties, TravelMode } from "@/types";
import { IsochroneAPI } from "./IsochroneAPI";
import intersect from "@turf/intersect";
import { featureCollection } from "@turf/turf";

export class IntersectingIsochrone {
  constructor(
    private adresses: string[],
    private travelMode: TravelMode,
    private travelTimeInSeconds: number,
  ) {
    this.adresses = adresses
      .map((loc) => loc.trim())
      .filter((loc) => loc.length > 0);
  }

  public async getIntersections() {
    const fetched = await this.fetchIsochrones();
    const isochrones = fetched.map((f) => f.geojson);
    const markers = fetched.map((f) => ({ position: f.coords, popup: f.name }));
    let current: ResponseFeature = isochrones[0].features[0];

    for (let i = 1; i < isochrones.length; i++) {
      const next = isochrones[i].features[0];
      const intersection = this.getIntersection(current, next);
      if (!intersection) {
        throw new Error("No intersection found between isochrones.");
      }
      current = intersection;
    }
    return { polygon: current, markers };
  }

  private getIntersection(
    poly1Features: ResponseFeature,
    poly2Features: ResponseFeature
  ) {
    return intersect<ResponseProperties>(featureCollection([poly1Features,poly2Features]));
  }

  private parseLocation(loc: string): string | [number, number] {
    const parts = loc.split(',');
    if (
      parts.length === 2 &&
      !isNaN(parseFloat(parts[0])) &&
      !isNaN(parseFloat(parts[1]))
    ) {
      return [parseFloat(parts[0]), parseFloat(parts[1])] as [number, number];
    }
    return loc;
  }

  private fetchIsochrones = async () => {
    return await Promise.all(
      this.adresses.map(async (address) => {
        const loc = this.parseLocation(address);
        const isochroneAPI = new IsochroneAPI(
          loc,
          this.travelMode,
          this.travelTimeInSeconds,
        );
        return await isochroneAPI.getIsochrone();
      }),
    );
  };


}
