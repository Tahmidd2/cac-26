import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
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
    title: "Find real food assistance near you",
    category: "NYC FOOD HELP",
    description:
      "Explore the official New York City food assistance map for actual food pantries and community kitchens.",
    url: "https://finder.nyc.gov/foodhelp/",
    link: "Open NYC Food Help",
  },
  {
    icon: Leaf,
    title: "Get support with everyday groceries",
    category: "SNAP · NYC HRA",
    description:
      "Read official SNAP information, explore the application guide, and connect with ACCESS HRA.",
    url: "https://www.nyc.gov/site/hra/help/snap-benefits-food-program.page",
    link: "Explore SNAP information",
  },
  {
    icon: UtensilsCrossed,
    title: "School meals, a little easier",
    category: "NYC PUBLIC SCHOOLS",
    description:
      "Find current school meal information, menus, and food service updates from NYC Public Schools.",
    url: "https://www.schools.nyc.gov/school-life/school-meals",
    link: "Learn about school meals",
  },
  {
    icon: Baby,
    title: "Nutrition support for growing families",
    category: "WIC · ACCESS NYC",
    description:
      "Explore official information about WIC nutrition support and how to connect with a local program.",
    url: "https://access.nyc.gov/programs/women-infants-and-children-wic/",
    link: "Learn about WIC",
  },
  {
    icon: HandHeart,
    title: "A wider network of food support",
    category: "FEEDING AMERICA",
    description:
      "Use Feeding America’s food bank finder to connect with real food assistance beyond this NYC demo.",
    url: "https://www.feedingamerica.org/need-help-find-food",
    link: "Find a food bank",
  },
  {
    icon: Heart,
    title: "A real person to help you find your way",
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
        <span className="eyebrow">A LITTLE MORE SUPPORT</span>
        <h1>
          You don’t have to
          <br />
          <em>figure it all out alone.</em>
        </h1>
        <p>
          A few trusted places to start. These links take you to real, official
          services.
        </p>
        <Badge>
          <ShieldCheck size={12} />
          External resources · Separate from our demo
        </Badge>
      </div>
      <div className="urgent-resource">
        <span>
          <UtensilsCrossed size={26} />
        </span>
        <div>
          <h2>Need food today?</h2>
          <p>
            Our demo locations are fictional. For real food resources, use the
            official NYC Food Help map or call NYC 311.
          </p>
        </div>
        <a
          className="button button-primary"
          href="https://finder.nyc.gov/foodhelp/"
          target="_blank"
          rel="noreferrer"
        >
          Find real food assistance
          <ArrowUpRight size={16} />
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
            <span className="text-link">
              {r.link}
              <ArrowUpRight size={15} />
            </span>
          </a>
        ))}
      </div>
      <section className="accessibility-panel" id="accessibility">
        <Accessibility size={27} />
        <div>
          <h2>Designed to welcome you.</h2>
          <p>
            Nourish is built with keyboard navigation, visible focus indicators,
            labeled forms, and responsive layouts. You can search without an
            account or sharing your exact address. The prototype is currently
            available in English. Spanish and Bengali localization are future
            work.
          </p>
          <p>
            This project is a working prototype, not a service provider. No
            food, transportation, or assistance is booked through this demo.
          </p>
        </div>
      </section>
      <div className="notice">
        <Info size={17} />
        <p>
          Official organizations set their own eligibility, schedules, and
          application processes. Follow the linked provider’s current guidance.
          Nourish does not determine eligibility or collect benefit
          applications.
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
          GOOD FOOD. STRONGER COMMUNITIES.
        </div>
        <h1>
          A place at the table.
          <br />
          <em>For everyone.</em>
        </h1>
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
          <ArrowRight size={16} />
        </button>
        <p className="auth-note">
          Demo choices are stored only in this browser.
          <br />
          You can switch roles any time.
        </p>
        <Link to="/" className="text-link">
          Back to the neighborhood
          <ArrowUpRight size={14} />
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
      <span className="eyebrow">A LITTLE OFF THE BEATEN PATH</span>
      <h1>Let’s find your way back.</h1>
      <p>This page isn’t here, but a good next step is.</p>
      <Link className="button button-primary" to="/find-food">
        Find nearby food
        <ArrowRight size={17} />
      </Link>
    </section>
  );
}
