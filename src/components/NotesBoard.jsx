import { useState } from "react";
import { Send, PenLine, Trash2 } from "lucide-react";
import { addNote, deleteNote } from "../lib/store";
import { relativeTime } from "../lib/logic";

export default function NotesBoard({ notes, me, siblings }) {
  const [text, setText] = useState("");

  async function handleAdd(e) {
    e.preventDefault();
    if (!text.trim()) return;
    await addNote({ authorId: me.id, authorName: me.name, text: text.trim() });
    setText("");
  }

  return (
    <div className="notes-board">
      <form className="notes-board__composer" onSubmit={handleAdd}>
        <span className="avatar-dot notes-board__composer-avatar" style={{ background: me.avatarColor }}>{me.name?.[0]}</span>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Post a note for everyone… (e.g. Buy dishwashing liquid)"
        />
        <button className="notes-board__post" type="submit" disabled={!text.trim()} aria-label="Post note">
          <Send size={16} />
        </button>
      </form>

      {notes.length === 0 ? (
        <div className="notes-board__empty">
          <PenLine size={26} />
          <p>No notes posted yet — pin something for the household.</p>
        </div>
      ) : (
        <div className="notes-board__grid">
          {notes.map((n) => {
            const author = siblings.find((s) => s.id === n.authorId);
            const color = author?.avatarColor || "var(--brand)";
            return (
              <div key={n.id} className="sticky-note" style={{ "--note-color": color }}>
                <p className="sticky-note__text">{n.text}</p>
                <div className="sticky-note__footer">
                  <span className="avatar-dot" style={{ background: color }}>{n.authorName?.[0]}</span>
                  <span className="sticky-note__author">{n.authorName}</span>
                  <span className="mono sticky-note__time">{relativeTime(n.createdAt)}</span>
                  {n.authorId === me.id && (
                    <button className="sticky-note__delete" onClick={() => deleteNote(n.id)} aria-label="Delete note">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}