import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  MapPin,
  Clock3,
  CalendarDays,
  Users,
  Check,
  ShieldCheck,
  Info,
  Accessibility,
  Search,
  Sparkles,
  Flame,
  Trash2,
  HandHeart,
  ChevronRight,
} from "lucide-react";
import { useDemo } from "./lib/store";
import { Badge, Empty, Modal, Success } from "./components/ui";
import {
  formatDate,
  time,
  days,
  shiftHasEnded,
  volunteerPhoto,
} from "./lib/data";
import type {
  Opportunity,
  FoodLocation,
  VolunteerPreferences,
} from "./lib/types";
import { matchVolunteers, registerShift } from "./lib/services";
export function OpportunityCard({
  opportunity: o,
  organization: l,
  featured = false,
}: {
  opportunity: Opportunity;
  organization: FoodLocation;
  featured?: boolean;
}) {
  const { state } = useDemo();
  const registered = state.signups.some((s) => s.opportunityId === o.id);
  return (
    <article
      className={`opportunity-card ${featured ? "featured-opportunity" : ""}`}
    >
      <div className="opportunity-card-top">
        <span className="activity-icon">
          {o.activity === "Packing groceries" ? (
            <HandHeart size={21} />
          ) : o.activity === "Meal preparation" ? (
            <Heart size={21} />
          ) : (
            <Users size={21} />
          )}
        </span>
        <Badge tone={o.priority ? "amber" : "gray"}>
          {o.priority ? (
            <>
              <Flame size={11} />
              Priority
            </>
          ) : (
            o.activity
          )}
        </Badge>
      </div>
      <p className="opportunity-org">{l.name}</p>
      <Link to={`/volunteer/${o.id}`}>
        <h3>{o.title}</h3>
      </Link>
      <p className="location-meta">
        <MapPin size={12} />
        {l.neighborhood}, {l.borough}
      </p>
      <div className="opportunity-meta">
        <span>
          <CalendarDays size={13} />
          {formatDate(o.date)}
        </span>
        <span>
          <Clock3 size={13} />
          {time(o.start)}–{time(o.end)}
        </span>
      </div>
      <div className="capacity-bar">
        <span style={{ width: `${(o.filled / o.capacity) * 100}%` }} />
      </div>
      <div className="opportunity-capacity">
        <span>
          <strong>{o.capacity - o.filled}</strong> of {o.capacity} spots open
        </span>
        <span>
          {o.end - o.start} hours · Ages {o.minAge}+
        </span>
      </div>
      <div className="opportunity-card-footer">
        <span>
          {registered ? (
            <Badge>
              <Check size={11} />
              In your schedule
            </Badge>
          ) : o.group ? (
            <Badge tone="gray">Group-friendly</Badge>
          ) : (
            <Badge tone="gray">No experience needed</Badge>
          )}
        </span>
        <Link className="text-link" to={`/volunteer/${o.id}`}>
          View Shift
        </Link>
      </div>
    </article>
  );
}
export default function Volunteer() {
  const { state } = useDemo();
  const [area, setArea] = useState("11372"),
    [query, setQuery] = useState("11372"),
    [day, setDay] = useState("Any day"),
    [activity, setActivity] = useState("Any activity"),
    [radius, setRadius] = useState(15),
    [duration, setDuration] = useState(0),
    [accessible, setAccessible] = useState(false),
    [age, setAge] = useState(18),
    [group, setGroup] = useState(false),
    [recurring, setRecurring] = useState(false),
    [skill, setSkill] = useState("No preference"),
    [more, setMore] = useState(false);
  const pref: VolunteerPreferences = {
    area: query,
    day,
    activity,
    maxMiles: radius,
    minAge: age,
    accessible,
    duration,
    group,
    recurring,
    skill,
  };
  const results = matchVolunteers(state.opportunities, state.locations, pref);
  const urgent = results.filter((r) => r.opportunity.priority).slice(0, 3);
  return (
    <>
      <section className="volunteer-hero section">
        <div>
          <div className="eyebrow">
            <Heart size={13} /> VOLUNTEER
          </div>
          <h1>
            Volunteer With
            <br />
            Local Food Programs
          </h1>
          <p>Find shifts near you that fit your schedule and skills.</p>
          <Link className="button button-primary" to="/volunteer/match">
            <Sparkles size={16} />
            Get Matched
          </Link>
          <Link className="text-link" to="/volunteer/dashboard">
            My Schedule
          </Link>
        </div>
        <div className="volunteer-hero-photo">
          <img
            src={volunteerPhoto}
            alt="Neighbors working together to distribute food"
          />
        </div>
      </section>
      <section className="section volunteer-discovery">
        <div className="volunteer-search">
          <form
            className="search-field"
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(area);
            }}
          >
            <Search size={17} />
            <input
              value={area}
              aria-label="Volunteer ZIP code or neighborhood"
              onChange={(e) => setArea(e.target.value)}
              placeholder="ZIP code or neighborhood"
            />
            <button className="button button-primary button-small">
              Search
            </button>
          </form>
          <select
            aria-label="Volunteer search radius"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
          >
            {[3, 5, 10, 15, 30].map((n) => (
              <option key={n} value={n}>
                Within {n} miles
              </option>
            ))}
          </select>
          <select
            aria-label="Available day"
            value={day}
            onChange={(e) => setDay(e.target.value)}
          >
            <option>Any day</option>
            {days.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <select
            aria-label="Activity type"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
          >
            {[
              "Any activity",
              "Packing groceries",
              "Food distribution",
              "Meal preparation",
              "Sorting donations",
              "Community outreach",
              "Translation",
              "Delivery support",
            ].map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
          <button
            className="button button-outline button-small"
            onClick={() => setMore(!more)}
          >
            More Filters
          </button>
        </div>
        {more && (
          <div className="volunteer-extra-filters">
            <label className="field">
              Max Duration
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              >
                <option value="0">Any duration</option>
                <option value="2">2 hours</option>
                <option value="3">3 hours</option>
                <option value="4">4 hours</option>
              </select>
            </label>
            <label className="field">
              Age
              <input
                type="number"
                min="10"
                max="100"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
              />
            </label>
            <label className="field">
              Skills & Travel
              <select value={skill} onChange={(e) => setSkill(e.target.value)}>
                <option>No preference</option>
                <option>No driving</option>
                <option>Languages & interpretation</option>
                <option>Driving</option>
              </select>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={accessible}
                onChange={(e) => setAccessible(e.target.checked)}
              />
              Accessible
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={group}
                onChange={(e) => setGroup(e.target.checked)}
              />
              Group-friendly
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={recurring}
                onChange={(e) => setRecurring(e.target.checked)}
              />
              Recurring
            </label>
          </div>
        )}
        <div className="demo-label standalone">
          <Info size={12} />
          Volunteer listings are sample data for demonstration.
        </div>
        {urgent.length > 0 && (
          <section className="most-needed">
            <div className="section-heading">
              <div>
                <div className="eyebrow">
                  <Flame size={14} /> HIGH PRIORITY
                </div>
                <h2>Most Needed This Week</h2>
              </div>
            </div>
            <div className="opportunity-grid">
              {urgent.map(({ opportunity: o, organization: l }) => (
                <OpportunityCard
                  key={o.id}
                  opportunity={o}
                  organization={l}
                  featured
                />
              ))}
            </div>
            <p className="urgency-explanation">
              <Info size={12} />
              Ranked by priority, open spots, and distance.
            </p>
          </section>
        )}
        <div className="section-heading all-opportunities-heading">
          <div>
            <span className="eyebrow">ALL OPPORTUNITIES</span>
            <h2>Browse Shifts</h2>
          </div>
          <span className="small muted">
            {results.length} matching opportunities
          </span>
        </div>
        <div className="opportunity-grid">
          {results.map(({ opportunity: o, organization: l }) => (
            <OpportunityCard key={o.id} opportunity={o} organization={l} />
          ))}
        </div>
        {!results.length && (
          <Empty title="No Matching Shifts">
            <p>Try a wider radius, a different day, or fewer filters.</p>
            <button
              className="button button-primary"
              onClick={() => {
                setDay("Any day");
                setActivity("Any activity");
                setRadius(30);
                setAccessible(false);
                setGroup(false);
                setRecurring(false);
                setDuration(0);
                setAge(18);
                setSkill("No preference");
                setArea("11372");
                setQuery("11372");
              }}
            >
              Reset Filters
            </button>
          </Empty>
        )}
      </section>
    </>
  );
}
export function VolunteerDetail() {
  const { id } = useParams();
  const { state, update } = useDemo();
  const [signup, setSignup] = useState(false),
    [done, setDone] = useState(false),
    [error, setError] = useState(""),
    [age, setAge] = useState(18),
    [consent, setConsent] = useState(false);
  const o = state.opportunities.find((o) => o.id === id);
  const l = state.locations.find((l) => l.id === o?.orgId);
  if (!o || !l)
    return (
      <Empty title="Opportunity Not Found">
        <Link to="/volunteer" className="button button-primary">
          Browse Opportunities
        </Link>
      </Empty>
    );
  const registered = state.signups.some((s) => s.opportunityId === o.id);
  return (
    <section className="content-page detail-page">
      <Link className="back-link" to="/volunteer">
        <ArrowLeft size={14} />
        All Opportunities
      </Link>
      <div className="detail-heading">
        <div>
          <div className="card-badges">
            <Badge tone={o.priority ? "amber" : "green"}>
              {o.priority ? "High Priority" : "Community Opportunity"} · Demo
            </Badge>
            <Badge tone="gray">{o.activity}</Badge>
          </div>
          <h1>{o.title}</h1>
          <p className="location-meta">
            <MapPin size={14} />
            {l.name} · {l.neighborhood}
          </p>
        </div>
      </div>
      <div className="volunteer-detail-image">
        <img
          src={volunteerPhoto}
          alt="Community volunteers sharing their time"
        />
      </div>
      <div className="detail-layout">
        <div>
          <section className="detail-section">
            <h2>About This Shift</h2>
            <p>{o.description}</p>
            <div className="volunteer-facts">
              <span>
                <CalendarDays size={20} />
                <strong>{formatDate(o.date, true)}</strong>
                <small>
                  {time(o.start)} – {time(o.end)}
                </small>
              </span>
              <span>
                <Clock3 size={20} />
                <strong>{o.end - o.start} hours</strong>
                <small>{o.recurring ? "Recurring" : "One-time shift"}</small>
              </span>
              <span>
                <Users size={20} />
                <strong>{o.capacity - o.filled} spots open</strong>
                <small>of {o.capacity} demo positions</small>
              </span>
            </div>
          </section>
          <section className="detail-section">
            <h2>
              <Check size={21} />
              Before You Arrive
            </h2>
            <div className="preparation-list">
              <span>
                <Check size={14} />
                Ages {o.minAge} and older
              </span>
              {o.requirements.map((r) => (
                <span key={r}>
                  <Check size={14} />
                  {r}
                </span>
              ))}
              <span>
                <Accessibility size={14} />
                {o.accessible
                  ? "Accessible activity and entrance"
                  : "Confirm access with the organization"}
              </span>
              <span>
                <Users size={14} />
                {o.group
                  ? "Individuals and groups welcome"
                  : "Individual signups"}
              </span>
            </div>
          </section>
          <section className="detail-section">
            <h2>
              <MapPin size={21} />
              Location
            </h2>
            <p>
              {l.name}
              <br />
              {l.address}, {l.borough}, NY {l.zip}
            </p>
            <Link className="text-link" to={`/food/${l.id}`}>
              View Organization
            </Link>
            <div className="notice">
              <Info size={16} />
              <p>Sample organization. Signups are not sent anywhere.</p>
            </div>
          </section>
        </div>
        <aside className="detail-sidebar">
          <div className="visit-card">
            <Badge>
              <Heart size={12} />
              SHIFT DETAILS
            </Badge>
            <h2>{formatDate(o.date)}</h2>
            <p>
              {time(o.start)} – {time(o.end)}
            </p>
            <div className="capacity-bar">
              <span style={{ width: `${(o.filled / o.capacity) * 100}%` }} />
            </div>
            <p className="small">
              {o.filled} of {o.capacity} spots filled
            </p>
            {o.priority && (
              <div className="notice">
                <Flame size={15} />
                <p>High priority: {o.capacity - o.filled} spots still open.</p>
              </div>
            )}
            <button
              disabled={
                registered ||
                !o.active ||
                o.filled >= o.capacity ||
                shiftHasEnded(o)
              }
              className="button button-primary button-full"
              onClick={() => setSignup(true)}
            >
              {registered ? (
                <>
                  <Check size={16} />
                  Signed Up
                </>
              ) : !o.active ? (
                "Closed"
              ) : o.filled >= o.capacity ? (
                "Full"
              ) : shiftHasEnded(o) ? (
                "Shift Ended"
              ) : (
                <>Sign Up</>
              )}
            </button>
            <Link
              to="/volunteer/dashboard"
              className="button button-outline button-full"
            >
              My Schedule
              <CalendarDays size={15} />
            </Link>
          </div>
          <div className="verification-card">
            <ShieldCheck size={22} />
            <div>
              <strong>Organization-Approved</strong>
              <p>
                Delivery roles require organization approval. Household details
                are never shared with volunteers.
              </p>
            </div>
          </div>
        </aside>
      </div>
      {signup && (
        <Modal
          title={done ? "You’re Signed Up" : "Confirm Signup"}
          onClose={() => setSignup(false)}
        >
          {done ? (
            <>
              <Success title="Shift Added">
                This shift is now in your schedule.
              </Success>
              <Link
                className="button button-primary button-full"
                to="/volunteer/dashboard"
              >
                View Schedule
              </Link>
            </>
          ) : (
            <>
              <Badge tone="amber">DEMO SIGNUP</Badge>
              <div className="signup-summary">
                <h3>{o.activity}</h3>
                <p>{l.name}</p>
                <span>
                  {formatDate(o.date, true)} · {time(o.start)}–{time(o.end)}
                </span>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (age < o.minAge) {
                    setError(
                      `This demo shift requires volunteers to be at least ${o.minAge}. Please choose an age-appropriate shift.`,
                    );
                    return;
                  }
                  if (!consent) {
                    setError("Please confirm you meet the requirements.");
                    return;
                  }
                  try {
                    const next = registerShift(state, o.id);
                    update(() => next);
                    setDone(true);
                  } catch (err) {
                    setError((err as Error).message);
                  }
                }}
              >
                <label className="field">
                  Your age{" "}
                  <span className="optional">
                    Not stored · Used only for shift eligibility
                  </span>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    required
                  />
                </label>
                <div className="preparation-list">
                  {o.requirements.map((r) => (
                    <span key={r}>
                      <Check size={14} />
                      {r}
                    </span>
                  ))}
                </div>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    required
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  I meet the requirements for this shift.
                </label>
                {error && (
                  <p className="error-text" role="alert">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  className="button button-primary button-full"
                >
                  Confirm Signup
                </button>
              </form>
            </>
          )}
        </Modal>
      )}
    </section>
  );
}
export function VolunteerDashboard() {
  const { state, update } = useDemo();
  const signups = state.signups
    .map((s) => ({
      signup: s,
      opportunity: state.opportunities.find((o) => o.id === s.opportunityId)!,
    }))
    .filter((s) => s.opportunity);
  const hours = signups.reduce(
    (sum, { opportunity: o }) => sum + o.end - o.start,
    0,
  );
  return (
    <section className="content-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">GOOD THINGS, ON THE CALENDAR</span>
          <h1>My Volunteer Schedule</h1>
          <p>Your upcoming shifts and hours.</p>
        </div>
        <Link className="button button-primary" to="/volunteer">
          Find More Shifts
        </Link>
      </div>
      <div className="dashboard-stats">
        <article>
          <span>UPCOMING SHIFTS</span>
          <strong>{signups.length}</strong>
        </article>
        <article>
          <span>HOURS COMMITTED</span>
          <strong>
            {hours}
            <small> hrs</small>
          </strong>
        </article>
        <article>
          <span>ORGANIZATIONS</span>
          <strong>
            {new Set(signups.map((s) => s.opportunity.orgId)).size}
          </strong>
        </article>
      </div>
      <h2 className="subheading">
        <CalendarDays size={21} />
        Upcoming
      </h2>
      {!signups.length ? (
        <Empty title="No Shifts Yet">
          <p>Sign up for a shift and it will appear here.</p>
          <Link className="button button-primary" to="/volunteer">
            Browse Opportunities
          </Link>
        </Empty>
      ) : (
        signups
          .sort((a, b) => a.opportunity.date.localeCompare(b.opportunity.date))
          .map(({ signup: s, opportunity: o }) => {
            const l = state.locations.find((l) => l.id === o.orgId)!;
            return (
              <article className="volunteer-schedule-card" key={s.id}>
                <div className="date-tile">
                  <small>
                    {new Date(o.date + "T12:00:00").toLocaleDateString(
                      "en-US",
                      { month: "short" },
                    )}
                  </small>
                  <strong>{new Date(o.date + "T12:00:00").getDate()}</strong>
                  <span>
                    {days[new Date(o.date + "T12:00:00").getDay()].slice(0, 3)}
                  </span>
                </div>
                <div>
                  <Badge>
                    <Check size={11} />
                    Confirmed
                  </Badge>
                  <h3>{o.activity}</h3>
                  <p>
                    {l.name} · {time(o.start)} – {time(o.end)}
                  </p>
                  <small>{o.requirements.join(" · ")}</small>
                </div>
                <Link to={`/volunteer/${o.id}`} className="text-link">
                  Shift Details
                  <ChevronRight size={15} />
                </Link>
                <button
                  className="icon-button"
                  aria-label={`Cancel demo signup for ${o.activity}`}
                  onClick={() =>
                    update((state) => ({
                      ...state,
                      signups: state.signups.filter((v) => v.id !== s.id),
                      opportunities: state.opportunities.map((v) =>
                        v.id === o.id
                          ? { ...v, filled: Math.max(0, v.filled - 1) }
                          : v,
                      ),
                    }))
                  }
                >
                  <Trash2 size={16} />
                </button>
              </article>
            );
          })
      )}
      <div className="notice">
        <Info size={17} />
        <p>Signups are stored in this browser only.</p>
      </div>
    </section>
  );
}
