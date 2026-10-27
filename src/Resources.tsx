import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  Leaf,
  ShoppingBasket,
  UtensilsCrossed,
  Baby,
  HandHeart,
  Info,
  Accessibility,
  ShieldCheck,
  Check,
  LockKeyhole,
  Sprout,
  Search,
  Building2,
} from "lucide-react";
import { useDemo } from "./lib/store";
import { Badge } from "./components/ui";
import type { Role } from "./lib/types";
const resources = [
  {
    icon: ShoppingBasket,
    title: "Food Assistance Near You",
    category: "NYC FOOD HELP",
    description:
      "Explore the official New York City food assistance map for actual food pantries and community kitchens.",
    url: "https://finder.nyc.gov/foodhelp/",
    link: "Open NYC Food Help",
  },
  {
    icon: Leaf,
    title: "SNAP Benefits",
    category: "SNAP · NYC HRA",
    description:
      "Read official SNAP information, explore the application guide, and connect with ACCESS HRA.",
    url: "https://www.nyc.gov/site/hra/help/snap-benefits-food-program.page",
    link: "Learn About SNAP",
  },
  {
    icon: UtensilsCrossed,
    title: "Free School Meals",
    category: "NYC PUBLIC SCHOOLS",
    description:
      "Find current school meal information, menus, and food service updates from NYC Public Schools.",
    url: "https://www.schools.nyc.gov/school-life/school-meals",
    link: "Learn About School Meals",
  },
  {
    icon: Baby,
    title: "WIC for Families",
    category: "WIC · ACCESS NYC",
    description:
      "Explore official information about WIC nutrition support and how to connect with a local program.",
    url: "https://access.nyc.gov/programs/women-infants-and-children-wic/",
    link: "Learn About WIC",
  },
  {
    icon: HandHeart,
    title: "Food Bank Network",
    category: "FEEDING AMERICA",
    description:
      "Use Feeding America’s food bank finder to connect with real food assistance beyond this NYC demo.",
    url: "https://www.feedingamerica.org/need-help-find-food",
    link: "Find a Food Bank",
  },
  {
    icon: Heart,
    title: "Talk to Someone",
    category: "NYC 311",
    description:
      "Find food and community services through New York City’s official information service. In NYC, call 311 for help.",
    url: "https://portal.311.nyc.gov/",
    link: "Visit NYC 311",
  },
];
export default function Resources() {
  return (
    <section className="content-page resources-page">
      <div className="resource-intro">
        <span className="eyebrow">RESOURCES</span>
        <h1>
          Food & Benefits
          <br />
          Resources
        </h1>
        <p>
          Official programs for food, nutrition, and benefits in New York City.
        </p>
        <Badge>
          <ShieldCheck size={12} />
          Official Sources
        </Badge>
      </div>
      <div className="urgent-resource">
        <span>
          <UtensilsCrossed size={26} />
        </span>
        <div>
          <h2>Need Food Today?</h2>
          <p>
            Use the NYC Food Help map or call 311. Confirm hours before
            traveling.
          </p>
        </div>
        <a
          className="button button-primary"
          href="https://finder.nyc.gov/foodhelp/"
          target="_blank"
          rel="noreferrer"
        >
          Open NYC Food Help
        </a>
      </div>
      <div className="resource-grid">
        {resources.map(({ icon: Icon, ...r }) => (
          <a
            key={r.title}
            className="resource-card"
            href={r.url}
            target="_blank"
            rel="noreferrer"
          >
            <span className="resource-card-icon">
              <Icon size={24} />
            </span>
            <span className="eyebrow">{r.category}</span>
            <h2>{r.title}</h2>
            <p>{r.description}</p>
            <span className="text-link">{r.link}</span>
          </a>
        ))}
      </div>
      <section className="accessibility-panel" id="accessibility">
        <Accessibility size={27} />
        <div>
          <h2>Accessibility</h2>
          <p>
            Nourish supports keyboard navigation, visible focus, labeled forms,
            and mobile layouts. Search without an account or your exact address.
            Currently available in English; Spanish and Bengali are planned.
          </p>
          <p>
            Nourish is a directory, not a service provider. Nothing is booked
            through this site.
          </p>
        </div>
      </section>
      <div className="notice">
        <Info size={17} />
        <p>
          Each organization sets its own eligibility and schedules. Nourish does
          not determine eligibility or collect applications.
        </p>
      </div>
    </section>
  );
}
export function Auth() {
  const { update } = useDemo();
  const navigate = useNavigate();
  const [mode, setMode] = useState("Sign in"),
    [role, setRole] = useState<Role>("Family");
  return (
    <section className="auth-page">
      <div className="auth-story">
        <div className="eyebrow">
          <Sprout size={16} />
          NOURISH
        </div>
        <h1>Sign In</h1>
        <p>
          Whether you need a hand or have one to offer,
          <br />
          there’s a place for you in this community.
        </p>
        <div>
          <span>
            <Check size={15} />
            Explore without an account
          </span>
          <span>
            <Check size={15} />
            No proof of need
          </span>
          <span>
            <Check size={15} />
            Your privacy comes first
          </span>
        </div>
      </div>
      <div className="auth-card">
        <Badge tone="amber">
          <LockKeyhole size={12} />
          DEMO MODE · NO REAL AUTHENTICATION
        </Badge>
        <div className="auth-tabs">
          <button
            className={mode === "Sign in" ? "active" : ""}
            onClick={() => setMode("Sign in")}
          >
            Sign in
          </button>
          <button
            className={mode === "Sign up" ? "active" : ""}
            onClick={() => setMode("Sign up")}
          >
            Sign up
          </button>
        </div>
        <h2>
          {mode === "Sign in"
            ? "Welcome to the neighborhood."
            : "Good things start with you."}
        </h2>
        <p>
          Preview the experience by choosing a role. No email, password, or real
          account needed.
        </p>
        <label className="field">I’m here to…</label>
        <div className="auth-role-options">
          {(
            [
              ["Family", Search, "Find food for my family"],
              ["Volunteer", Heart, "Share my time"],
              ["Organization", Building2, "Support my community"],
            ] as const
          ).map(([r, Icon, label]) => (
            <button
              key={r}
              className={role === r ? "selected" : ""}
              onClick={() => setRole(r)}
            >
              <Icon size={18} />
              {label}
              {role === r && <Check size={15} />}
            </button>
          ))}
        </div>
        <button
          className="button button-primary button-full"
          onClick={() => {
            update((s) => ({ ...s, role }));
            navigate(
              role === "Family"
                ? "/find-food"
                : role === "Volunteer"
                  ? "/volunteer"
                  : "/organizations/dashboard",
            );
          }}
        >
          {mode === "Sign in" ? "Enter demo" : "Start exploring"}
        </button>
        <p className="auth-note">
          Demo choices are stored only in this browser.
          <br />
          You can switch roles any time.
        </p>
        <Link to="/" className="text-link">
          Back to Home
        </Link>
      </div>
    </section>
  );
}
export function NotFound() {
  return (
    <section className="not-found">
      <span className="match-symbol">
        <Sprout size={30} />
      </span>
      <span className="eyebrow">404</span>
      <h1>Page Not Found</h1>
      <p>The page you’re looking for doesn’t exist.</p>
      <Link className="button button-primary" to="/find-food">
        Find Food
      </Link>
    </section>
  );
}
