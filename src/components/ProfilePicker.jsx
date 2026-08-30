import { useState } from "react";
import { Lock, Eye, EyeOff, PawPrint, Plus } from "lucide-react";
import { upsertSibling } from "../lib/store";
import { emailForName, signIn, signUp, authErrorMessage } from "../lib/auth";
import dogHero from "../assets/frontDog.webp";

const AVATAR_COLORS = ["#E0A339", "#3E7CB1", "#B65C3F", "#3F7D5C", "#8A5CB6"];

// If Firestore/Auth ever hangs instead of resolving or rejecting, this makes
// sure the button doesn't get stuck forever — the user sees an error and can
// retry, instead of staring at "Creating…" with no way out.
function withTimeout(promise, ms, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ]);
}

function Brand({ tagline }) {
  return (
    <>
      <div className="profile-picker__brand">
        <span className="profile-picker__paw"><PawPrint size={16} /></span>
        <h1 className="profile-picker__wordmark">KUTING</h1>
      </div>
      {tagline && <p className="profile-picker__tagline">Keeping Unified Tasks, Information, Notes &amp; Goals</p>}
    </>
  );
}

export default function ProfilePicker({ siblings }) {
  const [mode, setMode] = useState(siblings.length === 0 ? "signup" : "pick");
  const [active, setActive] = useState(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function pickSibling(s) {
    setActive((cur) => (cur?.id === s.id ? null : s));
    setPassword("");
    setError("");
  }

  function goToSignup() {
    setMode("signup");
    setActive(null);
    setName("");
    setPassword("");
    setError("");
  }

  async function handleLogin(e) {
    e.preventDefault();
    if (!active) return;
    setError("");
    setBusy(true);
    try {
      await signIn(active.id, active.email, password);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    if (!name.trim() || !password) return;
    setError("");
    setBusy(true);
    try {
      const email = emailForName(name);
      const role = siblings.length === 0 ? "admin" : "member";
      const user = await withTimeout(signUp(email, password), 10000, "That's taking too long — check your connection and try again.");
      await withTimeout(
        upsertSibling(user.uid, {
          name: name.trim(),
          email,
          role,
          avatarColor: AVATAR_COLORS[siblings.length % AVATAR_COLORS.length],
        }),
        10000,
        "Your account was created, but saving your profile timed out — try logging in, or ask an admin to check Firestore access."
      );
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (mode === "signup") {
    return (
      <div className="profile-picker">
        <div className="profile-picker__body profile-picker__body--top">
          <Brand />
          <h2 className="profile-picker__title">{siblings.length === 0 ? "Set up your household" : "Add a sibling"}</h2>
          <p className="profile-picker__sub">Choose a name and a password only you'll know. Your browser can remember it for next time.</p>
          <form className="profile-picker__form profile-picker__form--stack" onSubmit={handleSignup}>
            <input
              autoFocus
              type="text"
              autoComplete="username"
              placeholder="Your first name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Choose a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
            {error && <p className="form-error">{error}</p>}
            <div className="profile-picker__form-actions">
              {siblings.length > 0 && <button type="button" className="btn-link" onClick={() => setMode("pick")}>Back</button>}
              <button className="btn-primary" type="submit" disabled={busy}>{busy ? "Creating…" : "Join the household"}</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-picker">
      <div className="profile-picker__hero">
        <img src={dogHero} alt="" className="profile-picker__hero-img" />
        <div className="profile-picker__hero-fade" aria-hidden="true" />
      </div>

      <div className="profile-picker__body">
        <Brand tagline />

        <h2 className="profile-picker__title">Who's checking in?</h2>
        <p className="profile-picker__sub">Pick your name, then enter your password.</p>

        <div className="profile-picker__grid">
          {siblings.map((s) => (
            <button
              key={s.id}
              className={`profile-chip ${active?.id === s.id ? "profile-chip--active" : ""}`}
              onClick={() => pickSibling(s)}
              style={{ "--chip-color": s.avatarColor || "#B65C3F" }}
            >
              <span className="profile-chip__avatar">{s.name?.[0]?.toUpperCase()}</span>
              <span>{s.name}</span>
            </button>
          ))}
          <button className="profile-chip profile-chip--add" onClick={goToSignup}>
            <span className="profile-chip__avatar profile-chip__avatar--add"><Plus size={16} /></span>
            <span>Add</span>
          </button>
        </div>

        {active && (
          <form className="profile-picker__login-form" onSubmit={handleLogin}>
            <input type="text" value={active.email} readOnly className="sr-only" autoComplete="username" tabIndex={-1} />
            <div className="password-field">
              <Lock size={16} className="password-field__icon" />
              <input
                autoFocus
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" className="password-field__toggle" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <p className="form-error">{error}</p>}
            <button className="btn-primary btn-primary--block" type="submit" disabled={busy}>
              {busy ? "Checking…" : `Sign in as ${active.name}`}
            </button>
          </form>
        )}

        <p className="profile-picker__footer"><PawPrint size={12} /> Welcome back! Let's take care of our home.</p>
      </div>
    </div>
  );
}