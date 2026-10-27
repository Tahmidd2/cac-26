import { useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  ArrowUpRight,
  ChevronDown,
  Menu,
  X,
  Heart,
  CalendarDays,
  Search,
  Users,
  Building2,
  Info,
  ArrowRight,
} from "lucide-react";
import { Brand, Modal } from "./ui";
import { useDemo } from "../lib/store";
import type { Role } from "../lib/types";
export default function Layout() {
  const { state, update } = useDemo();
  const [menu, setMenu] = useState(false),
    [roleOpen, setRoleOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
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
      <div className="demo-strip">
        <span>
          <span className="tiny-dot" /> A little connection. A lot of
          possibility.
        </span>
        <button onClick={() => setRoleOpen(true)}>
          Interactive demo <Info size={12} />
        </button>
      </div>
      <header className="site-header">
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
            <Link
              className="plan-link"
              to="/my-plan"
              aria-label={`My plan, ${state.plans.length} visits`}
            >
              <CalendarDays size={18} />
              <span>My plan</span>
              {state.plans.length > 0 && <b>{state.plans.length}</b>}
            </Link>
            <button className="role-button" onClick={() => setRoleOpen(true)}>
              <span className="avatar">
                {state.role === "Family"
                  ? "N"
                  : state.role === "Volunteer"
                    ? "V"
                    : "O"}
              </span>
              <span>Explore demo</span>
              <ChevronDown size={14} />
            </button>
            <button
              className="menu-toggle icon-button"
              aria-label={menu ? "Close menu" : "Open menu"}
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      <main id="main" key={location.pathname}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="footer-top">
          <div>
            <Brand />
            <p>
              Good food, within reach.
              <br />A stronger community, together.
            </p>
          </div>
          <div>
            <h4>Find your way</h4>
            <Link to="/find-food">Find food</Link>
            <Link to="/find-food/match">Find my match</Link>
            <Link to="/my-plan">My weekly plan</Link>
          </div>
          <div>
            <h4>Lend a hand</h4>
            <Link to="/volunteer">Volunteer opportunities</Link>
            <Link to="/organizations">For organizations</Link>
            <Link to="/volunteer/dashboard">My volunteer schedule</Link>
          </div>
          <div>
            <h4>A little more support</h4>
            <Link to="/resources">Resources & benefits</Link>
            <Link to="/resources#accessibility">Accessibility</Link>
            <Link to="/auth">Explore a demo role</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Nourish. Built around our neighbors.
          </span>
          <span>
            <Heart size={13} /> This is a prototype. All organizations and
            activity are fictional.
          </span>
        </div>
      </footer>
      <nav className="bottom-nav" aria-label="Mobile quick navigation">
        <NavLink to="/find-food">
          <Search size={19} />
          Find food
        </NavLink>
        <NavLink to="/volunteer">
          <Heart size={19} />
          Volunteer
        </NavLink>
        <NavLink to="/my-plan">
          <CalendarDays size={19} />
          My plan
        </NavLink>
        <button onClick={() => setRoleOpen(true)}>
          <Users size={19} />
          Demo role
        </button>
      </nav>
      {roleOpen && (
        <Modal
          title="A community. Three perspectives."
          onClose={() => setRoleOpen(false)}
        >
          <p className="muted">
            Explore how families, volunteers, and organizations connect. No
            account needed.
          </p>
          <div className="role-choices">
            {(
              [
                ["Family", Search, "Find food that works for you."],
                ["Volunteer", Heart, "Put your time where it matters."],
                ["Organization", Building2, "Bring your community together."],
              ] as const
            ).map(([r, Icon, desc]) => (
              <button key={r} onClick={() => switchRole(r)}>
                <span className="role-choice-icon">
                  <Icon size={22} />
                </span>
                <span>
                  <strong>Explore as a {r.toLowerCase()}</strong>
                  <small>{desc}</small>
                </span>
                <ArrowRight size={19} />
              </button>
            ))}
          </div>
          <div className="notice">
            <Info size={17} />
            <p>
              Demo mode only. No real account is created, no registrations are
              sent, and no food or assistance is reserved. Changes stay in this
              browser.
            </p>
          </div>
          <Link
            to="/auth"
            onClick={() => setRoleOpen(false)}
            className="text-link"
          >
            Preview sign in <ArrowUpRight size={15} />
          </Link>
        </Modal>
      )}
    </>
  );
}
