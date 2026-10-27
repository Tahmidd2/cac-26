import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ArrowRight, LocateFixed, HeartHandshake } from "lucide-react";
import ShaderField from "./components/ShaderField";
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
          <p className="page-context">Citywide Coverage</p>
          <h2>
            Food Programs in
            <br />
            Every Borough
          </h2>
          <p>
            Browse {directoryMetadata.count} food pantries and community
            kitchens from the official NYC Food Help directory.
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
          View{" "}
          {active === "All five boroughs"
            ? "All Programs"
            : `${active} Programs`}
        </Link>
      </div>
      <Reveal className="network-atlas">
        <div className="atlas-header">
          <span>{active}</span>
          <span>{count} Programs</span>
        </div>
        <div className="atlas-map-frame">
          <svg
            viewBox="0 0 580 630"
            role="img"
            aria-label={`${count} food programs, with official outlines for all five New York City boroughs`}
            onClick={() => setHoveredHub(null)}
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
                    onClick={(event) => {
                      event.stopPropagation();
                      setHoveredHub(l);
                    }}
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
        <p>Sources: NYC Food Help, NYC Department of City Planning.</p>
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
  const headings = ["Find a Program", "Plan the Trip", "Track Your Visit"];
  return (
    <section className="journey-story" ref={section} id="how-it-works">
      <div className="journey-story-visual">
        <p className="page-context">How It Works</p>
        <h2>
          From Search
          <br />
          to Pickup
        </h2>
        <div className="journey-visual-card" data-phase={active}>
          <div className="journey-phase">
            <span>{active + 1} / 3</span>
            <strong>{["Find", "Travel", "Collect"][active]}</strong>
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
            {[
              [60, 215, "Find", 250],
              [210, 125, "Travel", 88],
              [365, 75, "Collect", 38],
            ].map(([x, y, label, ly], i) => (
              <g key={label} className={i <= active ? "node done" : "node"}>
                <circle cx={x} cy={y} r="13" />
                <text x={x} y={ly as number} textAnchor="middle">
                  {label}
                </text>
              </g>
            ))}
          </svg>
          <div className="journey-caption" key={active}>
            <h3>{headings[active]}</h3>
            <p>
              {
                [
                  "Hours, eligibility, and contact details.",
                  "Walking, driving, or transit directions.",
                  "Itinerary, checklist, and pickup record.",
                ][active]
              }
            </p>
          </div>
        </div>
      </div>
      <div className="journey-story-steps">
        {[
          {
            title: "Search Near You",
            body: "Enter a ZIP code or neighborhood to see nearby programs, their posted hours, and how to contact them. No account required.",
            link: "Find Food",
            to: "/find-food",
          },
          {
            title: "Plan Your Trip",
            body: "Pick a day, get walking, driving, or transit directions, and see when to leave and what to bring.",
            link: "Plan a Visit",
            to: "/find-food",
          },
          {
            title: "Keep Track",
            body: "Save visits, add them to your calendar, and record each pickup. If plans change, find another option.",
            link: "View My Plan",
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
        <div className="hero-backdrop" aria-hidden="true">
          <ShaderField variant="hero" />
        </div>
        <div className="hero-copy">
          <p className="hero-location">
            <span className="live-dot" /> {directoryMetadata.count} Free Food
            Programs Across NYC
          </p>
          <h1>
            Free Food,
            <br />
            Close to Home.
          </h1>
          <p className="hero-description">
            Find food pantries and community kitchens near you, check their
            hours, and plan your visit.
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
            <label htmlFor="hero-area">ZIP Code or Neighborhood</label>
            <div>
              <Search size={20} />
              <input
                id="hero-area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. 11372 or Astoria"
                aria-label="ZIP code or neighborhood"
              />
              <Link
                className="hero-geo"
                to="/find-food?locate=1"
                aria-label="Use My Location"
                title="Use My Location"
              >
                <LocateFixed size={18} />
              </Link>
              <button className="button button-primary" type="submit">
                Search
              </button>
            </div>
          </form>
          <div className="hero-cta-row">
            <Link
              className="button button-primary button-lg"
              to="/find-food?today=true"
            >
              Find Food Open Today <ArrowRight size={18} />
            </Link>
            <Link className="button button-outline button-lg" to="/volunteer">
              <HeartHandshake size={18} /> Volunteer
            </Link>
          </div>
          <ul className="hero-trust">
            <li>
              <b>{directoryMetadata.count}</b> Programs
            </li>
            <li>
              <b>5</b> Boroughs
            </li>
            <li>
              <b>0</b> Sign-Ups Required
            </li>
          </ul>
        </div>
        <div className="hero-visual">
          <div className="hero-image-frame">
            <img
              src="/images/neighbors-sharing-groceries.png"
              alt="Two neighbors passing a paper grocery bag filled with vegetables and bread"
              fetchPriority="high"
            />
          </div>
        </div>
      </section>
      <div className="home-local-nav">
        <span>Browse by Borough</span>
        <nav aria-label="Find food by borough">
          {boroughs.map((b) => (
            <Link key={b} to={`/find-food?area=${encodeURIComponent(b)}`}>
              {b}
            </Link>
          ))}
        </nav>
        <Link className="food-today-link" to="/find-food?today=true">
          Open Today
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
          <p className="page-context">Volunteer</p>
          <h2>
            Give a Few Hours
            <br />
            to Your Neighbors
          </h2>
          <p>
            Pack groceries, serve meals, or help with distribution at food
            programs near you.
          </p>
          <Link className="button button-primary" to="/volunteer">
            Find Opportunities
          </Link>
        </Reveal>
      </section>
      <section className="partner-section">
        <Reveal>
          <p className="page-context">For Organizations</p>
          <h2>
            Tools for Food
            <br />
            Programs
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p>
            Publish schedules, recruit volunteers, and manage requests from one
            workspace.
          </p>
          <Link className="button button-outline" to="/organizations">
            Open the Workspace
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
