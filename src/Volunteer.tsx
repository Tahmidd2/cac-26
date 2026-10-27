import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
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
              Priority · Demo
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
          View shift
          <ArrowUpRight size={14} />
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
            <Heart size={13} /> MAKE A LITTLE ROOM FOR GOOD
          </div>
          <h1>
            Your time.
            <br />
            <em>Someone’s better day.</em>
          </h1>
          <p>
            Find where you’re needed. Discover nearby opportunities
            <br className="desktop-break" /> that fit your schedule, your
            skills, and your heart.
          </p>
          <Link className="button button-primary" to="/volunteer/match">
            <Sparkles size={16} />
            Find my volunteer match
            <ArrowUpRight size={16} />
          </Link>
          <Link className="text-link" to="/volunteer/dashboard">
            My volunteer schedule
            <ArrowRight size={14} />
          </Link>
        </div>
        <div className="volunteer-hero-photo">
          <img
            src={volunteerPhoto}
            alt="Neighbors working together to distribute food"
          />
          <div className="volunteer-photo-note">
            <Heart size={18} />
            <span>No act of kindness is ever too small.</span>
          </div>
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
            More filters
          </button>
        </div>
        {more && (
          <div className="volunteer-extra-filters">
            <label className="field">
              Maximum duration
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
              Your age
              <input
                type="number"
                min="10"
                max="100"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
              />
            </label>
            <label className="field">
              Skills & travel
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
              Accessible activity
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
          All organizations, priorities, and open slots are fictional. Signups
          are simulations.
        </div>
        {urgent.length > 0 && (
          <section className="most-needed">
            <div className="section-heading">
              <div>
                <div className="eyebrow">
                  <Flame size={14} /> SMALL COMMITMENT. MEANINGFUL DIFFERENCE.
                </div>
                <h2>Where a little help matters most.</h2>
              </div>
              <Badge tone="amber">Organization-marked priority · Demo</Badge>
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
              Ranked by organization-posted priority, remaining positions, and
              distance. This is illustrative need, not live staffing
              information.
            </p>
          </section>
        )}
        <div className="section-heading all-opportunities-heading">
          <div>
            <span className="eyebrow">GOOD THINGS HAPPEN WHEN WE SHOW UP</span>
            <h2>Find your next meaningful few hours.</h2>
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
          <Empty title="A different day could make all the difference.">
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
              Reset filters
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
      <Empty title="This opportunity isn’t available.">
        <Link to="/volunteer" className="button button-primary">
          Explore opportunities
        </Link>
      </Empty>
    );
  const registered = state.signups.some((s) => s.opportunityId === o.id);
  return (
    <section className="content-page detail-page">
      <Link className="back-link" to="/volunteer">
        <ArrowLeft size={14} />
        All volunteer opportunities
      </Link>
      <div className="detail-heading">
        <div>
          <div className="card-badges">
            <Badge tone={o.priority ? "amber" : "green"}>
              {o.priority
                ? "Organization-marked priority"
                : "Community opportunity"}{" "}
              · Demo
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
        <span className="badge badge-white">A LITTLE TIME. A LOT OF CARE.</span>
      </div>
      <div className="detail-layout">
        <div>
          <section className="detail-section">
            <h2>A few hours that mean something.</h2>
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
                <small>
                  {o.recurring ? "Recurring opportunity" : "One-time shift"}
                </small>
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
              What to know before you come
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
                  ? "Accessible activity and entrance in demo data"
                  : "Physical access needs confirmation"}
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
              The place you’ll be helping
            </h2>
            <p>
              {l.name}
              <br />
              {l.address}, {l.borough}, NY {l.zip}
            </p>
            <Link className="text-link" to={`/food/${l.id}`}>
              Meet the demo organization
              <ArrowUpRight size={15} />
            </Link>
            <div className="notice">
              <Info size={16} />
              <p>
                This organization is fictional. Demo signup does not register
                you for a real shift. No contact details or identifying
                information are collected.
              </p>
            </div>
          </section>
        </div>
        <aside className="detail-sidebar">
          <div className="visit-card">
            <Badge>
              <Heart size={12} />
              YOUR NEXT GOOD THING
            </Badge>
            <h2>{formatDate(o.date)}</h2>
            <p>
              {time(o.start)} – {time(o.end)}
            </p>
            <div className="capacity-bar">
              <span style={{ width: `${(o.filled / o.capacity) * 100}%` }} />
            </div>
            <p className="small">
              {o.filled} of {o.capacity} demo positions filled
            </p>
            {o.priority && (
              <div className="notice">
                <Flame size={15} />
                <p>
                  High priority, marked by the demo organization.{" "}
                  {o.capacity - o.filled} positions still need a hand.
                </p>
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
                  You’re in the demo schedule
                </>
              ) : !o.active ? (
                "Opportunity closed"
              ) : o.filled >= o.capacity ? (
                "Shift full"
              ) : shiftHasEnded(o) ? (
                "Shift has passed"
              ) : (
                <>
                  Count me in · Demo signup
                  <ArrowUpRight size={16} />
                </>
              )}
            </button>
            <Link
              to="/volunteer/dashboard"
              className="button button-outline button-full"
            >
              My volunteer schedule
              <CalendarDays size={15} />
            </Link>
            <small>No real signup is sent.</small>
          </div>
          <div className="verification-card">
            <ShieldCheck size={22} />
            <div>
              <strong>Organization-led, always.</strong>
              <p>
                Any delivery role requires separate organizational approval.
                Household details are never shared with volunteers in this
                prototype.
              </p>
            </div>
          </div>
        </aside>
      </div>
      {signup && (
        <Modal
          title={
            done
              ? "A little kindness, on the calendar."
              : "Ready to make a little difference?"
          }
          onClose={() => setSignup(false)}
        >
          {done ? (
            <>
              <Success title="You’re on the demo team.">
                Your shift is in your schedule and the organization’s staffing
                count has been updated. No real signup was sent.
              </Success>
              <Link
                className="button button-primary button-full"
                to="/volunteer/dashboard"
              >
                See my schedule
                <ArrowRight size={16} />
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
                    setError("Please acknowledge the demo requirements.");
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
                  I meet the requirements and understand this is a demo signup.
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
                  Confirm demo signup
                  <ArrowRight size={16} />
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
          <h1>
            You’re part of <em>something good.</em>
          </h1>
          <p>
            Your volunteer commitments, with everything you need to show up.
          </p>
        </div>
        <Link className="button button-primary" to="/volunteer">
          Find another way to help
          <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="dashboard-stats">
        <article>
          <span>UPCOMING DEMO SHIFTS</span>
          <strong>{signups.length}</strong>
          <p>A little time, thoughtfully given.</p>
        </article>
        <article>
          <span>HOURS COMMITTED · DEMO</span>
          <strong>
            {hours}
            <small> hrs</small>
          </strong>
          <p>Time that could make a difference.</p>
        </article>
        <article>
          <span>COMMUNITY CONNECTIONS</span>
          <strong>
            {new Set(signups.map((s) => s.opportunity.orgId)).size}
          </strong>
          <p>Fictional organizations you’re helping.</p>
        </article>
      </div>
      <h2 className="subheading">
        <CalendarDays size={21} />
        Your demo schedule
      </h2>
      {!signups.length ? (
        <Empty title="Your next good thing is out there.">
          <p>
            Choose a volunteer shift and complete a demo signup.
            <br />
            We’ll put the details right here.
          </p>
          <Link className="button button-primary" to="/volunteer">
            Explore volunteer opportunities
            <ArrowRight size={16} />
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
                    Demo registration confirmed
                  </Badge>
                  <h3>{o.activity}</h3>
                  <p>
                    {l.name} · {time(o.start)} – {time(o.end)}
                  </p>
                  <small>{o.requirements.join(" · ")}</small>
                </div>
                <Link to={`/volunteer/${o.id}`} className="text-link">
                  Shift details
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
        <p>
          All registrations are local simulations. No messages are sent, no real
          places are booked, and no volunteer attendance has been recorded.
        </p>
      </div>
    </section>
  );
}
