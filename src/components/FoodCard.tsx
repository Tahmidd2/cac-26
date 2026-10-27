import { Link } from "react-router-dom";
import {
  MapPin,
  Heart,
  ArrowUpRight,
  Clock3,
  Accessibility,
  Check,
  Navigation,
} from "lucide-react";
import type { FoodLocation } from "../lib/types";
import { useDemo } from "../lib/store";
import { Badge } from "./ui";
import { formatDate, nextDistribution, time, today } from "../lib/data";
export default function FoodCard({
  location: l,
  index,
  selected,
  onSelect,
  miles,
  compact = false,
  distributionDate,
}: {
  location: FoodLocation;
  index?: number;
  selected?: boolean;
  onSelect?: () => void;
  miles?: number;
  compact?: boolean;
  distributionDate?: string;
}) {
  const { state, update } = useDemo();
  const saved = state.saved.includes(l.id);
  return (
    <article
      id={`card-${l.id}`}
      className={`food-card ${selected ? "selected" : ""} ${compact ? "food-card-compact" : ""}`}
      onMouseEnter={onSelect}
      onFocus={onSelect}
    >
      <div className="food-card-top">
        <span className="resource-type">
          {index !== undefined && (
            <span className="result-index">{index + 1}</span>
          )}
          {l.type}
        </span>
        <button
          className={`save-button ${saved ? "is-saved" : ""}`}
          onClick={() =>
            update((s) => ({
              ...s,
              saved: saved
                ? s.saved.filter((id) => id !== l.id)
                : [...s.saved, l.id],
            }))
          }
          aria-label={`${saved ? "Unsave" : "Save"} ${l.name}`}
        >
          <Heart size={17} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <Link
        to={`/food/${l.id}${distributionDate ? `?visit=${distributionDate}` : ""}`}
        className="card-title-link"
      >
        <h3>{l.name}</h3>
      </Link>
      <p className="location-meta">
        <MapPin size={12} />
        {l.neighborhood}, {l.borough}
        {miles !== undefined && (
          <>
            <span>·</span>
            {miles.toFixed(1)} mi
          </>
        )}
      </p>
      <div className="food-card-time">
        <Clock3 size={14} />
        <strong>
          {(distributionDate || nextDistribution(l)) === today
            ? "Today"
            : formatDate(distributionDate || nextDistribution(l))}
        </strong>
        <span>
          {time(l.start)} – {time(l.end)}
        </span>
      </div>
      <div className="card-badges">
        {!l.appointment && (
          <Badge>
            <Check size={11} />
            No appointment
          </Badge>
        )}
        {l.delivery && <Badge tone="gray">Delivery support</Badge>}
        {l.accessible && (
          <Badge tone="gray">
            <Accessibility size={11} />
            Accessible
          </Badge>
        )}
        {!l.noId && <Badge tone="amber">ID required</Badge>}
      </div>
      {!compact && (
        <div className="food-card-footer">
          <span>
            <span
              className={`verification-dot ${!l.verified ? "unverified" : ""}`}
            />
            {l.verified
              ? "Recently updated · Demo"
              : "Needs verification · Demo"}
          </span>
          <Link
            to={`/food/${l.id}${distributionDate ? `?visit=${distributionDate}` : ""}`}
            className="text-link"
          >
            View details
            <ArrowUpRight size={13} />
          </Link>
        </div>
      )}
      {compact && (
        <Link
          className="text-link"
          to={`/food/${l.id}${distributionDate ? `?visit=${distributionDate}` : ""}`}
        >
          <Navigation size={13} />
          Plan a visit
          <ArrowUpRight size={13} />
        </Link>
      )}
    </article>
  );
}
