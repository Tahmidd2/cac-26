import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { Link } from "react-router-dom";
import L from "leaflet";
import { LocateFixed, Minus, Plus } from "lucide-react";
import type { FoodLocation } from "../lib/types";
import "leaflet/dist/leaflet.css";
function Sync({
  locations,
  selected,
  onSelect,
}: {
  locations: FoodLocation[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    function fit() {
      if (!container.clientWidth || !container.clientHeight) return;
      map.invalidateSize();
      if (locations.length)
        map.fitBounds(
          L.latLngBounds(
            locations.map((l) => [l.lat, l.lng] as [number, number]),
          ),
          { padding: [45, 45], maxZoom: 14, animate: false },
        );
    }
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(container);
    return () => observer.disconnect();
  }, [locations, map]);
  useEffect(() => {
    const l = locations.find((l) => l.id === selected);
    if (l && !map.getBounds().contains([l.lat, l.lng]))
      map.panTo([l.lat, l.lng], {
        animate: !matchMedia("(prefers-reduced-motion: reduce)").matches,
        duration: 0.5,
      });
  }, [selected, locations, map]);
  useEffect(() => {
    function opened(e: L.PopupEvent) {
      const point = e.popup.getLatLng();
      if (!point) return;
      const l = locations.find(
        (l) =>
          Math.abs(l.lat - point.lat) < 0.00001 &&
          Math.abs(l.lng - point.lng) < 0.00001,
      );
      if (l) onSelect(l.id);
    }
    map.on("popupopen", opened);
    return () => {
      map.off("popupopen", opened);
    };
  }, [map, locations, onSelect]);
  return null;
}
function Hubs({
  locations,
  selected,
  onSelect,
}: {
  locations: FoodLocation[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) });
  const groups = useMemo(() => {
    const buckets = new Map<string, FoodLocation[]>();
    for (const l of locations) {
      const point = map.project([l.lat, l.lng], zoom);
      const key =
        l.id === selected
          ? l.id
          : `${Math.floor(point.x / 38)}:${Math.floor(point.y / 38)}`;
      const bucket = buckets.get(key) || [];
      bucket.push(l);
      buckets.set(key, bucket);
    }
    return [...buckets.values()];
  }, [locations, selected, zoom, map]);
  return (
    <>
      {groups.map((group) => {
        if (group.length > 1) {
          const lat = group.reduce((s, l) => s + l.lat, 0) / group.length,
            lng = group.reduce((s, l) => s + l.lng, 0) / group.length;
          return (
            <Marker
              key={`cluster-${group[0].id}-${zoom}`}
              position={[lat, lng]}
              title={`${group.length} food programs; zoom in for individual locations`}
              icon={L.divIcon({
                className: "hub-cluster-wrapper",
                html: `<span class="hub-cluster">${group.length}</span>`,
                iconSize: [36, 36],
                iconAnchor: [18, 18],
              })}
              eventHandlers={{
                click: () =>
                  map.fitBounds(
                    L.latLngBounds(
                      group.map((l) => [l.lat, l.lng] as [number, number]),
                    ),
                    {
                      padding: [70, 70],
                      maxZoom: Math.min(18, zoom + 3),
                      animate: false,
                    },
                  ),
              }}
            >
              <Tooltip
                className="hub-tooltip"
                direction="top"
                offset={[0, -18]}
                opacity={1}
              >
                <strong>{group.length} food programs nearby</strong>
                <small>
                  {group
                    .slice(0, 3)
                    .map((l) => l.name)
                    .join(" · ")}
                  {group.length > 3 ? "…" : ""}
                </small>
                <small>Click or press Enter to zoom into this area.</small>
              </Tooltip>
            </Marker>
          );
        }
        const l = group[0],
          isSelected = l.id === selected;
        return (
          <Marker
            key={l.id}
            position={[l.lat, l.lng]}
            title={`${l.name} — ${l.serviceTypes?.join(" and ") || l.type}, ${l.borough}`}
            alt={l.name}
            icon={L.divIcon({
              className: "custom-pin",
              html: `<span class="hub-dot ${l.type === "Prepared meals" ? "meal-dot" : ""} ${isSelected ? "is-selected" : ""}"></span>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            })}
            eventHandlers={{ click: () => onSelect(l.id) }}
          >
            <Tooltip
              className="hub-tooltip"
              direction="top"
              offset={[0, -12]}
              opacity={1}
            >
              <strong>{l.name}</strong>
              <small>
                {l.serviceTypes?.join(" & ") || l.type} · {l.borough} {l.zip}
              </small>
            </Tooltip>
            <Popup>
              <strong>{l.name}</strong>
              <p>{l.address}</p>
              <Link to={`/food/${l.id}`}>View hours & plan a visit</Link>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
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
        onClick={() => map.setView([40.7489, -73.8913], 12, { animate: false })}
      >
        <LocateFixed size={18} />
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
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          eventHandlers={{ tileerror: () => setFailed(true) }}
        />
        <Hubs locations={locations} selected={selected} onSelect={onSelect} />
        <Sync locations={locations} selected={selected} onSelect={onSelect} />
        <Controls />
      </MapContainer>
      <div className="map-label">
        {compact
          ? "Program location"
          : `${locations.length} food programs in this search`}
      </div>
      {failed && (
        <div className="map-fallback">
          Street tiles are unavailable. Program dots, hover labels, and the list
          still work.
        </div>
      )}
      <div className="map-legend">
        <span className="legend-dot" />
        Pantries
        <span className="legend-outline" />
        Meal programs
      </div>
    </div>
  );
}
