import { UserRound, LogOut, X } from "lucide-react";

export default function ProfileMenu({ open, onClose, me, onViewProfile, onLogout }) {
  if (!open || !me) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal profile-menu" onClick={(e) => e.stopPropagation()}>
        <div className="filter-sheet__header">
          <div className="profile-menu__who">
            <span className="avatar-dot profile-menu__avatar" style={{ background: me.avatarColor }}>{me.name?.[0]}</span>
            <div>
              <p className="profile-menu__name">{me.name}</p>
              <p className="profile-menu__role">{me.role === "admin" ? "Admin" : "Member"}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>

        <div className="profile-menu__list">
          <button className="profile-menu__item" onClick={onViewProfile}>
            <UserRound size={18} />
            <span>View profile</span>
          </button>
          <button className="profile-menu__item profile-menu__item--danger" onClick={onLogout}>
            <LogOut size={18} />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </div>
  );
}