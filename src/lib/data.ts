import type { FoodLocation, Opportunity, DemoState } from "./types";
import directorySnapshot from "../data/nyc-food-directory.json";
export const directoryMetadata = directorySnapshot.metadata;
export const publicLocations = directorySnapshot.locations as FoodLocation[];
export const foodPhoto =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=85";
export const volunteerPhoto = "/images/volunteers-unloading-produce.jpg";
export const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
export function localDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
export const today = localDate();
export function datePlus(date: string, count: number) {
  const d = new Date(date + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + count);
  return d.toISOString().slice(0, 10);
}
export function newYorkHour(now = new Date()) {
  return Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "numeric",
      hourCycle: "h23",
    }).format(now),
  );
}
export function newYorkMinutes(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(now);
  return (
    Number(parts.find((p) => p.type === "hour")?.value) * 60 +
    Number(parts.find((p) => p.type === "minute")?.value)
  );
}
export function shiftHasEnded(
  shift: Pick<Opportunity, "date" | "end">,
  now = new Date(),
) {
  const currentDate = localDate(now);
  return (
    shift.date < currentDate ||
    (shift.date === currentDate && shift.end <= newYorkHour(now))
  );
}
export function nextDay(day: number, offset = 0) {
  const d = new Date(today + "T12:00:00");
  return datePlus(today, ((day - d.getDay() + 7) % 7) + offset);
}
export function formatDate(date: string, long = false) {
  return new Date(date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: long ? "long" : "short",
    month: "short",
    day: "numeric",
  });
}
export function time(hour: number) {
  return `${Math.floor(hour) % 12 || 12}${Math.round((hour % 1) * 60) ? ":" + String(Math.round((hour % 1) * 60)).padStart(2, "0") : ""} ${hour >= 12 ? "PM" : "AM"}`;
}
export function nextDistribution(l: FoodLocation) {
  const weekday = new Date(today + "T12:00:00").getDay();
  const hour = newYorkHour();
  if (!l.days.length) return "";
  return datePlus(
    today,
    Math.min(
      ...l.days.map((d) => {
        const delta = (d - weekday + 7) % 7;
        return delta === 0 && hour >= l.end ? 7 : delta;
      }),
    ),
  );
}
const names = [
  [
    "Queens Table Community Pantry",
    "Jackson Heights",
    "Queens",
    "11372",
    "74th St & 37th Ave",
    40.7489,
    -73.8913,
  ],
  [
    "The Neighborhood Harvest",
    "Astoria",
    "Queens",
    "11102",
    "30th Ave & 31st St",
    40.767,
    -73.921,
  ],
  [
    "Common Ground Food Collective",
    "Bedford-Stuyvesant",
    "Brooklyn",
    "11216",
    "Fulton St & Nostrand Ave",
    40.68,
    -73.95,
  ],
  [
    "Greenpoint Giving Kitchen",
    "Greenpoint",
    "Brooklyn",
    "11222",
    "Manhattan Ave & Greenpoint Ave",
    40.73,
    -73.954,
  ],
  [
    "Eastside Community Table",
    "East Harlem",
    "Manhattan",
    "10029",
    "E 116th St & Lexington Ave",
    40.798,
    -73.941,
  ],
  [
    "Flushing Neighbors Pantry",
    "Flushing",
    "Queens",
    "11354",
    "Main St & 39th Ave",
    40.76,
    -73.83,
  ],
  [
    "Sunset Sharing Place",
    "Sunset Park",
    "Brooklyn",
    "11220",
    "5th Ave & 44th St",
    40.648,
    -74.007,
  ],
  [
    "Mott Haven Meal Project",
    "Mott Haven",
    "Bronx",
    "10454",
    "E 138th St & Brook Ave",
    40.808,
    -73.92,
  ],
  [
    "West Village Community Shelf",
    "West Village",
    "Manhattan",
    "10014",
    "Hudson St & W 10th St",
    40.734,
    -74.006,
  ],
  [
    "St. George Neighbors Network",
    "St. George",
    "Staten Island",
    "10301",
    "Stuyvesant Pl & Hyatt St",
    40.642,
    -74.078,
  ],
  [
    "Corona Fresh Food Circle",
    "Corona",
    "Queens",
    "11368",
    "Roosevelt Ave & 103rd St",
    40.75,
    -73.862,
  ],
  [
    "Prospect Community Kitchen",
    "Prospect Heights",
    "Brooklyn",
    "11238",
    "Vanderbilt Ave & Bergen St",
    40.677,
    -73.969,
  ],
  [
    "Uptown Harvest Hub",
    "Washington Heights",
    "Manhattan",
    "10033",
    "Broadway & W 181st St",
    40.851,
    -73.935,
  ],
  [
    "Riverdale Food Exchange",
    "Riverdale",
    "Bronx",
    "10471",
    "Riverdale Ave & W 259th St",
    40.907,
    -73.904,
  ],
  [
    "Elmhurst Open Table",
    "Elmhurst",
    "Queens",
    "11373",
    "Broadway & Elmhurst Ave",
    40.742,
    -73.881,
  ],
  [
    "Flatbush Community Basket",
    "Flatbush",
    "Brooklyn",
    "11226",
    "Flatbush Ave & Church Ave",
    40.65,
    -73.958,
  ],
  [
    "South Shore Sharing Pantry",
    "Great Kills",
    "Staten Island",
    "10308",
    "Giffords Ln & Amboy Rd",
    40.553,
    -74.151,
  ],
  [
    "Lower Eastside Food Friends",
    "Lower East Side",
    "Manhattan",
    "10002",
    "Essex St & Delancey St",
    40.718,
    -73.988,
  ],
] as const;
export const seedLocations: FoodLocation[] = names.map((n, i) => ({
  id: `food-${i + 1}`,
  sourceKind: "demo",
  name: n[0],
  neighborhood: n[1],
  borough: n[2],
  zip: n[3],
  address: n[4],
  lat: n[5],
  lng: n[6],
  type:
    i === 7 || i === 11
      ? "Prepared meals"
      : i === 10
        ? "Mobile distribution"
        : i === 12
          ? "Food bank"
          : "Food pantry",
  description:
    "A welcoming, neighborhood-led space bringing fresh food and a little more connection to our community. Everyone deserves a nourishing meal and a friendly face.",
  days:
    i === 0
      ? [1, 3, 6]
      : i === 7 || i === 11
        ? [0, 1, 2, 3, 4, 5, 6]
        : i === 3
          ? [3, 5]
          : [i % 7, (i + 3) % 7],
  start: i === 0 ? 13 : i === 7 ? 11 : 9 + (i % 5),
  end: i === 0 ? 17 : i === 7 ? 14 : 12 + (i % 5),
  dietary:
    i === 0
      ? ["Halal", "Vegetarian"]
      : i % 3 === 0
        ? ["Vegetarian", "Kosher"]
        : i % 3 === 1
          ? ["Vegetarian"]
          : ["Halal", "Vegetarian"],
  languages:
    i % 2 === 0 ? ["English", "Spanish", "Bengali"] : ["English", "Spanish"],
  accessible: i % 5 !== 4,
  delivery: i === 0 || i === 5 || i === 9 || i === 14,
  appointment: i % 6 === 5,
  noId: i % 4 !== 3,
  verified: i !== 13 && i !== 16,
  updatedAt: datePlus(today, i === 13 ? -40 : i === 16 ? -22 : -1 - (i % 4)),
  inventory: [
    "Seasonal produce",
    "Pantry staples",
    i % 2 ? "Bread & grains" : "Rice & lentils",
    i % 3 ? "Canned goods" : "Fresh dairy",
  ],
  instructions:
    "Please enter through the main entrance. Bring a reusable bag or a small cart if you have one. A neighbor at the welcome desk will help you get started.",
  image: foodPhoto,
  householdLimit: i === 16 ? 3 : undefined,
}));
const activities = [
  "Packing groceries",
  "Food distribution",
  "Meal preparation",
  "Sorting donations",
  "Community outreach",
  "Translation",
  "Delivery support",
];
export const seedOpportunities: Opportunity[] = Array.from(
  { length: 24 },
  (_, i) => ({
    id: `shift-${i + 1}`,
    orgId: `food-${(i % 18) + 1}`,
    title: [
      "Pack a little care into every box",
      "Help neighbors bring good food home",
      "Make a meal. Make someone’s day.",
      "Give good food a second beginning",
      "Be a friendly face in your neighborhood",
      "Help every neighbor feel understood",
      "Deliver a little everyday kindness",
    ][i % 7],
    activity: activities[i % 7],
    date: nextDay(i < 7 ? 6 : (i + 2) % 7, i > 17 ? 7 : 0),
    start: i % 3 === 0 ? 9 : i % 3 === 1 ? 10 : 13,
    end: i % 3 === 0 ? 12 : i % 3 === 1 ? 12 : 16,
    capacity: 8 + (i % 5),
    filled: 2 + (i % 5),
    priority: i < 4 || i === 9,
    active: true,
    minAge: i % 7 === 6 ? 21 : i % 4 === 0 ? 16 : 14,
    accessible: i % 7 !== 6 && i % 6 !== 5,
    group: i % 3 === 0,
    recurring: i % 4 === 0,
    requirements:
      i % 7 === 6
        ? ["Valid driver’s license", "Organization approval required"]
        : ["Comfortable shoes", "Brief orientation included"],
    description:
      "Spend a few meaningful hours alongside a welcoming team of neighbors. We’ll show you everything you need to know. No previous experience needed.",
  }),
);
export const initialState: DemoState = {
  version: 2,
  role: "Family",
  locations: [...publicLocations, ...seedLocations],
  opportunities: seedOpportunities,
  signups: [],
  plans: [],
  saved: [],
  requests: [
    {
      id: "request-seed-1",
      locationId: "food-1",
      area: "Jackson Heights",
      type: "Food delivery",
      date: nextDay(3),
      window: "Afternoon (12–5 PM)",
      status: "Awaiting review",
      createdAt: today,
    },
    {
      id: "request-seed-2",
      locationId: "food-1",
      area: "Elmhurst",
      type: "Pickup assistance",
      date: nextDay(3),
      window: "Afternoon (12–5 PM)",
      status: "Arranging assistance",
      createdAt: today,
    },
    {
      id: "request-seed-3",
      locationId: "food-1",
      area: "Woodside",
      type: "Transportation information",
      date: nextDay(6),
      window: "Morning (9 AM–12 PM)",
      status: "Scheduled",
      assignedVolunteer: "Jordan — sample coordinator",
      createdAt: today,
    },
    {
      id: "request-seed-4",
      locationId: "food-1",
      area: "Corona",
      type: "Food delivery",
      date: today,
      window: "Afternoon (12–5 PM)",
      status: "Completed",
      createdAt: today,
    },
  ],
};
