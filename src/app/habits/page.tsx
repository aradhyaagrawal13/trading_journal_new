"use client";
import { useState } from "react";
import { useStore } from "@/store";
import PageLayout from "@/components/layout/PageLayout";
import { Modal, StatCard, EmptyState, FormField, Select, TagInput } from "@/components/ui";
import { today, getLast7Days, calcStreak, CATEGORIES } from "@/lib/utils";
import { format } from "date-fns";
import { Plus, Flame, CheckCircle2, Target, Trash2, BarChart2 } from "lucide-react";

const COLORS = ["#0ABAB5", "#D4AF37", "#818cf8", "#fb7185", "#34d399", "#fb923c", "#a78bfa"];

export default function HabitsPage() {
  const { habits, addHabit, toggleHabitCompletion, deleteHabit } = useStore();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"today" | "week">("today");
  const todayStr = today();
  const last7 = getLast7Days();

  const [form, setForm] = useState({
    name: "", description: "", frequency: "daily" as const,
    category: "Health", color: COLORS[0],
  });

  const save = () => {
    if (!form.name) return;
    addHabit(form);
    setOpen(false);
    setForm({ name: "", description: "", frequency: "daily", category: "Health", color: COLORS[0] });
  };

  const completedToday = habits.filter(h => h.completions[todayStr]).length;
  const completionRate = habits.length ? Math.round((completedToday / habits.length) * 100) : 0;
  const topStreak = habits.reduce((m, h) => Math.max(m, calcStreak(h.completions)), 0);

  return (
    <PageLayout
      title="Habit Tracker"
      subtitle="Build consistency, one day at a time"
      actions={
        <button onClick={() => setOpen(true)} className="btn-primary flex items-center gap-1.5">
          <Plus size={15} /> New Habit
        </button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Done today" value={`${completedToday}/${habits.length}`} sub={`${completionRate}% complete`} color="tiffany" icon={<CheckCircle2 size={16} />} />
        <StatCard label="Top streak" value={`${topStreak}d`} sub="consecutive days" color="gold" icon={<Flame size={16} />} />
        <StatCard label="Total habits" value={habits.length} sub="being tracked" color="tiffany" icon={<Target size={16} />} />
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-2 mb-4">
        {["today", "week"].map(v => (
          <button key={v} onClick={() => setView(v as any)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all capitalize ${view === v ? "bg-tiffany-500/10 text-tiffany-400 border border-tiffany-500/20" : "text-gray-500 hover:text-gray-300"}`}>
            {v === "today" ? "Today" : "This week"}
          </button>
        ))}
      </div>

      {/* Habits list */}
      {habits.length === 0 ? (
        <EmptyState icon={<Target size={40} />} title="No habits yet" sub="Add your first habit to start building streaks" />
      ) : view === "today" ? (
        <div className="space-y-3">
          {habits.map(h => {
            const done = h.completions[todayStr];
            const streak = calcStreak(h.completions);
            return (
              <div key={h.id} className={`card card-hover flex items-center gap-4 cursor-pointer transition-all ${done ? "opacity-80" : ""}`}
                onClick={() => toggleHabitCompletion(h.id, todayStr)}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ background: done ? h.color : "transparent", border: `2px solid ${h.color}` }}>
                  {done && <CheckCircle2 size={18} style={{ color: "#080B0F" }} />}
                </div>
                <div className="flex-1">
                  <div className={`font-medium text-sm ${done ? "line-through text-gray-500" : "text-white"}`}>{h.name}</div>
                  <div className="text-xs text-gray-600">{h.category} · {h.frequency}</div>
                </div>
                {streak > 0 && (
                  <div className="flex items-center gap-1 text-gold-400">
                    <Flame size={14} />
                    <span className="text-xs font-mono font-medium">{streak}d</span>
                  </div>
                )}
                <button onClick={(e) => { e.stopPropagation(); deleteHabit(h.id); }}
                  className="btn-ghost p-1.5 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all">
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        // Week heatmap view
        <div className="card overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left text-gray-500 font-medium py-2 pr-4 w-40">Habit</th>
                {last7.map(d => (
                  <th key={d} className="text-center text-gray-500 font-medium py-2 px-2 w-10">
                    {format(new Date(d), "EEE")}
                    <div className="text-[10px] text-gray-700">{format(new Date(d), "d")}</div>
                  </th>
                ))}
                <th className="text-center text-gray-500 font-medium py-2 px-2">Streak</th>
              </tr>
            </thead>
            <tbody>
              {habits.map(h => (
                <tr key={h.id} className="border-t border-bg-border">
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: h.color }} />
                      <span className="text-gray-300 truncate max-w-[120px]">{h.name}</span>
                    </div>
                  </td>
                  {last7.map(d => (
                    <td key={d} className="py-2.5 text-center">
                      <button onClick={() => toggleHabitCompletion(h.id, d)}
                        className="w-7 h-7 rounded-md mx-auto block transition-all hover:scale-110"
                        style={{ background: h.completions[d] ? h.color : "#1e2d3d" }} />
                    </td>
                  ))}
                  <td className="py-2.5 text-center">
                    <span className="text-gold-400 font-mono font-medium">{calcStreak(h.completions)}d</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add habit modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="New Habit">
        <div className="space-y-4">
          <FormField label="Habit name" required>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Morning meditation" />
          </FormField>
          <FormField label="Description">
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional note..." />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Frequency">
              <Select value={form.frequency} onChange={v => setForm({ ...form, frequency: v as any })}
                options={[{ value: "daily", label: "Daily" }, { value: "weekly", label: "Weekly" }]} />
            </FormField>
            <FormField label="Category">
              <Select value={form.category} onChange={v => setForm({ ...form, category: v })}
                options={CATEGORIES.habits.map(c => ({ value: c, label: c }))} />
            </FormField>
          </div>
          <FormField label="Color">
            <div className="flex gap-2 mt-1">
              {COLORS.map(c => (
                <button key={c} onClick={() => setForm({ ...form, color: c })}
                  className={`w-7 h-7 rounded-full transition-all ${form.color === c ? "ring-2 ring-white ring-offset-2 ring-offset-bg-card scale-110" : ""}`}
                  style={{ background: c }} />
              ))}
            </div>
          </FormField>
          <div className="flex gap-2 pt-2">
            <button onClick={save} className="btn-primary flex-1">Add Habit</button>
            <button onClick={() => setOpen(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
}
