"use client"

import { useState, useMemo, useEffect } from "react"
import dynamic from "next/dynamic"
import type { GeoJSON as GeoJSONType } from "geojson"
import L from "leaflet"

import { Button } from "@/components/ui/button"
import LocationInput from "@/components/location-input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, MapPin, AlertCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import "leaflet/dist/leaflet.css"
import { IntersectingIsochrone } from "@/lib/IntersectingIsochrone"
import { TravelMode } from "@/types"

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
  const [locations, setLocations] = useState<string[]>([""])
  const [travelTime, setTravelTime] = useState<number>(15)
  const [travelMode, setTravelMode] = useState<TravelMode>("approximated_transit")
  const [intersection, setIntersection] = useState<GeoJSONType | null>(null)
  const [markers, setMarkers] = useState<{ position: [number, number]; popup: string }[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [mapKey, setMapKey] = useState<number>(Date.now())
  const [selecting, setSelecting] = useState<number | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()

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

  const handleMapSelect = (coords: [number, number]) => {
    if (selecting !== null) {
      const newLocs = [...locations]
      newLocs[selecting] = `${coords[0].toFixed(5)},${coords[1].toFixed(5)}`
      setLocations(newLocs)
      setSelecting(null)
    }
  }

  // initialize from query params
  useEffect(() => {
    const locParam = searchParams.get("loc")
    if (locParam) {
      setLocations(locParam.split(";").map((l) => decodeURIComponent(l)))
    }
    const t = searchParams.get("time")
    if (t) setTravelTime(parseInt(t))
    const mode = searchParams.get("mode")
    if (mode) setTravelMode(mode as TravelMode)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams()
    if (locations.length) {
      params.set(
        "loc",
        locations.map((l) => encodeURIComponent(l)).join(";")
      )
    }
    params.set("time", travelTime.toString())
    params.set("mode", travelMode)
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [locations, travelTime, travelMode])

  const handleLocationChange = (index: number, value: string) => {
    const newLocations = [...locations]
    newLocations[index] = value
    setLocations(newLocations)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setIntersection(null)
    setMarkers([])

    const validLocations = locations.filter((loc) => loc.trim() !== "")
    if (validLocations.length === 0) {
      setError("Please enter at least one location.")
      setLoading(false)
      return
    }

      //setMarkers(geocoded.map((g) => ({ position: g.coords, popup: g.name })))
    try {
        const intersectingIsochrone = new IntersectingIsochrone(
          locations,
          travelMode,
          travelTime * 60,
        )
        const result = await intersectingIsochrone.getIntersections()
        setIntersection(result.polygon.geometry)
        setMarkers(result.markers)
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
              <LocationInput
                id={`location-${idx}`}
                value={loc}
                onChange={(val) => handleLocationChange(idx, val)}
              />
              <Button size="sm" variant="outline" onClick={() => setSelecting(idx)}>
                Select on map
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={() => setLocations([...locations, ""]) } className="w-full">
            Add Location
          </Button>
          {selecting !== null && (
            <p className="text-sm text-muted-foreground">Click on the map to set location {selecting + 1}</p>
          )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="travel-time">Travel Time: {travelTime} min</Label>
              <Slider
                id="travel-time"
                min={1}
                max={60}
                step={1}
                value={[travelTime]}
                onValueChange={(val) => setTravelTime(val[0])}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Travel Mode</Label>
              <RadioGroup
                value={travelMode}
                onValueChange={(mode:TravelMode)=>setTravelMode(mode)}
                className="flex items-center space-x-4 pt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="approximated_transit" id="transit" />
                  <Label htmlFor="transit">Public</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="walk" id="walk" />
                  <Label htmlFor="walk">Walk</Label>
                </div>
              </RadioGroup>
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
        <Map
          key={mapKey}
          displayData={intersection}
          markers={markers}
          travelTime={travelTime}
          onSelectLocation={handleMapSelect}
        />
      </div>
    </div>
  )
}
