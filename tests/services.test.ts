import { test } from "node:test";
import assert from "node:assert/strict";
import {
  matchFood,
  matchVolunteers,
  registerShift,
  advanceRequest,
  resolveArea,
  distance,
} from "../src/lib/services";
import { initialState, seedLocations, today, nextDay } from "../src/lib/data";
import type {
  FoodPreferences,
  VolunteerPreferences,
  DemoState,
} from "../src/lib/types";
const food: FoodPreferences = {
  area: "11372",
  household: 4,
  day: "Wednesday",
  period: "Afternoon",
  transport: "Public transit",
  maxMinutes: 45,
  dietary: "Halal",
  accessible: false,
  noId: false,
};
const volunteer: VolunteerPreferences = {
  area: "11372",
  day: "Saturday",
  activity: "Any activity",
  maxMiles: 15,
  minAge: 18,
  accessible: false,
  duration: 4,
  group: false,
  recurring: false,
  skill: "No preference",
};
const fresh = (): DemoState => structuredClone(initialState);
test("food matching respects Wednesday afternoon, travel, accessibility, and household limits", () => {
  const results = matchFood(seedLocations, {
    ...food,
    accessible: true,
    noId: true,
  });
  assert.ok(results.length);
  assert.equal(results[0].location.id, "food-1");
  for (const r of results) {
    assert.ok(r.location.days.includes(3));
    assert.ok(r.location.end > 12);
    assert.ok(r.location.accessible);
    assert.ok(r.location.noId);
    assert.ok(r.minutes <= 45);
    assert.ok(!r.location.householdLimit || r.location.householdLimit >= 4);
  }
});
test("a nearby location closed Wednesday cannot outrank an available distribution", () => {
  const closed = { ...seedLocations[0], id: "closed", days: [2] };
  const results = matchFood([closed, seedLocations[3]], food);
  assert.ok(results.length);
  assert.ok(results.every((r) => r.location.id !== "closed"));
});
test("unknown dietary information reduces confidence instead of claiming compatibility", () => {
  const l = { ...seedLocations[0], dietary: [] };
  const results = matchFood([l], food);
  assert.equal(results.length, 1);
  assert.ok(results[0].cautions.some((c) => c.includes("not confirmed")));
  assert.ok(!results[0].reasons.some((c) => c.includes("halal")));
  assert.ok(matchFood([seedLocations[0]], food)[0].score > results[0].score);
});
test("delivery is a hard constraint and long walking journeys are excluded", () => {
  assert.ok(
    matchFood(seedLocations, {
      ...food,
      day: "Any day",
      period: "Any time",
      transport: "Delivery",
    }).every((r) => r.location.delivery),
  );
  assert.ok(
    matchFood(seedLocations, {
      ...food,
      day: "Any day",
      period: "Any time",
      transport: "Walking",
      maxMinutes: 15,
    }).every((r) => r.minutes <= 15),
  );
});
test("food allergies always prompt provider confirmation", () => {
  assert.ok(
    matchFood(seedLocations, {
      ...food,
      dietary: "Food allergies",
    })[0].cautions.some((c) => c.includes("allergen safety")),
  );
});
test("unsupported areas do not silently use a different neighborhood", () => {
  assert.equal(resolveArea("90210", seedLocations), null);
  assert.deepEqual(matchFood(seedLocations, { ...food, area: "90210" }), []);
  assert.deepEqual(
    matchVolunteers(initialState.opportunities, seedLocations, {
      ...volunteer,
      area: "90210",
    }),
    [],
  );
});
test("stale information lowers ranking when other details are equivalent", () => {
  const base = seedLocations[0];
  const results = matchFood(
    [{ ...base, id: "stale", verified: false }, base],
    food,
  );
  assert.equal(results[0].location.id, base.id);
  assert.ok(results[1].cautions.length);
});
test("volunteer ranking respects age, availability, distance, duration, and posted priority", () => {
  const results = matchVolunteers(
    initialState.opportunities,
    seedLocations,
    volunteer,
  );
  assert.ok(results.length);
  assert.ok(results[0].opportunity.priority);
  for (const { opportunity: o, miles } of results) {
    assert.equal(new Date(o.date + "T12:00:00").getDay(), 6);
    assert.ok(o.minAge <= 18);
    assert.ok(miles <= 15);
    assert.ok(o.end - o.start <= 4);
    assert.ok(o.filled < o.capacity);
  }
});
test("a signup increases capacity once and duplicate registrations are prevented", () => {
  let s = fresh();
  const id = s.opportunities[0].id;
  const old = s.opportunities[0].filled;
  s = registerShift(s, id);
  assert.equal(s.signups.length, 1);
  assert.equal(s.opportunities[0].filled, old + 1);
  assert.throws(() => registerShift(s, id), /already/);
});
test("full and closed shifts cannot accept signups", () => {
  let s = fresh();
  s.opportunities[0].filled = s.opportunities[0].capacity;
  assert.throws(
    () => registerShift(s, s.opportunities[0].id),
    /no longer available/,
  );
  s = fresh();
  s.opportunities[0].active = false;
  assert.throws(
    () => registerShift(s, s.opportunities[0].id),
    /no longer available/,
  );
});
test("requests require organization review and a coordinator before scheduling", () => {
  let s = fresh();
  const id = s.requests[0].id;
  assert.throws(() => advanceRequest(s, id, "Completed"), /in order/);
  s = advanceRequest(s, id, "Arranging assistance");
  assert.throws(() => advanceRequest(s, id, "Scheduled"), /coordinator/);
  s = advanceRequest(s, id, "Scheduled", "Jordan — approved demo coordinator");
  assert.equal(
    s.requests[0].assignedVolunteer,
    "Jordan — approved demo coordinator",
  );
  s = advanceRequest(s, id, "Completed");
  assert.equal(s.requests[0].status, "Completed");
  assert.equal(initialState.requests[0].status, "Awaiting review");
});
test("seeded relationships and capacities are internally consistent", () => {
  const ids = new Set(seedLocations.map((l) => l.id));
  assert.equal(ids.size, 18);
  assert.equal(initialState.opportunities.length, 24);
  for (const o of initialState.opportunities) {
    assert.ok(ids.has(o.orgId));
    assert.ok(o.capacity >= o.filled);
    assert.ok(o.end > o.start);
    assert.ok(o.date >= today);
  }
  for (const r of initialState.requests) assert.ok(ids.has(r.locationId));
  assert.ok(nextDay(6) >= today);
  assert.equal(distance([40, -73], [40, -73]), 0);
});

test("shift expiration uses New York time, including a shift that ended earlier today", async () => {
  const { shiftHasEnded, datePlus } = await import("../src/lib/data");
  const now = new Date("2026-10-28T20:00:00Z");
  assert.equal(shiftHasEnded({ date: "2026-10-28", end: 15 }, now), true);
  assert.equal(shiftHasEnded({ date: "2026-10-28", end: 17 }, now), false);
  assert.equal(shiftHasEnded({ date: "2026-10-27", end: 23 }, now), true);
  assert.equal(datePlus("2026-12-31", 1), "2027-01-01");
});
