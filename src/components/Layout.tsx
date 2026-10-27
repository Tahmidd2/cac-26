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
              Find Food
            </NavLink>
            <NavLink onClick={() => setMenu(false)} to="/volunteer">
              Volunteer
            </NavLink>
            <NavLink onClick={() => setMenu(false)} to="/organizations">
              Organizations
            </NavLink>
            <NavLink onClick={() => setMenu(false)} to="/resources">
              Resources
            </NavLink>
          </nav>
          <div className="nav-actions">
            <Link className="plan-link" to="/my-plan">
              My Plan{state.plans.length > 0 && <b>{state.plans.length}</b>}
            </Link>
            <button className="role-button" onClick={() => setRoleOpen(true)}>
              Demo Roles
            </button>
            <Link className="nav-cta" to="/find-food?today=true">
              Open Today
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
            <h2>Find Free Food Near You</h2>
            <p>
              {directoryMetadata.count} programs across all five boroughs. No
              account required.
            </p>
          </div>
          <div className="footer-cta-actions">
            <Link className="button button-light" to="/find-food">
              Find Food
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
              Free food resources for
              <br />
              New York City.
            </p>
          </div>
          <div>
            <h4>Find Food</h4>
            <Link to="/find-food">Search Programs</Link>
            <Link to="/find-food/match">Get Matched</Link>
            <Link to="/my-plan">My Plan</Link>
          </div>
          <div>
            <h4>Get Involved</h4>
            <Link to="/volunteer">Volunteer</Link>
            <Link to="/organizations">Organization Workspace</Link>
            <Link to="/volunteer/dashboard">My Schedule</Link>
          </div>
          <div>
            <h4>Support</h4>
            <Link to="/resources">Food & Benefits</Link>
            <Link to="/resources#accessibility">Accessibility</Link>
            <Link to="/auth">Demo Roles</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Nourish</span>
          <p>
            Listings sourced from NYC Food Help. Volunteer and organization
            features are demonstrations.
          </p>
        </div>
      </footer>
      <nav className="bottom-nav" aria-label="Mobile quick navigation">
        <NavLink to="/find-food">Find Food</NavLink>
        <NavLink to="/volunteer">Volunteer</NavLink>
        <NavLink to="/my-plan">
          My Plan{state.plans.length > 0 && <span>{state.plans.length}</span>}
        </NavLink>
        <button onClick={() => setRoleOpen(true)}>Demo Roles</button>
      </nav>
      {roleOpen && (
        <Modal title="Choose a Demo Role" onClose={() => setRoleOpen(false)}>
          <p className="muted">
            Food listings are real. Volunteer and organization features are
            demonstrations.
          </p>
          <div className="role-choices">
            {(
              [
                [
                  "Family",
                  "Find Food & Plan a Visit",
                  "Search NYC listings and build a personal food plan.",
                ],
                [
                  "Volunteer",
                  "Volunteer",
                  "Browse opportunities, sign up, and view a sample schedule.",
                ],
                [
                  "Organization",
                  "Manage an Organization",
                  "Manage a sample pantry, shifts, and assistance requests.",
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
              No account is created and nothing is sent. All data stays in this
              browser.
            </p>
          </div>
          <Link
            className="text-link"
            to="/auth"
            onClick={() => setRoleOpen(false)}
          >
            Preview Sign-In
          </Link>
        </Modal>
      )}
    </>
  );
}
