import type {
  FoodLocation,
  FoodPreferences,
  Opportunity,
  VolunteerPreferences,
  DemoState,
  RequestStatus,
} from "./types";
import { days, today } from "./data";
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
export function resolveArea(
  area: string,
  locations: FoodLocation[],
): [number, number] | null {
  if (!area.trim() || /new york|nyc/i.test(area)) return knownAreas["11372"];
  if (knownAreas[area.trim()]) return knownAreas[area.trim()];
  const l = locations.find((l) =>
    `${l.neighborhood} ${l.borough}`.toLowerCase().includes(area.toLowerCase()),
  );
  return l ? [l.lat, l.lng] : null;
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
        day = days.indexOf(p.day);
      if (
        (p.accessible && !l.accessible) ||
        (p.noId && !l.noId) ||
        (p.transport === "Delivery" && !l.delivery) ||
        (p.transport !== "Delivery" && minutes > p.maxMinutes) ||
        (l.householdLimit && p.household > l.householdLimit) ||
        (day >= 0 && !l.days.includes(day)) ||
        (p.period === "Afternoon" && l.end <= 12) ||
        (p.period === "Morning" && l.start >= 12)
      )
        return [];
      const reasons = [
        p.transport === "Delivery"
          ? "Offers organization-coordinated delivery"
          : `Within your ${p.maxMinutes}-minute travel preference`,
        day >= 0
          ? `Fits your ${p.day} availability`
          : "Distribution available this week",
      ];
      const cautions: string[] = [];
      let score = 70 - Math.min(minutes, 60) / 3;
      if (p.dietary !== "No preference") {
        if (p.dietary === "Food allergies") {
          cautions.push("Contact the organization to discuss allergen safety");
          score -= 12;
        } else if (l.dietary.includes(p.dietary)) {
          reasons.push(`Lists ${p.dietary.toLowerCase()} options in demo data`);
          score += 12;
        } else {
          cautions.push(
            `${p.dietary} options not confirmed — contact the organization`,
          );
          score -= 20;
        }
      }
      if (l.verified) {
        score += 12;
        reasons.push("Recently updated demonstration information");
      } else {
        score -= 22;
        cautions.push("Availability needs verification");
      }
      if (p.accessible) reasons.push("Accessible entrance");
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
        o.date < today ||
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
  if (!o || !o.active || o.date < today || o.filled >= o.capacity)
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
