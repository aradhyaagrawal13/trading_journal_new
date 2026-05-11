"use client";
import { useState, useEffect, useRef } from "react";
import { useStore } from "@/store";
import PageLayout from "@/components/layout/PageLayout";
import { Modal, StatCard, EmptyState, FormField, Select } from "@/components/ui";
import { today, getLast7Days, CATEGORIES } from "@/lib/utils";
import { format } from "date-fns";
import { Play, Pause, RotateCcw, Plus, Zap, Clock, Trash2, CheckCircle } from "lucide-react";

export default function DeepWorkPage() {
  const { deepWorkSessions, addDeepWorkSession, deleteDeepWorkSession } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date: today(), task: "", category: "Trading", duration: 25, completed: true, notes: "" });

  // Timer
  const [mode, setMode] = useState<"pomodoro" | "custom">("pomodoro");
  const [mins, setMins] = useState(25);
  const [secs, setSecs] = useState(0);
  const [running, setRunning] = useState(false);
  const [task, setTask] = useState("");
  const [cat, setCat] = useState("Trading");
  const intervalRef = useRef<any>(null);
  const totalMins = useRef(25);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecs(s => {
          if (s === 0) {
            setMins(m => {
              if (m === 0) {
                setRunning(false);
                clearInterval(intervalRef.current);
                if (task) addDeepWorkSession({ date: today(), task, category: cat, duration: totalMins.current, completed: true, notes: "" });
                return 0;
              }
              return m - 1;
            });
            return 59;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const reset = (m = 25) => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setMins(m);
    setSecs(0);
    totalMins.current = m;
  };

  const pct = ((totalMins.current * 60 - (mins * 60 + secs)) / (totalMins.current * 60)) * 100;

  const todaySessions = deepWorkSessions.filter(s => s.date === today());
  const todayMins = todaySessions.reduce((s, x) => s + x.duration, 0);
  const last7 = getLast7Days();
  const weekMins = deepWorkSessions.filter(s => last7.includes(s.date)).reduce((s, x) => s + x.duration, 0);

  const save = () => {
    if (!form.task) return;
    addDeepWorkSession(form);
    setOpen(false);
    setForm({ date: today(), task: "", category: "Trading", duration: 25, completed: true, notes: "" });
  };

  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (pct / 100) * circumference;

  return (
    <PageLayout title="Deep Work" subtitle="Focus sessions · Pomodoro timer">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Today" value={`${Math.floor(todayMins / 60)}h ${todayMins % 60}m`} sub={`${todaySessions.length} sessions`} color="tiffany" icon={<Zap size={16} />} />
        <StatCard label="This week" value={`${Math.floor(weekMins / 60)}h ${weekMins % 60}m`} color="gold" icon={<Clock size={16} />} />
        <StatCard label="Total sessions" value={deepWorkSessions.length} color="tiffany" icon={<CheckCircle size={16} />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Timer */}
        <div className="card flex flex-col items-center py-8">
          {/* Mode tabs */}
          <div className="flex gap-2 mb-6">
            {[{ id: "pomodoro", label: "Pomodoro", m: 25 }, { id: "custom", label: "Custom", m: mins }].map(v => (
              <button key={v.id} onClick={() => { setMode(v.id as any); if (v.id === "pomodoro") reset(25); }}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${mode === v.id ? "bg-tiffany-500/10 text-tiffany-400 border border-tiffany-500/20" : "text-gray-500"}`}>
                {v.label}
              </button>
            ))}
          </div>

          {/* SVG Timer ring */}
          <div className="relative w-36 h-36 mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#1e2d3d" strokeWidth="8" />
              <circle cx="60" cy="60" r="54" fill="none" stroke="#0ABAB5" strokeWidth="8"
                strokeDasharray={circumference} strokeDashoffset={dashOffset}
                strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-mono text-3xl font-bold text-white">
                {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
              </div>
              <div className="text-xs text-gray-500 mt-1">{running ? "focusing..." : "ready"}</div>
            </div>
          </div>

          {/* Task input */}
          <div className="w-full mb-4 space-y-2">
            <input value={task} onChange={e => setTask(e.target.value)} placeholder="What are you working on?" className="text-center text-sm" />
            {mode === "custom" && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Minutes:</span>
                <input type="number" min="1" max="180" value={totalMins.current}
                  onChange={e => { const m = +e.target.value; reset(m); }}
                  className="!w-20 text-center" />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            <button onClick={() => setRunning(r => !r)}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-gray-900 font-bold transition-all ${running ? "bg-gold-400 hover:bg-gold-300" : "bg-tiffany-500 hover:bg-tiffany-400"}`}>
              {running ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button onClick={() => reset(totalMins.current)}
              className="w-12 h-12 rounded-full bg-bg-elevated hover:bg-bg-card border border-bg-border flex items-center justify-center text-gray-400 hover:text-white transition-all">
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Today's sessions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-sm font-semibold text-white">Today's sessions</h3>
            <button onClick={() => setOpen(true)} className="btn-ghost flex items-center gap-1 text-xs">
              <Plus size={12} /> Manual log
            </button>
          </div>
          {todaySessions.length === 0 ? (
            <EmptyState icon={<Zap size={32} />} title="No sessions yet" sub="Start the timer or log manually" />
          ) : (
            <div className="space-y-2">
              {todaySessions.map(s => (
                <div key={s.id} className="flex items-center gap-3 p-2.5 bg-bg-elevated rounded-lg group">
                  <div className="w-8 h-8 rounded-lg bg-tiffany-500/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={14} className="text-tiffany-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{s.task}</div>
                    <div className="text-xs text-gray-500">{s.category} · {s.duration}m</div>
                  </div>
                  <button onClick={() => deleteDeepWorkSession(s.id)} className="opacity-0 group-hover:opacity-100 btn-ghost p-1 hover:text-red-400 transition-all">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* History */}
      <div className="card">
        <h3 className="font-serif text-sm font-semibold text-white mb-4">History</h3>
        {deepWorkSessions.length === 0 ? (
          <EmptyState icon={<Clock size={32} />} title="No sessions logged" sub="Complete a session to see your history" />
        ) : (
          <div className="space-y-1">
            {deepWorkSessions.slice(0, 20).map(s => (
              <div key={s.id} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-bg-elevated group transition-colors">
                <span className="text-xs text-gray-500 font-mono w-20 flex-shrink-0">{s.date}</span>
                <span className="text-sm text-gray-300 flex-1 truncate">{s.task}</span>
                <span className="text-xs badge bg-tiffany-500/10 text-tiffany-400">{s.category}</span>
                <span className="text-xs font-mono text-gray-500 w-12 text-right">{s.duration}m</span>
                <button onClick={() => deleteDeepWorkSession(s.id)} className="opacity-0 group-hover:opacity-100 btn-ghost p-1 hover:text-red-400">
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Log Session Manually">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Date"><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></FormField>
            <FormField label="Duration (min)"><input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: +e.target.value })} /></FormField>
          </div>
          <FormField label="Task" required><input value={form.task} onChange={e => setForm({ ...form, task: e.target.value })} placeholder="What did you work on?" /></FormField>
          <FormField label="Category">
            <Select value={form.category} onChange={v => setForm({ ...form, category: v })}
              options={CATEGORIES.deepwork.map(c => ({ value: c, label: c }))} />
          </FormField>
          <FormField label="Notes"><textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></FormField>
          <div className="flex gap-2">
            <button onClick={save} className="btn-primary flex-1">Log Session</button>
            <button onClick={() => setOpen(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
}
