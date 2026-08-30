import {
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut,
} from "firebase/auth";
import { auth, DEMO_MODE } from "./firebase";

// Firebase Auth needs an email/password pair, but siblings just pick a name
// and password — so each sibling gets a synthetic, never-emailed address
// derived from their name. It's only ever used internally to talk to
// Firebase Auth.
export function emailForName(name) {
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `${slug}@homesync.local`;
}

// ---------- Demo mode: a tiny fake auth state, no Firebase involved ----------
let demoUser = null;
const demoListeners = new Set();
function emitDemoUser() { demoListeners.forEach((cb) => cb(demoUser)); }

export function subscribeAuthState(cb) {
  if (DEMO_MODE) {
    demoListeners.add(cb);
    cb(demoUser);
    return () => demoListeners.delete(cb);
  }
  return onAuthStateChanged(auth, cb);
}

// siblingId is the Firestore sibling doc id; in demo mode this doubles as
// the fake uid so it matches the sample data (kim / alex / sam).
export async function signIn(siblingId, email, password) {
  if (DEMO_MODE) {
    if (!password) throw new Error("Enter a password.");
    demoUser = { uid: siblingId };
    emitDemoUser();
    return demoUser;
  }
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signUp(email, password) {
  if (DEMO_MODE) {
    if (!password) throw new Error("Enter a password.");
    const uid = `demo-${Date.now()}`;
    demoUser = { uid };
    emitDemoUser();
    return demoUser;
  }
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  // Force-refresh the ID token so the Firestore write that immediately
  // follows signup definitely has a fully-propagated auth context — without
  // this, the very next request can occasionally be evaluated as
  // unauthenticated and get silently rejected by security rules.
  await cred.user.getIdToken(true);
  return cred.user;
}

export async function signOutUser() {
  if (DEMO_MODE) {
    demoUser = null;
    emitDemoUser();
    return;
  }
  await signOut(auth);
}

// Friendly copy for common Firebase Auth error codes.
export function authErrorMessage(err) {
  const code = err?.code || "";
  if (code.includes("wrong-password") || code.includes("invalid-credential")) return "That password doesn't match.";
  if (code.includes("too-many-requests")) return "Too many tries — wait a moment and try again.";
  if (code.includes("email-already-in-use")) return "That name is already taken — try logging in instead.";
  if (code.includes("weak-password")) return "Password should be at least 6 characters.";
  return err?.message || "Something went wrong — try again.";
}