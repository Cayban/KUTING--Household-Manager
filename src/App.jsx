import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, ListChecks, StickyNote, Activity, Plus, SlidersHorizontal, PawPrint } from "lucide-react";
import { subscribeAuthState, signOutUser } from "./lib/auth";
import {
  subscribeSiblings, subscribeChores, subscribeNotes, subscribeHistory,
} from "./lib/store";
import { isDueToday, isDueThisWeek, isDueThisMonth, effectiveStatus } from "./lib/logic";
import ProfilePicker from "./components/ProfilePicker";
import ChoreCard from "./components/ChoreCard";
import ChoreForm from "./components/ChoreForm";
import ChoreDetail from "./components/ChoreDetail";
import Dashboard from "./components/Dashboard";
import NotesBoard from "./components/NotesBoard";
import HistoryLog from "./components/HistoryLog";
import FilterSheet from "./components/FilterSheet";
import ProfileMenu from "./components/Profilemenu";
import ProfilePage from "./components/Profilepage";
import LoadingScreen from "./components/Loadingscreen";
import "./styles/tokens.css";
import "./styles/app.css";

const NAV = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutGrid },
  { id: "chores", label: "Chores", Icon: ListChecks },
  { id: "notes", label: "Notes", Icon: StickyNote },
  { id: "history", label: "Activity", Icon: Activity },
];

const RANGES = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "all", label: "All" },
];

export default function App() {
  const [authReady, setAuthReady] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [siblings, setSiblings] = useState([]);
  const [chores, setChores] = useState([]);
  const [notes, setNotes] = useState([]);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState("dashboard");
  const [range, setRange] = useState("today");
  const [formOpen, setFormOpen] = useState(false);
  const [editingChore, setEditingChore] = useState(null);
  const [openChore, setOpenChore] = useState(null);
  const [filters, setFilters] = useState({ person: "all", category: "all", status: "all", search: "" });
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profilePageOpen, setProfilePageOpen] = useState(false);

  useEffect(() => {
    const MIN_LOADING_MS = 2200;
    let minTimeDone = false;
    let hasAuthResult = false;

    const timer = setTimeout(() => {
      minTimeDone = true;
      if (hasAuthResult) setAuthReady(true);
    }, MIN_LOADING_MS);

    const unsub = subscribeAuthState((user) => {
      setAuthUser(user);
      hasAuthResult = true;
      if (minTimeDone) setAuthReady(true);
    });

    return () => { clearTimeout(timer); unsub(); };
  }, []);

  // Siblings must be readable even before anyone's logged in — the "pick
  // your name" screen needs the names and avatar colors to render its grid.
  useEffect(() => subscribeSiblings(setSiblings), []);

  // Everything else is private household data — only subscribe once someone
  // is actually signed in, both to satisfy the security rules and to avoid
  // burning reads on data nobody can see yet.
  useEffect(() => {
    if (!authUser) return;
    const unsubs = [
      subscribeChores(setChores),
      subscribeNotes(setNotes),
      subscribeHistory(setHistory),
    ];
    return () => unsubs.forEach((u) => u());
  }, [authUser]);

  const me = authUser ? siblings.find((s) => s.id === authUser.uid) : null;

  const activeFilterCount = (filters.person !== "all" ? 1 : 0) + (filters.category !== "all" ? 1 : 0) + (filters.status !== "all" ? 1 : 0);

  const filteredChores = useMemo(() => {
    let list = chores;
    if (range === "today") list = list.filter(isDueToday);
    if (range === "week") list = list.filter(isDueThisWeek);
    if (range === "month") list = list.filter(isDueThisMonth);
    if (filters.person !== "all") list = list.filter((c) => c.assignedTo === filters.person);
    if (filters.category !== "all") list = list.filter((c) => c.category === filters.category);
    if (filters.status !== "all") list = list.filter((c) => effectiveStatus(c) === filters.status);
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q));
    }
    return list;
  }, [chores, range, filters]);

  if (!authReady) {
    return <LoadingScreen />;
  }

  if (!authUser || !me) {
    return (
      <div className="app-shell app-shell--center">
        <ProfilePicker siblings={siblings} />
      </div>
    );
  }

  return (
    <div className="app-shell app-shell--with-nav">
      <nav className="sidenav">
        <div className="sidenav__brand">
          <span className="sidenav__clip" aria-hidden="true"><PawPrint size={16} /></span>
          <h1>KUTING</h1>
        </div>
        <div className="sidenav__links">
          {NAV.map((t) => (
            <button key={t.id} className={`sidenav__link ${tab === t.id ? "sidenav__link--active" : ""}`} onClick={() => setTab(t.id)}>
              <span className="sidenav__icon" aria-hidden="true"><t.Icon size={18} strokeWidth={2.25} /></span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
        <button className="sidenav__me" onClick={() => setProfileMenuOpen(true)}>
          <span className="avatar-dot" style={{ background: me.avatarColor }}>{me.name?.[0]}</span>
          <span className="sidenav__me-name">{me.name}</span>
        </button>
      </nav>

      <main className="app-main">
        {tab === "dashboard" && <Dashboard chores={chores} siblings={siblings} me={me} />}

        {tab === "chores" && (
          <div className="board-view">
            <div className="range-switch" role="tablist" aria-label="Date range">
              {RANGES.map((r) => (
                <button key={r.id} role="tab" aria-selected={range === r.id} className={`range-switch__btn ${range === r.id ? "range-switch__btn--active" : ""}`} onClick={() => setRange(r.id)}>
                  {r.label}
                </button>
              ))}
            </div>

            <div className="board-view__toolbar">
              <input
                className="search-input"
                placeholder="Search chores…"
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              />
              <button className="filter-btn" onClick={() => setFilterSheetOpen(true)} aria-label="Filters">
                <SlidersHorizontal size={18} />
                {activeFilterCount > 0 && <span className="filter-btn__badge">{activeFilterCount}</span>}
              </button>
            </div>

            <div className="chore-grid">
              {filteredChores.length === 0 && <p className="empty-hint">No chores here. Nice and clear — or add one.</p>}
              {filteredChores.map((c) => (
                <ChoreCard key={c.id} chore={c} siblings={siblings} me={me} onOpen={setOpenChore} />
              ))}
            </div>
          </div>
        )}

        {tab === "notes" && <NotesBoard notes={notes} me={me} siblings={siblings} />}
        {tab === "history" && <HistoryLog history={history} siblings={siblings} />}
      </main>

      <FilterSheet
        open={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        siblings={siblings}
        filters={filters}
        setFilters={setFilters}
      />

      <ProfileMenu
        open={profileMenuOpen}
        onClose={() => setProfileMenuOpen(false)}
        me={me}
        onViewProfile={() => { setProfileMenuOpen(false); setProfilePageOpen(true); }}
        onLogout={() => { setProfileMenuOpen(false); signOutUser(); }}
      />

      <ProfilePage
        open={profilePageOpen}
        onClose={() => setProfilePageOpen(false)}
        me={me}
        chores={chores}
        onLogout={() => { setProfilePageOpen(false); signOutUser(); }}
      />

      {tab === "chores" && (
        <button className="fab" onClick={() => { setEditingChore(null); setFormOpen(true); }} aria-label="New chore">
          <Plus size={26} strokeWidth={2.5} />
        </button>
      )}


      {formOpen && (
        <ChoreForm
          siblings={siblings}
          me={me}
          chore={editingChore}
          onClose={() => { setFormOpen(false); setEditingChore(null); }}
        />
      )}

      {openChore && (
        <ChoreDetail
          chore={chores.find((c) => c.id === openChore.id) || openChore}
          siblings={siblings}
          me={me}
          onClose={() => setOpenChore(null)}
          onEdit={(c) => { setOpenChore(null); setEditingChore(c); setFormOpen(true); }}
        />
      )}
    </div>
  );
}