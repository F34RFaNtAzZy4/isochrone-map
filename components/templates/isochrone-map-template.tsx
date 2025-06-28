"use client"
import { useIsochroneMap } from "@/hooks/use-isochrone-map"
import IsochroneControls from "@/components/organisms/isochrone-controls"
import { useConfigureLeaflet } from "@/hooks/use-configure-leaflet"

export default function IsochroneMapTemplate() {
  useConfigureLeaflet()
  const state = useIsochroneMap()

  const {
    Map,
    intersection,
    markers,
    travelTime,
    mapKey,
    selecting,
    handleMapSelect,
    MODE_COLORS,
  } = state

  return (
    <div className="flex h-screen w-full flex-col lg:flex-row bg-background">
      <IsochroneControls
        travelModes={state.travelModes}
        travelTime={state.travelTime}
        locations={state.locations}
        selecting={state.selecting}
        loading={state.loading}
        error={state.error}
        colors={MODE_COLORS}
        onChangeModes={state.setTravelModes}
        onChangeTime={state.setTravelTime}
        onChangeLocation={state.handleLocationChange}
        onAddLocation={() => state.setLocations([...state.locations, ""])}
        onSelectOnMap={(idx) => state.setSelecting(idx)}
        onDeleteLocation={(idx) => {
          const newLocations = [...state.locations]
          newLocations.splice(idx, 1)
          state.setLocations(newLocations)
        }}
        onSubmit={state.handleSubmit}
      />
      <div className="flex-grow h-1/2 lg:h-full w-full">
        <Map
          key={mapKey}
          displayData={intersection}
          markers={markers}
          travelTime={travelTime}
          onSelectLocation={handleMapSelect}
          selecting={selecting !== null}
        />
      </div>
    </div>
  )
}
