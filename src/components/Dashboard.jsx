import { ListTodo, Hourglass, CheckCircle2, Heart } from "lucide-react";
import { effectiveStatus, isDueToday } from "../lib/logic";
import peekingDog from "../assets/peekingDog.webp";
import frontDog from "../assets/frontDog.webp";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const RING_SIZE = 132;
const STROKE = 12;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function Dashboard({ chores, siblings, me }) {
  const myChores = chores.filter((c) => c.assignedTo === me.id);
  const myToday = myChores.filter((c) => effectiveStatus(c) !== "verified" && effectiveStatus(c) !== "overdue" && ["pending", "in_progress"].includes(c.status));
  const waitingForMe = chores.filter((c) => c.status === "verification" && c.completedBy !== me.id);
  const myDone = myChores.filter((c) => c.status === "verified").length;

  const dueToday = chores.filter(isDueToday);
  const doneToday = dueToday.filter((c) => c.status === "verified").length;
  const pct = dueToday.length === 0 ? 1 : doneToday / dueToday.length;
  const offset = CIRCUMFERENCE * (1 - pct);

  const rows = siblings.map((s) => {
    const mine = chores.filter((c) => c.assignedTo === s.id);
    return {
      ...s,
      pending: mine.filter((c) => ["pending", "in_progress"].includes(c.status)).length,
      completed: mine.filter((c) => c.status === "verification" || c.status === "verified").length,
      verified: mine.filter((c) => c.status === "verified").length,
    };
  });

  return (
    <div className="dashboard">
      <div className="dashboard__hero glass">
        <div className="dashboard__hero-copy">
          <h2>{greeting()}, {me.name}. <span aria-hidden="true">🐾</span></h2>
          <p>Here's where things stand today.</p>
        </div>
        <img src={peekingDog} alt="" className="dashboard__hero-dog" aria-hidden="true" />
      </div>

      <div className="progress-hero glass">
        <svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "#FF6B5B" }} />
              <stop offset="55%" style={{ stopColor: "#B34CFF" }} />
              <stop offset="100%" style={{ stopColor: "#6C5CE7" }} />
            </linearGradient>
          </defs>
          <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RADIUS} fill="none" stroke="var(--border)" strokeWidth={STROKE} />
          <circle
            cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RADIUS} fill="none" stroke="url(#ringGrad)"
            strokeWidth={STROKE} strokeLinecap="round" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={offset}
            transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`} style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
          <text x="50%" y="47%" textAnchor="middle" fontFamily="Space Grotesk" fontSize="26" fontWeight="700" fill="var(--text)">
            {Math.round(pct * 100)}%
          </text>
          <text x="50%" y="64%" textAnchor="middle" fontFamily="Inter" fontSize="10" fill="var(--text-dim)">
            today
          </text>
        </svg>
        <div className="progress-hero__copy">
          <h3 style={{ fontSize: "1.05rem", marginBottom: 4 }}>Household progress</h3>
          <p style={{ margin: 0, color: "var(--text-dim)", fontSize: "0.86rem" }}>
            {dueToday.length === 0
              ? "Nothing due today — enjoy it."
              : `${doneToday} of ${dueToday.length} chores verified today across everyone.`}
          </p>
        </div>
      </div>

      <div className="dashboard__stats">
        <div className="stat-card" style={{ "--stat-color": "var(--pending)" }}>
          <ListTodo size={18} color="var(--pending)" style={{ marginBottom: 8 }} />
          <span className="stat-card__num">{myToday.length}</span>
          <span className="stat-card__label">Your open tasks</span>
        </div>
        <div className="stat-card" style={{ "--stat-color": "var(--verify)" }}>
          <Hourglass size={18} color="var(--verify)" style={{ marginBottom: 8 }} />
          <span className="stat-card__num">{waitingForMe.length}</span>
          <span className="stat-card__label">Waiting on your check</span>
        </div>
        <div className="stat-card" style={{ "--stat-color": "var(--done)" }}>
          <CheckCircle2 size={18} color="var(--done)" style={{ marginBottom: 8 }} />
          <span className="stat-card__num">{myDone}</span>
          <span className="stat-card__label">Your verified chores</span>
        </div>
      </div>

      <h3 className="dashboard__section-title">Family overview</h3>
      <div className="sibling-rows">
        {rows.map((r) => (
          <div key={r.id} className={`sibling-row ${r.id === me.id ? "sibling-row--me" : ""}`}>
            <span className="avatar-dot sibling-row__avatar" style={{ background: r.avatarColor }}>{r.name?.[0]}</span>
            <span className="sibling-row__name">{r.name}</span>
            <div className="sibling-row__counts">
              <span className="count-pill" style={{ color: "var(--pending)", background: "var(--pending-bg)" }}>{r.pending} pending</span>
              <span className="count-pill" style={{ color: "var(--progress)", background: "var(--progress-bg)" }}>{r.completed} done</span>
              <span className="count-pill" style={{ color: "var(--done)", background: "var(--done-bg)" }}>{r.verified} verified</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard__cheer glass">
        <img src={frontDog} alt="" className="dashboard__cheer-dog" aria-hidden="true" />
        <div>
          <h3>{pct === 1 ? "Great job, team!" : "Keep it up, team!"}</h3>
          <p>{pct === 1 ? "Let's keep our home clean and happy." : "A few more chores and today's all clear."}</p>
        </div>
        <Heart size={16} className="dashboard__cheer-heart" />
      </div>
    </div>
  );
}