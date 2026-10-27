import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Phone,
  ExternalLink,
  TrainFront,
  Footprints,
  Car,
  LoaderCircle,
  Download,
  Bookmark,
  Trash2,
  HandHeart,
} from "lucide-react";
import { Modal, Badge, Success, Empty } from "./components/ui";
import { useDemo } from "./lib/store";
import type {
  FoodLocation,
  Transport,
  VisitPlan,
  TravelRoute,
} from "./lib/types";
import { today, nextDistribution, formatDate, time, days } from "./lib/data";
import { resolveArea } from "./lib/services";
import {
  upcomingWindows,
  windowsForDate,
  validateVisit,
  minutesTime,
  setVisitStatus,
} from "./lib/schedules";
import { directionsUrl, retrieveRoute, calendarDownload } from "./lib/routing";
import TripMap from "./components/TripMap";
export const directions = directionsUrl;
function prettyMinutes(n: number) {
  return n >= 60
    ? `${Math.floor(n / 60)} hr${n % 60 ? ` ${n % 60} min` : ""}`
    : `${n} min`;
}
function clock(minutes: number) {
  return time((((minutes % 1440) + 1440) % 1440) / 60);
}
export function Planner({
  location: l,
  onClose,
  existing,
  preferredDate,
}: {
  location: FoodLocation;
  onClose: () => void;
  existing?: VisitPlan;
  preferredDate?: string;
}) {
  const { state, update, journey } = useDemo();
  const real = l.sourceKind === "public";
  const next = upcomingWindows(l, 1)[0];
  const defaultDate =
    preferredDate &&
    /^\d{4}-\d{2}-\d{2}$/.test(preferredDate) &&
    preferredDate >= today
      ? preferredDate
      : next?.date || today;
  const initialWindow =
    windowsForDate(l, existing?.date || defaultDate).find((w) =>
      journey.period === "Afternoon"
        ? w.end > 12
        : journey.period === "Morning"
          ? w.start < 12
          : true,
    ) || windowsForDate(l, existing?.date || defaultDate)[0];
  const [step, setStep] = useState(0),
    [area, setArea] = useState(existing?.originArea || journey.area),
    [transport, setTransport] = useState<Transport>(
      existing?.transport ||
        (journey.transport === "Delivery"
          ? "Public transit"
          : journey.transport),
    ),
    [date, setDate] = useState(existing?.date || defaultDate),
    [arrival, setArrival] = useState(
      existing?.arrivalMinutes ||
        Math.round(
          initialWindow
            ? Math.min(
                initialWindow.end * 60 - 10,
                Math.max(
                  initialWindow.start * 60 + 15,
                  journey.period === "Afternoon" && initialWindow.end > 12
                    ? 12 * 60 + 15
                    : 0,
                ),
              )
            : 13 * 60 + 15,
        ),
    ),
    [confirmed, setConfirmed] = useState(existing?.providerConfirmed || !real),
    [route, setRoute] = useState<TravelRoute | undefined>(existing?.route),
    [outbound, setOutbound] = useState(existing?.outboundMinutes || 0),
    [returnMinutes, setReturnMinutes] = useState(existing?.returnMinutes || 0),
    [transitChecked, setTransitChecked] = useState(
      existing?.travelTimeSource === "user",
    ),
    [loading, setLoading] = useState(false),
    [routeError, setRouteError] = useState(""),
    [error, setError] = useState(""),
    [done, setDone] = useState(false);
  const abort = useRef<AbortController | null>(null);
  useEffect(() => () => abort.current?.abort(), []);
  const origin = resolveArea(area, state.locations),
    windows = windowsForDate(l, date);
  const matched = windows.find(
    (w) => arrival >= w.start * 60 && arrival <= w.end * 60 - 10,
  );
  const departure = outbound ? arrival - outbound : null;
  function clearRoute() {
    abort.current?.abort();
    setRoute(undefined);
    setOutbound(0);
    setReturnMinutes(0);
    setRouteError("");
    setTransitChecked(false);
    setLoading(false);
  }
  async function calculate() {
    if (!origin) {
      setRouteError("Enter a supported ZIP code or neighborhood.");
      return;
    }
    if (transport !== "Walking" && transport !== "Driving") return;
    setLoading(true);
    setRouteError("");
    const controller = new AbortController();
    abort.current = controller;
    try {
      const result = await retrieveRoute(
        origin,
        [l.lat, l.lng],
        transport,
        controller.signal,
      );
      if (controller.signal.aborted) return;
      setRoute(result);
      setOutbound(result.outboundMinutes);
      setReturnMinutes(result.returnMinutes);
    } catch (err) {
      if ((err as Error).name !== "AbortError")
        setRouteError(
          "A route could not be retrieved. Open directions, check the trip there, and enter its travel times below.",
        );
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }
  function continueStep() {
    setError("");
    if (step === 0) {
      const issue = validateVisit(l, {
        date,
        arrivalMinutes: arrival,
        providerConfirmed: confirmed,
      });
      if (issue) {
        setError(issue);
        return;
      }
      setStep(1);
      return;
    }
    if (!origin) {
      setError("Enter a ZIP code or neighborhood that we can locate.");
      return;
    }
    if (!outbound || !returnMinutes) {
      setError(
        "Retrieve a route, or check an external planner and enter both one-way and return travel times.",
      );
      return;
    }
    if (!route && !transitChecked) {
      setError(
        "Confirm that you checked these travel times in a directions planner.",
      );
      return;
    }
    const issue = validateVisit(l, {
      date,
      arrivalMinutes: arrival,
      outboundMinutes: outbound,
      providerConfirmed: confirmed,
    });
    if (issue) {
      setError(issue);
      return;
    }
    setStep(2);
  }
  function save() {
    const plan: VisitPlan = {
      id: existing?.id || crypto.randomUUID(),
      locationId: l.id,
      date,
      transport,
      checklist: existing?.checklist || [],
      originArea: area.trim(),
      arrivalMinutes: arrival,
      windowStart: matched?.start,
      windowEnd: matched?.end,
      route,
      outboundMinutes: outbound,
      returnMinutes,
      travelTimeSource: route ? "route" : "user",
      providerConfirmed: confirmed,
      status: existing?.status || "Planned",
    };
    const issue = validateVisit(l, plan);
    if (issue) {
      setError(issue);
      return;
    }
    if (
      state.plans.some(
        (p) =>
          p.id !== existing?.id && p.locationId === l.id && p.date === date,
      )
    ) {
      setError(
        "This place is already in your plan for that date. Adjust the existing visit instead.",
      );
      return;
    }
    update((s) => ({
      ...s,
      plans: existing
        ? s.plans.map((p) => (p.id === existing.id ? plan : p))
        : [...s.plans, plan],
    }));
    setDone(true);
  }
  return (
    <Modal
      title={
        done
          ? "Your next step is saved."
          : existing
            ? "Adjust your visit"
            : "Plan your visit"
      }
      onClose={onClose}
      wide
    >
      {done ? (
        <>
          <Success title="A plan you can take with you.">
            Your visit to {l.name} is saved in this browser.{" "}
            {real
              ? "Food has not been reserved."
              : "This is a demonstration visit to a fictional organization."}
          </Success>
          <div className="form-actions">
            <button
              className="button button-outline"
              onClick={() =>
                calendarDownload({
                  name: l.name,
                  date,
                  arrivalMinutes: arrival,
                  address: l.address,
                })
              }
            >
              <Download size={16} />
              Add to calendar
            </button>
            <Link
              to="/my-plan"
              className="button button-primary"
              onClick={onClose}
            >
              View my plan
            </Link>
          </div>
        </>
      ) : (
        <>
          <div className="planner-destination">
            <div>
              <strong>{l.name}</strong>
              <small>
                {l.borough} {l.zip}
                {!real ? " · Sample organization" : ""}
              </small>
            </div>
            <span className="plain-tag">{step + 1} of 3</span>
          </div>
          <ol className="journey-steps" aria-label="Visit planning progress">
            {["Choose a time", "Plan the journey", "Review & save"].map(
              (label, i) => (
                <li
                  key={label}
                  className={
                    i === step ? "current" : i < step ? "complete" : ""
                  }
                >
                  <span>{i < step ? <Check size={13} /> : i + 1}</span>
                  {label}
                </li>
              ),
            )}
          </ol>
          {step === 0 ? (
            <div className="planner-step">
              <h3>Start with a time that works.</h3>
              <p className="muted">
                {real
                  ? "Call to confirm the published hours and pickup requirements before planning your trip."
                  : "Choose a distribution time to try the connected demo."}
              </p>
              {real && l.phone && (
                <a
                  className="call-provider"
                  href={`tel:${l.phone.replace(/[^+\d]/g, "")}`}
                >
                  <Phone size={17} />
                  <span>
                    Call {l.name}
                    <strong>{l.phone}</strong>
                  </span>
                  <ExternalLink size={14} />
                </a>
              )}
              <div className="form-grid">
                <label className="field">
                  Visit date
                  <input
                    type="date"
                    min={today}
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      const w = windowsForDate(l, e.target.value)[0];
                      if (w) setArrival(Math.round(w.start * 60 + 15));
                      setConfirmed(!real);
                    }}
                    required
                  />
                </label>
                <label className="field">
                  Arrival time
                  <input
                    type="time"
                    value={minutesTime(arrival)}
                    onChange={(e) => {
                      const [h, m] = e.target.value.split(":").map(Number);
                      setArrival(h * 60 + m);
                    }}
                    required
                  />
                </label>
              </div>
              <div className="posted-windows">
                <strong>
                  Published for {date ? formatDate(date) : "this day"}
                </strong>
                {windows.length ? (
                  windows.map((w, i) => (
                    <span key={i}>
                      {time(w.start)}–{time(w.end)}
                      {w.service ? ` · ${w.service}` : ""}
                    </span>
                  ))
                ) : (
                  <span>
                    No structured hours. Confirm this date and time with the
                    provider.
                  </span>
                )}
              </div>
              {l.conditionalSchedule && (
                <div className="notice notice-warning">
                  <p>
                    <strong>Additional schedule conditions:</strong>{" "}
                    {l.scheduleNotes || l.postedSchedule}
                  </p>
                </div>
              )}
              <div className="notice">
                <p>{l.instructions}</p>
              </div>
              {real && (
                <label className="checkbox-label confirmation-check">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                  />
                  I confirmed this visit’s date, hours, and pickup requirements
                  with the provider.
                </label>
              )}
            </div>
          ) : step === 1 ? (
            <div className="planner-step">
              <h3>Let’s work out the trip.</h3>
              <p className="muted">
                Your route starts from an approximate neighborhood or ZIP-area
                center. Your home address is not needed.
              </p>
              <label className="field">
                Starting ZIP code or neighborhood
                <input
                  value={area}
                  onChange={(e) => {
                    setArea(e.target.value);
                    clearRoute();
                  }}
                  placeholder="e.g. 11372 or Harlem"
                  maxLength={60}
                />
              </label>
              <div className="transport-options">
                {(
                  [
                    [TrainFront, "Public transit"],
                    [Footprints, "Walking"],
                    [Car, "Driving"],
                  ] as const
                ).map(([Icon, t]) => (
                  <button
                    type="button"
                    key={t}
                    aria-pressed={transport === t}
                    className={transport === t ? "chosen" : ""}
                    onClick={() => {
                      setTransport(t);
                      clearRoute();
                    }}
                  >
                    <Icon size={22} />
                    {t}
                  </button>
                ))}
              </div>
              {transport === "Public transit" ? (
                <div className="transit-handoff">
                  <h4>Check the actual connection.</h4>
                  <p>
                    Transit schedules and transfers need a current itinerary.
                    Open directions with both endpoints filled in, choose your
                    arrival date and time, then enter the journey times it gives
                    you.
                  </p>
                  <a
                    className="button button-primary"
                    href={directionsUrl(l, transport, area)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open transit directions
                    <ExternalLink size={15} />
                  </a>
                  <a
                    className="text-link"
                    href="https://new.mta.info/trip-planner"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Use the official MTA planner
                  </a>
                </div>
              ) : (
                <>
                  <div className="route-actions">
                    <button
                      className="button button-primary"
                      disabled={loading || !origin}
                      onClick={calculate}
                    >
                      {loading ? (
                        <>
                          <LoaderCircle size={16} className="spin" />
                          Retrieving a street route…
                        </>
                      ) : route ? (
                        "Refresh street route"
                      ) : (
                        `Retrieve ${transport.toLowerCase()} route`
                      )}
                    </button>
                    <a
                      className="text-link"
                      href={directionsUrl(l, transport, area)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open directions
                      <ExternalLink size={14} />
                    </a>
                  </div>
                  <p className="route-privacy">
                    The routing request sends approximate endpoints to
                    FOSSGIS/OpenStreetMap. No home address is sent.
                  </p>
                </>
              )}
              {routeError && (
                <p className="error-text" role="status">
                  {routeError}
                </p>
              )}
              {route ? (
                <>
                  <div className="travel-summary">
                    <div>
                      <small>To the pantry</small>
                      <strong>{prettyMinutes(route.outboundMinutes)}</strong>
                    </div>
                    <div>
                      <small>Trip home</small>
                      <strong>{prettyMinutes(route.returnMinutes)}</strong>
                    </div>
                    <div>
                      <small>Leave by</small>
                      <strong>
                        {departure !== null ? clock(departure) : "—"}
                      </strong>
                    </div>
                  </div>
                  <TripMap route={route} />
                  <p className="route-provenance">
                    Retrieved from {route.provider}. No live traffic, fares, or
                    wheelchair-accessibility guarantee.
                  </p>
                  <details className="route-instructions">
                    <summary>Street-by-street directions</summary>
                    <ol>
                      {route.steps.map((s, i) => (
                        <li key={i}>
                          <span>{s.instruction}</span>
                          <small>
                            {s.meters < 1000
                              ? `${Math.round(s.meters)} m`
                              : `${(s.meters / 1000).toFixed(1)} km`}
                          </small>
                        </li>
                      ))}
                    </ol>
                  </details>
                </>
              ) : (
                <div className="manual-route">
                  <h4>
                    {transport === "Public transit"
                      ? "Add the times from your itinerary"
                      : "Or add times from another directions planner"}
                  </h4>
                  <div className="form-grid">
                    <label className="field">
                      One-way travel time (minutes)
                      <input
                        type="number"
                        min="1"
                        max="600"
                        value={outbound || ""}
                        onChange={(e) => setOutbound(Number(e.target.value))}
                        placeholder="e.g. 25"
                      />
                    </label>
                    <label className="field">
                      Return travel time (minutes)
                      <input
                        type="number"
                        min="1"
                        max="600"
                        value={returnMinutes || ""}
                        onChange={(e) =>
                          setReturnMinutes(Number(e.target.value))
                        }
                        placeholder="e.g. 30"
                      />
                    </label>
                  </div>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={transitChecked}
                      onChange={(e) => setTransitChecked(e.target.checked)}
                    />
                    I checked these times
                    {transport === "Public transit"
                      ? ", walking connections, and transfers"
                      : ""}{" "}
                    in a directions planner.
                  </label>
                  <p className="route-provenance">
                    These times are entered by you, not retrieved or verified by
                    Nourish.
                  </p>
                </div>
              )}
              {outbound > 60 && (
                <div className="notice notice-warning">
                  <p>
                    This is a long trip. Consider a closer location or ask the
                    provider about transport assistance.
                  </p>
                </div>
              )}
              {journey.accessible && (
                <div className="notice">
                  <p>
                    Street routing does not verify wheelchair or step-free
                    access. Confirm the full route with an accessible travel
                    planner before leaving.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="planner-step">
              <h3>The plan, all in one place.</h3>
              <div className="trip-timeline">
                <div>
                  <span className="timeline-point" />
                  <small>Leave your neighborhood</small>
                  <strong>
                    {departure !== null
                      ? clock(departure)
                      : "Check departure time"}
                  </strong>
                  <p>
                    {area} · {transport}
                  </p>
                </div>
                <div>
                  <span className="timeline-point" />
                  <small>Arrive at the food program</small>
                  <strong>{clock(arrival)}</strong>
                  <p>
                    {formatDate(date, true)} · {l.name}
                  </p>
                  <span className="plain-tag">
                    {outbound} min out · {returnMinutes} min home
                  </span>
                </div>
                <div>
                  <span className="timeline-point" />
                  <small>Before heading home</small>
                  <strong>Check in & collect food</strong>
                  <p>
                    Bring a reusable bag and any documents you confirmed with
                    the provider.
                  </p>
                </div>
              </div>
              <div className="notice">
                <p>
                  {real
                    ? "Your schedule confirmation and personal visit plan do not guarantee inventory or reserve food."
                    : "This organization is fictional. Use this plan to explore the demo, not to travel."}{" "}
                  {route
                    ? "Travel times are from a retrieved street route."
                    : "Travel times were entered by you from an external planner."}
                </p>
              </div>
            </div>
          )}
          {error && (
            <p className="error-text" role="alert">
              {error}
            </p>
          )}
          <div className="planner-footer">
            <button
              className="text-link"
              onClick={() => (step ? setStep(step - 1) : onClose())}
            >
              {step ? "Back" : "Cancel"}
            </button>
            <button
              className="button button-primary"
              disabled={loading}
              onClick={step === 2 ? save : continueStep}
            >
              {step === 2 ? "Save my visit" : "Continue"}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
export function Assistance({
  location: l,
  onClose,
}: {
  location: FoodLocation;
  onClose: () => void;
}) {
  const { update } = useDemo();
  const [type, setType] = useState("Food delivery"),
    [area, setArea] = useState(l.neighborhood),
    [date, setDate] = useState(nextDistribution(l)),
    [window, setWindow] = useState("Afternoon (12–5 PM)"),
    [preview, setPreview] = useState(false),
    [done, setDone] = useState(false);
  return (
    <Modal title="A little help getting there." onClose={onClose}>
      {done ? (
        <>
          <Success title="Your demo request is in.">
            It’s now awaiting review in the organization workspace. This
            simulation does not arrange real assistance.
          </Success>
          <Link
            className="button button-primary button-full"
            to="/my-plan"
            onClick={onClose}
          >
            Track my demo request
          </Link>
        </>
      ) : (
        <>
          <Badge tone="amber">DEMO REQUEST · NO REAL SERVICE</Badge>
          <p className="muted small form-intro">
            {l.name} can review your sample request. No address or contact
            details needed.
          </p>
          {preview ? (
            <>
              <div className="request-preview">
                <h3>A quick look before you send</h3>
                <dl>
                  <dt>Assistance</dt>
                  <dd>{type}</dd>
                  <dt>General area</dt>
                  <dd>{area}</dd>
                  <dt>Preferred day</dt>
                  <dd>{formatDate(date, true)}</dd>
                  <dt>Time window</dt>
                  <dd>{window}</dd>
                </dl>
              </div>
              <div className="notice">
                <HandHeart size={18} />
                <p>
                  The organization reviews every request. Coordinators arrange
                  approved volunteer support; volunteers are never assigned
                  directly to households.
                </p>
              </div>
              <div className="form-actions">
                <button
                  className="button button-outline"
                  onClick={() => setPreview(false)}
                >
                  <ArrowLeft size={15} />
                  Edit
                </button>
                <button
                  className="button button-primary"
                  onClick={() => {
                    update((s) => ({
                      ...s,
                      requests: [
                        ...s.requests,
                        {
                          id: crypto.randomUUID(),
                          locationId: l.id,
                          area,
                          type,
                          date,
                          window,
                          status: "Awaiting review",
                          createdAt: new Date().toISOString(),
                        },
                      ],
                    }));
                    setDone(true);
                  }}
                >
                  Submit demo request
                </button>
              </div>
            </>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPreview(true);
              }}
            >
              <label className="field">
                What would help?
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option>Food delivery</option>
                  <option>Pickup assistance</option>
                  <option>Transportation information</option>
                </select>
              </label>
              <label className="field">
                General neighborhood
                <input
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  required
                  maxLength={60}
                  placeholder="Neighborhood only — no home address"
                />
              </label>
              <div className="form-grid">
                <label className="field">
                  Preferred day
                  <input
                    type="date"
                    min={today}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </label>
                <label className="field">
                  Time window
                  <select
                    value={window}
                    onChange={(e) => setWindow(e.target.value)}
                  >
                    <option>Morning (9 AM–12 PM)</option>
                    <option>Afternoon (12–5 PM)</option>
                    <option>Flexible</option>
                  </select>
                </label>
              </div>
              <button
                type="submit"
                className="button button-primary button-full"
              >
                Preview demo request
              </button>
            </form>
          )}
        </>
      )}
    </Modal>
  );
}
export default function MyPlan() {
  const { state, update } = useDemo();
  const [editing, setEditing] = useState<VisitPlan | null>(null),
    [recording, setRecording] = useState<VisitPlan | null>(null),
    [outcome, setOutcome] = useState("Collected"),
    [note, setNote] = useState("");
  const requests = state.requests.filter(
    (r) => !r.id.startsWith("request-seed"),
  );
  const visits = [...state.plans].sort((a, b) => a.date.localeCompare(b.date));
  const checklist = [
    "Confirm today’s hours",
    "Pack a reusable bag",
    "Check my route before leaving",
  ];
  return (
    <section className="content-page food-plan-page">
      <div className="page-intro">
        <div>
          <p className="page-context">From a search to a meal</p>
          <h1>Your food plan.</h1>
          <p>
            Your visits, your journey, and a little less to keep in your head.
          </p>
        </div>
        <Link className="button button-primary" to="/find-food">
          Find another place
        </Link>
      </div>
      <div className="plan-layout">
        <div>
          {!visits.length ? (
            <Empty title="Your next visit starts here.">
              <p>
                Find a food program, confirm its hours, and plan your trip. Your
                itinerary and pickup checklist will be waiting here.
              </p>
              <Link className="button button-primary" to="/find-food">
                Explore the food directory
              </Link>
            </Empty>
          ) : (
            visits.map((p) => {
              const l = state.locations.find((l) => l.id === p.locationId);
              if (!l) return null;
              const status = p.status || "Planned";
              return (
                <article
                  className={`plan-card visit-${status.toLowerCase().replaceAll(" ", "-")}`}
                  key={p.id}
                >
                  <div className="date-tile">
                    <small>
                      {new Date(p.date + "T12:00:00").toLocaleDateString(
                        "en-US",
                        { month: "short" },
                      )}
                    </small>
                    <strong>{new Date(p.date + "T12:00:00").getDate()}</strong>
                    <span>
                      {days[new Date(p.date + "T12:00:00").getDay()].slice(
                        0,
                        3,
                      )}
                    </span>
                  </div>
                  <div className="plan-card-content">
                    <div className="plan-card-top">
                      <span className="visit-status">
                        <span className="status-dot" />
                        {status === "Collected" ? "Pickup recorded" : status}
                      </span>
                      <span className="small muted">
                        {l.sourceKind === "public"
                          ? "Personal plan"
                          : "Demo visit"}
                      </span>
                    </div>
                    <Link to={`/food/${l.id}`}>
                      <h2>{l.name}</h2>
                    </Link>
                    <p className="location-meta">{l.address}</p>
                    <div className="plan-itinerary">
                      <div>
                        <span>Leave</span>
                        <strong>
                          {p.outboundMinutes && p.arrivalMinutes
                            ? clock(p.arrivalMinutes - p.outboundMinutes)
                            : "Check route"}
                        </strong>
                      </div>
                      <div className="itinerary-connection">
                        <span>{p.transport}</span>
                        <i />
                      </div>
                      <div>
                        <span>Arrive</span>
                        <strong>
                          {p.arrivalMinutes
                            ? clock(p.arrivalMinutes)
                            : time(l.start)}
                        </strong>
                      </div>
                      <div className="return-itinerary">
                        <span>Trip home</span>
                        <strong>
                          {p.returnMinutes
                            ? `${p.returnMinutes} min`
                            : "Check route"}
                        </strong>
                      </div>
                    </div>
                    <p className="route-provenance">
                      From {p.originArea || "your neighborhood"} ·{" "}
                      {p.travelTimeSource === "route"
                        ? "Retrieved street route"
                        : p.travelTimeSource === "user"
                          ? "Travel times entered by you"
                          : "Route not checked"}
                    </p>
                    {status !== "Collected" &&
                    status !== "Could not collect" ? (
                      <>
                        <div className="checklist">
                          {checklist.map((item) => (
                            <label key={item}>
                              <input
                                type="checkbox"
                                checked={p.checklist.includes(item)}
                                onChange={(e) =>
                                  update((s) => ({
                                    ...s,
                                    plans: s.plans.map((v) =>
                                      v.id === p.id
                                        ? {
                                            ...v,
                                            checklist: e.target.checked
                                              ? [...v.checklist, item]
                                              : v.checklist.filter(
                                                  (c) => c !== item,
                                                ),
                                          }
                                        : v,
                                    ),
                                  }))
                                }
                              />
                              {item}
                            </label>
                          ))}
                        </div>
                        <div className="visit-stage-actions">
                          <button
                            className="button button-primary button-small"
                            onClick={() => {
                              if (status === "Planned")
                                update((s) => ({
                                  ...s,
                                  plans: setVisitStatus(
                                    s.plans,
                                    p.id,
                                    "On my way",
                                  ),
                                }));
                              else {
                                setRecording(p);
                                setOutcome("Collected");
                                setNote("");
                              }
                            }}
                          >
                            {status === "Planned"
                              ? "I’m on my way"
                              : "Record my pickup"}
                          </button>
                          <a
                            className="button button-outline button-small"
                            href={directionsUrl(l, p.transport, p.originArea)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open directions
                            <ExternalLink size={13} />
                          </a>
                          {l.phone && (
                            <a
                              className="icon-button"
                              aria-label={`Call ${l.name}`}
                              href={`tel:${l.phone.replace(/[^+\d]/g, "")}`}
                            >
                              <Phone size={16} />
                            </a>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="recorded-outcome">
                        <strong>
                          {status === "Collected"
                            ? "Good food, brought home."
                            : "Let’s find another option."}
                        </strong>
                        <p>
                          {p.outcomeNote ||
                            (status === "Collected"
                              ? "Your pickup is recorded as a personal, self-reported outcome."
                              : "Your personal record says food was not collected. Explore another nearby program or call 311 for help.")}
                        </p>
                        {status === "Could not collect" && (
                          <Link
                            className="text-link"
                            to={`/find-food?area=${encodeURIComponent(p.originArea || l.zip)}`}
                          >
                            Find another food program
                          </Link>
                        )}
                        <button
                          className="text-link"
                          onClick={() =>
                            update((s) => ({
                              ...s,
                              plans: setVisitStatus(s.plans, p.id, "Planned"),
                            }))
                          }
                        >
                          Reset visit status
                        </button>
                      </div>
                    )}
                    <div className="plan-actions">
                      <button
                        className="text-link"
                        onClick={() => setEditing(p)}
                      >
                        Adjust visit
                      </button>
                      <button
                        className="text-link"
                        onClick={() =>
                          calendarDownload({
                            name: l.name,
                            date: p.date,
                            arrivalMinutes: p.arrivalMinutes || l.start * 60,
                            address: l.address,
                          })
                        }
                      >
                        Add to calendar
                      </button>
                      <button
                        className="icon-button"
                        aria-label={`Remove visit to ${l.name}`}
                        onClick={() =>
                          update((s) => ({
                            ...s,
                            plans: s.plans.filter((v) => v.id !== p.id),
                          }))
                        }
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
        <aside>
          <div className="plan-support-card">
            <Bookmark size={22} />
            <h3>Something changed?</h3>
            <p>
              Food and schedules can change. Call before leaving, check your
              directions again, and keep a second option saved.
            </p>
            <Link className="text-link" to="/find-food">
              Find another food program
            </Link>
            <a className="text-link" href="tel:311">
              Call NYC 311
            </a>
          </div>
          {requests.length > 0 && (
            <div className="side-card">
              <h3>Demo assistance requests</h3>
              <p>
                These requests are simulated. Organization status updates appear
                here.
              </p>
              {requests.map((r) => (
                <div className="tracked-request" key={r.id}>
                  <strong>{r.type}</strong>
                  <p>
                    {r.area} · {formatDate(r.date)}
                  </p>
                  <Badge tone={r.status === "Completed" ? "green" : "amber"}>
                    {r.status}
                  </Badge>
                  {r.assignedVolunteer && (
                    <p>Coordinator: {r.assignedVolunteer}</p>
                  )}
                </div>
              ))}
            </div>
          )}
          <p className="plan-privacy">
            Plans stay in this browser. Personal pickup records are
            self-reported, not verified by a food provider. No food is reserved.
          </p>
        </aside>
      </div>
      {editing && (
        <Planner
          location={state.locations.find((l) => l.id === editing.locationId)!}
          existing={editing}
          onClose={() => setEditing(null)}
        />
      )}
      {recording && (
        <Modal
          title="How did your visit go?"
          onClose={() => setRecording(null)}
        >
          <p className="muted">
            Keep a personal record of what happened. This is not sent to the
            organization.
          </p>
          <label className="field">
            Your visit outcome
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
            >
              <option>Collected</option>
              <option>Could not collect</option>
            </select>
          </label>
          <label className="field">
            A note for next time{" "}
            <span className="optional">Optional · No personal details</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={200}
              placeholder="e.g. The entrance is on the side street."
            />
          </label>
          <button
            className="button button-primary button-full"
            onClick={() => {
              update((s) => ({
                ...s,
                plans: setVisitStatus(
                  s.plans,
                  recording.id,
                  outcome as "Collected" | "Could not collect",
                ).map((p) =>
                  p.id === recording.id
                    ? { ...p, outcomeNote: note.trim() }
                    : p,
                ),
              }));
              setRecording(null);
            }}
          >
            Save my visit outcome
          </button>
        </Modal>
      )}
    </section>
  );
}
