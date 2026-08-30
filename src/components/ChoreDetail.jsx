import { useEffect, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { User, CalendarDays, Camera, X, Check, FileText, Send } from "lucide-react";
import { storage } from "../lib/firebase";
import { subscribeComments, addComment, updateChore, logHistory } from "../lib/store";
import { CATEGORIES, STATUS_META, effectiveStatus, formatDate } from "../lib/logic";

export default function ChoreDetail({ chore, siblings, me, onClose, onEdit }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [verifyNote, setVerifyNote] = useState("");
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");

  useEffect(() => subscribeComments(chore.id, setComments), [chore.id]);

  const status = effectiveStatus(chore);
  const meta = STATUS_META[status] || STATUS_META.pending;
  const assignee = siblings.find((s) => s.id === chore.assignedTo);
  const category = CATEGORIES.find((c) => c.id === chore.category);
  const isAssignee = chore.assignedTo === me.id;
  const isVerifier = chore.status === "verification" && chore.completedBy !== me.id;

  async function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setPhotoError("");
    try {
      const path = `proofs/${chore.id}/${Date.now()}-${file.name}`;
      const r = ref(storage, path);
      await uploadBytes(r, file);
      const url = await getDownloadURL(r);
      await updateChore(chore.id, { proofPhotoUrl: url });
    } catch (err) {
      setPhotoError("Photo uploads aren't set up yet for this household.");
    } finally {
      setUploading(false);
    }
  }

  async function markInProgress() {
    await updateChore(chore.id, { status: "in_progress" });
  }

  async function markCompleted() {
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

  async function handleVerify(approved) {
    await updateChore(chore.id, {
      status: approved ? "verified" : "needs_improvement",
      verifiedBy: me.id,
      verifiedAt: new Date().toISOString(),
      verificationNote: verifyNote,
    });
    if (approved) {
      await logHistory({
        choreId: chore.id, choreTitle: chore.title, type: "verified",
        byId: me.id, byName: me.name, note: verifyNote,
      });
    } else {
      await logHistory({
        choreId: chore.id, choreTitle: chore.title, type: "needs_improvement",
        byId: me.id, byName: me.name, note: verifyNote,
      });
    }
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!text.trim()) return;
    await addComment(chore.id, { authorId: me.id, authorName: me.name, text: text.trim() });
    setText("");
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal chore-detail" onClick={(e) => e.stopPropagation()}>
        <div className="chore-detail__header">
          <span className="chore-card__category">{category?.icon} {category?.label}</span>
          <span className="status-pill" style={{ color: meta.color, background: meta.bg }}>
            <span className="status-pill__dot" />{meta.label}
          </span>
        </div>
        <h2>{chore.title}</h2>
        {chore.description && <p className="chore-detail__desc">{chore.description}</p>}

        <div className="chore-detail__meta">
          <span><User size={14} style={{ verticalAlign: "-2px" }} /> {assignee?.name || "Unassigned"}</span>
          <span className="mono"><CalendarDays size={14} style={{ verticalAlign: "-2px" }} /> {formatDate(chore.dueDate)}</span>
          <button className="btn-link" onClick={() => onEdit(chore)}>Edit</button>
        </div>

        {chore.proofPhotoUrl && (
          <img className="chore-detail__photo" src={chore.proofPhotoUrl} alt="Proof of completion" />
        )}

        <div className="chore-detail__actions">
          {isAssignee && chore.status === "pending" && (
            <button className="btn-primary" onClick={markInProgress}>Start task</button>
          )}
          {isAssignee && (chore.status === "pending" || chore.status === "in_progress") && (
            <>
              <label className="btn-ghost upload-btn">
                <Camera size={16} />{uploading ? "Uploading…" : "Add proof photo"}
                <input type="file" accept="image/*" hidden onChange={handlePhoto} />
              </label>
              <button className="btn-primary" onClick={markCompleted}>Mark completed</button>
            </>
          )}
          {chore.status === "needs_improvement" && isAssignee && (
            <button className="btn-primary" onClick={markCompleted}>Mark completed again</button>
          )}
        </div>

        {photoError && <p className="form-error">{photoError}</p>}

        {chore.status === "verification" && (
          <div className="verify-box">
            <p className="verify-box__label">
              {isVerifier ? "Waiting for you to check this one" : `Waiting for someone else to verify ${assignee?.name || ""}'s work`}
            </p>
            {isVerifier && (
              <>
                <textarea placeholder="Optional note (e.g. table still needs cleaning)" value={verifyNote} onChange={(e) => setVerifyNote(e.target.value)} rows={2} />
                <div className="verify-box__buttons">
                  <button className="btn-danger" onClick={() => handleVerify(false)}><X size={15} /> Needs improvement</button>
                  <button className="btn-primary" onClick={() => handleVerify(true)}><Check size={15} /> Verified</button>
                </div>
              </>
            )}
          </div>
        )}

        {chore.status === "verified" && chore.verificationNote && (
          <p className="chore-detail__verify-note"><FileText size={14} style={{ verticalAlign: "-2px" }} /> {chore.verificationNote}</p>
        )}

        <div className="comments">
          <h3>Notes on this task</h3>
          <div className="comments__list">
            {comments.length === 0 && <p className="empty-hint">No comments yet — say something.</p>}
            {comments.map((c) => (
              <div key={c.id} className="comment">
                <span className="comment__author">{c.authorName}</span>
                <span className="comment__text">{c.text}</span>
              </div>
            ))}
          </div>
          <form className="comments__form" onSubmit={handleComment}>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a note…" />
            <button type="submit" className="btn-ghost"><Send size={14} /></button>
          </form>
        </div>

        <button className="modal-close" onClick={onClose} aria-label="Close"><X size={20} /></button>
      </div>
    </div>
  );
}