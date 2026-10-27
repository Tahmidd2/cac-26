# Prototype verification

Checked locally on October 26, 2026 (America/New_York).

- `npm run build`: strict TypeScript and production bundling pass; routes are code-split.
- `npm test`: 13 business-rule tests pass, including known access constraints, diet uncertainty, stale data, shift eligibility/capacity, duplicate prevention, ordered assistance transitions, and New York date handling.
- Dependency installation audit: zero known vulnerabilities after replacing the initial test-runner dependency tree. Final runtime audit also reports zero.
- Browser journeys: Queens food matching and visit confirmation; assistance submission, organizational review and scheduling, and family status update; creating a priority shift with six positions; volunteer discovery and signup, personal schedule, and organization capacity changing from 0/6 to 1/6.
- Organization distribution editing: saved pickup instructions appear immediately on the family-facing resource detail page.
- Map: numbered pins, actual OpenStreetMap tiles, persistent selected card/pin synchronization, keyboard marker activation, and mobile list/map resizing verified. Initial provider requiring a key was replaced before delivery.
- Responsive checks: primary pages have no horizontal document overflow at 390 CSS pixels. Home, food directory, and workspace also checked at 768 CSS pixels. Home and split food discovery checked at 1440 CSS pixels.
- Production console: no warnings or errors observed during final checks. Earlier development-only Fast Refresh messages were excluded from this production assessment.
- Preview demo data restored after verification. No real registrations, requests, or messages were sent.

Accessibility work includes labeled controls, focus indicators, keyboard marker activation, modal focus trapping, Escape dismissal, reduced motion, and improved text contrast. This is not a certification or a substitute for assistive-technology and user testing.

External fonts, photography, and map tiles need network access. Routing, sign-in, organizational verification, inventories, registrations, and delivery assistance remain explicitly simulated. See the main README for complete scope and limitations.
