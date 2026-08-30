import {
  collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp, setDoc, getDoc,
} from "firebase/firestore";
import { db } from "./firebase";

// ---------- Siblings ----------
export function subscribeSiblings(cb) {
  const q = query(collection(db, "siblings"), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

export async function upsertSibling(id, data) {
  const ref = doc(db, "siblings", id);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    await updateDoc(ref, data);
  } else {
    await setDoc(ref, {
      points: 0,
      role: "member",
      createdAt: serverTimestamp(),
      ...data,
    });
  }
}

export async function addPoints(siblingId, delta) {
  const ref = doc(db, "siblings", siblingId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const current = snap.data().points || 0;
  await updateDoc(ref, { points: current + delta });
}

// ---------- Chores ----------
export function subscribeChores(cb) {
  const q = query(collection(db, "chores"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

export async function createChore(chore) {
  return addDoc(collection(db, "chores"), {
    title: "",
    description: "",
    assignedTo: null,
    dueDate: null,
    priority: "medium",
    category: "general",
    status: "pending", // pending | in_progress | completed | verification | verified | needs_improvement
    points: 10,
    recurrence: "none", // none | daily | weekly | monthly
    rotationGroup: null,
    completedBy: null,
    completedAt: null,
    verifiedBy: null,
    verifiedAt: null,
    verificationNote: "",
    proofPhotoUrl: null,
    createdAt: serverTimestamp(),
    ...chore,
  });
}

export async function updateChore(id, data) {
  await updateDoc(doc(db, "chores", id), data);
}

export async function deleteChore(id) {
  await deleteDoc(doc(db, "chores", id));
}

// ---------- Comments (subcollection per chore) ----------
export function subscribeComments(choreId, cb) {
  const q = query(collection(db, "chores", choreId, "comments"), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

export async function addComment(choreId, { authorId, authorName, text }) {
  await addDoc(collection(db, "chores", choreId, "comments"), {
    authorId, authorName, text, createdAt: serverTimestamp(),
  });
}

// ---------- Shared Notes (bulletin board) ----------
export function subscribeNotes(cb) {
  const q = query(collection(db, "notes"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

export async function addNote({ authorId, authorName, text }) {
  await addDoc(collection(db, "notes"), { authorId, authorName, text, createdAt: serverTimestamp() });
}

export async function deleteNote(id) {
  await deleteDoc(doc(db, "notes", id));
}

// ---------- History ----------
export function subscribeHistory(cb) {
  const q = query(collection(db, "history"), orderBy("at", "desc"));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

export async function logHistory(entry) {
  await addDoc(collection(db, "history"), { at: serverTimestamp(), ...entry });
}
