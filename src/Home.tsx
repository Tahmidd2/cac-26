import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  MapPin,
  Navigation,
  Leaf,
  Heart,
  Check,
  Clock3,
  Sparkles,
  MoveUpRight,
  ShoppingBasket,
  Users,
  Route,
  HandHeart,
  ShieldCheck,
} from "lucide-react";
import { foodPhoto, volunteerPhoto } from "./lib/data";
import { Badge } from "./components/ui";
export default function Home() {
  const [area, setArea] = useState("");
  const navigate = useNavigate();
  return (
    <>
      <section className="home-hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="small-line" /> GOOD FOOD. STRONGER COMMUNITIES.
          </div>
          <h1>
            Good food should
            <br />
            never be{" "}
            <em>
              out
              <br className="desktop-break" /> of reach.
            </em>
            <span className="headline-spark">✳</span>
          </h1>
          <p>
            Find food that works for your family. Share your time.
            <br className="desktop-break" /> Help good things reach the people
            around you.
          </p>
          <div className="hero-buttons">
            <Link className="button button-primary" to="/find-food">
              Find food near me <ArrowUpRight size={19} />
            </Link>
            <Link className="button button-outline" to="/volunteer">
              I want to help <Heart size={17} />
            </Link>
          </div>
          <div className="hero-reassurance">
            <span>
              <Check size={14} /> No account needed
            </span>
            <span>
              <Check size={14} /> Everyone is welcome
            </span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-photo">
            <img
              src={foodPhoto}
              alt="Fresh, colorful vegetables at a neighborhood food market"
            />
            <div className="photo-overlay" />
            <div className="photo-caption">
              <span className="photo-caption-icon">
                <HandHeart size={22} />
              </span>
              <div>
                Good food brings us together.
                <small>Let’s make room at the table.</small>
              </div>
            </div>
          </div>
          <div className="hero-sticker">
            <Leaf size={23} />
            <span>
              Grown in community.
              <br />
              Shared with care.
            </span>
            <span className="sticker-star">✳</span>
          </div>
          <div className="floating-resource">
            <div className="floating-resource-icon">
              <ShoppingBasket size={23} />
            </div>
            <div>
              <strong>A little closer to a full pantry.</strong>
              <span>
                <span className="tiny-dot" /> Discover neighborhood food
                resources
              </span>
            </div>
            <ArrowUpRight size={20} />
            <div className="floating-resource-footer">
              <MapPin size={13} /> New York City{" "}
              <span>18 demo locations to explore</span>
            </div>
          </div>
          <span className="hero-caption">
            FOR OUR NEIGHBORS, BY OUR NEIGHBORS.
          </span>
        </div>
      </section>
      <section className="location-bar-wrap">
        <form
          className="location-bar"
          onSubmit={(e) => {
            e.preventDefault();
            navigate(`/find-food?area=${encodeURIComponent(area || "11372")}`);
          }}
        >
          <div className="location-prompt">
            <span className="location-symbol">
              <MapPin size={22} />
            </span>
            <div>
              <h3>Your next good meal starts here.</h3>
              <p>Let’s find what’s around your corner.</p>
            </div>
          </div>
          <div className="location-input">
            <MapPin size={18} />
            <input
              aria-label="ZIP code or neighborhood"
              placeholder="Enter ZIP code or neighborhood"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
            <button className="button button-primary" type="submit">
              Find food <ArrowRight size={18} />
            </button>
          </div>
        </form>
        <div className="location-under">
          <span>
            <ShieldCheck size={14} /> Private by default. Your search is always
            yours.
          </span>
          <Link to="/find-food?today=true">
            Need food today? <ArrowUpRight size={14} />
          </Link>
        </div>
      </section>
      <section className="community-strip">
        <span>
          Small acts.
          <br />
          <strong>A bigger difference.</strong>
        </span>
        <div>
          <strong>
            18<span>+</span>
          </strong>
          <p>Neighborhood food resources</p>
        </div>
        <div>
          <strong>24</strong>
          <p>Ways to lend a hand</p>
        </div>
        <div>
          <strong>5</strong>
          <p>Boroughs. One community.</p>
        </div>
        <span className="demo-metric-label">
          AN ILLUSTRATION OF
          <br />
          WHAT’S POSSIBLE · DEMO DATA
        </span>
      </section>
      <section className="section how-section" id="how-it-works">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              A LITTLE GUIDANCE. A REAL NEXT STEP.
            </span>
            <h2>Good things start with connection.</h2>
          </div>
          <p>
            Less searching. More getting there.
            <br />A simpler way to find food and give back.
          </p>
        </div>
        <div className="steps">
          <article>
            <div className="step-top">
              <span className="step-icon">
                <MapPin size={24} />
              </span>
              <span className="step-number">01</span>
            </div>
            <h3>Start where you are.</h3>
            <p>
              Tell us your neighborhood and what works for you. No forms to
              prove you need a hand.
            </p>
          </article>
          <article>
            <div className="step-top">
              <span className="step-icon">
                <Sparkles size={24} />
              </span>
              <span className="step-number">02</span>
            </div>
            <h3>Find your kind of fit.</h3>
            <p>
              Explore food resources or volunteer shifts that match your
              schedule, needs, and everyday life.
            </p>
          </article>
          <article>
            <div className="step-top">
              <span className="step-icon">
                <Route size={24} />
              </span>
              <span className="step-number">03</span>
            </div>
            <h3>Make a plan. Move forward.</h3>
            <p>
              Know what to bring, how to get there, and what comes next. We’ll
              help connect the dots.
            </p>
          </article>
        </div>
      </section>
      <section className="audience-section section">
        <div className="audience-food">
          <Badge tone="white">
            <ShoppingBasket size={13} /> FOR YOU & YOUR FAMILY
          </Badge>
          <h2>
            A full table.
            <br />A little peace of mind.
          </h2>
          <p>
            Find nearby food, understand your options, and make a plan that fits
            your life.
          </p>
          <Link className="button button-light" to="/find-food/match">
            Find my food match <ArrowUpRight size={18} />
          </Link>
          <div className="audience-decoration">
            <Leaf size={110} strokeWidth={0.7} />
          </div>
        </div>
        <div className="audience-volunteer">
          <img
            src={volunteerPhoto}
            alt="Community volunteers preparing and sharing food"
          />
          <div className="audience-volunteer-content">
            <Badge tone="white">
              <Heart size={13} /> FOR THE NEIGHBOR IN YOU
            </Badge>
            <h2>
              Your time.
              <br />
              Someone’s better day.
            </h2>
            <Link className="button button-light" to="/volunteer">
              Find a way to help <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>
      <section className="section neighborhood-section">
        <div>
          <span className="eyebrow">MORE THAN A PIN ON A MAP</span>
          <h2>
            Finding food is a start.
            <br />
            <em>Getting there changes things.</em>
          </h2>
          <p>
            A pantry is only helpful if you can actually reach it. Nourish helps
            you see the whole picture, from dietary options to your trip home.
          </p>
          <Link className="text-link" to="/find-food/match">
            Find what works for you <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="feature-stack">
          {[
            [
              Navigation,
              "A way there, and a way forward.",
              "Plan a visit around how you travel and when you’re free.",
            ],
            [
              Leaf,
              "Food that feels right for you.",
              "Compare dietary options, accessibility, and pickup requirements.",
            ],
            [
              Users,
              "A community in your corner.",
              "Explore organization-coordinated pickup and delivery assistance.",
            ],
          ].map(([Icon, title, desc]) => {
            const I = Icon as typeof Leaf;
            return (
              <article key={title as string}>
                <span>
                  <I size={23} />
                </span>
                <div>
                  <h3>{title as string}</h3>
                  <p>{desc as string}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <section className="partner-banner section">
        <div className="partner-symbol">
          <HandHeart size={44} />
        </div>
        <div>
          <span className="eyebrow">FOR COMMUNITY ORGANIZATIONS</span>
          <h2>You bring the care. We’ll help connect it.</h2>
          <p>
            Share distributions, welcome volunteers, and coordinate a little
            more good.
          </p>
        </div>
        <Link className="button button-outline" to="/organizations">
          Let’s work together <MoveUpRight size={18} />
        </Link>
      </section>
      <div className="home-note">
        <Clock3 size={14} /> A working vision for better food access. All
        locations, shifts, and impact figures are demonstration data.
      </div>
    </>
  );
}
