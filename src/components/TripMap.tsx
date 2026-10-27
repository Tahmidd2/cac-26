import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Tooltip,
  useMap,
} from "react-leaflet";
import type { TravelRoute } from "../lib/types";
import { TILE_ATTRIBUTION, TILE_BASE, TILE_LABELS } from "./Map";
import "leaflet/dist/leaflet.css";
function Fit({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    map.fitBounds(points, { padding: [28, 28], maxZoom: 16 });
  }, [map, points]);
  return null;
}
export default function TripMap({ route }: { route: TravelRoute }) {
  const start = route.coordinates[0],
    finish = route.destination;
  return (
    <div className="trip-map">
      <MapContainer
        center={start}
        zoom={13}
        zoomControl={false}
        scrollWheelZoom={false}
      >
        <TileLayer
          url={TILE_BASE}
          maxNativeZoom={16}
          attribution={TILE_ATTRIBUTION}
        />
        <TileLayer url={TILE_LABELS} maxNativeZoom={16} />
        <Polyline
          positions={route.coordinates}
          pathOptions={{ color: "#244d3e", weight: 5, opacity: 0.9 }}
        />
        <CircleMarker
          center={start}
          radius={7}
          pathOptions={{
            color: "#fff",
            weight: 3,
            fillColor: "#244d3e",
            fillOpacity: 1,
          }}
        >
          <Tooltip>Your approximate starting area</Tooltip>
        </CircleMarker>
        <CircleMarker
          center={finish}
          radius={7}
          pathOptions={{
            color: "#fff",
            weight: 3,
            fillColor: "#cf954f",
            fillOpacity: 1,
          }}
        >
          <Tooltip>Journey destination</Tooltip>
        </CircleMarker>
        <Fit points={route.coordinates} />
      </MapContainer>
      <span className="route-provider">
        Street route from OpenStreetMap · approximate starting point
      </span>
    </div>
  );
}
