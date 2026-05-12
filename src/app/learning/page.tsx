"use client";
import { useState } from "react";
import { useStore } from "@/store";
import PageLayout from "@/components/layout/PageLayout";
import { Modal, StatCard, EmptyState, FormField, TagInput, Select } from "@/components/ui";
import { today, getLast7Days, CATEGORIES } from "@/lib/utils";
import { Plus, Brain, Clock, BookOpen, Link, Trash2, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format } from "date-fns";

const CATEGORY_COLORS: Record<string, string> = {
  Trading: "#0ABAB5", "AI/Tech": "#818cf8", Finance: "#D4AF37",
  Business: "#34d399", Science: "#fb923c", Language: "#fb7185", Other: "#6b7280",
};

export default function LearningPage() {
  const { learningEntries, addLearningEntry, deleteLearningEntry } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date: today(), topic: "", category: "Trading", duration: 30, resource: "", resourceUrl: "", notes: "", tags: [] as string[] });
  const last7 = getLast7Days();

  const save = () => {
    if (!form.topic) return;
    addLearningEntry(form);
    setOpen(false);
    setForm({ date: today(), topic: "", category: "Trading", duration: 30, resource: "", resourceUrl: "", notes: "", tags: [] });
  };

  const totalMins = learningEntries.reduce((s, e) => s + e.duration, 0);
  const weekMins = learningEntries.filter(e => last7.includes(e.date)).reduce((s, e) => s + e.duration, 0);
  const topics = Array.from(new Set(learningEntries.map(e => e.topic))).length;

  const dailyData = last7.map(d => ({
    day: format(new Date(d), "EEE"),
    mins: learningEntries.filter(e => e.date === d).reduce((s, e) => s + e.duration, 0),
  }));

  const catData = CATEGORIES.learning.map(c => ({
    name: c,
    value: learningEntries.filter(e => e.category === c).reduce((s, e) => s + e.duration, 0),
  })).filter(c => c.value > 0);

  return (
    <PageLayout
      title="Learning Tracker"
      subtitle="Knowledge compounds. Track every session."
      actions={<button onClick={() => setOpen(true)} className="btn-primary flex items-center gap-1.5"><Plus size={15} /> Log Session</button>}
    >
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Total time" value={`${Math.floor(totalMins / 60)}h ${totalMins % 60}m`} color="tiffany" icon={<Clock size={16} />} />
        <StatCard label="This week" value={`${Math.floor(weekMins / 60)}h ${weekMins % 60}m`} color="gold" icon={<TrendingUp size={16} />} />
        <StatCard label="Topics covered" value={topics} color="tiffany" icon={<Brain size={16} />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <h3 className="font-serif text-sm font-semibold text-white mb-4">Daily learning (7 days)</h3>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={dailyData} barSize={22}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: any) => [`${v} min`, "Duration"]} contentStyle={{ background: "#1a2234", border: "1px solid #1e2d3d", borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="mins" fill="#0ABAB5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {catData.length > 0 && (
          <div className="card">
            <h3 className="font-serif text-sm font-semibold text-white mb-4">By category</h3>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={120}>
                <PieChart>
                  <Pie data={catData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={3}>
                    {catData.map((c, i) => <Cell key={i} fill={CATEGORY_COLORS[c.name] || "#6b7280"} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {catData.map(c => (
                  <div key={c.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[c.name] || "#6b7280" }} />
                    <span className="text-gray-400 flex-1 truncate">{c.name}</span>
                    <span className="text-gray-500 font-mono">{Math.floor(c.value / 60)}h{c.value % 60}m</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {learningEntries.length === 0 ? (
        <EmptyState icon={<Brain size={40} />} title="No learning sessions yet" sub="Log your first study session to start tracking" />
      ) : (
        <div className="space-y-2">
          {learningEntries.map(e => (
            <div key={e.id} className="card card-hover flex items-center gap-4 group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${CATEGORY_COLORS[e.category] || "#6b7280"}20` }}>
                <Brain size={16} style={{ color: CATEGORY_COLORS[e.category] || "#6b7280" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-white">{e.topic}</span>
                  <span className="badge text-[10px]" style={{ background: `${CATEGORY_COLORS[e.category]}20`, color: CATEGORY_COLORS[e.category] }}>{e.category}</span>
                  {e.tags.map(t => <span key={t} className="badge bg-tiffany-500/10 text-tiffany-400 text-[10px]">{t}</span>)}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-gray-500">{e.date}</span>
                  <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={10} /> {e.duration}min</span>
                  {e.resource && <span className="text-xs text-gray-600 flex items-center gap-1"><BookOpen size={10} /> {e.resource}</span>}
                  {e.resourceUrl && <a href={e.resourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-tiffany-400 flex items-center gap-1 hover:underline" onClick={ev => ev.stopPropagation()}><Link size={10} /> Link</a>}
                </div>
                {e.notes && <p className="text-xs text-gray-600 mt-0.5 truncate">{e.notes}</p>}
              </div>
              <button onClick={() => deleteLearningEntry(e.id)} className="opacity-0 group-hover:opacity-100 btn-ghost p-1.5 hover:text-red-400 transition-all flex-shrink-0">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Log Learning Session">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Date"><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></FormField>
            <FormField label="Duration (min)"><input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: +e.target.value })} /></FormField>
          </div>
          <FormField label="Topic" required><input value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} placeholder="e.g. Candlestick patterns, VWAP strategy..." /></FormField>
          <FormField label="Category">
            <Select value={form.category} onChange={v => setForm({ ...form, category: v })} options={CATEGORIES.learning.map(c => ({ value: c, label: c }))} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Resource name"><input value={form.resource} onChange={e => setForm({ ...form, resource: e.target.value })} placeholder="e.g. Rayner Teo YouTube" /></FormField>
            <FormField label="Resource URL"><input value={form.resourceUrl} onChange={e => setForm({ ...form, resourceUrl: e.target.value })} placeholder="https://..." /></FormField>
          </div>
          <FormField label="Tags"><TagInput tags={form.tags} onChange={t => setForm({ ...form, tags: t })} /></FormField>
          <FormField label="Notes"><textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Key takeaways..." /></FormField>
          <div className="flex gap-2"><button onClick={save} className="btn-primary flex-1">Log Session</button><button onClick={() => setOpen(false)} className="btn-secondary">Cancel</button></div>
        </div>
      </Modal>
    </PageLayout>
  );
}
