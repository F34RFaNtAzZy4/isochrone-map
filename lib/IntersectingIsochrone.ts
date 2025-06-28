import { ResponseFeature, ResponseProperties, TravelMode } from "@/types";
import { IsochroneAPI } from "./IsochroneAPI";
import intersect from "@turf/intersect";
import { featureCollection } from "@turf/turf";

export class IntersectingIsochrone {
  constructor(
    private adresses: string[],
    private travelMode: TravelMode,
    private travelTimeInSeconds: number
  ) {
    this.adresses = adresses
      .map((loc) => loc.trim())
      .filter((loc) => loc.length > 0);
  }

  public async getIntersections() {
    const isochrones = await this.fetchIsochrones();  
    let current: ResponseFeature = isochrones[0].features[0];

    for (let i = 1; i < isochrones.length; i++) {
      const next = isochrones[i].features[0];
      const intersection = this.getIntersection(current, next);
      if (!intersection) {
        return null;
      }
      current = intersection;
    }
    return current;
  }

  private getIntersection(
    poly1Features: ResponseFeature,
    poly2Features: ResponseFeature
  ) {
    return intersect<ResponseProperties>(featureCollection([poly1Features,poly2Features]));
  }

  private fetchIsochrones = async () => {
    return await Promise.all(
      this.adresses.map(async (address) => {
        const isochroneAPI = new IsochroneAPI(
          address,
          this.travelMode,
          this.travelTimeInSeconds
        );
        return await isochroneAPI.getIsochrone();
      })
    );
  };


}
