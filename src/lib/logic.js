import { isBefore, isToday, isThisWeek, isThisMonth, startOfDay } from "date-fns";

export const CATEGORIES = [
  { id: "cleaning", label: "Cleaning", icon: "🧹" },
  { id: "kitchen", label: "Kitchen", icon: "🍳" },
  { id: "pets", label: "Pets", icon: "🐶" },
  { id: "garbage", label: "Garbage", icon: "🗑️" },
  { id: "shopping", label: "Shopping", icon: "🛒" },
  { id: "household", label: "General Household", icon: "🏠" },
  { id: "outdoor", label: "Outdoor", icon: "🌱" },
];

export const PRIORITIES = [
  { id: "low", label: "Low", points: 5 },
  { id: "medium", label: "Medium", points: 10 },
  { id: "high", label: "High", points: 20 },
];

export const STATUS_META = {
  pending: { label: "Pending", color: "var(--pending)", bg: "var(--pending-bg)" },
  in_progress: { label: "In Progress", color: "var(--progress)", bg: "var(--progress-bg)" },
  verification: { label: "Waiting for Check", color: "var(--verify)", bg: "var(--verify-bg)" },
  verified: { label: "Verified", color: "var(--done)", bg: "var(--done-bg)" },
  needs_improvement: { label: "Needs Improvement", color: "var(--overdue)", bg: "var(--overdue-bg)" },
  overdue: { label: "Overdue", color: "var(--overdue)", bg: "var(--overdue-bg)" },
};

export function effectiveStatus(chore) {
  if (chore.status === "pending" || chore.status === "in_progress") {
    if (chore.dueDate && isBefore(new Date(chore.dueDate), startOfDay(new Date())) ) {
      return "overdue";
    }
  }
  return chore.status;
}

export function toDateSafe(d) {
  if (!d) return null;
  return typeof d === "string" ? new Date(d) : d;
}

export function isDueToday(chore) {
  const d = toDateSafe(chore.dueDate);
  return d ? isToday(d) : false;
}
export function isDueThisWeek(chore) {
  const d = toDateSafe(chore.dueDate);
  return d ? isThisWeek(d, { weekStartsOn: 1 }) : false;
}
export function isDueThisMonth(chore) {
  const d = toDateSafe(chore.dueDate);
  return d ? isThisMonth(d) : false;
}

// Chore rotation: given a list of sibling ids and a chore's rotationGroup + a
// week number, returns which sibling index is "up" this week.
export function rotationAssignee(rotationGroup, siblingIds, weekIndex) {
  if (!rotationGroup || siblingIds.length === 0) return null;
  const idx = weekIndex % siblingIds.length;
  return siblingIds[idx];
}

export function weekIndexSinceEpoch(date = new Date()) {
  const epoch = new Date(2024, 0, 1); // arbitrary fixed Monday-ish anchor
  const diffMs = date - epoch;
  return Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
}

// Given a completed/recurring chore, compute the next due date instance.
export function nextDueDate(dueDate, recurrence) {
  const d = toDateSafe(dueDate) || new Date();
  const next = new Date(d);
  if (recurrence === "daily") next.setDate(next.getDate() + 1);
  else if (recurrence === "weekly") next.setDate(next.getDate() + 7);
  else if (recurrence === "monthly") next.setMonth(next.getMonth() + 1);
  return next;
}

export function formatDate(d) {
  const dt = toDateSafe(d);
  if (!dt) return "No due date";
  return dt.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Firestore serverTimestamp() resolves to a Timestamp object (.toDate()),
// while demo mode just stores ISO strings — this handles both.
export function toJsDate(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  return new Date(value);
}

export function relativeTime(value) {
  const d = toJsDate(value);
  if (!d) return "";
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function dayLabel(value) {
  const d = toJsDate(value);
  if (!d) return "Earlier";
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "long", day: "numeric" });
}