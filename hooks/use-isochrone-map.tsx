"use client"

import { useState, useEffect, useMemo } from "react"
import dynamic from "next/dynamic"
import type { GeoJSON as GeoJSONType } from "geojson"
import { useRouter, useSearchParams } from "next/navigation"
import { IntersectingIsochrone } from "@/lib/IntersectingIsochrone"
import { TravelMode } from "@/types"

const MODE_COLORS: Record<TravelMode, string> = {
  drive: "#1e3a8a",
  approximated_transit: "#7e22ce",
  bicycle: "#15803d",
  walk: "#ea580c",
}

export function useIsochroneMap() {
  const [locations, setLocations] = useState<string[]>([""])
  const [travelTime, setTravelTime] = useState<number>(15)
  const [travelModes, setTravelModes] = useState<TravelMode[]>(["approximated_transit"])
  const [intersection, setIntersection] = useState<{
    mode: TravelMode
    geoJson: GeoJSONType
    color: string
  }[]>([])
  const [markers, setMarkers] = useState<{ position: [number, number]; popup: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mapKey, setMapKey] = useState<number>(Date.now())
  const [selecting, setSelecting] = useState<number | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()

  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/map-display"), {
        ssr: false,
      }),
    []
  )

  useEffect(() => {
    const locParam = searchParams.get("loc")
    if (locParam) {
      setLocations(locParam.split(";").map((l) => decodeURIComponent(l)))
    }
    const t = searchParams.get("time")
    if (t) setTravelTime(parseInt(t))
    const modes = searchParams.getAll("mode")
    if (modes) setTravelModes(modes as TravelMode[])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const params = new URLSearchParams()
    if (locations.length) {
      params.set("loc", locations.map((l) => encodeURIComponent(l)).join(";"))
    }
    params.set("time", travelTime.toString())
    params.set("mode", travelModes.join(";"))
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [locations, travelTime, travelModes, router])

  const parseCoords = (loc: string): [number, number] | null => {
    const parts = loc.split(",")
    if (parts.length === 2) {
      const lat = parseFloat(parts[0])
      const lon = parseFloat(parts[1])
      if (!isNaN(lat) && !isNaN(lon)) {
        return [lat, lon]
      }
    }
    return null
  }

  useEffect(() => {
    const newMarkers = locations
      .map((loc, idx) => {
        const coords = parseCoords(loc)
        return coords ? { position: coords, popup: `Location ${idx + 1}` } : null
      })
      .filter((m): m is { position: [number, number]; popup: string } => m !== null)
    setMarkers(newMarkers)
  }, [locations])

  const handleLocationChange = (index: number, value: string) => {
    const newLocations = [...locations]
    newLocations[index] = value
    setLocations(newLocations)
  }

  const handleMapSelect = (coords: [number, number]) => {
    if (selecting !== null) {
      const newLocs = [...locations]
      newLocs[selecting] = `${coords[0].toFixed(5)},${coords[1].toFixed(5)}`
      setLocations(newLocs)
      setSelecting(null)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setIntersection([])
    setMarkers([])

    const validLocations = locations.filter((loc) => loc.trim() !== "")
    if (validLocations.length === 0) {
      setError("Please enter at least one location.")
      setLoading(false)
      return
    }

    try {
      const results = (
        await Promise.all(
          travelModes.map(async (mode) => {
            const intersectingIsochrone = new IntersectingIsochrone(
              locations,
              mode,
              travelTime * 60
            )
            const intersectingPolygon = await intersectingIsochrone.getIntersections()
            if (!intersectingPolygon) return
            return {
              mode,
              geoJson: intersectingPolygon.polygon.geometry as GeoJSONType,
              color: MODE_COLORS[mode],
              markers: intersectingPolygon.markers,
            }
          })
        )
      ).filter((res) => res !== undefined)

      if (results.length === 0)
        throw new Error(
          "No reachable area found for the selected locations and travel modes."
        )

      setIntersection(results as any)
      if (results[0]) {
        setMarkers((results[0] as any).markers)
      }
      setMapKey(Date.now())
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return {
    locations,
    setLocations,
    travelTime,
    setTravelTime,
    travelModes,
    setTravelModes,
    intersection,
    markers,
    loading,
    error,
    mapKey,
    selecting,
    setSelecting,
    handleLocationChange,
    handleMapSelect,
    handleSubmit,
    Map,
    MODE_COLORS,
  }
}
