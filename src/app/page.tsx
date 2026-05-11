"use client";
import { useStore } from "@/store";
import PageLayout from "@/components/layout/PageLayout";
import { StatCard } from "@/components/ui";
import { today, getLast7Days, calcWinRate, calcTotalPnL, calcStreak } from "@/lib/utils";
import { format } from "date-fns";
import {
  Target, BookOpen, TrendingUp, Brain, Zap, Trophy,
  Flame, CheckCircle2, Clock, DollarSign
} from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-elevated border border-bg-border rounded-lg px-3 py-2 text-xs">
      <p className="text-gray-400">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { habits, journalEntries, trades, deepWorkSessions, learningEntries, goals, settings } = useStore();
  const todayStr = today();
  const last7 = getLast7Days();

  // Habit stats
  const activeHabits = habits.length;
  const completedToday = habits.filter(h => h.completions[todayStr]).length;
  const topStreak = habits.reduce((m, h) => Math.max(m, calcStreak(h.completions)), 0);

  // Trading stats
  const winRate = calcWinRate(trades);
  const totalPnL = calcTotalPnL(trades);

  // Deep work this week
  const weekWork = deepWorkSessions
    .filter(s => last7.includes(s.date))
    .reduce((sum, s) => sum + s.duration, 0);

  // Learning this week
  const weekLearn = learningEntries
    .filter(e => last7.includes(e.date))
    .reduce((sum, e) => sum + e.duration, 0);

  // Habit completion chart
  const habitChart = last7.map(d => ({
    day: format(new Date(d), "EEE"),
    completed: habits.filter(h => h.completions[d]).length,
    total: habits.length,
  }));

  // Deep work chart
  const workChart = last7.map(d => ({
    day: format(new Date(d), "EEE"),
    mins: deepWorkSessions.filter(s => s.date === d).reduce((s, x) => s + x.duration, 0),
  }));

  const activeGoals = goals.filter(g => g.status === "active");
  const recentJournal = journalEntries[0];

  return (
    <PageLayout
      title={`Good ${getGreeting()}, ${settings.username}`}
      subtitle={format(new Date(), "EEEE, MMMM d, yyyy")}
    >
      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Habits today"
          value={`${completedToday}/${activeHabits}`}
          sub={`${activeHabits ? Math.round((completedToday / activeHabits) * 100) : 0}% complete`}
          color="tiffany"
          icon={<Target size={16} />}
        />
        <StatCard
          label="Top streak"
          value={`${topStreak}d`}
          sub="days in a row"
          color="gold"
          icon={<Flame size={16} />}
        />
        <StatCard
          label="Deep work (7d)"
          value={`${Math.round(weekWork / 60)}h ${weekWork % 60}m`}
          sub="focused sessions"
          color="tiffany"
          icon={<Zap size={16} />}
        />
        <StatCard
          label="Win rate"
          value={`${winRate}%`}
          sub={`P&L: ₹${totalPnL.toFixed(0)}`}
          color={totalPnL >= 0 ? "green" : "red"}
          icon={<TrendingUp size={16} />}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <h3 className="font-serif text-sm font-semibold text-white mb-4">Habit completion (7 days)</h3>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={habitChart} barSize={20}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="completed" fill="#0ABAB5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="font-serif text-sm font-semibold text-white mb-4">Focus minutes (7 days)</h3>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={workChart}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="mins" stroke="#D4AF37" strokeWidth={2} dot={{ fill: "#D4AF37", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Modules grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Today's habits */}
        {settings.modules.habits && (
          <div className="card card-hover">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-sm font-semibold text-white flex items-center gap-2">
                <Target size={14} className="text-tiffany-400" /> Habits today
              </h3>
              <Link href="/habits" className="text-xs text-tiffany-400 hover:text-tiffany-300">View all →</Link>
            </div>
            {habits.length === 0 ? (
              <p className="text-xs text-gray-600">No habits yet. <Link href="/habits" className="text-tiffany-400">Add one →</Link></p>
            ) : (
              <div className="space-y-2">
                {habits.slice(0, 4).map(h => (
                  <div key={h.id} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${h.completions[todayStr] ? "border-tiffany-500 bg-tiffany-500" : "border-gray-700"}`}>
                      {h.completions[todayStr] && <CheckCircle2 size={10} className="text-gray-900" />}
                    </div>
                    <span className={`text-xs flex-1 ${h.completions[todayStr] ? "line-through text-gray-600" : "text-gray-300"}`}>{h.name}</span>
                    {calcStreak(h.completions) > 0 && (
                      <span className="text-[10px] text-gold-400 font-mono">{calcStreak(h.completions)}d</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recent journal */}
        {settings.modules.journal && (
          <div className="card card-hover">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-sm font-semibold text-white flex items-center gap-2">
                <BookOpen size={14} className="text-gold-400" /> Latest journal
              </h3>
              <Link href="/journal" className="text-xs text-tiffany-400 hover:text-tiffany-300">View all →</Link>
            </div>
            {!recentJournal ? (
              <p className="text-xs text-gray-600">No entries yet. <Link href="/journal" className="text-tiffany-400">Write today →</Link></p>
            ) : (
              <div>
                <div className="text-xs text-gray-500 mb-1">{recentJournal.date}</div>
                <div className="text-sm text-white font-medium mb-1 line-clamp-1">{recentJournal.title}</div>
                <div className="text-xs text-gray-500 line-clamp-2">{recentJournal.content}</div>
              </div>
            )}
          </div>
        )}

        {/* Active goals */}
        {settings.modules.goals && (
          <div className="card card-hover">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-sm font-semibold text-white flex items-center gap-2">
                <Trophy size={14} className="text-gold-400" /> Active goals
              </h3>
              <Link href="/goals" className="text-xs text-tiffany-400 hover:text-tiffany-300">View all →</Link>
            </div>
            {activeGoals.length === 0 ? (
              <p className="text-xs text-gray-600">No goals yet. <Link href="/goals" className="text-tiffany-400">Add one →</Link></p>
            ) : (
              <div className="space-y-3">
                {activeGoals.slice(0, 3).map(g => (
                  <div key={g.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300 truncate">{g.title}</span>
                      <span className="text-tiffany-400 ml-2">{g.progress}%</span>
                    </div>
                    <div className="h-1 bg-bg-elevated rounded-full">
                      <div className="h-full bg-tiffany-500 rounded-full transition-all" style={{ width: `${g.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recent trades */}
        {settings.modules.trading && (
          <div className="card card-hover">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-sm font-semibold text-white flex items-center gap-2">
                <TrendingUp size={14} className="text-tiffany-400" /> Recent trades
              </h3>
              <Link href="/trading" className="text-xs text-tiffany-400 hover:text-tiffany-300">View all →</Link>
            </div>
            {trades.length === 0 ? (
              <p className="text-xs text-gray-600">No trades yet. <Link href="/trading" className="text-tiffany-400">Log one →</Link></p>
            ) : (
              <div className="space-y-2">
                {trades.slice(0, 3).map(t => (
                  <div key={t.id} className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-white font-medium">{t.asset}</span>
                      <span className={`ml-2 text-[10px] badge ${t.direction === "long" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>{t.direction}</span>
                    </div>
                    {t.status === "closed" && (
                      <span className={`text-xs font-mono font-medium ${(t.pnl ?? 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {(t.pnl ?? 0) >= 0 ? "+" : ""}₹{t.pnl?.toFixed(0)}
                      </span>
                    )}
                    {t.status === "open" && <span className="text-[10px] badge bg-gold-500/10 text-gold-400">Open</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Learning this week */}
        {settings.modules.learning && (
          <div className="card card-hover">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-sm font-semibold text-white flex items-center gap-2">
                <Brain size={14} className="text-tiffany-400" /> Learning (7d)
              </h3>
              <Link href="/learning" className="text-xs text-tiffany-400 hover:text-tiffany-300">View all →</Link>
            </div>
            <div className="text-2xl font-serif font-bold text-tiffany-400 mb-1">
              {Math.round(weekLearn / 60)}h {weekLearn % 60}m
            </div>
            <div className="text-xs text-gray-500 mb-3">studied this week</div>
            {learningEntries.slice(0, 2).map(e => (
              <div key={e.id} className="flex items-center gap-2 mb-1.5">
                <Clock size={10} className="text-gray-600" />
                <span className="text-xs text-gray-400 truncate">{e.topic}</span>
                <span className="text-xs text-gray-600 ml-auto">{e.duration}m</span>
              </div>
            ))}
          </div>
        )}

        {/* Quick add */}
        <div className="card border-dashed border-bg-border/50">
          <h3 className="font-serif text-sm font-semibold text-gray-600 mb-3">Quick links</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { href: "/habits", label: "Log habit", icon: Target },
              { href: "/journal", label: "New entry", icon: BookOpen },
              { href: "/trading", label: "Log trade", icon: TrendingUp },
              { href: "/deepwork", label: "Start focus", icon: Zap },
            ].map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-bg-elevated hover:bg-bg-card border border-bg-border hover:border-tiffany-500/30 transition-all text-xs text-gray-400 hover:text-tiffany-400">
                  <Icon size={12} />
                  {label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
