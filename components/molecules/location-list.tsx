"use client"
import LocationInput from "@/components/location-input"
import { Button } from "@/components/ui/button"

interface Props {
  locations: string[]
  selecting: number | null
  onChange: (idx: number, val: string) => void
  onSelectOnMap: (idx: number) => void
  onAdd: () => void
  onDelete: (idx: number) => void
}

export default function LocationList({
  locations,
  selecting,
  onChange,
  onSelectOnMap,
  onAdd,
  onDelete,
}: Props) {
  return (
    <div className="space-y-2">
      {locations.map((loc, idx) => (
        <div key={idx} className="space-y-1">
          <LocationInput
            id={`location-${idx}`}
            value={loc}
            onChange={(val) => onChange(idx, val)}
            onSelectOnMap={() => onSelectOnMap(idx)}
            onDelete={() => onDelete(idx)}
          />
        </div>
      ))}
      <Button variant="outline" onClick={onAdd} className="w-full border-dashed">
        Add Location
      </Button>
      {selecting !== null && (
        <p className="text-sm text-muted-foreground">
          Click on the map to set location {selecting + 1}
        </p>
      )}
    </div>
  )
}
