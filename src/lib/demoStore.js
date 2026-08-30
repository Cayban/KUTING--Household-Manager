// A drop-in stand-in for store.js that keeps everything in memory instead of
// Firestore. Same function names/signatures as store.js, so nothing else in
// the app needs to know which one is active. Used when VITE_DEMO_MODE=true.

let uid = 0;
const newId = () => `demo-${++uid}`;
const now = () => new Date().toISOString();

const listeners = { siblings: new Set(), chores: new Set(), notes: new Set(), history: new Set() };
const commentListeners = new Map(); // choreId -> Set

function emit(key) {
  const data = state[key];
  listeners[key].forEach((cb) => cb([...data]));
}
function emitComments(choreId) {
  const set = commentListeners.get(choreId);
  if (set) set.forEach((cb) => cb([...(state.comments[choreId] || [])]));
}

const today = new Date();
const iso = (daysFromToday) => {
  const d = new Date(today);
  d.setDate(d.getDate() + daysFromToday);
  return d.toISOString().slice(0, 10);
};

const state = {
  siblings: [
    { id: "kim", name: "Kim", role: "admin", points: 150, avatarColor: "#E0A339", createdAt: now() },
    { id: "alex", name: "Alex", role: "member", points: 130, avatarColor: "#3E7CB1", createdAt: now() },
    { id: "sam", name: "Sam", role: "member", points: 110, avatarColor: "#B65C3F", createdAt: now() },
  ],
  chores: [
    {
      id: "c1", title: "Wash the dishes", description: "Don't forget the pans", assignedTo: "alex",
      dueDate: iso(0), priority: "medium", category: "kitchen", status: "pending", points: 10,
      recurrence: "daily", rotationGroup: null, completedBy: null, completedAt: null,
      verifiedBy: null, verifiedAt: null, verificationNote: "", proofPhotoUrl: null, createdAt: now(),
    },
    {
      id: "c2", title: "Take out trash", description: "", assignedTo: "sam",
      dueDate: iso(-1), priority: "low", category: "garbage", status: "pending", points: 5,
      recurrence: "weekly", rotationGroup: null, completedBy: null, completedAt: null,
      verifiedBy: null, verifiedAt: null, verificationNote: "", proofPhotoUrl: null, createdAt: now(),
    },
    {
      id: "c3", title: "Clean the kitchen", description: "Counters, stove, and floor", assignedTo: "kim",
      dueDate: iso(0), priority: "high", category: "kitchen", status: "verification", points: 20,
      recurrence: "none", rotationGroup: null, completedBy: "kim", completedAt: now(),
      verifiedBy: null, verifiedAt: null, verificationNote: "", proofPhotoUrl: null, createdAt: now(),
    },
    {
      id: "c4", title: "Feed the pets", description: "Morning and evening", assignedTo: "alex",
      dueDate: iso(2), priority: "medium", category: "pets", status: "verified", points: 10,
      recurrence: "daily", rotationGroup: null, completedBy: "alex", completedAt: now(),
      verifiedBy: "sam", verifiedAt: now(), verificationNote: "All good!", proofPhotoUrl: null, createdAt: now(),
    },
    {
      id: "c5", title: "Buy dishwashing liquid", description: "We're almost out", assignedTo: "sam",
      dueDate: iso(5), priority: "low", category: "shopping", status: "pending", points: 5,
      recurrence: "none", rotationGroup: null, completedBy: null, completedAt: null,
      verifiedBy: null, verifiedAt: null, verificationNote: "", proofPhotoUrl: null, createdAt: now(),
    },
  ],
  comments: {
    c1: [
      { id: "cm1", authorId: "alex", authorName: "Alex", text: "I'll do this later tonight.", createdAt: now() },
      { id: "cm2", authorId: "kim", authorName: "Kim", text: "Please finish before 8 PM.", createdAt: now() },
    ],
  },
  notes: [
    { id: "n1", authorId: "kim", authorName: "Kim", text: "Mom said to clean the house before Saturday", createdAt: now() },
    { id: "n2", authorId: "sam", authorName: "Sam", text: "Don't forget the living room too", createdAt: now() },
  ],
  history: [
    { id: "h1", choreId: "c4", choreTitle: "Feed the pets", type: "verified", byId: "sam", byName: "Sam", note: "All good!", points: 10, at: now() },
  ],
};

export function subscribeSiblings(cb) { listeners.siblings.add(cb); cb([...state.siblings]); return () => listeners.siblings.delete(cb); }
export function subscribeChores(cb) { listeners.chores.add(cb); cb([...state.chores]); return () => listeners.chores.delete(cb); }
export function subscribeNotes(cb) { listeners.notes.add(cb); cb([...state.notes]); return () => listeners.notes.delete(cb); }
export function subscribeHistory(cb) { listeners.history.add(cb); cb([...state.history].reverse()); return () => listeners.history.delete(cb); }

export async function upsertSibling(id, data) {
  const existing = state.siblings.find((s) => s.id === id);
  if (existing) Object.assign(existing, data);
  else state.siblings.push({ id, points: 0, role: "member", createdAt: now(), ...data });
  emit("siblings");
}

export async function addPoints(siblingId, delta) {
  const s = state.siblings.find((s) => s.id === siblingId);
  if (s) { s.points = (s.points || 0) + delta; emit("siblings"); }
}

export async function createChore(chore) {
  const id = newId();
  state.chores.unshift({
    id, title: "", description: "", assignedTo: null, dueDate: null, priority: "medium",
    category: "general", status: "pending", points: 10, recurrence: "none", rotationGroup: null,
    completedBy: null, completedAt: null, verifiedBy: null, verifiedAt: null,
    verificationNote: "", proofPhotoUrl: null, createdAt: now(), ...chore,
  });
  emit("chores");
  return { id };
}

export async function updateChore(id, data) {
  const c = state.chores.find((c) => c.id === id);
  if (c) { Object.assign(c, data); emit("chores"); }
}

export async function deleteChore(id) {
  state.chores = state.chores.filter((c) => c.id !== id);
  emit("chores");
}

export function subscribeComments(choreId, cb) {
  if (!commentListeners.has(choreId)) commentListeners.set(choreId, new Set());
  commentListeners.get(choreId).add(cb);
  cb([...(state.comments[choreId] || [])]);
  return () => commentListeners.get(choreId).delete(cb);
}

export async function addComment(choreId, { authorId, authorName, text }) {
  if (!state.comments[choreId]) state.comments[choreId] = [];
  state.comments[choreId].push({ id: newId(), authorId, authorName, text, createdAt: now() });
  emitComments(choreId);
}

export async function addNote({ authorId, authorName, text }) {
  state.notes.unshift({ id: newId(), authorId, authorName, text, createdAt: now() });
  emit("notes");
}

export async function deleteNote(id) {
  state.notes = state.notes.filter((n) => n.id !== id);
  emit("notes");
}

export async function logHistory(entry) {
  state.history.push({ id: newId(), at: now(), ...entry });
  emit("history");
}
