"use client";
import { useStore } from "@/store";
import PageLayout from "@/components/layout/PageLayout";
import { StatCard } from "@/components/ui";
import { getLast7Days, getLast30Days, calcWinRate, calcTotalPnL, calcStreak, today } from "@/lib/utils";
import { format, subDays } from "date-fns";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PieChart, Pie, Cell
} from "recharts";
import { BarChart2, TrendingUp, Brain, Zap, Target, Trophy } from "lucide-react";

const TT = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-elevated border border-bg-border rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p: any) => <p key={p.name} style={{ color: p.color || p.stroke || p.fill }}>{p.name}: {typeof p.value === "number" && p.value % 1 !== 0 ? p.value.toFixed(1) : p.value}</p>)}
    </div>
  );
};

export default function AnalyticsPage() {
  const { habits, journalEntries, trades, deepWorkSessions, learningEntries, goals, bodyStats } = useStore();
  const last30 = getLast30Days();
  const last7 = getLast7Days();
  const todayStr = today();

  // Habit consistency
  const habitConsistency = last30.map(d => ({
    day: format(new Date(d), "M/d"),
    rate: habits.length ? Math.round((habits.filter(h => h.completions[d]).length / habits.length) * 100) : 0,
    done: habits.filter(h => h.completions[d]).length,
  }));

  // Deep work trend
  const workTrend = last30.map(d => ({
    day: format(new Date(d), "M/d"),
    mins: deepWorkSessions.filter(s => s.date === d).reduce((s, x) => s + x.duration, 0),
  }));

  // Learning trend
  const learnTrend = last30.map(d => ({
    day: format(new Date(d), "M/d"),
    mins: learningEntries.filter(e => e.date === d).reduce((s, e) => s + e.duration, 0),
  }));

  // Combined productivity (normalized 0-100)
  const productivity = last7.map(d => {
    const habitScore = habits.length ? (habits.filter(h => h.completions[d]).length / habits.length) * 40 : 0;
    const workScore = Math.min(40, deepWorkSessions.filter(s => s.date === d).reduce((s, x) => s + x.duration, 0) / 3);
    const learnScore = Math.min(20, learningEntries.filter(e => e.date === d).reduce((s, e) => s + e.duration, 0) / 3);
    return { day: format(new Date(d), "EEE"), score: Math.round(habitScore + workScore + learnScore), habits: Math.round(habitScore), work: Math.round(workScore), learn: Math.round(learnScore) };
  });

  // Trading P&L cumulative
  const closedTrades = trades.filter(t => t.status === "closed").sort((a, b) => a.date.localeCompare(b.date));
  let running = 0;
  const pnlCurve = closedTrades.map(t => ({ date: t.date.slice(5), pnl: Math.round(running += (t.pnl ?? 0)) }));

  // Mood trend
  const moodTrend = last30.map(d => {
    const entry = journalEntries.find(e => e.date === d);
    return { day: format(new Date(d), "M/d"), mood: entry?.mood ?? null };
  }).filter(d => d.mood !== null);

  // Radar: life balance
  const totalWorkMins = deepWorkSessions.filter(s => last7.includes(s.date)).reduce((s, x) => s + x.duration, 0);
  const totalLearnMins = learningEntries.filter(e => last7.includes(e.date)).reduce((s, e) => s + e.duration, 0);
  const habitRate = habits.length ? (habits.filter(h => h.completions[todayStr]).length / habits.length) * 100 : 0;
  const radarData = [
    { subject: "Habits", A: Math.round(habitRate) },
    { subject: "Deep Work", A: Math.min(100, Math.round(totalWorkMins / 4.2)) },
    { subject: "Learning", A: Math.min(100, Math.round(totalLearnMins / 2.1)) },
    { subject: "Trading", A: Math.min(100, calcWinRate(trades)) },
    { subject: "Goals", A: goals.filter(g => g.status === "active").length ? Math.round(goals.filter(g => g.status === "active").reduce((s, g) => s + g.progress, 0) / goals.filter(g => g.status === "active").length) : 0 },
    { subject: "Journaling", A: Math.min(100, journalEntries.filter(e => last7.includes(e.date)).length * 14) },
  ];

  // Summary stats
  const totalWork7 = deepWorkSessions.filter(s => last7.includes(s.date)).reduce((s, x) => s + x.duration, 0);
  const totalLearn7 = learningEntries.filter(e => last7.includes(e.date)).reduce((s, e) => s + e.duration, 0);
  const winRate = calcWinRate(trades);
  const totalPnL = calcTotalPnL(trades);
  const topStreak = habits.reduce((m, h) => Math.max(m, calcStreak(h.completions)), 0);

  return (
    <PageLayout title="Analytics" subtitle="Unified view of your performance across all modules">
      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Deep work (7d)" value={`${Math.floor(totalWork7 / 60)}h ${totalWork7 % 60}m`} color="tiffany" icon={<Zap size={16} />} />
        <StatCard label="Learning (7d)" value={`${Math.floor(totalLearn7 / 60)}h ${totalLearn7 % 60}m`} color="gold" icon={<Brain size={16} />} />
        <StatCard label="Trading win rate" value={`${winRate}%`} color={winRate >= 50 ? "tiffany" : "red"} icon={<TrendingUp size={16} />} />
        <StatCard label="Top habit streak" value={`${topStreak}d`} color="gold" icon={<Target size={16} />} />
      </div>

      {/* Life balance radar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="card">
          <h3 className="font-serif text-sm font-semibold text-white mb-4">Life balance (this week)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="#1e2d3d" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <Radar name="Score" dataKey="A" stroke="#0ABAB5" fill="#0ABAB5" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Productivity score */}
        <div className="card">
          <h3 className="font-serif text-sm font-semibold text-white mb-4">Daily productivity score (7d)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={productivity} barSize={28}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<TT />} />
              <Bar dataKey="habits" stackId="a" fill="#0ABAB5" radius={[0, 0, 0, 0]} name="Habits" />
              <Bar dataKey="work" stackId="a" fill="#D4AF37" name="Deep work" />
              <Bar dataKey="learn" stackId="a" fill="#818cf8" radius={[4, 4, 0, 0]} name="Learning" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Habit consistency */}
      <div className="card mb-4">
        <h3 className="font-serif text-sm font-semibold text-white mb-4">Habit consistency (30 days)</h3>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={habitConsistency}>
            <defs>
              <linearGradient id="habGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ABAB5" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0ABAB5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} interval={4} />
            <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
            <Tooltip content={<TT />} />
            <Area type="monotone" dataKey="rate" stroke="#0ABAB5" fill="url(#habGrad)" strokeWidth={2} name="Completion %" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Deep work trend */}
        <div className="card">
          <h3 className="font-serif text-sm font-semibold text-white mb-4">Focus minutes (30d)</h3>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={workTrend}>
              <defs>
                <linearGradient id="workGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <Tooltip content={<TT />} />
              <Area type="monotone" dataKey="mins" stroke="#D4AF37" fill="url(#workGrad)" strokeWidth={2} name="Minutes" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Cumulative P&L */}
        <div className="card">
          <h3 className="font-serif text-sm font-semibold text-white mb-4">Cumulative P&L</h3>
          {pnlCurve.length < 2 ? (
            <div className="flex items-center justify-center h-[140px] text-xs text-gray-600">Log more closed trades to see this chart</div>
          ) : (
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={pnlCurve}>
                <defs>
                  <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={totalPnL >= 0 ? "#0ABAB5" : "#ef4444"} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={totalPnL >= 0 ? "#0ABAB5" : "#ef4444"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                <Tooltip content={<TT />} formatter={(v: any) => [`₹${v}`, "P&L"]} />
                <Area type="monotone" dataKey="pnl" stroke={totalPnL >= 0 ? "#0ABAB5" : "#ef4444"} fill="url(#pnlGrad)" strokeWidth={2} name="P&L" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Mood trend */}
      {moodTrend.length > 0 && (
        <div className="card">
          <h3 className="font-serif text-sm font-semibold text-white mb-4">Mood trend (journal entries)</h3>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={moodTrend}>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} interval={3} />
              <YAxis domain={[1, 5]} tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} ticks={[1, 2, 3, 4, 5]} />
              <Tooltip content={<TT />} />
              <Line type="monotone" dataKey="mood" stroke="#818cf8" strokeWidth={2} dot={{ fill: "#818cf8", r: 3 }} name="Mood" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </PageLayout>
  );
}
