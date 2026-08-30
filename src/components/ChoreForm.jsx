import { useState } from "react";
import { X, ClipboardPlus, PencilLine, Trash2 } from "lucide-react";
import { CATEGORIES, PRIORITIES } from "../lib/logic";
import { createChore, updateChore, deleteChore, logHistory } from "../lib/store";

const PRIORITY_META = {
  low: { color: "var(--progress)", bg: "var(--progress-bg)" },
  medium: { color: "var(--pending)", bg: "var(--pending-bg)" },
  high: { color: "var(--overdue)", bg: "var(--overdue-bg)" },
};

const RECURRENCE_OPTIONS = [
  { id: "none", label: "One-time" },
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
];

export default function ChoreForm({ siblings, me, chore, onClose }) {
  const isEdit = !!chore;
  const [form, setForm] = useState(() => ({
    title: chore?.title || "",
    description: chore?.description || "",
    assignedTo: chore?.assignedTo || siblings[0]?.id || "",
    dueDate: chore?.dueDate ? chore.dueDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
    priority: chore?.priority || "medium",
    category: chore?.category || "household",
    recurrence: chore?.recurrence || "none",
    rotationGroup: chore?.rotationGroup || "",
  }));
  const [saving, setSaving] = useState(false);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    const payload = { ...form, dueDate: form.dueDate };
    if (isEdit) {
      await updateChore(chore.id, payload);
    } else {
      const ref = await createChore(payload);
      await logHistory({
        choreId: ref.id, choreTitle: form.title, type: "created",
        byId: me.id, byName: me.name,
      });
    }
    setSaving(false);
    onClose();
  }

  async function handleDelete() {
    if (!confirm("Delete this chore? This can't be undone.")) return;
    await deleteChore(chore.id);
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal chore-form" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="chore-form__header">
          <span className="chore-form__badge">{isEdit ? <PencilLine size={16} /> : <ClipboardPlus size={16} />}</span>
          <h2>{isEdit ? "Edit chore" : "New chore"}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>

        <label>Title
          <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Wash the dishes" required />
        </label>

        <label>Description
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} placeholder="Any details worth noting" />
        </label>

        <div className="chore-form__section">
          <p className="field-label">Assign to</p>
          <div className="chip-row">
            {siblings.map((s) => (
              <button type="button" key={s.id} className={`chip ${form.assignedTo === s.id ? "chip--active" : ""}`} onClick={() => set("assignedTo", s.id)}>
                <span className="avatar-dot" style={{ background: s.avatarColor }}>{s.name?.[0]}</span>{s.name}
              </button>
            ))}
          </div>
        </div>

        <label className="chore-form__date">Due date
          <input type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
        </label>

        <div className="chore-form__section">
          <p className="field-label">Priority</p>
          <div className="priority-picker">
            {PRIORITIES.map((p) => {
              const meta = PRIORITY_META[p.id];
              const active = form.priority === p.id;
              return (
                <button
                  type="button" key={p.id}
                  className={`priority-pill ${active ? "priority-pill--active" : ""}`}
                  style={{ "--priority-color": meta.color, "--priority-bg": meta.bg }}
                  onClick={() => set("priority", p.id)}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="chore-form__section">
          <p className="field-label">Category</p>
          <div className="chip-row">
            {CATEGORIES.map((c) => (
              <button type="button" key={c.id} className={`chip ${form.category === c.id ? "chip--active" : ""}`} onClick={() => set("category", c.id)}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="chore-form__section">
          <p className="field-label">Repeats</p>
          <div className="chip-row">
            {RECURRENCE_OPTIONS.map((r) => (
              <button type="button" key={r.id} className={`chip ${form.recurrence === r.id ? "chip--active" : ""}`} onClick={() => set("recurrence", r.id)}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-actions chore-form__actions">
          {isEdit && <button type="button" className="btn-danger" onClick={handleDelete}><Trash2 size={14} /> Delete</button>}
          <div className="modal-actions__right">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving || !form.title.trim()}>
              {saving ? "Saving…" : isEdit ? "Save changes" : "Create chore"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}