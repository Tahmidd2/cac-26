# Nourish

**Good food, within reach.** A responsive, connected prototype for community food access, volunteering, and organization coordination. Built locally in this repository; no accounts, credentials, backend, or deployment required.

## Run it

Use Node.js 22+ and npm.

```sh
npm install
npm run dev
```

Open the Local URL printed by Vite (normally `http://localhost:5173`).

```sh
npm test         # Essential business rules using Node's test runner
npm run build   # Strict TypeScript checks and a production build
npm run preview # Serve the production build
npm run format  # Format project source with Prettier
```

No environment variables are required. A production static host must rewrite application routes to `index.html`.

## Explore the connected demo

1. **A parent in Queens:** Open **Find food → Find my food match**. Defaults represent a household of four in ZIP 11372, available Wednesday afternoon, traveling by public transit for up to 45 minutes. Review match explanations, open Queens Table Community Pantry, and choose **Plan my visit**. Save the visit, then use its preparation checklist under **My plan**.
2. **A Saturday volunteer:** Open **Volunteer**, filter to Saturday, and explore a shift. Complete **Demo signup**, acknowledging the requirements and minimum age. The shift appears in **My volunteer schedule** and its open capacity decreases. Canceling restores the capacity. Volunteer matching offers a separate three-step flow.
3. **An organization seeking six volunteers:** Choose **Explore demo → Organization**, then **Volunteer shifts → Create opportunity**. Create a future shift with capacity six and high priority. It appears immediately in volunteer discovery. Demo registrations update the workspace's staffing counts. Edit, close, and reopen shifts.
4. **A family needing assistance:** At Queens Table's detail page, choose **Request assistance**, review, and submit. Open the organization workspace for Queens Table, then **Assistance requests**. Approve, arrange, assign the sample approved coordinator, schedule, and complete the request. The status updates under the family's **My plan**.

The workspace organization selector lets you inspect requests and edit distributions for all 18 sample organizations. **Save & confirm demo information** updates directory cards, details, and matching. Use **Reset demo** in the desktop workspace or clear the `nourish-demo-v1` local-storage key to restore the original seed data.

## What is included

- Warm, cohesive design system; responsive home, directory, detail, matching, planning, volunteer, organization, resource, and demo-authentication pages.
- Food search by supported NYC ZIP code, neighborhood, or borough; radius, day, food type, transport, delivery, accessibility, dietary, documentation, appointment, language, and saved-location filters.
- Interactive Leaflet map with synchronized card selection, labeled numbered markers, zoom controls, and a tile-failure notice. Mobile list/map toggle.
- Transparent rule-based food ranking, including time availability, travel limits, household limits, known accessibility and delivery requirements, diet uncertainty, and data verification.
- Saved locations and side-by-side comparison, weekly visits, editable plans, preparation checklists, and assistance request tracking.
- Volunteer discovery, preference matching, documented demo priority, eligibility requirements, duplicate-safe capacity checks, registration, cancellation, and a personal schedule.
- Organization overview, distribution editor, opportunity creation/editing, closing/reopening, registrations, and an assistance status board.
- Keyboard-accessible navigation, modal focus trapping and Escape dismissal, visible focus, reduced-motion support, labeled forms, and meaningful empty/success states.
- Direct links to official assistance information. The app is complete in English; other languages are not advertised as implemented.

## Technologies and architecture

**React 19, TypeScript, Vite, React Router, Lucide, Leaflet/react-leaflet, CSS, Node's test runner.** A browser-only Vite application keeps the prototype fast to start and avoids unnecessary authentication or server infrastructure. CSS tokens and shared components maintain visual consistency. Route-level lazy loading keeps map and workflow code off the initial landing-page bundle.

- `src/lib/types.ts`: typed relationships and model contracts.
- `src/lib/data.ts`: 18 fictional NYC organizations, 24 shifts, four sample assistance requests, and date formatting/seeding helpers.
- `src/lib/services.ts`: location resolution, distance/travel estimates, food and volunteer ranking, registration constraints, and validated assistance transitions. These pure functions form the replaceable service boundary for future APIs.
- `src/lib/store.tsx`: central demo repository/provider, shared state, and versioned browser-local persistence.
- `src/components/`: navigation, UI primitives, food cards, and map.
- `src/Home.tsx`, `FindFood.tsx`, `FoodDetail.tsx`, `Matching.tsx`, `Planning.tsx`, `Volunteer.tsx`, `Organizations.tsx`, `Resources.tsx`: complete user flows.
- `src/styles.css`: design tokens, shared visual system, desktop/tablet/mobile layouts, and reduced-motion rules.
- `tests/services.test.ts`: hard constraints, uncertain diets, stale data, volunteer ranking, capacity, duplicate prevention, and assistance transitions.

Dates are generated relative to the current date in `America/New_York`. Distribution days are recurring weekly examples. A location's next distribution skips today's window when its closing hour has passed. Volunteer dates are seeded on the initial browser session and persist; reset the demo to regenerate them later.

## What is simulated

**Every organization, intersection marker, schedule, food category, dietary accommodation, delivery service, verification label, staffing need, registration, assistance request, and impact figure is fictional demonstration data.** There are no real organizational partners or real verified inventories. Public links in the resource hub are the exception and lead to actual third-party services.

- No secure authentication, real accounts, emails, texts, bookings, payments, or notifications.
- No real food reservation, appointment, delivery, or volunteer registration is created.
- Travel times are clearly labeled illustrative estimates from straight-line distance and fixed assumptions, not retrieved routes. Fares, transfers, walking connections, and live transport are unavailable. External directions are provided for routing-provider handoff, and fictional-location warnings remain visible.
- Search resolves only seeded ZIP codes, neighborhoods, boroughs, or NYC. Unsupported areas receive a useful empty state. Explicit browser geolocation resolves to the nearest sample neighborhood and discards the precise coordinates; NYC coverage limits are explained.
- Preferences remain component-local. Demo persistence includes only general neighborhoods, resource IDs, dates, roles, schedules, and checklist/status values. Do not enter precise addresses or sensitive information into free-text demo fields.
- Data is shared across views in the same browser, not between devices. There is no cross-user or real-time backend.
- Map tiles use CARTO/OpenStreetMap, photographs use Unsplash, and fonts use Google Fonts. These optional assets need internet access. The directory and workflows still function without map tiles, and system-font/image-background fallbacks preserve the layout. Asset providers receive ordinary network requests; browser location is requested only after an explicit action.

## Toward a real deployment

Replace the mock repository with authorized organization APIs and a secure database; add authenticated organization roles and server-enforced authorization. Research source licensing and update/freshness contracts before integrating any directory. Add service-area geocoding and a licensed routing provider with verified transit details. Work with partner organizations to establish consent, volunteer checks, safeguarding, private delivery coordination, and contact processes. Add full accessibility auditing, localized copy, integration tests, reliable storage migrations, and privacy review before using real household information. Measure successful food pickups and completed assistance rather than clicks alone.

## External resources and credits

Official links were checked during implementation; providers control their current content and processes:

- [NYC Food Help](https://finder.nyc.gov/foodhelp/)
- [NYC HRA SNAP information](https://www.nyc.gov/site/hra/help/snap-benefits-food-program.page)
- [NYC Public Schools meals](https://www.schools.nyc.gov/school-life/school-meals)
- [WIC at ACCESS NYC](https://access.nyc.gov/programs/women-infants-and-children-wic/)
- [Feeding America food bank finder](https://www.feedingamerica.org/need-help-find-food)
- [NYC 311](https://portal.311.nyc.gov/)

Map attribution is displayed on the map. Photography is supplied by Unsplash; typography is DM Sans and Manrope from Google Fonts. Icons are Lucide. This repository retains its existing license.
