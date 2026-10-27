import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Users,
  CalendarDays,
  HandHeart,
  Plus,
  Check,
  Clock3,
  LayoutDashboard,
  ShoppingBasket,
  ClipboardList,
  Pencil,
  Pause,
  Play,
  Info,
  Heart,
  Sprout,
  RotateCcw,
} from "lucide-react";
import { useDemo } from "./lib/store";
import { Badge, Modal, Empty } from "./components/ui";
import type { Opportunity, FoodLocation } from "./lib/types";
import { days, today, nextDay, formatDate, time, localDate } from "./lib/data";
import { advanceRequest, requestStatuses } from "./lib/services";
export default function Organizations() {
  const { state, update } = useDemo();
  return (
    <section className="content-page organizations-landing">
      <div className="organization-hero">
        <span className="match-symbol">
          <HandHeart size={28} />
        </span>
        <div className="eyebrow">FOR ORGANIZATIONS</div>
        <h1>
          Run Your Food Program
          <br />
          in One Place
        </h1>
        <p>
          Publish distribution schedules, recruit volunteers, and manage
          assistance requests.
        </p>
        <Link
          to="/organizations/dashboard"
          className="button button-primary"
          onClick={() => update((s) => ({ ...s, role: "Organization" }))}
        >
          Open the Workspace
        </Link>
        <small>Demo workspace. No sign-up required.</small>
      </div>
      <div className="organization-features">
        {[
          [
            ShoppingBasket,
            "Publish Distributions",
            "Post schedules, requirements, and accessibility details. Updates appear in search.",
          ],
          [
            Users,
            "Recruit Volunteers",
            "Post shifts and track signups against your staffing needs.",
          ],
          [
            HandHeart,
            "Manage Assistance",
            "Review assistance requests and coordinate approved support.",
          ],
        ].map(([Icon, title, desc]) => {
          const I = Icon as typeof Users;
          return (
            <article key={title as string}>
              <I size={27} />
              <h3>{title as string}</h3>
              <p>{desc as string}</p>
            </article>
          );
        })}
      </div>
      <section className="workspace-preview">
        <div>
          <Badge>
            <Sprout size={12} />A LOOK INSIDE
          </Badge>
          <h2>
            Less administration.
            <br />
            More room for your mission.
          </h2>
          <p>
            A simple workspace that connects to the family and volunteer
            experience, so everyone is working from the same picture.
          </p>
          <Link to="/organizations/dashboard" className="text-link">
            Take a Look Around
          </Link>
        </div>
        <div className="preview-window">
          <span className="preview-window-label">
            <Building2 size={14} />
            Queens Table · Demo workspace
          </span>
          <div className="preview-stat-row">
            <span>
              <small>Open shifts</small>
              <strong>
                {
                  state.opportunities.filter(
                    (o) => o.orgId === "food-1" && o.active,
                  ).length
                }
              </strong>
            </span>
            <span>
              <small>Pending requests</small>
              <strong>
                {
                  state.requests.filter(
                    (r) =>
                      r.locationId === "food-1" && r.status !== "Completed",
                  ).length
                }
              </strong>
            </span>
          </div>
          <div className="preview-activity">
            <span>
              <Check size={13} />
            </span>
            <div>
              <strong>Your community, connected.</strong>
              <small>
                Distribution, volunteer, and assistance updates in one place.
              </small>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
function OpportunityEditor({
  existing,
  orgId,
  onClose,
}: {
  existing?: Opportunity;
  orgId: string;
  onClose: () => void;
}) {
  const { update } = useDemo();
  const [form, setForm] = useState({
    title: existing?.title || "",
    activity: existing?.activity || "Food distribution",
    date: existing?.date || nextDay(6),
    start: existing?.start || 9,
    end: existing?.end || 12,
    capacity: existing?.capacity || 6,
    priority: existing?.priority ?? true,
    minAge: existing?.minAge || 16,
    accessible: existing?.accessible ?? true,
    group: existing?.group ?? false,
    recurring: existing?.recurring ?? false,
    requirements:
      existing?.requirements.join("\n") ||
      "Comfortable shoes\nBrief orientation included",
    description:
      existing?.description ||
      "Join a welcoming team of neighbors and help good food reach our community. We’ll show you everything you need to know.",
  });
  const [error, setError] = useState("");
  function field(key: string, value: string | number | boolean) {
    setForm((s) => ({ ...s, [key]: value }));
  }
  return (
    <Modal
      title={
        existing
          ? "A little update to your opportunity."
          : "Make room for a few more helping hands."
      }
      wide
      onClose={onClose}
    >
      <Badge tone="gray">DEMO OPPORTUNITY · APPEARS IN VOLUNTEER SEARCH</Badge>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (
            form.date < today ||
            form.end <= form.start ||
            form.capacity < (existing?.filled || 0)
          ) {
            setError(
              "Choose a future date, an end time after the start, and a capacity at least as large as current signups.",
            );
            return;
          }
          if (!form.title.trim()) {
            setError("Give your opportunity a descriptive title.");
            return;
          }
          const opportunity: Opportunity = {
            ...form,
            title: form.title.trim(),
            id: existing?.id || crypto.randomUUID(),
            orgId,
            filled: existing?.filled || 0,
            active: existing?.active ?? true,
            requirements: form.requirements.split("\n").filter(Boolean),
          };
          update((s) => ({
            ...s,
            opportunities: existing
              ? s.opportunities.map((o) =>
                  o.id === existing.id ? opportunity : o,
                )
              : [opportunity, ...s.opportunities],
          }));
          onClose();
        }}
      >
        <label className="field">
          Opportunity title
          <input
            value={form.title}
            onChange={(e) => field("title", e.target.value)}
            placeholder="e.g. Help our neighbors fill their pantries"
            required
            maxLength={100}
          />
        </label>
        <div className="form-grid">
          <label className="field">
            Activity
            <select
              value={form.activity}
              onChange={(e) => field("activity", e.target.value)}
            >
              {[
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
          </label>
          <label className="field">
            Distribution date
            <input
              type="date"
              min={today}
              value={form.date}
              onChange={(e) => field("date", e.target.value)}
              required
            />
          </label>
        </div>
        <div className="form-grid">
          <label className="field">
            Start time
            <select
              value={form.start}
              onChange={(e) => field("start", Number(e.target.value))}
            >
              {Array.from({ length: 15 }, (_, i) => i + 6).map((h) => (
                <option key={h} value={h}>
                  {time(h)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            End time
            <select
              value={form.end}
              onChange={(e) => field("end", Number(e.target.value))}
            >
              {Array.from({ length: 15 }, (_, i) => i + 7).map((h) => (
                <option key={h} value={h}>
                  {time(h)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-grid">
          <label className="field">
            Volunteer capacity
            <input
              type="number"
              min={Math.max(1, existing?.filled || 0)}
              max="100"
              value={form.capacity}
              onChange={(e) => field("capacity", Number(e.target.value))}
              required
            />
          </label>
          <label className="field">
            Minimum age
            <input
              type="number"
              min="10"
              max="99"
              value={form.minAge}
              onChange={(e) => field("minAge", Number(e.target.value))}
              required
            />
          </label>
        </div>
        <label className="field">
          What volunteers will do
          <textarea
            value={form.description}
            onChange={(e) => field("description", e.target.value)}
            required
            maxLength={600}
          />
        </label>
        <label className="field">
          Requirements <span className="optional">One per line</span>
          <textarea
            value={form.requirements}
            onChange={(e) => field("requirements", e.target.value)}
            maxLength={600}
          />
        </label>
        <div className="editor-checkboxes">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.priority}
              onChange={(e) => field("priority", e.target.checked)}
            />
            High priority
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={!!form.accessible}
              onChange={(e) => field("accessible", e.target.checked)}
            />
            Accessible activity
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.group}
              onChange={(e) => field("group", e.target.checked)}
            />
            Groups welcome
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.recurring}
              onChange={(e) => field("recurring", e.target.checked)}
            />
            Recurring
          </label>
        </div>
        {form.activity === "Delivery support" && (
          <div className="notice">
            <Info size={16} />
            <p>
              Delivery volunteers require separate organizational approval. Do
              not add household addresses or contact details to this demo
              opportunity.
            </p>
          </div>
        )}
        {error && (
          <p className="error-text" role="alert">
            {error}
          </p>
        )}
        <button className="button button-primary button-full" type="submit">
          {existing ? "Save opportunity" : "Publish demo opportunity"}
        </button>
      </form>
    </Modal>
  );
}
function AvailabilityForm({ location: l }: { location: FoodLocation }) {
  const { update } = useDemo();
  const [form, setForm] = useState(l),
    [saved, setSaved] = useState(false);
  function field<K extends keyof FoodLocation>(key: K, value: FoodLocation[K]) {
    setSaved(false);
    setForm((s) => ({ ...s, [key]: value }));
  }
  return (
    <form
      className="availability-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!form.days.length || form.end <= form.start) return;
        update((s) => ({
          ...s,
          locations: s.locations.map((o) =>
            o.id === l.id
              ? { ...form, verified: true, updatedAt: localDate() }
              : o,
          ),
        }));
        setSaved(true);
      }}
    >
      <div className="workspace-section-heading">
        <div>
          <h2>Distribution Overview</h2>
          <p>Changes update the family-facing demo immediately.</p>
        </div>
        <Link className="text-link" to={`/food/${l.id}`}>
          View Public Listing
        </Link>
      </div>
      <label className="field">Distribution days</label>
      <div className="day-picker">
        {days.map((d, i) => (
          <button
            type="button"
            key={d}
            aria-pressed={form.days.includes(i)}
            className={form.days.includes(i) ? "selected" : ""}
            onClick={() =>
              field(
                "days",
                form.days.includes(i)
                  ? form.days.filter((x) => x !== i)
                  : [...form.days, i],
              )
            }
          >
            {d.slice(0, 3)}
          </button>
        ))}
      </div>
      <div className="form-grid">
        <label className="field">
          Opening time
          <select
            value={form.start}
            onChange={(e) => field("start", Number(e.target.value))}
          >
            {Array.from({ length: 14 }, (_, i) => i + 6).map((h) => (
              <option value={h} key={h}>
                {time(h)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Closing time
          <select
            value={form.end}
            onChange={(e) => field("end", Number(e.target.value))}
          >
            {Array.from({ length: 14 }, (_, i) => i + 7).map((h) => (
              <option value={h} key={h}>
                {time(h)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="form-grid">
        <label className="field">
          Food service type
          <select
            value={form.type}
            onChange={(e) =>
              field("type", e.target.value as FoodLocation["type"])
            }
          >
            {[
              "Food pantry",
              "Prepared meals",
              "Mobile distribution",
              "Food bank",
            ].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Inventory categories{" "}
          <span className="optional">Comma separated · illustrative</span>
          <input
            value={form.inventory.join(", ")}
            onChange={(e) =>
              field(
                "inventory",
                e.target.value.split(",").map((x) => x.trim()),
              )
            }
            required
          />
        </label>
      </div>
      <label className="field">
        Pickup instructions
        <textarea
          value={form.instructions}
          onChange={(e) => field("instructions", e.target.value)}
          required
          maxLength={600}
        />
      </label>
      <div className="editor-checkboxes">
        {(
          [
            ["accessible", "Accessible entrance"],
            ["delivery", "Delivery assistance"],
            ["appointment", "Appointment required"],
            ["noId", "No ID required"],
          ] as const
        ).map(([key, label]) => (
          <label className="checkbox-label" key={key}>
            <input
              type="checkbox"
              checked={!!form[key]}
              onChange={(e) => field(key, e.target.checked)}
            />
            {label}
          </label>
        ))}
      </div>
      {(!form.days.length || form.end <= form.start) && (
        <p className="error-text">
          Choose at least one distribution day and a closing time after opening.
        </p>
      )}
      <div className="form-actions">
        {saved && (
          <span className="inline-success" role="status">
            <Check size={16} />
            Saved & demo verification updated
          </span>
        )}
        <button className="button button-primary" type="submit">
          Save & Confirm
          <Check size={15} />
        </button>
      </div>
    </form>
  );
}
export function OrganizationDashboard() {
  const { state, update, reset } = useDemo();
  const [orgId, setOrgId] = useState("food-1"),
    [tab, setTab] = useState("Overview"),
    [editing, setEditing] = useState<Opportunity | "new" | null>(null),
    [resetOpen, setResetOpen] = useState(false),
    [error, setError] = useState("");
  const l = state.locations.find((l) => l.id === orgId)!;
  const opportunities = state.opportunities.filter((o) => o.orgId === orgId);
  const requests = state.requests.filter((r) => r.locationId === orgId);
  const signups = state.signups.filter((s) =>
    opportunities.some((o) => o.id === s.opportunityId),
  );
  const active = opportunities.filter((o) => o.active && o.date >= today);
  const spots = active.reduce((sum, o) => sum + o.capacity - o.filled, 0);
  const tabs = [
    ["Overview", LayoutDashboard],
    ["Food availability", ShoppingBasket],
    ["Volunteer shifts", Users],
    ["Assistance requests", HandHeart],
  ] as const;
  return (
    <section className="workspace content-page">
      <div className="workspace-top">
        <div>
          <span className="eyebrow">
            <Building2 size={13} />
            ORGANIZATION WORKSPACE
          </span>
          <h1>Dashboard</h1>
          <p>Schedules, volunteers, and requests at a glance.</p>
        </div>
        <label className="workspace-org-select">
          <span>ORGANIZATION</span>
          <select value={orgId} onChange={(e) => setOrgId(e.target.value)}>
            {state.locations
              .filter((l) => l.sourceKind !== "public")
              .map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
          </select>
        </label>
      </div>
      <div className="workspace-tabs">
        {tabs.map(([name, Icon]) => (
          <button
            className={tab === name ? "active" : ""}
            key={name}
            onClick={() => setTab(name)}
          >
            <Icon size={16} />
            {name}
            {name === "Assistance requests" &&
              requests.filter((r) => r.status === "Awaiting review").length >
                0 && (
                <span>
                  {
                    requests.filter((r) => r.status === "Awaiting review")
                      .length
                  }
                </span>
              )}
          </button>
        ))}
        <button className="reset-demo" onClick={() => setResetOpen(true)}>
          <RotateCcw size={13} />
          Reset demo
        </button>
      </div>
      {tab === "Overview" ? (
        <>
          <div className="dashboard-stats four-stats">
            <article>
              <span>
                <CalendarDays size={14} />
                DISTRIBUTIONS / WEEK
              </span>
              <strong>{l.days.length}</strong>
              <p>Your regular demo schedule</p>
            </article>
            <article>
              <span>
                <Users size={14} />
                VOLUNTEER POSITIONS OPEN
              </span>
              <strong>{spots}</strong>
              <p>Across {active.length} active demo shifts</p>
            </article>
            <article>
              <span>
                <HandHeart size={14} />
                REQUESTS TO REVIEW
              </span>
              <strong>
                {requests.filter((r) => r.status === "Awaiting review").length}
              </strong>
              <p>A neighbor’s next step starts here</p>
            </article>
            <article>
              <span>
                <Check size={14} />
                ASSISTANCE COMPLETED
              </span>
              <strong>
                {requests.filter((r) => r.status === "Completed").length}
              </strong>
              <p>Illustrative workflow completions</p>
            </article>
          </div>
          <div className="workspace-overview-grid">
            <div className="workspace-panel">
              <div className="workspace-section-heading">
                <h2>Volunteer Shifts</h2>
                <button className="text-link" onClick={() => setEditing("new")}>
                  <Plus size={14} />
                  Add Opportunity
                </button>
              </div>
              {active.length ? (
                active.slice(0, 4).map((o) => (
                  <div className="overview-shift" key={o.id}>
                    <span className="activity-icon">
                      <Users size={19} />
                    </span>
                    <div>
                      <strong>{o.activity}</strong>
                      <small>
                        {formatDate(o.date)} · {time(o.start)}–{time(o.end)}
                      </small>
                    </div>
                    <Badge tone={o.priority ? "amber" : "green"}>
                      {o.capacity - o.filled} spots open
                    </Badge>
                    <button
                      className="icon-button"
                      aria-label={`Edit ${o.title}`}
                      onClick={() => setEditing(o)}
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <Empty title="No Shifts Posted">
                  <button
                    className="text-link"
                    onClick={() => setEditing("new")}
                  >
                    Create Opportunity
                    <Plus size={13} />
                  </button>
                </Empty>
              )}
              <button
                className="text-link"
                onClick={() => setTab("Volunteer shifts")}
              >
                Manage All Shifts
              </button>
            </div>
            <div className="workspace-panel activity-panel">
              <div className="workspace-section-heading">
                <h2>Recent Activity</h2>
              </div>
              <div className="activity-item">
                <span>
                  <CalendarDays size={15} />
                </span>
                <div>
                  <strong>Distribution schedule available</strong>
                  <p>
                    {l.days.map((d) => days[d]).join(", ")} · {time(l.start)}–
                    {time(l.end)}
                  </p>
                  <Link className="text-link" to={`/food/${l.id}`}>
                    View Family Experience
                  </Link>
                </div>
              </div>
              {signups.map((s) => (
                <div className="activity-item" key={s.id}>
                  <span>
                    <Heart size={15} />
                  </span>
                  <div>
                    <strong>A demo volunteer signed up</strong>
                    <p>
                      {
                        opportunities.find((o) => o.id === s.opportunityId)
                          ?.activity
                      }
                    </p>
                    <small>Staffing count updated automatically</small>
                  </div>
                </div>
              ))}
              <div className="activity-item">
                <span>
                  <HandHeart size={15} />
                </span>
                <div>
                  <strong>
                    {requests.filter((r) => r.status !== "Completed").length}{" "}
                    assistance requests in progress
                  </strong>
                  <p>Every request is coordinated by your organization.</p>
                  <button
                    className="text-link"
                    onClick={() => setTab("Assistance requests")}
                  >
                    Review Requests
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : tab === "Food availability" ? (
        <AvailabilityForm key={orgId} location={l} />
      ) : tab === "Volunteer shifts" ? (
        <div className="workspace-panel">
          <div className="workspace-section-heading">
            <div>
              <h2>Volunteers</h2>
              <p>
                New opportunities appear in the volunteer directory immediately.
              </p>
            </div>
            <button
              className="button button-primary button-small"
              onClick={() => setEditing("new")}
            >
              <Plus size={15} />
              Create Opportunity
            </button>
          </div>
          <div className="shift-table-wrap">
            <table className="shift-table">
              <thead>
                <tr>
                  <th>Opportunity</th>
                  <th>When</th>
                  <th>Team</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <strong>{o.activity}</strong>
                      <small>{o.title}</small>
                      {signups.some((s) => s.opportunityId === o.id) && (
                        <Badge>Includes demo registration</Badge>
                      )}
                    </td>
                    <td>
                      {formatDate(o.date)}
                      <small>
                        {time(o.start)}–{time(o.end)}
                      </small>
                    </td>
                    <td>
                      <strong>
                        {o.filled} / {o.capacity}
                      </strong>
                      <small>{o.capacity - o.filled} still open</small>
                    </td>
                    <td>
                      <Badge tone={o.active ? "green" : "gray"}>
                        {o.active ? "Active" : "Closed"}
                      </Badge>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="icon-button"
                          aria-label={`Edit ${o.title}`}
                          onClick={() => setEditing(o)}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="icon-button"
                          aria-label={`${o.active ? "Close" : "Reopen"} ${o.title}`}
                          onClick={() =>
                            update((s) => ({
                              ...s,
                              opportunities: s.opportunities.map((v) =>
                                v.id === o.id ? { ...v, active: !v.active } : v,
                              ),
                            }))
                          }
                        >
                          {o.active ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!opportunities.length && (
            <Empty title="No Volunteers Yet">
              <p>Post a shift to start recruiting.</p>
            </Empty>
          )}
        </div>
      ) : (
        <>
          <div className="workspace-section-heading">
            <div>
              <h2>Assistance Requests</h2>
              <p>
                Organization-reviewed support. No precise addresses or household
                contact details.
              </p>
            </div>
            <Badge tone="amber">SIMULATED REQUESTS</Badge>
          </div>
          {error && (
            <p className="error-text" role="alert">
              {error}
            </p>
          )}
          <div className="request-board">
            {requestStatuses.map((status, i) => (
              <div className="request-column" key={status}>
                <h3>
                  <span className={`status-dot status-${i}`} />
                  {status}
                  <span>
                    {requests.filter((r) => r.status === status).length}
                  </span>
                </h3>
                {requests
                  .filter((r) => r.status === status)
                  .map((r) => (
                    <article className="request-card" key={r.id}>
                      <span className="request-id">
                        DEMO · {r.id.slice(-6).toUpperCase()}
                      </span>
                      <h4>{r.type}</h4>
                      <p>{r.area}</p>
                      <small>
                        <CalendarDays size={11} />
                        {formatDate(r.date)}
                      </small>
                      <small>
                        <Clock3 size={11} />
                        {r.window}
                      </small>
                      {r.assignedVolunteer && (
                        <div className="assigned-coordinator">
                          <Check size={11} />
                          {r.assignedVolunteer}
                        </div>
                      )}
                      {i < 3 && (
                        <button
                          className="button button-outline button-small button-full"
                          onClick={() => {
                            try {
                              const next = advanceRequest(
                                state,
                                r.id,
                                requestStatuses[i + 1],
                                i === 1
                                  ? "Jordan — approved demo coordinator"
                                  : undefined,
                              );
                              update(() => next);
                              setError("");
                            } catch (e) {
                              setError((e as Error).message);
                            }
                          }}
                        >
                          {i === 0
                            ? "Approve & arrange"
                            : i === 1
                              ? "Assign coordinator & schedule"
                              : "Mark complete"}
                        </button>
                      )}
                      {i === 1 && (
                        <p className="coordinator-note">
                          Scheduling assigns Jordan, a sample
                          organization-approved coordinator.
                        </p>
                      )}
                    </article>
                  ))}
                {!requests.some((r) => r.status === status) && (
                  <div className="empty-column">
                    <ClipboardList size={22} />
                    <span>No requests here yet</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="notice">
            <Info size={17} />
            <p>
              Requests submitted from a food location appear under that
              organization. Switch the organization above to review its
              requests. Status updates also appear in the family’s weekly plan.
            </p>
          </div>
        </>
      )}
      {editing && (
        <OpportunityEditor
          existing={editing === "new" ? undefined : editing}
          orgId={orgId}
          onClose={() => setEditing(null)}
        />
      )}
      {resetOpen && (
        <Modal title="Reset Demo Data?" onClose={() => setResetOpen(false)}>
          <p className="muted small">
            This clears saved locations, visits, signups, new opportunities, and
            assistance changes from this browser, then restores the seeded
            demonstration data.
          </p>
          <div className="form-actions">
            <button
              className="button button-outline"
              onClick={() => setResetOpen(false)}
            >
              Keep Exploring
            </button>
            <button
              className="button button-primary"
              onClick={() => {
                reset();
                setResetOpen(false);
                setOrgId("food-1");
                setTab("Overview");
              }}
            >
              Reset demo
              <RotateCcw size={15} />
            </button>
          </div>
        </Modal>
      )}
      <div className="workspace-demo-footer">
        <Info size={13} />A connected prototype. All activity is fictional and
        saved only in this browser.
      </div>
    </section>
  );
}
