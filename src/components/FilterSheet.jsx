import { X } from "lucide-react";
import { CATEGORIES } from "../lib/logic";

const STATUS_OPTIONS = [
  { id: "all", label: "All" }, { id: "pending", label: "Pending" }, { id: "in_progress", label: "In Progress" },
  { id: "verification", label: "Waiting" }, { id: "verified", label: "Verified" },
  { id: "needs_improvement", label: "Needs Improvement" }, { id: "overdue", label: "Overdue" },
];

export default function FilterSheet({ open, onClose, siblings, filters, setFilters }) {
  if (!open) return null;

  function set(key, value) { setFilters((f) => ({ ...f, [key]: value })); }
  function clearAll() { setFilters((f) => ({ ...f, person: "all", category: "all", status: "all" })); }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal filter-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="filter-sheet__header">
          <h2>Filters</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>

        <div className="filter-sheet__section">
          <p className="filter-sheet__label">Person</p>
          <div className="chip-row">
            <button className={`chip ${filters.person === "all" ? "chip--active" : ""}`} onClick={() => set("person", "all")}>Everyone</button>
            {siblings.map((s) => (
              <button key={s.id} className={`chip ${filters.person === s.id ? "chip--active" : ""}`} onClick={() => set("person", s.id)}>
                <span className="avatar-dot" style={{ background: s.avatarColor }}>{s.name?.[0]}</span>{s.name}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-sheet__section">
          <p className="filter-sheet__label">Category</p>
          <div className="chip-row">
            <button className={`chip ${filters.category === "all" ? "chip--active" : ""}`} onClick={() => set("category", "all")}>All</button>
            {CATEGORIES.map((c) => (
              <button key={c.id} className={`chip ${filters.category === c.id ? "chip--active" : ""}`} onClick={() => set("category", c.id)}>{c.icon} {c.label}</button>
            ))}
          </div>
        </div>

        <div className="filter-sheet__section">
          <p className="filter-sheet__label">Status</p>
          <div className="chip-row">
            {STATUS_OPTIONS.map((s) => (
              <button key={s.id} className={`chip ${filters.status === s.id ? "chip--active" : ""}`} onClick={() => set("status", s.id)}>{s.label}</button>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-link" onClick={clearAll}>Clear all</button>
          <button className="btn-primary" onClick={onClose}>Show results</button>
        </div>
      </div>
    </div>
  );
}