import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, startOfWeek, eachDayOfInterval, subDays, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function today() {
  return format(new Date(), "yyyy-MM-dd");
}

export function formatDate(d: string) {
  return format(parseISO(d), "MMM d, yyyy");
}

export function formatShort(d: string) {
  return format(parseISO(d), "MMM d");
}

export function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) =>
    format(subDays(new Date(), 6 - i), "yyyy-MM-dd")
  );
}

export function getLast30Days() {
  return Array.from({ length: 30 }, (_, i) =>
    format(subDays(new Date(), 29 - i), "yyyy-MM-dd")
  );
}

export function getLast12Weeks() {
  return Array.from({ length: 12 }, (_, i) => {
    const d = subDays(new Date(), (11 - i) * 7);
    return format(startOfWeek(d), "yyyy-MM-dd");
  });
}

export function moodLabel(mood: number) {
  return ["", "Awful", "Bad", "Okay", "Good", "Great"][mood] || "—";
}

export function moodColor(mood: number) {
  return ["", "#ef4444", "#f97316", "#eab308", "#22c55e", "#0ABAB5"][mood] || "#666";
}

export const CATEGORIES = {
  habits: ["Health", "Fitness", "Learning", "Mindset", "Finance", "Social", "Other"],
  learning: ["Trading", "AI/Tech", "Finance", "Business", "Science", "Language", "Other"],
  knowledge: ["Trading", "Finance", "AI", "Tech", "Books", "Videos", "Tools", "Other"],
  goals: ["Finance", "Health", "Career", "Learning", "Personal", "Other"],
  deepwork: ["Trading", "Learning", "Building", "Writing", "Research", "Other"],
};

export function calcStreak(completions: Record<string, boolean>): number {
  let streak = 0;
  let d = new Date();
  while (true) {
    const key = format(d, "yyyy-MM-dd");
    if (completions[key]) { streak++; d = subDays(d, 1); }
    else break;
  }
  return streak;
}

export function calcWinRate(trades: Array<{ status: string; pnl?: number }>): number {
  const closed = trades.filter(t => t.status === "closed");
  if (!closed.length) return 0;
  const wins = closed.filter(t => (t.pnl ?? 0) > 0).length;
  return Math.round((wins / closed.length) * 100);
}

export function calcTotalPnL(trades: Array<{ status: string; pnl?: number }>): number {
  return trades.filter(t => t.status === "closed").reduce((s, t) => s + (t.pnl ?? 0), 0);
}
