"use client";

import "leaflet/dist/leaflet.css";

import { useMemo } from "react";
import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";

export function DetailMap({
  latitude,
  longitude,
  label,
}: {
  latitude: number;
  longitude: number;
  label: string;
}) {
  const center = useMemo(() => [latitude, longitude] as [number, number], [latitude, longitude]);

  return (
    <div className="overflow-hidden rounded-[1.75rem]">
      <MapContainer
        center={center}
        zoom={11}
        scrollWheelZoom={false}
        className="h-[420px] w-full grayscale"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors & CARTO"
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        />
        <CircleMarker
          center={center}
          radius={12}
          pathOptions={{
            color: "#a13c3f",
            weight: 2,
            fillColor: "#a13c3f",
            fillOpacity: 0.85,
          }}
        >
          <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
            {label}
          </Tooltip>
        </CircleMarker>
      </MapContainer>
    </div>
  );
}
