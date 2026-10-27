import { test } from "node:test";
import assert from "node:assert/strict";
import {
  publicLocations,
  directoryMetadata,
  seedLocations,
  nextDay,
  datePlus,
  today,
  newYorkMinutes,
} from "../src/lib/data";
import {
  windowsForDate,
  validateVisit,
  upcomingWindows,
  setVisitStatus,
} from "../src/lib/schedules";
import { directionsUrl, retrieveRoute } from "../src/lib/routing";
import { resolveArea, matchFood } from "../src/lib/services";
import type { FoodLocation, VisitPlan } from "../src/lib/types";
import { atlasPoint, boroughPaths, boundaries } from "../src/lib/geography";
test("all five official borough outlines and food dots fit the same atlas projection", () => {
  assert.equal(boroughPaths.length, 5);
  assert.equal(new Set(boroughPaths.map((b) => b.name)).size, 5);
  for (const feature of boundaries.features) {
    assert.equal(feature.geometry.type, "MultiPolygon");
    for (const polygon of feature.geometry.coordinates)
      for (const ring of polygon) {
        assert.deepEqual(ring[0], ring.at(-1));
        for (const [lng, lat] of ring) {
          const [x, y] = atlasPoint(lng, lat);
          assert.ok(x >= 0 && x <= 580 && y >= 0 && y <= 630);
        }
      }
  }
  for (const location of publicLocations) {
    const [x, y] = atlasPoint(location.lng, location.lat);
    assert.ok(x >= 0 && x <= 580 && y >= 0 && y <= 630, location.name);
  }
});
test("the real directory has over 500 active, attributed, geocoded locations without invented accommodation claims", () => {
  assert.ok(publicLocations.length >= 500);
  assert.equal(publicLocations.length, directoryMetadata.count);
  assert.equal(
    new Set(publicLocations.map((l) => l.id)).size,
    publicLocations.length,
  );
  for (const borough of [
    "Queens",
    "Brooklyn",
    "Bronx",
    "Manhattan",
    "Staten Island",
  ])
    assert.ok(publicLocations.some((l) => l.borough === borough));
  for (const l of publicLocations) {
    assert.ok(l.lat > 40 && l.lat < 42);
    assert.ok(l.lng < -73 && l.lng > -75);
    assert.equal(l.sourceKind, "public");
    assert.ok(l.sourceRecordUrl?.startsWith("https://services"));
    assert.equal(l.accessible, null);
    assert.equal(l.delivery, null);
    assert.equal(l.noId, null);
    assert.equal(l.appointment, null);
    assert.deepEqual(l.dietary, []);
  }
});
test("all structured hours have valid weekdays and minute-accurate windows", () => {
  let windows = 0;
  for (const l of publicLocations)
    for (const w of l.weeklySchedule || []) {
      windows++;
      assert.ok(w.day >= 0 && w.day <= 6);
      assert.ok(w.start >= 0 && w.end <= 24);
      assert.ok(w.end > w.start);
    }
  assert.ok(windows > 500);
});
test("Census geocoding supports many NYC and neighboring ZIP codes and does not misread East New York", () => {
  for (const zip of [
    "10001",
    "11226",
    "11372",
    "10451",
    "10314",
    "10701",
    "11550",
    "07030",
  ])
    assert.ok(resolveArea(zip, publicLocations), zip);
  assert.notDeepEqual(
    resolveArea("East New York", publicLocations),
    resolveArea("New York", publicLocations),
  );
  assert.equal(resolveArea("not a known neighborhood", publicLocations), null);
});
const location: FoodLocation = {
  ...seedLocations[0],
  sourceKind: "public",
  conditionalSchedule: false,
  weeklySchedule: [
    { day: 3, start: 9, end: 11 },
    { day: 3, start: 13, end: 15 },
  ],
  days: [3],
};
const visit = {
  date: nextDay(3) === today ? datePlus(today, 7) : nextDay(3),
  arrivalMinutes: 13 * 60 + 15,
  providerConfirmed: true,
};
test("the planner rejects arrivals in a gap between distributions or after closing", () => {
  assert.equal(validateVisit(location, visit), null);
  assert.match(
    validateVisit(location, { ...visit, arrivalMinutes: 12 * 60 })!,
    /window/,
  );
  assert.match(
    validateVisit(location, { ...visit, arrivalMinutes: 15 * 60 - 5 })!,
    /closing/,
  );
  assert.match(
    validateVisit(location, { ...visit, arrivalMinutes: 8 * 60 })!,
    /window/,
  );
});
test("a public program requires an explicit confirmation and a valid distribution day", () => {
  assert.match(
    validateVisit(location, { ...visit, providerConfirmed: false })!,
    /Confirm/,
  );
  assert.match(
    validateVisit(location, { ...visit, date: datePlus(visit.date, 1) })!,
    /does not include/,
  );
  assert.match(
    validateVisit(location, { ...visit, date: datePlus(today, -1) })!,
    /future/,
  );
});
test("upcoming windows use per-day, per-session times rather than a made-up all-day range", () => {
  const next = upcomingWindows(location, 4);
  assert.ok(next.length);
  for (const n of next)
    assert.ok(
      (n.window.start === 9 && n.window.end === 11) ||
        (n.window.start === 13 && n.window.end === 15),
    );
});
test("unknown access or dietary information stays uncertain in the real-network matcher", () => {
  const matches = matchFood(publicLocations, {
    area: "11372",
    household: 4,
    day: "Wednesday",
    period: "Afternoon",
    transport: "Public transit",
    maxMinutes: 45,
    dietary: "Halal",
    accessible: true,
    noId: false,
  });
  assert.ok(matches.length);
  for (const r of matches) {
    assert.ok(r.cautions.some((c) => c.includes("not confirmed")));
    assert.ok(!r.reasons.includes("Accessible entrance listed"));
    assert.ok(!r.reasons.some((c) => c.includes("halal options")));
  }
});
test("directions contain both endpoints and the selected travel mode", () => {
  const url = new URL(directionsUrl(location, "Walking", "11372"));
  assert.equal(url.searchParams.get("origin"), "11372, New York, USA");
  assert.equal(
    url.searchParams.get("destination"),
    `${location.lat},${location.lng}`,
  );
  assert.equal(url.searchParams.get("travelmode"), "walking");
});
test("walking retrieval requests a full round trip and preserves different outward and return times", async () => {
  const previous = globalThis.fetch;
  let requested = "";
  globalThis.fetch = (async (input) => {
    requested = String(input);
    return new Response(
      JSON.stringify({
        code: "Ok",
        routes: [
          {
            legs: [
              {
                duration: 600,
                distance: 700,
                steps: [
                  {
                    name: "Broadway",
                    distance: 700,
                    maneuver: { type: "depart" },
                  },
                ],
              },
              { duration: 720, distance: 800, steps: [] },
            ],
            geometry: {
              coordinates: [
                [-73.9, 40.7],
                [-73.89, 40.71],
                [-73.9, 40.7],
              ],
            },
          },
        ],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }) as typeof fetch;
  try {
    const route = await retrieveRoute(
      [40.7, -73.9],
      [40.71, -73.89],
      "Walking",
    );
    assert.ok(requested.includes("/routed-foot/route/v1/foot/"));
    assert.ok(requested.includes("-73.9,40.7;-73.89,40.71;-73.9,40.7"));
    assert.equal(route.outboundMinutes, 10);
    assert.equal(route.returnMinutes, 12);
    assert.deepEqual(route.coordinates[0], [40.7, -73.9]);
    assert.deepEqual(route.destination, [40.71, -73.89]);
    assert.equal(route.steps[0].instruction, "Start on Broadway");
  } finally {
    globalThis.fetch = previous;
  }
});
test("the full local cycle records travel, pickup, unsuccessful outcomes, and a deliberate reset", () => {
  let plans: VisitPlan[] = [
    {
      id: "trip",
      locationId: location.id,
      date: visit.date,
      transport: "Walking",
      originArea: "11372",
      arrivalMinutes: visit.arrivalMinutes,
      checklist: [],
      status: "Planned",
      providerConfirmed: true,
      outboundMinutes: 10,
      returnMinutes: 12,
      travelTimeSource: "route",
    },
  ];
  plans = setVisitStatus(plans, "trip", "On my way");
  assert.equal(plans[0].status, "On my way");
  plans = setVisitStatus(plans, "trip", "Collected");
  assert.equal(plans[0].status, "Collected");
  assert.throws(
    () => setVisitStatus(plans, "trip", "Could not collect"),
    /Reset/,
  );
  plans = setVisitStatus(plans, "trip", "Planned");
  plans = setVisitStatus(plans, "trip", "Could not collect");
  assert.equal(plans[0].status, "Could not collect");
  assert.ok(newYorkMinutes(new Date("2026-10-28T17:42:00Z")) === 13 * 60 + 42);
});
