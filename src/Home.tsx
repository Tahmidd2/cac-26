import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { directoryMetadata, publicLocations, volunteerPhoto } from "./lib/data";
import { Reveal, useParallax } from "./components/Motion";
import { atlasPoint, boroughPaths, boroughLabels } from "./lib/geography";
const boroughs = ["Queens", "Brooklyn", "Manhattan", "Bronx", "Staten Island"];
function NetworkAtlas() {
  const [active, setActive] = useState("All five boroughs");
  const points = publicLocations.filter(
    (l) => active === "All five boroughs" || l.borough === active,
  );
  const count = points.length;
  const [hoveredHub, setHoveredHub] = useState<
    (typeof publicLocations)[number] | null
  >(null);
  const activeIds = new Set(points.map((p) => p.id));
  return (
    <section className="network-section" id="our-neighborhoods">
      <div className="network-content">
        <Reveal>
          <p className="page-context">A bigger neighborhood</p>
          <h2>
            Good people.
            <br />
            All over New York.
          </h2>
          <p>
            Pantries, community kitchens, and a place to start in every borough.
            Explore {directoryMetadata.count} publicly listed food programs,
            with source information you can check.
          </p>
        </Reveal>
        <div className="borough-list">
          <button
            className={active === "All five boroughs" ? "active" : ""}
            onClick={() => setActive("All five boroughs")}
          >
            <span>All five boroughs</span>
            <b>{directoryMetadata.count}</b>
          </button>
          {boroughs.map((b) => (
            <button
              key={b}
              className={active === b ? "active" : ""}
              onClick={() => setActive(b)}
            >
              <span>{b}</span>
              <b>
                {
                  directoryMetadata.boroughCounts[
                    b as keyof typeof directoryMetadata.boroughCounts
                  ]
                }
              </b>
            </button>
          ))}
        </div>
        <Link
          className="button button-primary"
          to={`/find-food${active === "All five boroughs" ? "" : `?area=${encodeURIComponent(active)}`}`}
        >
          Explore {active === "All five boroughs" ? "the directory" : active}
        </Link>
      </div>
      <Reveal className="network-atlas">
        <div className="atlas-header">
          <span>{active}</span>
          <span>{count} public programs</span>
        </div>
        <div className="atlas-map-frame">
          <svg
            viewBox="0 0 580 630"
            role="img"
            aria-label={`${count} food programs, with official outlines for all five New York City boroughs`}
          >
            <defs>
              <pattern
                id="atlas-grid"
                width="42"
                height="42"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 42 0 L 0 0 0 42"
                  fill="none"
                  stroke="#d6e2d6"
                  strokeWidth=".6"
                />
              </pattern>
            </defs>
            <rect width="580" height="630" fill="#e2ece8" />
            <rect
              width="580"
              height="630"
              fill="url(#atlas-grid)"
              opacity=".5"
            />
            <g className="borough-outlines">
              {boroughPaths.map((borough, i) => (
                <path
                  key={borough.name}
                  d={borough.path}
                  pathLength={100}
                  fillRule="evenodd"
                  className={`borough-shape ${active === borough.name ? "active-borough" : ""} ${active !== "All five boroughs" && active !== borough.name ? "muted-borough" : ""}`}
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <title>{borough.name} borough boundary</title>
                </path>
              ))}
            </g>
            <g className="atlas-dots">
              {publicLocations.map((l) => {
                const [x, y] = atlasPoint(l.lng, l.lat);
                const isActive = activeIds.has(l.id);
                return (
                  <circle
                    key={l.id}
                    cx={x}
                    cy={y}
                    r={hoveredHub?.id === l.id ? 5 : isActive ? 2.8 : 1.8}
                    fill={isActive ? "#315b44" : "#9fb6a0"}
                    opacity={isActive ? 0.88 : 0.3}
                    onMouseEnter={() => setHoveredHub(l)}
                    onMouseLeave={() => setHoveredHub(null)}
                  >
                    <title>
                      {l.name} — {l.serviceTypes?.join(" & ") || l.type},{" "}
                      {l.borough}
                    </title>
                  </circle>
                );
              })}
            </g>
            <g className="borough-map-labels">
              {boroughLabels.map((label) => (
                <text
                  key={label.name}
                  x={label.point[0]}
                  y={label.point[1]}
                  textAnchor="middle"
                  className={active === label.name ? "active-label" : ""}
                >
                  {label.name}
                </text>
              ))}
            </g>
          </svg>
          {hoveredHub && (
            <div className="atlas-hub-tooltip" role="tooltip">
              <strong>{hoveredHub.name}</strong>
              <span>
                {hoveredHub.serviceTypes?.join(" & ") || hoveredHub.type} ·{" "}
                {hoveredHub.borough} {hoveredHub.zip}
              </span>
            </div>
          )}
        </div>
        <p>
          Each dot is a public food-program location.
          <br />
          Programs: NYC Food Help. Borough outlines: NYC Department of City
          Planning. Confirm before visiting.
        </p>
      </Reveal>
    </section>
  );
}
function JourneyStory() {
  const [active, setActive] = useState(0);
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    const root = section.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting)
            setActive(Number((entry.target as HTMLElement).dataset.step));
      },
      { rootMargin: "-20% 0px -35% 0px", threshold: 0 },
    );
    root.querySelectorAll("[data-step]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  const headings = [
    "A place that works for you.",
    "A journey you can make.",
    "Good food, brought home.",
  ];
  return (
    <section className="journey-story" ref={section} id="how-it-works">
      <div className="journey-story-visual">
        <p className="page-context">The whole journey matters</p>
        <h2>
          Finding food
          <br />
          is the beginning.
        </h2>
        <div className="journey-visual-card" data-phase={active}>
          <div className="journey-phase">
            <span>{active + 1} / 3</span>
            <strong>
              {
                ["Find your place", "Work out the trip", "Keep the plan"][
                  active
                ]
              }
            </strong>
          </div>
          <svg viewBox="0 0 430 280" aria-hidden="true">
            <path
              className="journey-path-base"
              d="M60 215 C60 100 190 245 210 125 S360 30 365 75"
            />
            <path
              className="journey-path-progress"
              pathLength="100"
              style={{ strokeDashoffset: 100 - ((active + 1) / 3) * 100 }}
              d="M60 215 C60 100 190 245 210 125 S360 30 365 75"
            />
            <circle cx="60" cy="215" r="12" />
            <circle cx="210" cy="125" r="12" />
            <circle cx="365" cy="75" r="12" />
            <text x="35" y="255">
              Find
            </text>
            <text x="187" y="170">
              Travel
            </text>
            <text x="330" y="122">
              Collect
            </text>
          </svg>
          <div className="journey-caption" key={active}>
            <h3>{headings[active]}</h3>
            <p>
              {
                [
                  "Posted hours and practical details. One useful shortlist.",
                  "A starting point, a street route, and a time to leave.",
                  "Your itinerary, checklist, and pickup record in one place.",
                ][active]
              }
            </p>
          </div>
        </div>
      </div>
      <div className="journey-story-steps">
        {[
          {
            title: "Start with your neighborhood.",
            body: "Search by ZIP code or neighborhood. See the food programs nearby, read their posted hours, and call to check what you need. No account or proof of need required.",
            link: "Find food near me",
            to: "/find-food",
          },
          {
            title: "Know how you’ll get there.",
            body: "Choose a day that works. Retrieve a walking or driving route, or check a real transit itinerary. See when to leave, the trip home, and what to bring.",
            link: "Find a place & plan a visit",
            to: "/find-food",
          },
          {
            title: "Have one less thing to remember.",
            body: "Save your visit, add it to your calendar, and keep a simple checklist. After the visit, record whether you brought food home—or find another option if plans changed.",
            link: "See my food plan",
            to: "/my-plan",
          },
        ].map((s, i) => (
          <div
            className={`story-step ${active === i ? "active" : ""}`}
            data-step={i}
            key={s.title}
          >
            <span className="story-step-number">{i + 1}</span>
            <Reveal>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
              <Link className="text-link" to={s.to}>
                {s.link}
              </Link>
            </Reveal>
          </div>
        ))}
      </div>
    </section>
  );
}
export default function Home() {
  const [area, setArea] = useState("");
  const navigate = useNavigate();
  const parallax = useParallax();
  return (
    <div className="home-v2">
      <section className="home-hero" ref={parallax}>
        <div className="hero-copy">
          <p className="hero-location">New York, together.</p>
          <h1>
            Good food.
            <br />
            For all of us.
          </h1>
          <p className="hero-description">
            Find a nearby pantry, work out the trip, and get food home. A little
            more support, right in your neighborhood.
          </p>
          <form
            className="hero-search"
            onSubmit={(e) => {
              e.preventDefault();
              navigate(
                `/find-food?area=${encodeURIComponent(area.trim() || "11372")}`,
              );
            }}
          >
            <label htmlFor="hero-area">Let’s start where you are.</label>
            <div>
              <Search size={20} />
              <input
                id="hero-area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Your ZIP code or neighborhood"
                aria-label="Your ZIP code or neighborhood"
              />
              <button className="button button-primary" type="submit">
                Find food
              </button>
            </div>
          </form>
          <div className="hero-followup">
            <span>No account needed. Everyone is welcome.</span>
            <Link to="/volunteer">I’d like to volunteer</Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-image-frame">
            <img
              src="/images/neighbors-sharing-groceries.png"
              alt="Two neighbors passing a paper grocery bag filled with vegetables and bread"
              fetchPriority="high"
            />
          </div>
          <div className="hero-image-caption">
            <span className="caption-rule" />
            <p>
              More than a bag of groceries.
              <br />A little connection.
            </p>
          </div>
          <span className="hero-photo-credit">Created for Nourish</span>
        </div>
      </section>
      <div className="home-local-nav">
        <span>Right around your corner.</span>
        <nav aria-label="Find food by borough">
          {boroughs.map((b) => (
            <Link key={b} to={`/find-food?area=${encodeURIComponent(b)}`}>
              {b}
            </Link>
          ))}
        </nav>
        <Link className="food-today-link" to="/find-food?today=true">
          Need food today?
        </Link>
      </div>
      <JourneyStory />
      <NetworkAtlas />
      <section className="give-back-section">
        <Reveal className="give-back-photo">
          <img
            src={volunteerPhoto}
            alt="Neighbors volunteering together to prepare food"
            loading="lazy"
          />
        </Reveal>
        <Reveal className="give-back-copy" delay={100}>
          <p className="page-context">There’s room for you here, too.</p>
          <h2>
            Your Saturday.
            <br />
            Someone’s better week.
          </h2>
          <p>
            A few hours packing groceries, sharing a meal, or helping a neighbor
            find their way. Discover a way to give back that fits your life.
          </p>
          <Link className="button button-primary" to="/volunteer">
            Find a way to help
          </Link>
          <small>
            Volunteer discovery and signups are a working demonstration.
          </small>
        </Reveal>
      </section>
      <section className="partner-section">
        <Reveal>
          <p className="page-context">For the people who bring us together</p>
          <h2>
            You bring the care.
            <br />
            We help connect it.
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p>
            Keep distributions clear, bring a few more volunteers on board, and
            help your community take the next step. One connected workspace.
          </p>
          <Link className="button button-outline" to="/organizations">
            Explore the organization workspace
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
