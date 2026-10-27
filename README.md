# Nourish

**Good food, within reach.** A New York guide with 524 real public food programs, practical trip planning, and a separate demonstration of volunteer and organization coordination.

## Run locally

Use Node.js 22+ and npm. No API keys or environment variables are required.

```sh
npm install
npm run dev
npm test
npm run build
npm run preview
```

Vite serves the app at `http://localhost:5173`. A production static host must rewrite application routes to `index.html`.

## Food search through pickup

1. Search a ZIP code, neighborhood, or borough. The default directory contains **524 public NYC Food Help programs**, with real coordinates, addresses, phone numbers, source dates, and posted schedules. Filters distinguish known and unpublished requirements.
2. Read the exact distribution sessions and conditions. Call the provider to confirm hours, pickup requirements, and available food. The planner requires a personal acknowledgment before saving a public-program visit.
3. Choose an approximate starting area and transport. Walking and driving retrieve an actual outward-and-return street route from FOSSGIS/OpenStreetMap, including geometry, instructions, separate travel times, and departure time. Transit opens Google Maps with both endpoints or the official MTA planner; enter and acknowledge the times from that itinerary.
4. Review and save the trip. My plan includes the origin, transport, departure, arrival, trip home, directions, checklist, and calendar export. Mark travel started and record successful or unsuccessful pickup. Outcomes are personal, self-reported records in this browser.

This does not reserve food, book appointments, contact providers, or dispatch transport. Public schedules are a dated snapshot and can change. Live transit, traffic, fares, and wheelchair routing are not supplied by Nourish.

## Network and maps

The snapshot covers Brooklyn (184), Queens (125), Bronx (106), Manhattan (86), and Staten Island (23). Census ZIP-area centers support 2,712 NY/NJ/CT starting ZIP codes, plus named neighborhoods. **Program coverage remains NYC's five boroughs**; nearby ZIP support does not imply a statewide food network.

The homepage atlas draws all five official NYC Department of City Planning borough boundaries, with a shared Mercator projection for every program dot. Hover a dot for its hub name. The directory map has the same outlines, permanent borough labels, service colors, clusters, hover/focus hub labels, and synchronized list selection. At close zoom, overlapping programs can be chosen from a cluster list. Switching mobile map/list views recalculates map dimensions.

Sources, dates, import rules, and refresh instructions are in [data sources](docs/data-sources.md). Refresh with:

```sh
node scripts/import-food-directory.mjs
```

The importer rejects incomplete responses, inactive records, invalid coordinates, and duplicate name/address pairs. It retains source references and edit dates. Unpublished access, ID, appointment, dietary, and delivery details remain unknown.

## Visual design

Outfit headlines, DM Sans interface text, forest green and cabbage accents, an original grocery-sharing photograph, flat directory rows, and a clear three-step journey create a neighborhood food-guide identity. Light section fades, restrained hero parallax, scroll-driven journey progress, and a borough outline introduction respect `prefers-reduced-motion`. Essential controls and search results remain available without animation.

Research, the installed frontend-design skill, and the hero prompt are recorded in [design direction](docs/design-direction.md). Browser evidence is recorded in [verification](docs/verification.md).

## Separate demonstration workflows

The 18 sample organizations, 24 volunteer opportunities, volunteer signups, staffing counts, and assistance coordination remain explicitly fictional. Choose **Explore the demo** for roles. The workspace edits only sample organizations. Public organizations are never presented as partners or given invented volunteer needs or delivery capacity.

- Volunteer discovery/matching supports requirements, age, availability, capacity, duplicate-safe signup, cancellation, and a personal schedule.
- The workspace supports distribution editing, opportunity creation/editing/closing, registrations, and ordered assistance transitions. Review and an approved sample coordinator are required before scheduling.
- Sample assistance requests connect a family's plan to the workspace. They do not arrange real delivery or assistance.

## Architecture and persistence

React 19, TypeScript, Vite, React Router, Lucide, Leaflet/react-leaflet, and Node's test runner.

- `src/lib/data.ts` and `src/data/`: attributed public records, geography, fictional seeds, and New York date helpers.
- `src/lib/services.ts` and `schedules.ts`: area resolution, matching, schedules, visit outcomes, volunteer capacity, and assistance transitions.
- `src/lib/routing.ts`: rate-limited street routing, external planner links, and calendar export.
- `src/lib/store.tsx`: shared state and v1-to-v2 migration. Public records load from the current snapshot. Editable demo data and personal plans persist under `nourish-demo-v2`.
- `src/components/Motion.tsx`, `Map.tsx`, and `TripMap.tsx`: reduced-motion-aware reveals, hub maps, and route display.
- `tests/`: business rules, data integrity, atlas projection, routing contract, schedule gaps, and the visit lifecycle.

Household, diet, and matching preferences stay in memory. Plans store general starting areas, selected resources, dates, routes, checklists, and self-reported outcomes. Avoid sensitive details in optional notes. Data stays in one browser; there is no cross-device database, authentication server, real booking, or notification system.

Routing sends approximate endpoints to FOSSGIS. Requests are serialized at least 1.1 seconds apart, with a 30-minute memory cache. Production use needs routing capacity and source update agreements appropriate to traffic. OpenStreetMap tiles, Google Fonts, and the Unsplash volunteer photograph need internet access; the original hero is local. Tile-failure notices and external directions cover service outages. The bundled directory and geographic data currently produce a Vite chunk-size warning; compression helps, but public deployment should split and cache these assets.

## Credits

[NYC Food Help](https://finder.nyc.gov/foodhelp/), [NYC DCP boundaries](https://data.cityofnewyork.us/City-Government/Borough-Boundaries/gthc-hcne), [Census Gazetteer](https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.2024.html), [FOSSGIS routing](https://routing.openstreetmap.de/about.html), [OpenStreetMap](https://www.openstreetmap.org/copyright), Google Fonts, Unsplash, and Lucide. The grocery-sharing hero was generated for this app. The repository retains its existing license.
