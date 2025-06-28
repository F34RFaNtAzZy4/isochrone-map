"use client";
import IsochroneMapTemplate from "@/components/templates/isochrone-map-template";
import "leaflet/dist/leaflet.css";
import { Suspense } from "react";

export default function IsochroneMapPage() {
  return (
    <Suspense fallback={<div>Loading params…</div>}>
      <IsochroneMapTemplate />
    </Suspense>
  );
}
