import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Bookmark, ArrowLeft, Phone, ExternalLink } from "lucide-react";
import { useDemo } from "./lib/store";
import { days, time, formatDate } from "./lib/data";
import { serviceWindows, upcomingWindows } from "./lib/schedules";
import { Empty } from "./components/ui";
import FoodMap from "./components/Map";
import { Planner, Assistance } from "./Planning";
import { directionsUrl } from "./lib/routing";
export default function FoodDetail() {
  const { id } = useParams(),
    [params] = useSearchParams();
  const { state, update, journey } = useDemo();
  const [planning, setPlanning] = useState(false),
    [assisting, setAssisting] = useState(false),
    [preferredDate, setPreferredDate] = useState(params.get("visit") || "");
  const l = state.locations.find((l) => l.id === id);
  if (!l)
    return (
      <Empty title="Location Not Found">
        <Link className="button button-primary" to="/find-food">
          Back to Directory
        </Link>
      </Empty>
    );
  const real = l.sourceKind === "public",
    saved = state.saved.includes(l.id),
    next = upcomingWindows(l),
    windows = serviceWindows(l),
    shifts = state.opportunities.filter(
      (o) => o.orgId === l.id && o.active && o.filled < o.capacity,
    );
  const known = (v: boolean | null, yes: string, no: string) =>
    v === null ? "Not published — ask the provider" : v ? yes : no;
  return (
    <section className="content-page detail-page">
      <Link className="back-link" to="/find-food">
        <ArrowLeft size={16} />
        Back to Directory
      </Link>
      <div className="detail-heading">
        <div>
          <p className="page-context">
            {l.serviceTypes?.join(" & ") || l.type} in {l.borough}
          </p>
          <h1>{l.name}</h1>
          <p className="detail-address">
            {l.address}
            {!real ? `, ${l.borough}, NY ${l.zip}` : ""}
          </p>
        </div>
        <button
          className={`button button-outline ${saved ? "saved" : ""}`}
          onClick={() =>
            update((s) => ({
              ...s,
              saved: s.saved.includes(l.id)
                ? s.saved.filter((x) => x !== l.id)
                : [...s.saved, l.id],
            }))
          }
        >
          <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
          {saved ? "Saved" : "Save"}
        </button>
      </div>
      <div className={`listing-provenance ${real ? "" : "demo-provenance"}`}>
        <div>
          <span className="status-dot" />
          <strong>
            {real ? "NYC Food Help Listing" : "Sample Organization"}
          </strong>
          <span>
            {real
              ? `Source updated ${formatDate(l.updatedAt)}. Hours and food can change.`
              : "All services and schedules at this organization are simulated."}
          </span>
        </div>
        {real && (
          <a href={l.sourceUrl} target="_blank" rel="noreferrer">
            View Source
            <ExternalLink size={14} />
          </a>
        )}
      </div>
      <div className="detail-layout">
        <div>
          <section className="detail-section">
            <h2>Hours</h2>
            <p>
              {real
                ? "Hours as published in the city directory. Call ahead to confirm."
                : "Choose a sample distribution to plan a visit."}
            </p>
            {l.conditionalSchedule && (
              <div className="notice notice-warning">
                <p>
                  <strong>Schedule Note:</strong>{" "}
                  {l.scheduleNotes || l.postedSchedule} Check directly before
                  choosing a date.
                </p>
              </div>
            )}
            {next.length ? (
              <div className="distribution-dates">
                {next.map(({ date, window }, i) => (
                  <button
                    key={`${date}-${i}`}
                    onClick={() => {
                      setPreferredDate(date);
                      setPlanning(true);
                    }}
                  >
                    <span>
                      {i === 0 ? "Next Distribution" : "Following Distribution"}
                    </span>
                    <strong>{formatDate(date, true)}</strong>
                    <span>
                      {time(window.start)}–{time(window.end)}
                    </span>
                    <span className="schedule-service">{window.service}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="notice">
                <p>
                  No hours are published for this location. Call to confirm a
                  time.
                </p>
              </div>
            )}
            <details className="weekly-hours">
              <summary>Full Schedule</summary>
              <div>
                {days.map((day, i) => {
                  const rows = windows.filter((w) => w.day === i);
                  return (
                    <div key={day}>
                      <strong>{day}</strong>
                      <span>
                        {rows.length
                          ? rows.map((w, j) => (
                              <span key={j}>
                                {time(w.start)}–{time(w.end)}
                                {l.serviceTypes?.length === 2
                                  ? ` · ${w.service}`
                                  : ""}
                              </span>
                            ))
                          : "No published hours"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </details>
          </section>
          <section className="detail-section">
            <h2>Before You Go</h2>
            <p>{l.instructions}</p>
            <div className="detail-info-grid">
              <article>
                <h3>What to Bring</h3>
                <p>
                  {l.noId === null
                    ? "Ask whether ID, proof of address, or an appointment is needed. Bring a reusable bag if you can."
                    : l.noId
                      ? "No ID required in this sample. A bag or cart is helpful."
                      : "Photo ID is required in this sample."}
                </p>
              </article>
              <article>
                <h3>Appointments</h3>
                <p>
                  {known(
                    l.appointment,
                    "Appointment required. A visit plan does not book one.",
                    "No appointment required in this sample.",
                  )}
                </p>
              </article>
              <article>
                <h3>Dietary Needs</h3>
                <p>
                  {l.dietary.length
                    ? l.dietary.join(", ")
                    : "Not published. Call to ask about dietary choices and allergen safety."}
                </p>
              </article>
              <article>
                <h3>Accessibility</h3>
                <p>
                  {known(
                    l.accessible,
                    "Accessible entrance listed in sample data.",
                    "Entrance access needs confirmation.",
                  )}
                </p>
              </article>
              <article>
                <h3>Languages</h3>
                <p>
                  {l.languages.length
                    ? l.languages.join(", ")
                    : "Language assistance is not published. Ask the provider."}
                </p>
              </article>
              <article>
                <h3>Delivery</h3>
                <p>
                  {known(
                    l.delivery,
                    "Organization-coordinated assistance in the demo.",
                    "In-person pickup only in this sample.",
                  )}
                </p>
              </article>
            </div>
          </section>
          <section className="detail-section">
            <h2>Getting There</h2>
            <p>
              Get walking, driving, or transit directions in the visit planner.
            </p>
            <FoodMap
              compact
              locations={[l]}
              selected={l.id}
              onSelect={() => {}}
            />
            <div className="detail-map-actions">
              <button className="text-link" onClick={() => setPlanning(true)}>
                Plan Your Trip
              </button>
              <a
                className="text-link"
                href={directionsUrl(l, journey.transport, journey.area)}
                target="_blank"
                rel="noreferrer"
              >
                Open Directions
                <ExternalLink size={14} />
              </a>
            </div>
            {!real && (
              <p className="small muted">
                This is a fictional location at an illustrative intersection. Do
                not travel here.
              </p>
            )}
          </section>
          {real && (
            <section className="detail-section">
              <h2>About This Listing</h2>
              <p>
                Imported from NYC Food Help on{" "}
                {l.importedAt ? formatDate(l.importedAt.slice(0, 10)) : ""}.
                Listing does not guarantee service or reserve food.
              </p>
              <a
                className="text-link"
                href={l.sourceRecordUrl}
                target="_blank"
                rel="noreferrer"
              >
                View Source Record
                <ExternalLink size={14} />
              </a>
            </section>
          )}
          {!real && shifts.length > 0 && (
            <section className="detail-section">
              <h2>Volunteer Here</h2>
              {shifts.slice(0, 2).map((o) => (
                <Link
                  className="related-opportunity"
                  to={`/volunteer/${o.id}`}
                  key={o.id}
                >
                  <span>
                    <strong>{o.activity}</strong>
                    <small>
                      {formatDate(o.date)} · {time(o.start)}–{time(o.end)}
                    </small>
                  </span>
                  <span>{o.capacity - o.filled} demo spots</span>
                </Link>
              ))}
            </section>
          )}
        </div>
        <aside className="detail-sidebar">
          <div className="visit-card">
            <p className="page-context">Your next step</p>
            <h2>{next[0] ? formatDate(next[0].date) : "Call to Confirm"}</h2>
            <p>
              {next[0]
                ? `${time(next[0].window.start)}–${time(next[0].window.end)}`
                : "Contact the provider for its next distribution."}
            </p>
            <button
              className="button button-primary button-full"
              onClick={() => setPlanning(true)}
            >
              Plan My Visit
            </button>
            {real && l.phone && (
              <a
                className="button button-outline button-full"
                href={`tel:${l.phone.replace(/[^+\d]/g, "")}`}
              >
                <Phone size={16} />
                Call {l.phone}
              </a>
            )}
            {!real && l.delivery && (
              <button
                className="button button-outline button-full"
                onClick={() => setAssisting(true)}
              >
                Request Assistance (Demo)
              </button>
            )}
            <p className="visit-card-note">
              {real
                ? "Plans do not reserve food. Confirm before traveling."
                : "Demo visits do not reserve food or arrange real transport."}
            </p>
          </div>
          <div className="support-note">
            <h3>Need Help Getting There?</h3>
            <p>
              {real
                ? "Ask the provider about delivery, or call 311 for other options."
                : "Try the sample assistance flow to see how an organization can coordinate support."}
            </p>
            {real ? (
              <a className="text-link" href="tel:311">
                Call 311
              </a>
            ) : (
              <Link className="text-link" to="/resources">
                More Resources
              </Link>
            )}
          </div>
        </aside>
      </div>
      {planning && (
        <Planner
          location={l}
          preferredDate={preferredDate || undefined}
          onClose={() => setPlanning(false)}
        />
      )}
      {assisting && (
        <Assistance location={l} onClose={() => setAssisting(false)} />
      )}
    </section>
  );
}
