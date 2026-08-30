const MEDALS = ["🥇", "🥈", "🥉"];

export default function Leaderboard({ siblings, chores }) {
  const ranked = [...siblings].sort((a, b) => (b.points || 0) - (a.points || 0));
  const mostCompleted = [...siblings]
    .map((s) => ({ ...s, count: chores.filter((c) => c.status === "verified" && c.assignedTo === s.id).length }))
    .sort((a, b) => b.count - a.count)[0];

  return (
    <div className="leaderboard">
      <div className="leaderboard__list">
        {ranked.map((s, i) => (
          <div key={s.id} className="leaderboard__row">
            <span className="leaderboard__medal">{MEDALS[i] || `#${i + 1}`}</span>
            <span className="avatar-dot" style={{ background: s.avatarColor }}>{s.name?.[0]}</span>
            <span className="leaderboard__name">{s.name}</span>
            <span className="leaderboard__points mono">{s.points || 0} pts</span>
          </div>
        ))}
      </div>
      {mostCompleted && (
        <p className="leaderboard__callout">🏆 Weekly champion so far: <strong>{mostCompleted.name}</strong> with {mostCompleted.count} verified chores.</p>
      )}
    </div>
  );
}
