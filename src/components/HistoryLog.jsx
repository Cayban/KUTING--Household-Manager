import { useState } from "react";
import { Sparkles, Hourglass, CheckCircle2, Undo2, FileText, ListFilter } from "lucide-react";
import { relativeTime, dayLabel } from "../lib/logic";

const TYPE_META = {
  created: { Icon: Sparkles, color: "var(--progress)", bg: "var(--progress-bg)", text: (h) => <>added <strong>{h.choreTitle}</strong> to the board</> },
  completed: { Icon: Hourglass, color: "var(--pending)", bg: "var(--pending-bg)", text: (h) => <>marked <strong>{h.choreTitle}</strong> done</> },
  verified: { Icon: CheckCircle2, color: "var(--done)", bg: "var(--done-bg)", text: (h) => <>verified <strong>{h.choreTitle}</strong></> },
  needs_improvement: { Icon: Undo2, color: "var(--overdue)", bg: "var(--overdue-bg)", text: (h) => <>sent <strong>{h.choreTitle}</strong> back for another pass</> },
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "created", label: "Added" },
  { id: "completed", label: "Marked done" },
  { id: "verified", label: "Verified" },
  { id: "needs_improvement", label: "Sent back" },
];

export default function HistoryLog({ history, siblings }) {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? history : history.filter((h) => h.type === filter);

  const groups = [];
  for (const h of filtered) {
    const label = dayLabel(h.at);
    let group = groups.find((g) => g.label === label);
    if (!group) { group = { label, items: [] }; groups.push(group); }
    group.items.push(h);
  }

  return (
    <div className="activity">
      <div className="activity__filters chip-row">
        {FILTERS.map((f) => (
          <button key={f.id} className={`chip ${filter === f.id ? "chip--active" : ""}`} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="activity__empty">
          <ListFilter size={26} />
          <p>{filter === "all" ? "Nothing yet — newly added and finished chores will show up here." : "No activity matches this filter."}</p>
        </div>
      )}

      {groups.map((group) => (
        <div key={group.label} className="activity-group">
          <p className="activity-group__label">{group.label}</p>
          <div className="activity-timeline">
            {group.items.map((h) => {
              const meta = TYPE_META[h.type] || { Icon: Hourglass, color: "var(--text-dim)", bg: "var(--surface)", text: () => "" };
              const { Icon } = meta;
              const actor = siblings.find((s) => s.id === h.byId);
              return (
                <div key={h.id} className="activity-item">
                  <span className="activity-item__icon" style={{ color: meta.color, background: meta.bg }}>
                    <Icon size={15} />
                  </span>
                  <div className="activity-item__card">
                    <p className="activity-item__title">
                      <span className="avatar-dot" style={{ background: actor?.avatarColor || "var(--brand)" }}>{h.byName?.[0]}</span>
                      <strong>{h.byName}</strong> {meta.text(h)}
                    </p>
                    {h.note && (
                      <p className="activity-item__note">
                        <FileText size={12} style={{ verticalAlign: "-1px" }} /> {h.note}
                      </p>
                    )}
                    <span className="mono activity-item__time">{relativeTime(h.at)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}