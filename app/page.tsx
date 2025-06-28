"use client"

import { useState, useMemo } from "react"
import dynamic from "next/dynamic"
import type { GeoJSON as GeoJSONType } from "geojson"
import L from "leaflet"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, MapPin, AlertCircle, Car, Bus, Bike, Footprints } from "lucide-react"

import "leaflet/dist/leaflet.css"
import { IntersectingIsochrone } from "@/lib/IntersectingIsochrone"
import { TravelMode } from "@/types"

const MODE_COLORS: Record<TravelMode, string> = {
  drive: "#1e3a8a",
  approximated_transit: "#7e22ce",
  bicycle: "#15803d",
  walk: "#ea580c",
}

// Leaflet icon workaround for Next.js using CDN
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize:      [25, 41],
  iconAnchor:    [12, 41],
  popupAnchor:   [1, -34],
  shadowSize:    [41, 41],
})

export default function IsochroneMapPage() {
  const [locations, setLocations] = useState<string[]>([
    "Stephansplatz 1, 1010 Wien",
    "Westbahnhof, 1150 Wien",
    "",
  ])
  const [travelTime, setTravelTime] = useState<number>(15)
  const [travelModes, setTravelModes] = useState<TravelMode[]>(["approximated_transit"])
  const [intersection, setIntersection] = useState<{mode: TravelMode; geoJson: GeoJSONType; color: string}[]>([])
  const [markers, setMarkers] = useState<{ position: [number, number]; popup: string }[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [mapKey, setMapKey] = useState<number>(Date.now())

  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/map-display"), {
        loading: () => (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ),
        ssr: false,
      }),
    []
  )

  const handleLocationChange = (index: number, value: string) => {
    const newLocations = [...locations]
    newLocations[index] = value
    setLocations(newLocations)
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
      const results = await Promise.all(
        travelModes.map(async (mode) => {
          const intersectingIsochrone = new IntersectingIsochrone(locations, mode, travelTime * 60)
          const intersectingPolygon = await intersectingIsochrone.getIntersections()
          return { mode, geoJson: intersectingPolygon.geometry as GeoJSONType, color: MODE_COLORS[mode] }
        })
      )

      setIntersection(results)
      setMapKey(Date.now())
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full flex-col lg:flex-row bg-background">
      <Card className="w-full lg:w-[380px] lg:h-full lg:border-r lg:rounded-none flex flex-col">
        <CardHeader>
          <CardTitle className="text-xl">Vienna Reachable Area</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col gap-4 overflow-y-auto">
          <div className="space-y-4">
            {locations.map((loc, idx) => (
              <div key={idx} className="space-y-1.5">
                <Label htmlFor={`location-${idx}`}>Location {idx + 1}</Label>
                <Input
                  id={`location-${idx}`}
                  placeholder="e.g., Praterstern, 1020 Wien"
                  value={loc}
                  onChange={(e) => handleLocationChange(idx, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="travel-time">Travel Time</Label>
              <Select value={travelTime.toString()} onValueChange={(val)=>setTravelTime(parseInt(val))} defaultValue="15">
                <SelectTrigger id="travel-time">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Travel Mode</Label>
              <ToggleGroup
                type="multiple"
                value={travelModes}
                onValueChange={(modes) => setTravelModes(modes as TravelMode[])}
                className="flex items-center space-x-2 pt-2"
              >
                <ToggleGroupItem
                  value="drive"
                  style={{
                    backgroundColor: travelModes.includes("drive") ? MODE_COLORS.drive : undefined,
                    color: travelModes.includes("drive") ? "white" : undefined,
                  }}
                >
                  <Car className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="approximated_transit"
                  style={{
                    backgroundColor: travelModes.includes("approximated_transit") ? MODE_COLORS.approximated_transit : undefined,
                    color: travelModes.includes("approximated_transit") ? "white" : undefined,
                  }}
                >
                  <Bus className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="bicycle"
                  style={{
                    backgroundColor: travelModes.includes("bicycle") ? MODE_COLORS.bicycle : undefined,
                    color: travelModes.includes("bicycle") ? "white" : undefined,
                  }}
                >
                  <Bike className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="walk"
                  style={{
                    backgroundColor: travelModes.includes("walk") ? MODE_COLORS.walk : undefined,
                    color: travelModes.includes("walk") ? "white" : undefined,
                  }}
                >
                  <Footprints className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="w-full mt-2">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
            Show Reachable Area
          </Button>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="flex-grow h-1/2 lg:h-full w-full">
        <Map key={mapKey} displayData={intersection} markers={markers} travelTime={travelTime} />
      </div>
    </div>
  )
}
