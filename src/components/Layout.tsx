import { useEffect, useState } from "react";
import ShaderField from "./ShaderField";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Brand, Modal } from "./ui";
import { useDemo } from "../lib/store";
import { directoryMetadata } from "../lib/data";
import type { Role } from "../lib/types";
export default function Layout() {
  const { state, update } = useDemo();
  const [menu, setMenu] = useState(false),
    [roleOpen, setRoleOpen] = useState(false);
  const navigate = useNavigate(),
    location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const isHome = location.pathname === "/";
  function switchRole(role: Role) {
    update((s) => ({ ...s, role }));
    setRoleOpen(false);
    navigate(
      role === "Family"
        ? "/find-food"
        : role === "Volunteer"
          ? "/volunteer"
          : "/organizations/dashboard",
    );
  }
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header
        className={`site-header ${scrolled ? "is-scrolled" : ""} ${isHome ? "on-home" : ""}`}
      >
        <div className="nav-wrap">
          <Brand />
          <nav
            className={menu ? "desktop-nav mobile-open" : "desktop-nav"}
            aria-label="Main navigation"
          >
            <NavLink onClick={() => setMenu(false)} to="/find-food">
              Find food
            </NavLink>
            <NavLink onClick={() => setMenu(false)} to="/volunteer">
              Volunteer
            </NavLink>
            <NavLink onClick={() => setMenu(false)} to="/organizations">
              For organizations
            </NavLink>
            <NavLink onClick={() => setMenu(false)} to="/resources">
              Resources
            </NavLink>
          </nav>
          <div className="nav-actions">
            <Link className="plan-link" to="/my-plan">
              My plan{state.plans.length > 0 && <b>{state.plans.length}</b>}
            </Link>
            <button className="role-button" onClick={() => setRoleOpen(true)}>
              Explore the demo
            </button>
            <Link className="nav-cta" to="/find-food">
              Find food
            </Link>
            <button
              className="menu-toggle icon-button"
              aria-label={menu ? "Close menu" : "Open menu"}
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>
      <main id="main" key={location.pathname}>
        {!isHome && (
          <div className="page-aura" aria-hidden="true">
            <ShaderField variant="ambient" intensity={0.9} />
          </div>
        )}
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="footer-cta">
          <div>
            <h2>Good food is closer than you think.</h2>
            <p>
              Search {directoryMetadata.count} free food programs across all
              five boroughs. No account, no sign-up.
            </p>
          </div>
          <div className="footer-cta-actions">
            <Link className="button button-light" to="/find-food">
              Find food near me
            </Link>
            <Link className="button button-ghost-light" to="/volunteer">
              Volunteer
            </Link>
          </div>
          <ShaderField variant="deep" />
        </div>
        <div className="footer-top">
          <div>
            <Brand />
            <p>
              Good food, within reach.
              <br />
              New York, together.
            </p>
          </div>
          <div>
            <h4>For your everyday</h4>
            <Link to="/find-food">Find food near you</Link>
            <Link to="/find-food/match">Help me find a fit</Link>
            <Link to="/my-plan">My food plan</Link>
          </div>
          <div>
            <h4>For your community</h4>
            <Link to="/volunteer">Ways to volunteer</Link>
            <Link to="/organizations">Organization workspace</Link>
            <Link to="/volunteer/dashboard">My volunteer schedule</Link>
          </div>
          <div>
            <h4>A little more support</h4>
            <Link to="/resources">Food & benefits resources</Link>
            <Link to="/resources#accessibility">Accessibility</Link>
            <Link to="/auth">Explore demo roles</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Nourish</span>
          <p>
            Food listings are sourced from NYC Food Help. Organization accounts,
            volunteer signups, and assistance coordination are demonstrations.
          </p>
        </div>
      </footer>
      <nav className="bottom-nav" aria-label="Mobile quick navigation">
        <NavLink to="/find-food">Find food</NavLink>
        <NavLink to="/volunteer">Volunteer</NavLink>
        <NavLink to="/my-plan">
          My plan{state.plans.length > 0 && <span>{state.plans.length}</span>}
        </NavLink>
        <button onClick={() => setRoleOpen(true)}>Demo roles</button>
      </nav>
      {roleOpen && (
        <Modal
          title="A community, connected."
          onClose={() => setRoleOpen(false)}
        >
          <p className="muted">
            Find real public food listings, or try the connected volunteer and
            organization demonstrations.
          </p>
          <div className="role-choices">
            {(
              [
                [
                  "Family",
                  "Find food & plan a visit",
                  "Explore public NYC listings and build your personal food plan.",
                ],
                [
                  "Volunteer",
                  "Share your time",
                  "Try volunteer discovery, signup, and your sample schedule.",
                ],
                [
                  "Organization",
                  "Support your neighborhood",
                  "Manage the sample pantry, shifts, and assistance workflow.",
                ],
              ] as const
            ).map(([role, title, description]) => (
              <button key={role} onClick={() => switchRole(role)}>
                <span>
                  <strong>{title}</strong>
                  <small>{description}</small>
                </span>
                <span className="role-choice-action">Explore</span>
              </button>
            ))}
          </div>
          <div className="notice">
            <p>
              No real account is created, messages are not sent, and no food or
              assistance is reserved. Personal plans and demo changes stay in
              this browser.
            </p>
          </div>
          <Link
            className="text-link"
            to="/auth"
            onClick={() => setRoleOpen(false)}
          >
            Preview sign in
          </Link>
        </Modal>
      )}
    </>
  );
}
