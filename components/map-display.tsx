"use client"

import { MapContainer, TileLayer, GeoJSON, Marker, Popup, Tooltip, useMap, useMapEvents } from "react-leaflet"
import type { GeoJSON as GeoJSONType } from "geojson"
import type { LatLngBoundsExpression } from "leaflet"
import { useEffect } from "react"
import L from "leaflet"

interface MapDisplayProps {
  displayData: GeoJSONType | null
  markers: { position: [number, number]; popup: string }[]
  travelTime: number
  onSelectLocation?: (coords: [number, number]) => void
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

export default function MapDisplay({ displayData, markers, travelTime, onSelectLocation }: MapDisplayProps) {
  return (
    <MapContainer center={[48.2082, 16.3738]} zoom={12} scrollWheelZoom={true} className="h-full w-full z-0">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <ChangeView markers={markers} />
      <ClickHandler onSelectLocation={onSelectLocation} />

      {displayData && (
        <GeoJSON
          data={displayData}
          style={{
            color: "#e60000",
            weight: 2,
            opacity: 0.9,
            fillColor: "#ff4d4d",
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
      )}

      {markers.map((marker, index) => (
        <Marker key={index} position={marker.position}>
          <Popup>{marker.popup}</Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
