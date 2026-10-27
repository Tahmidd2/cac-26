import { useEffect, useRef, type ReactNode } from "react";
import { X, Check, LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";
export function Brand() {
  return (
    <Link className="brand" to="/" aria-label="Nourish home">
      <svg className="brand-mark" viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="18" fill="#244d3e" />
        <path
          d="M32 35V25"
          stroke="#fafbf7"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M32 28.5C24.5 28.5 19.5 23.5 19.5 15.5C27 15.5 32 20.5 32 28.5Z"
          fill="#fafbf7"
        />
        <path
          d="M32 25C32 18 36.5 13 44.5 13C44.5 20.5 39.5 25 32 25Z"
          fill="#dee998"
        />
        <path
          d="M13 35H51C51 45.5 42.5 53 32 53C21.5 53 13 45.5 13 35Z"
          fill="#dee998"
        />
      </svg>
      nourish<span className="brand-period">.</span>
    </Link>
  );
}
export function Badge({
  children,
  tone = "green",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
export function ArrowLink({
  to,
  children,
}: {
  to: string;
  children: ReactNode;
}) {
  return (
    <Link className="text-link" to={to}>
      {children}
    </Link>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      <div>{children}</div>
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const el = ref.current;
    el?.querySelector<HTMLElement>(
      'button,input,select,[tabindex="0"]',
    )?.focus();
    function key(e: KeyboardEvent) {
      if (e.key === "Escape") closeRef.current();
      if (e.key === "Tab" && el) {
        const all = Array.from(
          el.querySelectorAll<HTMLElement>(
            'button:not(:disabled),a,input,select,textarea,[tabindex="0"]',
          ),
        );
        if (!el.contains(document.activeElement)) {
          e.preventDefault();
          (e.shiftKey ? all.at(-1) : all[0])?.focus();
        } else if (e.shiftKey && document.activeElement === all[0]) {
          e.preventDefault();
          all.at(-1)?.focus();
        } else if (!e.shiftKey && document.activeElement === all.at(-1)) {
          e.preventDefault();
          all[0]?.focus();
        }
      }
    }
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className={`modal ${wide ? "modal-wide" : ""}`}
      >
        <div className="modal-header">
          <h2 id="dialog-title">{title}</h2>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={21} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
export function Success({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="success-state">
      <span>
        <Check size={30} />
      </span>
      <h2>{title}</h2>
      <p>{children}</p>
    </div>
  );
}
export function Loading() {
  return (
    <div className="empty">
      <LoaderCircle className="spin" />
      <p>Finding your way…</p>
    </div>
  );
}
