import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { LocateFixed, Minus, Plus, Layers, MapPin } from "lucide-react";
import type { FoodLocation } from "../lib/types";
import "leaflet/dist/leaflet.css";
function Sync({
  selected,
  locations,
  onSelect,
}: {
  selected: string;
  locations: FoodLocation[];
  onSelect: (id: string) => void;
}) {
  const map = useMap();
  useEffect(() => {
    function selectPopup(event: L.PopupEvent) {
      const point = event.popup.getLatLng();
      if (!point) return;
      const location = locations.find(
        (l) =>
          Math.abs(l.lat - point.lat) < 0.00001 &&
          Math.abs(l.lng - point.lng) < 0.00001,
      );
      if (location) onSelect(location.id);
    }
    map.on("popupopen", selectPopup);
    return () => {
      map.off("popupopen", selectPopup);
    };
  }, [map, locations, onSelect]);
  useEffect(() => {
    const l = locations.find((l) => l.id === selected);
    if (l)
      map.flyTo([l.lat, l.lng], Math.max(map.getZoom(), 12), {
        duration: 0.65,
      });
  }, [selected, locations, map]);
  useEffect(() => {
    // A mobile map starts hidden. Recalculate its bounds once it has a size,
    // and whenever the list/map toggle or responsive layout changes that size.
    const container = map.getContainer();
    function fitVisibleMap() {
      if (!container.clientWidth || !container.clientHeight) return;
      map.invalidateSize();
      if (locations.length)
        map.fitBounds(
          L.latLngBounds(
            locations.map((l) => [l.lat, l.lng] as [number, number]),
          ),
          { padding: [40, 40], maxZoom: 13 },
        );
    }
    fitVisibleMap();
    const observer = new ResizeObserver(fitVisibleMap);
    observer.observe(container);
    return () => observer.disconnect();
  }, [locations, map]);
  return null;
}
function Controls() {
  const map = useMap();
  return (
    <div className="map-controls">
      <button aria-label="Zoom in" onClick={() => map.zoomIn()}>
        <Plus size={19} />
      </button>
      <button aria-label="Zoom out" onClick={() => map.zoomOut()}>
        <Minus size={19} />
      </button>
      <button
        aria-label="Center on New York City"
        onClick={() => map.flyTo([40.7489, -73.8913], 12)}
      >
        <LocateFixed size={19} />
      </button>
    </div>
  );
}
export default function FoodMap({
  locations,
  selected,
  onSelect,
  compact = false,
}: {
  locations: FoodLocation[];
  selected: string;
  onSelect: (id: string) => void;
  compact?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`food-map ${compact ? "compact-map" : ""}`}>
      <MapContainer
        center={[40.7489, -73.8913]}
        zoom={12}
        zoomControl={false}
        scrollWheelZoom={false}
        className="leaflet-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={{
            tileerror: () => setFailed(true),
          }}
        />
        {locations.map((l, i) => (
          <Marker
            key={l.id}
            position={[l.lat, l.lng]}
            title={l.name}
            alt={l.name}
            icon={L.divIcon({
              className: "custom-pin",
              html: `<span class="pin ${selected === l.id ? "pin-selected" : ""}"><b>${i + 1}</b></span>`,
              iconSize: [34, 42],
              iconAnchor: [17, 42],
            })}
            eventHandlers={{ click: () => onSelect(l.id) }}
          >
            <Popup>
              <strong>{l.name}</strong>
              <br />
              {l.neighborhood}
              <br />
              <a href={`/food/${l.id}`}>View location →</a>
            </Popup>
          </Marker>
        ))}
        <Sync selected={selected} locations={locations} onSelect={onSelect} />
        <Controls />
      </MapContainer>
      <div className="map-label">
        <MapPin size={14} /> New York City <span>·</span> Demo locations
      </div>
      {failed && (
        <div className="map-fallback">
          <Layers size={18} /> Map tiles unavailable. Locations and numbered
          markers still work.
        </div>
      )}
      <div className="map-legend">
        <span className="legend-dot" /> Food resources{" "}
        <span className="legend-outline" /> Selected location
      </div>
    </div>
  );
}
