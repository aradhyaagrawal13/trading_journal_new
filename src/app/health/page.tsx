"use client";
import { useState } from "react";
import { useStore } from "@/store";
import PageLayout from "@/components/layout/PageLayout";
import { Modal, StatCard, EmptyState, FormField } from "@/components/ui";
import { today } from "@/lib/utils";
import { Plus, Dumbbell, TrendingDown, Scale, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { v4 as uuid } from "uuid";

const PRESET_EXERCISES = ["Bench Press", "Squat", "Deadlift", "Pull-ups", "Push-ups", "Shoulder Press", "Rows", "Curl", "Tricep Dips", "Plank"];

export default function HealthPage() {
  const { workouts, addWorkout, deleteWorkout, bodyStats, addBodyStat } = useStore();
  const [tab, setTab] = useState<"workouts" | "stats">("workouts");
  const [openW, setOpenW] = useState(false);
  const [openS, setOpenS] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [wForm, setWForm] = useState({
    date: today(), name: "", duration: 60, notes: "",
    exercises: [{ name: "", sets: 3, reps: 10, weight: 0 }],
  });
  const [sForm, setSForm] = useState({ date: today(), weight: 0, bodyFat: 0, notes: "" });

  const addExercise = () => setWForm(f => ({ ...f, exercises: [...f.exercises, { name: "", sets: 3, reps: 10, weight: 0 }] }));
  const updateEx = (i: number, field: string, val: any) => setWForm(f => ({
    ...f, exercises: f.exercises.map((e, idx) => idx === i ? { ...e, [field]: val } : e)
  }));
  const removeEx = (i: number) => setWForm(f => ({ ...f, exercises: f.exercises.filter((_, idx) => idx !== i) }));

  const saveWorkout = () => {
    if (!wForm.name) return;
    addWorkout({ ...wForm });
    setOpenW(false);
    setWForm({ date: today(), name: "", duration: 60, notes: "", exercises: [{ name: "", sets: 3, reps: 10, weight: 0 }] });
  };

  const saveStat = () => {
    addBodyStat({ date: sForm.date, weight: sForm.weight || undefined, bodyFat: sForm.bodyFat || undefined, notes: sForm.notes });
    setOpenS(false);
    setSForm({ date: today(), weight: 0, bodyFat: 0, notes: "" });
  };

  const weightData = [...bodyStats].reverse().slice(-20).map(s => ({ date: s.date.slice(5), weight: s.weight, bf: s.bodyFat }));
  const totalVol = workouts.reduce((sum, w) => sum + w.exercises.reduce((s, e) => s + (e.sets * e.reps * (e.weight || 1)), 0), 0);

  return (
    <PageLayout
      title="Health & Gym"
      subtitle="Workouts, body stats, and progress"
      actions={
        <div className="flex gap-2">
          <button onClick={() => setOpenS(true)} className="btn-secondary flex items-center gap-1.5 text-xs"><Scale size={14} /> Log Stats</button>
          <button onClick={() => setOpenW(true)} className="btn-primary flex items-center gap-1.5"><Plus size={15} /> Log Workout</button>
        </div>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Total workouts" value={workouts.length} color="tiffany" icon={<Dumbbell size={16} />} />
        <StatCard label="This month" value={workouts.filter(w => w.date.startsWith(new Date().toISOString().slice(0, 7))).length} color="gold" />
        <StatCard label="Latest weight" value={bodyStats[0]?.weight ? `${bodyStats[0].weight} kg` : "—"} color="tiffany" icon={<Scale size={16} />} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {["workouts", "stats"].map(t => (
          <button key={t} onClick={() => setTab(t as any)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition-all ${tab === t ? "bg-tiffany-500/10 text-tiffany-400 border border-tiffany-500/20" : "text-gray-500 hover:text-gray-300"}`}>
            {t === "workouts" ? "Workout Log" : "Body Stats"}
          </button>
        ))}
      </div>

      {tab === "workouts" ? (
        workouts.length === 0 ? (
          <EmptyState icon={<Dumbbell size={40} />} title="No workouts yet" sub="Log your first workout to start tracking" />
        ) : (
          <div className="space-y-3">
            {workouts.map(w => (
              <div key={w.id} className="card">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setExpanded(expanded === w.id ? null : w.id)}>
                  <div className="w-10 h-10 rounded-xl bg-tiffany-500/10 flex items-center justify-center flex-shrink-0">
                    <Dumbbell size={18} className="text-tiffany-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-white text-sm">{w.name}</div>
                    <div className="text-xs text-gray-500">{w.date} · {w.duration}min · {w.exercises.length} exercises</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={e => { e.stopPropagation(); deleteWorkout(w.id); }} className="btn-ghost p-1.5 hover:text-red-400"><Trash2 size={13} /></button>
                    {expanded === w.id ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
                  </div>
                </div>
                {expanded === w.id && (
                  <div className="mt-4 pt-4 border-t border-bg-border">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-gray-500">
                            <th className="text-left pb-2 font-medium">Exercise</th>
                            <th className="text-center pb-2 font-medium">Sets</th>
                            <th className="text-center pb-2 font-medium">Reps</th>
                            <th className="text-center pb-2 font-medium">Weight (kg)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {w.exercises.map((e, i) => (
                            <tr key={i} className="border-t border-bg-border">
                              <td className="py-2 text-gray-300">{e.name || "—"}</td>
                              <td className="py-2 text-center text-gray-400">{e.sets}</td>
                              <td className="py-2 text-center text-gray-400">{e.reps}</td>
                              <td className="py-2 text-center text-gray-400">{e.weight || "BW"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {w.notes && <p className="text-xs text-gray-500 mt-3 italic">{w.notes}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="space-y-4">
          {bodyStats.length > 1 && (
            <div className="card">
              <h3 className="font-serif text-sm font-semibold text-white mb-4">Weight over time</h3>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={weightData}>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                  <Tooltip contentStyle={{ background: "#1a2234", border: "1px solid #1e2d3d", borderRadius: 8, fontSize: 11 }} />
                  <Line type="monotone" dataKey="weight" stroke="#0ABAB5" strokeWidth={2} dot={{ fill: "#0ABAB5", r: 3 }} name="Weight (kg)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {bodyStats.length === 0 ? (
            <EmptyState icon={<Scale size={40} />} title="No body stats yet" sub="Log your first measurement to track progress" />
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-bg-border text-gray-500 font-medium">
                    <th className="text-left py-2 pr-4">Date</th>
                    <th className="text-right py-2 px-4">Weight (kg)</th>
                    <th className="text-right py-2 px-4">Body Fat %</th>
                    <th className="text-left py-2 pl-4">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {bodyStats.map(s => (
                    <tr key={s.id} className="border-t border-bg-border">
                      <td className="py-2.5 pr-4 text-gray-400 font-mono">{s.date}</td>
                      <td className="py-2.5 px-4 text-right text-white font-medium">{s.weight ?? "—"}</td>
                      <td className="py-2.5 px-4 text-right text-gray-400">{s.bodyFat ?? "—"}</td>
                      <td className="py-2.5 pl-4 text-gray-500">{s.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Log Workout Modal */}
      <Modal open={openW} onClose={() => setOpenW(false)} title="Log Workout">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Date"><input type="date" value={wForm.date} onChange={e => setWForm({ ...wForm, date: e.target.value })} /></FormField>
            <FormField label="Duration (min)"><input type="number" value={wForm.duration} onChange={e => setWForm({ ...wForm, duration: +e.target.value })} /></FormField>
          </div>
          <FormField label="Workout name" required><input value={wForm.name} onChange={e => setWForm({ ...wForm, name: e.target.value })} placeholder="e.g. Push Day, Leg Day..." /></FormField>
          <div>
            <label className="label">Exercises</label>
            <div className="space-y-2">
              {wForm.exercises.map((ex, i) => (
                <div key={i} className="bg-bg-elevated rounded-lg p-3 space-y-2">
                  <div className="flex gap-2">
                    <select value={ex.name} onChange={e => updateEx(i, "name", e.target.value)} className="flex-1 !py-1.5 !text-xs">
                      <option value="">Select exercise...</option>
                      {PRESET_EXERCISES.map(p => <option key={p} value={p}>{p}</option>)}
                      <option value="custom">Custom...</option>
                    </select>
                    <button onClick={() => removeEx(i)} className="btn-ghost p-1.5 hover:text-red-400 flex-shrink-0"><Trash2 size={12} /></button>
                  </div>
                  {ex.name === "custom" && (
                    <input placeholder="Exercise name" onChange={e => updateEx(i, "name", e.target.value)} className="!text-xs !py-1.5" />
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    <div><label className="label text-[10px]">Sets</label><input type="number" value={ex.sets} onChange={e => updateEx(i, "sets", +e.target.value)} className="!text-xs !py-1.5" /></div>
                    <div><label className="label text-[10px]">Reps</label><input type="number" value={ex.reps} onChange={e => updateEx(i, "reps", +e.target.value)} className="!text-xs !py-1.5" /></div>
                    <div><label className="label text-[10px]">Weight kg</label><input type="number" value={ex.weight} onChange={e => updateEx(i, "weight", +e.target.value)} className="!text-xs !py-1.5" /></div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={addExercise} className="btn-ghost text-xs mt-2 flex items-center gap-1"><Plus size={12} /> Add exercise</button>
          </div>
          <FormField label="Notes"><textarea rows={2} value={wForm.notes} onChange={e => setWForm({ ...wForm, notes: e.target.value })} placeholder="How did it go?" /></FormField>
          <div className="flex gap-2"><button onClick={saveWorkout} className="btn-primary flex-1">Save Workout</button><button onClick={() => setOpenW(false)} className="btn-secondary">Cancel</button></div>
        </div>
      </Modal>

      {/* Log Stats Modal */}
      <Modal open={openS} onClose={() => setOpenS(false)} title="Log Body Stats">
        <div className="space-y-4">
          <FormField label="Date"><input type="date" value={sForm.date} onChange={e => setSForm({ ...sForm, date: e.target.value })} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Weight (kg)"><input type="number" step="0.1" value={sForm.weight || ""} onChange={e => setSForm({ ...sForm, weight: +e.target.value })} placeholder="0.0" /></FormField>
            <FormField label="Body fat %"><input type="number" step="0.1" value={sForm.bodyFat || ""} onChange={e => setSForm({ ...sForm, bodyFat: +e.target.value })} placeholder="0.0" /></FormField>
          </div>
          <FormField label="Notes"><textarea rows={2} value={sForm.notes} onChange={e => setSForm({ ...sForm, notes: e.target.value })} /></FormField>
          <div className="flex gap-2"><button onClick={saveStat} className="btn-primary flex-1">Save Stats</button><button onClick={() => setOpenS(false)} className="btn-secondary">Cancel</button></div>
        </div>
      </Modal>
    </PageLayout>
  );
}
