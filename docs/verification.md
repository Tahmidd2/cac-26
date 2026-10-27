# Verification

Checked locally October 26–27, 2026 (America/New_York).

## Build and rules

- `npm test`: **25 tests pass**. Coverage includes over 500 unique attributed public locations; unknown accommodation fields; valid minute-accurate weekly windows; all five closed borough geometries and all hub coordinates fitting a shared atlas; NYC and neighboring ZIP resolution; split-session arrival gaps and closing buffers; required provider acknowledgment; directions endpoints; manual transit-time bounds; a mocked two-leg OSRM contract; and the local pickup lifecycle.
- Existing volunteer age/availability/capacity/duplicate checks, assistance transitions, diet uncertainty, access constraints, and New York time handling continue to pass.
- `npm run build`: strict TypeScript and production bundling pass. Vite warns about the main chunk size because the complete directory and borough geometry are bundled. Current main chunk is approximately 1.22 MB, 230 KB gzip; this is documented rather than hidden with a warning-limit override.

## Browser checks

- Restarted the existing project development server and refreshed `http://localhost:5173`. CSS and both font families load. A fresh production preview independently renders styled content.
- Production home and directory: no console warnings or errors observed. OpenStreetMap tile images loaded, five borough paths and five permanent borough labels were present.
- Homepage: all 524 dots and five shoreline outlines render together; borough buttons update emphasis and counts (Queens 125). Hub hover/tap labels show name, service, borough, and ZIP.
- Directory: ZIP 11372 returns 119 public programs within five miles. Cluster distribution, labels, source schedules, pagination, and map/list selection are connected. Focusing a hub marker reveals its full name and service tooltip.
- Actual browser routing: Corpus Christi Food Pantry, Wednesday October 28 at 9:15 AM, generic starting ZIP 11372. Walking retrieval returned **21 minutes outward and 21 minutes home**, departure **8:54 AM**, street instructions, and route geometry on map tiles.
- Saved that test itinerary, opened My plan, marked travel started, and recorded a self-reported pickup. Removed the newly created test visit afterward, preserving prior browser state. No provider was called and no food was reserved. The confirmation checkbox was exercised as a local UI test, not a claim of an actual provider conversation.
- Transit handoff: Google Maps contains the selected origin, program coordinates, and transit mode. The MTA link is available. Transit times remain explicitly user-entered and acknowledged; no transit itinerary is fabricated.
- Responsive: home and directory have no horizontal document overflow at 390 CSS pixels. Mobile map/list switching produces a visible, correctly sized Leaflet map. Desktop checks include 1280 and 1440 CSS pixels; earlier layout checks also covered 768 pixels.
- Reduced motion is implemented through `prefers-reduced-motion` in CSS and motion hooks. Navigation and essential results remain available without reveal animation. This is implementation review, not an assistive-technology certification.

## Evidence

- `screenshots/borough-map-v2.png`: complete five-borough overview.
- `screenshots/home-desktop-v2.png` and `home-mobile-v2.png`: revised visual layout.
- `screenshots/directory-desktop-v2.png`: public directory and outlined Leaflet map.
- `screenshots/walking-route-v2.png`: retrieved walking route and departure time.
- `screenshots/pickup-record-v2.png`: self-reported local pickup result.

Organization accounts, volunteer registrations, and assistance dispatch remain demonstrations. Public food listings and retrieved street routes are real external data, subject to provider availability and source freshness. The development preview stays running for user review; the temporary production-check server is stopped after verification.
