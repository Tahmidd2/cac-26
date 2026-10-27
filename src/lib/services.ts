import type {
  FoodLocation,
  FoodPreferences,
  Opportunity,
  VolunteerPreferences,
  DemoState,
  RequestStatus,
} from "./types";
import { days, today, shiftHasEnded } from "./data";
import zipCentroids from "../data/zip-centroids.json";
import { serviceWindows } from "./schedules";
const knownAreas: Record<string, [number, number]> = {
  "11372": [40.7489, -73.8913],
  "11373": [40.742, -73.881],
  "11368": [40.75, -73.862],
  "11102": [40.767, -73.921],
  "11354": [40.76, -73.83],
  "11216": [40.68, -73.95],
  "11222": [40.73, -73.954],
  "10029": [40.798, -73.941],
  "11220": [40.648, -74.007],
  "10454": [40.808, -73.92],
  "10014": [40.734, -74.006],
  "10301": [40.642, -74.078],
  "11238": [40.677, -73.969],
  "10033": [40.851, -73.935],
  "10471": [40.907, -73.904],
  "11226": [40.65, -73.958],
  "10308": [40.553, -74.151],
  "10002": [40.718, -73.988],
};
const neighborhoods: Record<string, [number, number]> = {
  "jackson heights": [40.7489, -73.8913],
  astoria: [40.764, -73.923],
  elmhurst: [40.742, -73.881],
  corona: [40.75, -73.862],
  flushing: [40.76, -73.83],
  jamaica: [40.702, -73.794],
  "forest hills": [40.719, -73.845],
  ridgewood: [40.705, -73.902],
  woodside: [40.745, -73.904],
  "long island city": [40.744, -73.949],
  sunnyside: [40.742, -73.92],
  bayside: [40.763, -73.771],
  "far rockaway": [40.603, -73.755],
  brooklyn: [40.678, -73.944],
  queens: [40.728, -73.851],
  manhattan: [40.783, -73.966],
  bronx: [40.844, -73.864],
  "staten island": [40.58, -74.15],
  harlem: [40.811, -73.946],
  "east harlem": [40.795, -73.938],
  "washington heights": [40.841, -73.94],
  inwood: [40.867, -73.922],
  "lower east side": [40.718, -73.988],
  chinatown: [40.716, -73.998],
  chelsea: [40.746, -74.001],
  midtown: [40.754, -73.984],
  "upper west side": [40.787, -73.975],
  "upper east side": [40.773, -73.956],
  greenpoint: [40.73, -73.954],
  williamsburg: [40.714, -73.96],
  bushwick: [40.695, -73.917],
  "bedford stuyvesant": [40.687, -73.941],
  "bed stuy": [40.687, -73.941],
  flatbush: [40.65, -73.958],
  "sunset park": [40.648, -74.007],
  "bay ridge": [40.626, -74.032],
  "coney island": [40.576, -73.982],
  "east new york": [40.668, -73.882],
  "crown heights": [40.67, -73.943],
  "park slope": [40.671, -73.981],
  brownsville: [40.662, -73.909],
  canarsie: [40.64, -73.902],
  "mott haven": [40.808, -73.92],
  fordham: [40.862, -73.897],
  "hunts point": [40.812, -73.885],
  riverdale: [40.896, -73.912],
  "st george": [40.643, -74.077],
  "st. george": [40.643, -74.077],
  yonkers: [40.932, -73.899],
  "new rochelle": [40.912, -73.782],
  "white plains": [41.034, -73.762],
  hempstead: [40.707, -73.618],
  newark: [40.735, -74.172],
  "jersey city": [40.717, -74.044],
  hoboken: [40.744, -74.032],
};
const titleCase = (s: string) =>
  s.replace(/\b\w/g, (c) => c.toUpperCase()).replace("Bed Stuy", "Bed-Stuy");
export const areaSuggestions = [
  ...new Set(Object.keys(neighborhoods).map(titleCase)),
].sort();
/** Nearest ZIP-area center to a point. Used so precise coordinates are never stored. */
export function nearestZip(lat: number, lng: number) {
  let best = "",
    bestD = Infinity;
  for (const [zip, c] of Object.entries(
    zipCentroids as Record<string, number[]>,
  )) {
    const d = (c[0] - lat) ** 2 + ((c[1] - lng) * 0.76) ** 2;
    if (d < bestD) {
      bestD = d;
      best = zip;
    }
  }
  return best ? { zip: best, miles: Math.sqrt(bestD) * 69 } : null;
}
export function resolveArea(
  area: string,
  locations: FoodLocation[],
): [number, number] | null {
  const query = area
    .trim()
    .toLowerCase()
    .replace(/[-,]/g, " ")
    .replace(/\s+/g, " ");
  if (
    !query ||
    query === "new york" ||
    query === "nyc" ||
    query === "new york city"
  )
    return knownAreas["11372"];
  if (knownAreas[query]) return knownAreas[query];
  if (neighborhoods[query]) return neighborhoods[query];
  const zip = (zipCentroids as Record<string, number[]>)[query];
  if (zip) return [zip[0], zip[1]];
  const location = locations.find(
    (l) =>
      l.name.toLowerCase().includes(query) ||
      l.neighborhood.toLowerCase() === query ||
      l.address.toLowerCase().includes(query),
  );
  return location ? [location.lat, location.lng] : null;
}
export function distance(a: [number, number], b: [number, number]) {
  const r = Math.PI / 180,
    dLat = (b[0] - a[0]) * r,
    dLng = (b[1] - a[1]) * r,
    v =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLng / 2) ** 2;
  return 3958.8 * 2 * Math.atan2(Math.sqrt(v), Math.sqrt(1 - v));
}
export function travelMinutes(miles: number, mode: string) {
  return Math.ceil(
    mode === "Walking"
      ? (miles / 2.5) * 60
      : mode === "Driving"
        ? (miles / 12) * 60 + 8
        : mode === "Delivery"
          ? 0
          : (miles / 9) * 60 + 12,
  );
}
export function matchFood(locations: FoodLocation[], p: FoodPreferences) {
  const origin = resolveArea(p.area, locations);
  if (!origin) return [];
  return locations
    .flatMap((l) => {
      const miles = distance(origin, [l.lat, l.lng]),
        minutes = travelMinutes(miles, p.transport),
        day = days.indexOf(p.day),
        windows = serviceWindows(l);
      const possible = windows.filter(
        (w) =>
          (day < 0 || w.day === day) &&
          (p.period !== "Afternoon" || w.end > 12) &&
          (p.period !== "Morning" || w.start < 12),
      );
      if (
        (p.accessible && l.accessible === false) ||
        (p.noId && l.noId === false) ||
        (p.transport === "Delivery" && l.delivery !== true) ||
        (p.transport !== "Delivery" && minutes > p.maxMinutes) ||
        (l.householdLimit && p.household > l.householdLimit) ||
        (windows.length && !possible.length)
      )
        return [];
      const publicData = l.sourceKind === "public";
      const reasons: string[] = [
        p.transport === "Delivery"
          ? "Offers organization-coordinated delivery"
          : publicData
            ? "Near your selected starting area"
            : `Within your ${p.maxMinutes}-minute travel preference`,
      ];
      const cautions: string[] = [];
      let score = 70 - Math.min(minutes, 60) / 3;
      if (possible.length) {
        reasons.push(
          day >= 0
            ? `Posted hours fit your ${p.day} availability`
            : "Posted distribution hours this week",
        );
        score += 8;
      } else {
        cautions.push("Distribution hours need confirmation");
        score -= 18;
      }
      if (publicData)
        cautions.push(
          "Travel time is a distance-based shortlist estimate. Retrieve a route in the visit planner.",
        );
      if (l.conditionalSchedule) {
        cautions.push(
          "This schedule has additional conditions. Call before choosing a visit date.",
        );
        score -= 10;
      }
      if (p.accessible) {
        if (l.accessible === true) reasons.push("Accessible entrance listed");
        else {
          cautions.push(
            "Step-free access is not confirmed. Ask the organization.",
          );
          score -= 12;
        }
      }
      if (p.noId && l.noId === null) {
        cautions.push(
          "Documentation requirements are not confirmed. Call the organization.",
        );
        score -= 12;
      }
      if (p.dietary !== "No preference") {
        if (p.dietary === "Food allergies") {
          cautions.push("Contact the organization to discuss allergen safety");
          score -= 12;
        } else if (l.dietary.includes(p.dietary)) {
          reasons.push(
            `Lists ${p.dietary.toLowerCase()} options${publicData ? "" : " in demo data"}`,
          );
          score += 12;
        } else {
          cautions.push(
            `${p.dietary} options not confirmed — contact the organization`,
          );
          score -= 20;
        }
      }
      if (publicData) {
        reasons.push("Listed in the official NYC Food Help directory");
        const age = (Date.now() - Date.parse(l.updatedAt)) / 86400000;
        if (age > 90) {
          cautions.push(
            "The source record is more than 90 days old; reconfirm all details.",
          );
          score -= 10;
        }
      } else if (l.verified) {
        score += 12;
        reasons.push("Recently updated demonstration information");
      } else {
        score -= 22;
        cautions.push("Availability needs verification");
      }
      return [
        {
          location: l,
          score: Math.round(score),
          miles,
          minutes,
          reasons,
          cautions,
        },
      ];
    })
    .sort((a, b) => b.score - a.score);
}
export function matchVolunteers(
  opportunities: Opportunity[],
  locations: FoodLocation[],
  p: VolunteerPreferences,
) {
  const origin = resolveArea(p.area, locations);
  if (!origin) return [];
  return opportunities
    .flatMap((o) => {
      const org = locations.find((l) => l.id === o.orgId);
      if (
        !org ||
        !o.active ||
        shiftHasEnded(o) ||
        o.filled >= o.capacity ||
        p.minAge < o.minAge ||
        (p.accessible && !o.accessible) ||
        (p.group && !o.group) ||
        (p.recurring && !o.recurring) ||
        (p.skill === "No driving" && o.activity === "Delivery support") ||
        (p.duration && o.end - o.start > p.duration)
      )
        return [];
      const miles = distance(origin, [org.lat, org.lng]);
      if (
        miles > p.maxMiles ||
        (p.day !== "Any day" &&
          days[new Date(o.date + "T12:00:00").getDay()] !== p.day) ||
        (p.activity !== "Any activity" && o.activity !== p.activity)
      )
        return [];
      const daysUntil =
        (new Date(o.date + "T12:00:00").getTime() -
          new Date(today + "T12:00:00").getTime()) /
        86400000;
      const skillBonus =
        (p.skill === "Languages & interpretation" &&
          o.activity === "Translation") ||
        (p.skill === "Driving" && o.activity === "Delivery support")
          ? 15
          : 0;
      return [
        {
          opportunity: o,
          organization: org,
          miles,
          score:
            (o.priority && org.verified ? 35 : 0) +
            (o.capacity - o.filled) * 2 -
            Math.min(miles, 20) +
            Math.max(0, 14 - daysUntil) +
            skillBonus,
        },
      ];
    })
    .sort((a, b) => b.score - a.score);
}
export function registerShift(state: DemoState, id: string): DemoState {
  const o = state.opportunities.find((o) => o.id === id);
  if (!o || !o.active || shiftHasEnded(o) || o.filled >= o.capacity)
    throw new Error(
      "This shift is no longer available. Please choose another.",
    );
  if (state.signups.some((s) => s.opportunityId === id))
    throw new Error("This shift is already in your schedule.");
  return {
    ...state,
    opportunities: state.opportunities.map((o) =>
      o.id === id ? { ...o, filled: o.filled + 1 } : o,
    ),
    signups: [
      ...state.signups,
      {
        id: crypto.randomUUID(),
        opportunityId: id,
        createdAt: new Date().toISOString(),
      },
    ],
  };
}
export const requestStatuses: RequestStatus[] = [
  "Awaiting review",
  "Arranging assistance",
  "Scheduled",
  "Completed",
];
export function advanceRequest(
  state: DemoState,
  id: string,
  status: RequestStatus,
  assignedVolunteer?: string,
) {
  const req = state.requests.find((r) => r.id === id);
  if (!req) throw new Error("Request not found.");
  if (
    requestStatuses.indexOf(status) !==
    requestStatuses.indexOf(req.status) + 1
  )
    throw new Error(
      "Requests must move through organization review, arrangement, and scheduling in order.",
    );
  if (status === "Scheduled" && !assignedVolunteer)
    throw new Error(
      "Choose an organization-approved sample coordinator before scheduling.",
    );
  return {
    ...state,
    requests: state.requests.map((r) =>
      r.id === id
        ? {
            ...r,
            status,
            assignedVolunteer: assignedVolunteer || r.assignedVolunteer,
          }
        : r,
    ),
  };
}
