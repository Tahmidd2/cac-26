import type { FoodLocation, Transport, TravelRoute } from "./types";
const cache = new Map<string, TravelRoute>();
let requestChain: Promise<unknown> = Promise.resolve();
let lastRequest = 0;
export function directionsUrl(
  location: FoodLocation,
  transport: Transport = "Public transit",
  originArea?: string,
) {
  const params = new URLSearchParams({
    api: "1",
    destination: `${location.lat},${location.lng}`,
    travelmode:
      transport === "Walking"
        ? "walking"
        : transport === "Driving"
          ? "driving"
          : "transit",
  });
  if (originArea)
    params.set(
      "origin",
      /^\d{5}$/.test(originArea)
        ? `${originArea}, USA`
        : `${originArea}, New York, USA`,
    );
  return `https://www.google.com/maps/dir/?${params}`;
}
export async function retrieveRoute(
  origin: [number, number],
  destination: [number, number],
  mode: "Walking" | "Driving",
  signal?: AbortSignal,
): Promise<TravelRoute> {
  const key = JSON.stringify([origin, destination, mode]);
  const hit = cache.get(key);
  if (hit && Date.now() - Date.parse(hit.retrievedAt) < 1800000) return hit;
  const execute = async () => {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const wait = Math.max(0, 1100 - (Date.now() - lastRequest));
    if (wait) await new Promise((r) => setTimeout(r, wait));
    lastRequest = Date.now();
    const coordinates = `${origin[1]},${origin[0]};${destination[1]},${destination[0]};${origin[1]},${origin[0]}`;
    const response = await fetch(
      `https://routing.openstreetmap.de/${mode === "Walking" ? "routed-foot" : "routed-car"}/route/v1/${mode === "Walking" ? "foot" : "driving"}/${coordinates}?overview=full&geometries=geojson&steps=true&continue_straight=false`,
      {
        signal: signal
          ? AbortSignal.any([signal, AbortSignal.timeout(15000)])
          : AbortSignal.timeout(15000),
      },
    );
    if (!response.ok)
      throw new Error(
        "The routing service is unavailable. Use the directions link to check your journey.",
      );
    const data = await response.json();
    const route = data.routes?.[0];
    if (data.code !== "Ok" || !route || route.legs?.length !== 2)
      throw new Error(
        "No suitable route was returned. Check the external directions planner.",
      );
    const steps = route.legs[0].steps.map(
      (s: {
        name: string;
        distance: number;
        maneuver: { type: string; modifier?: string };
      }) => ({
        instruction:
          s.maneuver.type === "depart"
            ? `Start on ${s.name || "the local path"}`
            : s.maneuver.type === "arrive"
              ? "Arrive at your destination"
              : `${s.maneuver.type === "turn" ? "Turn" : s.maneuver.type === "continue" ? "Continue" : s.maneuver.type === "roundabout" ? "At the roundabout, continue" : "Continue"}${s.maneuver.modifier ? " " + s.maneuver.modifier : ""}${s.name ? " onto " + s.name : ""}`,
        meters: s.distance,
      }),
    );
    const result: TravelRoute = {
      provider: "FOSSGIS / OpenStreetMap (OSRM)",
      retrievedAt: new Date().toISOString(),
      mode,
      outboundMinutes: Math.max(1, Math.ceil(route.legs[0].duration / 60)),
      returnMinutes: Math.max(1, Math.ceil(route.legs[1].duration / 60)),
      meters: route.legs[0].distance,
      destination,
      coordinates: route.geometry.coordinates.map(
        ([lng, lat]: [number, number]) => [lat, lng],
      ),
      steps,
    };
    cache.set(key, result);
    return result;
  };
  const task = requestChain.then(execute, execute);
  requestChain = task.catch(() => {});
  return task;
}
export function calendarDownload({
  name,
  date,
  arrivalMinutes,
  address,
}: {
  name: string;
  date: string;
  arrivalMinutes: number;
  address: string;
}) {
  const clean = (s: string) =>
    s
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  const at = (n: number) =>
    `${date.replaceAll("-", "")}T${String(Math.floor(n / 60)).padStart(2, "0")}${String(n % 60).padStart(2, "0")}00`;
  const content = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nourish//Visit planner//EN",
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}@nourish.local`,
    `DTSTAMP:${new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "")}`,
    `DTSTART;TZID=America/New_York:${at(arrivalMinutes)}`,
    `DTEND;TZID=America/New_York:${at(Math.min(arrivalMinutes + 30, 1439))}`,
    `SUMMARY:${clean(`Food pickup: ${name}`)}`,
    `LOCATION:${clean(address)}`,
    "DESCRIPTION:Confirm hours and pickup requirements with the provider. This calendar event does not reserve food.",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(
    new Blob([content], { type: "text/calendar;charset=utf-8" }),
  );
  link.download = "nourish-visit.ics";
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}
