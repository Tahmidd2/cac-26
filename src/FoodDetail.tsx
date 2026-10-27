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
      <Empty title="This location is not in the directory.">
        <Link className="button button-primary" to="/find-food">
          Find another place
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
        Back to the directory
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
          {saved ? "Saved" : "Save place"}
        </button>
      </div>
      <div className={`listing-provenance ${real ? "" : "demo-provenance"}`}>
        <div>
          <span className="status-dot" />
          <strong>
            {real ? "Public NYC Food Help listing" : "Sample organization"}
          </strong>
          <span>
            {real
              ? `Source updated ${formatDate(l.updatedAt)}. Hours and food can change.`
              : "All services and schedules at this organization are simulated."}
          </span>
        </div>
        {real && (
          <a href={l.sourceUrl} target="_blank" rel="noreferrer">
            View the city source
            <ExternalLink size={14} />
          </a>
        )}
      </div>
      <div className="detail-layout">
        <div>
          <section className="detail-section">
            <h2>When to visit</h2>
            <p>
              {real
                ? "These are the hours published in the city directory. Call before you leave to confirm your day, eligibility, and available food."
                : "Choose a sample distribution to explore the complete visit workflow."}
            </p>
            {l.conditionalSchedule && (
              <div className="notice notice-warning">
                <p>
                  <strong>This schedule has conditions.</strong>{" "}
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
                      {i === 0 ? "Next posted window" : "Another posted window"}
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
                  No structured hours are published for this location. Call the
                  organization, then save the date and time you confirm in your
                  visit plan.
                </p>
              </div>
            )}
            <details className="weekly-hours">
              <summary>See the full posted schedule</summary>
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
            <h2>Before you go</h2>
            <p>{l.instructions}</p>
            <div className="detail-info-grid">
              <article>
                <h3>What to bring</h3>
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
                <h3>Dietary needs</h3>
                <p>
                  {l.dietary.length
                    ? l.dietary.join(", ")
                    : "Not published. Call to ask about dietary choices and allergen safety."}
                </p>
              </article>
              <article>
                <h3>Step-free access</h3>
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
            <h2>Your way there</h2>
            <p>
              Start from your neighborhood, check a route, and keep all the
              details together. Walking and driving routes can be retrieved in
              the planner.
            </p>
            <FoodMap
              compact
              locations={[l]}
              selected={l.id}
              onSelect={() => {}}
            />
            <div className="detail-map-actions">
              <button className="text-link" onClick={() => setPlanning(true)}>
                Plan the full journey
              </button>
              <a
                className="text-link"
                href={directionsUrl(l, journey.transport, journey.area)}
                target="_blank"
                rel="noreferrer"
              >
                Open directions
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
              <h2>About this information</h2>
              <p>
                This listing was imported from the query-only public layers used
                by NYC Food Help on{" "}
                {l.importedAt ? formatDate(l.importedAt.slice(0, 10)) : ""}. It
                is a directory record, not a partnership, food reservation, or
                guarantee of service.
              </p>
              <a
                className="text-link"
                href={l.sourceRecordUrl}
                target="_blank"
                rel="noreferrer"
              >
                Inspect the source record
                <ExternalLink size={14} />
              </a>
            </section>
          )}
          {!real && shifts.length > 0 && (
            <section className="detail-section">
              <h2>Help out here</h2>
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
            <h2>{next[0] ? formatDate(next[0].date) : "Confirm a time"}</h2>
            <p>
              {next[0]
                ? `${time(next[0].window.start)}–${time(next[0].window.end)}`
                : "Contact the provider for its next distribution."}
            </p>
            <button
              className="button button-primary button-full"
              onClick={() => setPlanning(true)}
            >
              Plan my visit
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
                Request demo assistance
              </button>
            )}
            <p className="visit-card-note">
              {real
                ? "A personal plan does not reserve food. Confirm directly before traveling."
                : "Demo visits do not reserve food or arrange real transport."}
            </p>
          </div>
          <div className="support-note">
            <h3>Need a hand with the trip?</h3>
            <p>
              {real
                ? "Call the provider to ask about pickup or delivery support. NYC 311 can also help you find other options."
                : "Try the sample assistance flow to see how an organization can coordinate support."}
            </p>
            {real ? (
              <a className="text-link" href="tel:311">
                Call NYC 311
              </a>
            ) : (
              <Link className="text-link" to="/resources">
                Find real support
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
