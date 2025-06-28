"use client"
import { useEffect } from "react"

export function useConfigureLeaflet() {
  useEffect(() => {
    async function configure() {
      const L = await import("leaflet")
      // @ts-ignore
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })
    }
    if (typeof window !== "undefined") {
      configure()
    }
  }, [])
}
