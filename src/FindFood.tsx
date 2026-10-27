import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  LocateFixed,
  SlidersHorizontal,
  Map as MapIcon,
  List,
  Check,
  X,
} from "lucide-react";
import { useDemo } from "./lib/store";
import {
  resolveArea,
  distance,
  nearestZip,
  areaSuggestions,
} from "./lib/services";
import { days, time, directoryMetadata } from "./lib/data";
import { hasFoodToday, serviceWindows } from "./lib/schedules";
import FoodMap from "./components/Map";
import FoodCard from "./components/FoodCard";
import { Empty, Modal } from "./components/ui";
const filterOptions = [
  "Posted today",
  "Step-free access",
  "No appointment",
  "No ID required",
  "Saved",
];
export default function FindFood() {
  const { state, journey, setJourney } = useDemo();
  const [params] = useSearchParams();
  const [area, setArea] = useState(params.get("area") || journey.area),
    [query, setQuery] = useState(params.get("area") || journey.area),
    [scope, setScope] = useState(
      params.get("network") === "demo" ? "demo" : "public",
    ),
    [filters, setFilters] = useState<string[]>(
      params.get("today") ? ["Posted today"] : [],
    ),
    [type, setType] = useState("All services"),
    [radius, setRadius] = useState("5"),
    [day, setDay] = useState("Any day"),
    [diet, setDiet] = useState("Any diet"),
    [language, setLanguage] = useState("Any language"),
    [selected, setSelected] = useState(""),
    [hovered, setHovered] = useState(""),
    [view, setView] = useState("list"),
    [extra, setExtra] = useState(false),
    [geoMessage, setGeoMessage] = useState(""),
    [compare, setCompare] = useState(false),
    [limit, setLimit] = useState(20);
  const origin = useMemo(
    () => resolveArea(query, state.locations),
    [query, state.locations],
  );
  const results = useMemo(
    () =>
      state.locations
        .filter((l) =>
          scope === "public"
            ? l.sourceKind === "public"
            : l.sourceKind !== "public",
        )
        .map((l) => ({
          l,
          miles: origin ? distance(origin, [l.lat, l.lng]) : Infinity,
        }))
        .filter(
          ({ l, miles }) =>
            origin &&
            miles <= Number(radius) &&
            (type === "All services" ||
              l.type === type ||
              l.serviceTypes?.includes(type)) &&
            (day === "Any day" ||
              serviceWindows(l).some((w) => w.day === days.indexOf(day))) &&
            (diet === "Any diet" || l.dietary.includes(diet)) &&
            (language === "Any language" || l.languages.includes(language)) &&
            filters.every((f) =>
              f === "Posted today"
                ? hasFoodToday(l)
                : f === "Step-free access"
                  ? l.accessible === true
                  : f === "No appointment"
                    ? l.appointment === false
                    : f === "No ID required"
                      ? l.noId === true
                      : state.saved.includes(l.id),
            ),
        )
        .sort((a, b) => a.miles - b.miles),
    [
      state.locations,
      state.saved,
      origin,
      scope,
      type,
      radius,
      day,
      diet,
      language,
      filters,
    ],
  );
  const mapLocations = useMemo(() => results.map((r) => r.l), [results]);
  function search() {
    setQuery(area.trim());
    setLimit(20);
    setJourney({ ...journey, area: area.trim() });
  }
  function toggle(f: string) {
    setLimit(20);
    setFilters((s) => (s.includes(f) ? s.filter((x) => x !== f) : [...s, f]));
  }
  function geolocate() {
    if (!navigator.geolocation) {
      setGeoMessage(
        "Your browser cannot share location. Enter a ZIP code or neighborhood.",
      );
      return;
    }
    setGeoMessage("Finding your neighborhood…");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const { latitude, longitude } = p.coords;
        const nearestProgram = state.locations
          .filter((l) => l.sourceKind === "public")
          .reduce(
            (m, l) =>
              Math.min(m, distance([latitude, longitude], [l.lat, l.lng])),
            Infinity,
          );
        const z = nearestZip(latitude, longitude);
        if (!z || nearestProgram > 35) {
          setGeoMessage(
            "The food directory covers New York City. Enter an NYC or nearby ZIP code to explore it.",
          );
          return;
        }
        setArea(z.zip);
        setQuery(z.zip);
        setLimit(20);
        setJourney({ ...journey, area: z.zip });
        setGeoMessage(
          `Showing programs near ZIP ${z.zip}. Your exact location isn’t saved — only the ZIP area.`,
        );
      },
      (err) =>
        setGeoMessage(
          err.code === err.PERMISSION_DENIED
            ? "Location permission was declined. Search by neighborhood or ZIP code instead."
            : "Your location couldn’t be found. Search by neighborhood or ZIP code instead.",
        ),
      { timeout: 10000, maximumAge: 300000 },
    );
  }
  useEffect(() => {
    if (params.get("locate")) geolocate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const saved = state.locations
    .filter((l) => state.saved.includes(l.id))
    .slice(0, 4);
  return (
    <>
      <div className="page-intro directory-intro">
        <div>
          <p className="page-context">Food Directory</p>
          <h1>Find Food Near You</h1>
          <p>
            {directoryMetadata.count} food programs across all five boroughs.
          </p>
        </div>
        <Link
          to={`/find-food/match${scope === "demo" ? "?network=demo" : ""}`}
          className="button button-primary"
        >
          Get Matched
        </Link>
      </div>
      <section className="directory-shell">
        <div className="search-toolbar">
          <form
            className="search-field"
            onSubmit={(e) => {
              e.preventDefault();
              search();
            }}
          >
            <Search size={19} />
            <input
              aria-label="Search ZIP code or neighborhood"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="ZIP code, neighborhood, or borough"
              list="area-suggestions"
              autoComplete="off"
            />
            <datalist id="area-suggestions">
              {areaSuggestions.map((a) => (
                <option key={a} value={a} />
              ))}
            </datalist>
            <button
              className="geo-button"
              type="button"
              aria-label="Use my approximate location"
              onClick={geolocate}
            >
              <LocateFixed size={19} />
            </button>
            <button
              className="button button-primary button-small"
              type="submit"
            >
              Search
            </button>
          </form>
          <label className="select-field">
            <select
              aria-label="Search radius"
              value={radius}
              onChange={(e) => {
                setRadius(e.target.value);
                setLimit(20);
              }}
            >
              {[1, 3, 5, 10, 15, 30, 50].map((n) => (
                <option key={n} value={n}>
                  Within {n} miles
                </option>
              ))}
            </select>
          </label>
          <label className="select-field">
            <select
              aria-label="Preferred day"
              value={day}
              onChange={(e) => setDay(e.target.value)}
            >
              <option>Any day</option>
              {days.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
          <button
            className="filter-toggle"
            aria-expanded={extra}
            onClick={() => setExtra(!extra)}
          >
            <SlidersHorizontal size={17} />
            Filters{filters.length > 0 && <b>{filters.length}</b>}
          </button>
        </div>
        {geoMessage && (
          <p className="inline-message" role="status">
            {geoMessage}
          </p>
        )}
        <div className="filter-row">
          <select
            aria-label="Food assistance type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {[
              "All services",
              "Food pantry",
              "Prepared meals",
              "Mobile distribution",
              "Food bank",
            ].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          {filterOptions.map((f) => (
            <button
              className={`filter-chip ${filters.includes(f) ? "active" : ""}`}
              onClick={() => toggle(f)}
              key={f}
              aria-pressed={filters.includes(f)}
            >
              {filters.includes(f) && <Check size={13} />}
              {f}
            </button>
          ))}
        </div>
        {extra && (
          <div className="extra-filters">
            <label>
              Dietary Needs
              <select value={diet} onChange={(e) => setDiet(e.target.value)}>
                {["Any diet", "Vegetarian", "Halal", "Kosher"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label>
              Language
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {["Any language", "English", "Spanish", "Bengali"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label>
              Directory
              <select
                value={scope}
                onChange={(e) => {
                  setScope(e.target.value);
                  setLimit(20);
                }}
              >
                <option value="public">NYC Public Listings</option>
                <option value="demo">Sample Organizations</option>
              </select>
            </label>
            <button
              className="text-link"
              onClick={() => {
                setFilters([]);
                setDay("Any day");
                setType("All services");
                setDiet("Any diet");
                setLanguage("Any language");
                setRadius("5");
              }}
            >
              Reset Filters
              <X size={13} />
            </button>
            <p>
              Dietary, access, and ID details are only shown when the provider
              lists them.
            </p>
          </div>
        )}
        <div className="directory-content">
          <div
            className={`results-panel ${view === "map" ? "mobile-hidden" : ""}`}
          >
            <div className="results-heading">
              <div>
                <h2>
                  {results.length} {results.length === 1 ? "place" : "places"}{" "}
                  near {query}
                </h2>
                <p>Sorted by distance</p>
              </div>
              <button className="text-link" onClick={() => setCompare(true)}>
                Compare Saved
              </button>
            </div>
            <div className="source-note">
              {scope === "public" ? (
                <>
                  <span className="status-dot" />
                  Source: NYC Food Help. Call ahead to confirm hours.
                </>
              ) : (
                <>Sample organizations for demonstration.</>
              )}
            </div>
            <div className="results-list">
              {results.slice(0, limit).map(({ l, miles }, i) => (
                <FoodCard
                  key={l.id}
                  location={l}
                  index={i}
                  selected={selected === l.id}
                  onSelect={() => setSelected(l.id)}
                  onHover={(active) => setHovered(active ? l.id : "")}
                  miles={miles}
                />
              ))}
              {results.length > limit && (
                <button
                  className="button button-outline load-more"
                  onClick={() => setLimit(limit + 20)}
                >
                  Show 20 more places{" "}
                  <span>
                    {limit} of {results.length}
                  </span>
                </button>
              )}
              {!results.length && (
                <Empty
                  title={origin ? "No Programs Found" : "Enter a Location"}
                >
                  <p>
                    {origin
                      ? "Try another day, a larger radius, or fewer filters."
                      : "Search by ZIP code (11372), neighborhood (Harlem), or borough (Queens)."}
                  </p>
                  <button
                    className="button button-primary"
                    onClick={() => {
                      setRadius("30");
                      setFilters([]);
                      setDay("Any day");
                      setDiet("Any diet");
                      setLanguage("Any language");
                      setType("All services");
                    }}
                  >
                    Clear Filters
                  </button>
                  <a
                    className="text-link"
                    href="https://finder.nyc.gov/foodhelp/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    NYC Food Help Directory
                  </a>
                  <a className="text-link" href="tel:311">
                    Call 311
                  </a>
                </Empty>
              )}
            </div>
          </div>
          <div
            className={`map-panel ${view === "list" ? "mobile-hidden" : ""}`}
          >
            <FoodMap
              origin={origin}
              radiusMiles={Number(radius)}
              locations={mapLocations}
              selected={hovered || selected}
              onSelect={(id) => {
                setHovered("");
                setSelected(id);
                const index = results.findIndex((r) => r.l.id === id);
                if (index >= limit) setLimit(Math.ceil((index + 1) / 20) * 20);
                requestAnimationFrame(() => {
                  const card = document.getElementById(`card-${id}`),
                    panel = card?.closest<HTMLElement>(".results-panel");
                  if (
                    card &&
                    panel?.clientHeight &&
                    card.getClientRects().length
                  )
                    panel.scrollTo({
                      top:
                        card.getBoundingClientRect().top -
                        panel.getBoundingClientRect().top +
                        panel.scrollTop -
                        12,
                      behavior: "smooth",
                    });
                });
              }}
            />
            <div className="map-help-card">
              <p>
                <strong>Not Sure Where to Start?</strong>
                <span>Answer a few questions to find a good match.</span>
              </p>
              <Link
                to={`/find-food/match${scope === "demo" ? "?network=demo" : ""}`}
              >
                Get Matched
              </Link>
            </div>
          </div>
        </div>
        <div className="mobile-view-switch">
          <button onClick={() => setView(view === "list" ? "map" : "list")}>
            {view === "list" ? <MapIcon size={17} /> : <List size={17} />}Show{" "}
            {view === "list" ? "Map" : "List"}
          </button>
        </div>
      </section>
      {compare && (
        <Modal
          title="Compare Saved Places"
          wide
          onClose={() => setCompare(false)}
        >
          {saved.length ? (
            <div className="comparison-scroll">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Notes</th>
                    {saved.map((l) => (
                      <th key={l.id}>
                        <Link to={`/food/${l.id}`}>{l.name}</Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {["Hours", "Documents", "Access", "Delivery"].map((label) => (
                    <tr key={label}>
                      <th>{label}</th>
                      {saved.map((l) => (
                        <td key={l.id}>
                          {label === "Hours"
                            ? serviceWindows(l).length
                              ? serviceWindows(l)
                                  .map(
                                    (w) =>
                                      `${days[w.day].slice(0, 3)} ${time(w.start)}–${time(w.end)}`,
                                  )
                                  .join("; ")
                              : "Call for hours"
                            : label === "Documents"
                              ? l.noId === true
                                ? "No ID required"
                                : l.noId === false
                                  ? "ID required"
                                  : "Not published"
                              : label === "Access"
                                ? l.accessible === true
                                  ? "Step-free"
                                  : l.accessible === false
                                    ? "Not confirmed accessible"
                                    : "Not published"
                                : l.delivery === true
                                  ? "Organization assistance"
                                  : l.delivery === false
                                    ? "Not offered"
                                    : "Not published"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty title="No Saved Places">
              <p>
                Save up to four places with the bookmark button to compare them
                here.
              </p>
            </Empty>
          )}
        </Modal>
      )}
    </>
  );
}
