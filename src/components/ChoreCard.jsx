import { useRef, useState } from "react";
import { Repeat } from "lucide-react";
import { CATEGORIES, STATUS_META, effectiveStatus, formatDate } from "../lib/logic";
import { updateChore, logHistory } from "../lib/store";

const SWIPE_THRESHOLD = 88;
const TAP_TOLERANCE = 6;

export default function ChoreCard({ chore, siblings, me, onOpen }) {
  const status = effectiveStatus(chore);
  const meta = STATUS_META[status] || STATUS_META.pending;
  const category = CATEGORIES.find((c) => c.id === chore.category);
  const assignee = siblings.find((s) => s.id === chore.assignedTo);

  const canSwipeComplete = me && chore.assignedTo === me.id && ["pending", "in_progress"].includes(chore.status);

  const [dragX, setDragX] = useState(0);
  const [settling, setSettling] = useState(false);
  const startX = useRef(0);
  const dragging = useRef(false);

  function onPointerDown(e) {
    startX.current = e.clientX;
    dragging.current = true;
    setSettling(false);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e) {
    if (!dragging.current) return;
    const delta = e.clientX - startX.current;
    if (canSwipeComplete && delta > 0) {
      setDragX(Math.min(delta, 140));
    }
  }

  async function onPointerUp() {
    if (!dragging.current) return;
    dragging.current = false;
    const moved = dragX;
    setSettling(true);

    if (Math.abs(moved) <= TAP_TOLERANCE) {
      setDragX(0);
      onOpen(chore);
      return;
    }

    if (canSwipeComplete && moved >= SWIPE_THRESHOLD) {
      await updateChore(chore.id, {
        status: "verification",
        completedBy: me.id,
        completedAt: new Date().toISOString(),
      });
      await logHistory({
        choreId: chore.id, choreTitle: chore.title, type: "completed",
        byId: me.id, byName: me.name,
      });
    }
    setDragX(0);
  }

  return (
    <div className="chore-card-wrap">
      {canSwipeComplete && (
        <div className="chore-card__swipe-hint" style={{ opacity: Math.min(dragX / SWIPE_THRESHOLD, 1) }}>
          <span className="status-pill" style={{ color: "var(--done)", background: "var(--done-bg)" }}>
            <span className="status-pill__dot" />Mark done
          </span>
        </div>
      )}
      <button
        key={status}
        className="chore-card"
        style={{
          transform: dragX ? `translateX(${dragX}px)` : undefined,
          transition: settling ? "transform 0.25s ease" : dragging.current ? "none" : undefined,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { dragging.current = false; setDragX(0); }}
      >
        <div className="chore-card__top">
          <span className="chore-card__category">
            <span className="chore-card__cat-icon" style={{ background: "var(--surface)" }}>{category?.icon}</span>
            {category?.label || "General"}
          </span>
          <span className="status-pill status-pill--animated" style={{ color: meta.color, background: meta.bg }}>
            <span className="status-pill__dot" />{meta.label}
          </span>
        </div>
        <h3 className="chore-card__title">{chore.title}</h3>
        {chore.description && <p className="chore-card__desc">{chore.description}</p>}
        <div className="chore-card__bottom">
          <span className="chore-card__assignee">
            {assignee ? (
              <>
                <span className="avatar-dot" style={{ background: assignee.avatarColor }}>{assignee.name?.[0]}</span>
                {assignee.name}
              </>
            ) : "Unassigned"}
          </span>
          <span className="chore-card__due mono">{formatDate(chore.dueDate)}</span>
        </div>
        {chore.recurrence && chore.recurrence !== "none" && (
          <span className="chore-card__recurring mono" title={`Repeats ${chore.recurrence}`}>
            <Repeat size={11} /> {chore.recurrence}
          </span>
        )}
        {canSwipeComplete && <span className="chore-card__swipe-affordance" aria-hidden="true">‹ swipe</span>}
      </button>
    </div>
  );
}