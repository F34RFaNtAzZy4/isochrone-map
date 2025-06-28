"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, MapPin, AlertCircle } from "lucide-react"
import TravelModeSelector from "@/components/molecules/travel-mode-selector"
import LocationList from "@/components/molecules/location-list"
import { TravelMode } from "@/types"

interface Props {
  travelModes: TravelMode[]
  travelTime: number
  locations: string[]
  selecting: number | null
  loading: boolean
  error: string | null
  colors: Record<TravelMode, string>
  onChangeModes: (modes: TravelMode[]) => void
  onChangeTime: (val: number) => void
  onChangeLocation: (idx: number, val: string) => void
  onAddLocation: () => void
  onSelectOnMap: (idx: number) => void
  onDeleteLocation: (idx: number) => void
  onSubmit: () => void
}

export default function IsochroneControls({
  travelModes,
  travelTime,
  locations,
  selecting,
  loading,
  error,
  colors,
  onChangeModes,
  onChangeTime,
  onChangeLocation,
  onAddLocation,
  onSelectOnMap,
  onDeleteLocation,
  onSubmit,
}: Props) {
  return (
    <Card className="w-full lg:w-[380px] lg:h-full lg:border-r lg:rounded-none flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl">Reachable Area</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4 space-y-2 overflow-y-auto">
        <TravelModeSelector value={travelModes} onChange={onChangeModes} colors={colors} />
        <div className="space-y-1.5">
          <Label htmlFor="travel-time">Travel Time: {travelTime} min</Label>
          <Slider id="travel-time" min={1} max={60} step={1} value={[travelTime]} onValueChange={(val) => onChangeTime(val[0])} />
        </div>
        <LocationList
          locations={locations}
          selecting={selecting}
          onChange={onChangeLocation}
          onSelectOnMap={onSelectOnMap}
          onAdd={onAddLocation}
          onDelete={onDeleteLocation}
        />
        <Button onClick={onSubmit} disabled={loading} className="w-full mt-2">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}Show Reachable Area
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
  )
}
