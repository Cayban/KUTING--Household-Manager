// Switches between the real Firestore-backed store and an in-memory demo
// store, based on VITE_DEMO_MODE. Every component imports from here, so
// nothing else in the app needs to know which one is active.
import * as live from "./firestoreStore.js";
import * as demo from "./demoStore.js";

const impl = import.meta.env.VITE_DEMO_MODE === "true" ? demo : live;

export const subscribeSiblings = impl.subscribeSiblings;
export const upsertSibling = impl.upsertSibling;

export const subscribeChores = impl.subscribeChores;
export const createChore = impl.createChore;
export const updateChore = impl.updateChore;
export const deleteChore = impl.deleteChore;

export const subscribeComments = impl.subscribeComments;
export const addComment = impl.addComment;

export const subscribeNotes = impl.subscribeNotes;
export const addNote = impl.addNote;
export const deleteNote = impl.deleteNote;

export const subscribeHistory = impl.subscribeHistory;
export const logHistory = impl.logHistory;