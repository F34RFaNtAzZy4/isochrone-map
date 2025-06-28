"use client"

import { MapContainer, TileLayer, GeoJSON, Marker, Popup, Tooltip, useMap, useMapEvents } from "react-leaflet"
import type { GeoJSON as GeoJSONType } from "geojson"
import type { LatLngBoundsExpression } from "leaflet"
import { TravelMode } from "@/types"
import { useEffect } from "react"
import L from "leaflet"
import { cn } from "@/lib/utils"

interface IsochroneDisplay {
  geoJson: GeoJSONType
  color: string
  mode: TravelMode
}

interface MapDisplayProps {
  displayData: IsochroneDisplay[]
  markers: { position: [number, number]; popup: string }[]
  travelTime: number
  onSelectLocation?: (coords: [number, number]) => void
  selecting?: boolean
}

const viennaBounds: LatLngBoundsExpression = [
  [48.11, 16.18], // Southwest
  [48.32, 16.57], // Northeast
]

function ChangeView({ markers }: { markers: { position: [number, number] }[] }) {
  const map = useMap()
  useEffect(() => {
    if (markers.length > 0) {
      const bounds = new L.LatLngBounds(markers.map((m) => m.position))
      map.fitBounds(bounds, { padding: [50, 50] })
    } else {
      map.fitBounds(viennaBounds)
    }
  }, [markers, map])
  return null
}

function ClickHandler({ onSelectLocation }: { onSelectLocation?: (coords: [number, number]) => void }) {
  useMapEvents({
    click: (e) => {
      onSelectLocation && onSelectLocation([e.latlng.lat, e.latlng.lng])
    },
  })
  return null
}

export default function MapDisplay({ displayData, markers, travelTime, onSelectLocation, selecting }: MapDisplayProps) {
  return (
    <MapContainer
      center={[48.2082, 16.3738]}
      zoom={12}
      scrollWheelZoom={true}
      className={cn('h-full w-full z-0', selecting && 'cursor-marker')}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <ChangeView markers={markers} />
      <ClickHandler onSelectLocation={onSelectLocation} />

      {displayData.map((iso) => (
        <GeoJSON
          key={iso.mode}
          data={iso.geoJson}
          style={{
            color: iso.color,
            weight: 2,
            opacity: 0.9,
            fillColor: iso.color,
            fillOpacity: 0.4,
            className: "isochrone-path",
          }}
        >
          <Tooltip sticky>
            {markers.length > 1
              ? `Common reachable area within ${travelTime} minutes`
              : `Reachable area within ${travelTime} minutes`}
          </Tooltip>
        </GeoJSON>
      ))}

      {markers.map((marker, index) => (
        <Marker key={index} position={marker.position}>
          <Popup>{marker.popup}</Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
