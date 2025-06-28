"use client"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Car, Bus, Bike, Footprints } from "lucide-react"
import { TravelMode } from "@/types"

interface Props {
  value: TravelMode[]
  onChange: (modes: TravelMode[]) => void
  colors: Record<TravelMode, string>
}

export default function TravelModeSelector({ value, onChange, colors }: Props) {
  return (
    <ToggleGroup
      type="multiple"
      value={value}
      onValueChange={(modes) => onChange(modes as TravelMode[])}
      className="flex items-center space-x-2 pt-2"
    >
      <ToggleGroupItem
        value="drive"
        style={{
          backgroundColor: value.includes("drive") ? colors.drive : undefined,
          color: value.includes("drive") ? "white" : undefined,
        }}
      >
        <Car className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="approximated_transit"
        style={{
          backgroundColor: value.includes("approximated_transit")
            ? colors.approximated_transit
            : undefined,
          color: value.includes("approximated_transit") ? "white" : undefined,
        }}
      >
        <Bus className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="bicycle"
        style={{
          backgroundColor: value.includes("bicycle") ? colors.bicycle : undefined,
          color: value.includes("bicycle") ? "white" : undefined,
        }}
      >
        <Bike className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="walk"
        style={{
          backgroundColor: value.includes("walk") ? colors.walk : undefined,
          color: value.includes("walk") ? "white" : undefined,
        }}
      >
        <Footprints className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
