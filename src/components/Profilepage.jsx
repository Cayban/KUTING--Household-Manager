import { X, ListTodo, CheckCircle2, LogOut } from "lucide-react";

export default function ProfilePage({ open, onClose, me, chores = [], onLogout }) {
  if (!open || !me) return null;

  const mine = chores.filter((c) => c.assignedTo === me.id);
  const openCount = mine.filter((c) => ["pending", "in_progress"].includes(c.status)).length;
  const verifiedCount = mine.filter((c) => c.status === "verified").length;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal profile-page" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close"><X size={20} /></button>

        <div className="profile-page__header">
          <span className="avatar-dot profile-page__avatar" style={{ background: me.avatarColor }}>{me.name?.[0]}</span>
          <h2>{me.name}</h2>
          <p className="profile-page__role">{me.role === "admin" ? "Household admin" : "Household member"}</p>
        </div>

        <div className="profile-page__stats">
          <div className="stat-card" style={{ "--stat-color": "var(--pending)" }}>
            <ListTodo size={18} color="var(--pending)" style={{ marginBottom: 8 }} />
            <span className="stat-card__num">{openCount}</span>
            <span className="stat-card__label">Open chores</span>
          </div>
          <div className="stat-card" style={{ "--stat-color": "var(--done)" }}>
            <CheckCircle2 size={18} color="var(--done)" style={{ marginBottom: 8 }} />
            <span className="stat-card__num">{verifiedCount}</span>
            <span className="stat-card__label">Verified chores</span>
          </div>
        </div>

        <button className="btn-danger profile-page__logout" onClick={onLogout}>
          <LogOut size={16} /> Log out
        </button>
      </div>
    </div>
  );
}