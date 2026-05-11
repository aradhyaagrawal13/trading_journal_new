"use client";
import { useState } from "react";
import { useStore } from "@/store";
import PageLayout from "@/components/layout/PageLayout";
import { Modal, StatCard, EmptyState, FormField, Select, ProgressBar } from "@/components/ui";
import { CATEGORIES } from "@/lib/utils";
import { Plus, Trophy, Target, CheckCircle2, Circle, Trash2, Edit2, ChevronDown, ChevronUp, Flag } from "lucide-react";
import { v4 as uuid } from "uuid";

const STATUS_COLORS = { active: "bg-tiffany-500/10 text-tiffany-400", completed: "bg-green-500/10 text-green-400", paused: "bg-gray-500/10 text-gray-400" };

export default function GoalsPage() {
  const { goals, addGoal, updateGoal, deleteGoal } = useStore();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "paused">("active");
  const [form, setForm] = useState({
    title: "", description: "", category: "Finance", deadline: "", progress: 0,
    status: "active" as "active" | "completed" | "paused",
    milestones: [] as { id: string; title: string; completed: boolean }[],
  });

  const save = () => {
    if (!form.title) return;
    if (editId) { updateGoal(editId, form); setEditId(null); }
    else addGoal(form);
    setOpen(false);
    resetForm();
  };

  const resetForm = () => setForm({ title: "", description: "", category: "Finance", deadline: "", progress: 0, status: "active", milestones: [] });

  const startEdit = (g: any) => {
    setForm({ title: g.title, description: g.description || "", category: g.category, deadline: g.deadline || "", progress: g.progress, status: g.status, milestones: g.milestones });
    setEditId(g.id);
    setOpen(true);
  };

  const addMilestone = () => setForm(f => ({ ...f, milestones: [...f.milestones, { id: uuid(), title: "", completed: false }] }));
  const updateMilestone = (id: string, title: string) => setForm(f => ({ ...f, milestones: f.milestones.map(m => m.id === id ? { ...m, title } : m) }));
  const removeMilestone = (id: string) => setForm(f => ({ ...f, milestones: f.milestones.filter(m => m.id !== id) }));

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    const g = goals.find(x => x.id === goalId);
    if (!g) return;
    const milestones = g.milestones.map(m => m.id === milestoneId ? { ...m, completed: !m.completed } : m);
    const progress = milestones.length ? Math.round((milestones.filter(m => m.completed).length / milestones.length) * 100) : g.progress;
    updateGoal(goalId, { milestones, progress });
  };

  const filtered = filter === "all" ? goals : goals.filter(g => g.status === filter);
  const active = goals.filter(g => g.status === "active");
  const completed = goals.filter(g => g.status === "completed");
  const avgProgress = active.length ? Math.round(active.reduce((s, g) => s + g.progress, 0) / active.length) : 0;

  return (
    <PageLayout
      title="Goals"
      subtitle="Dream big. Break it down. Execute."
      actions={<button onClick={() => { resetForm(); setEditId(null); setOpen(true); }} className="btn-primary flex items-center gap-1.5"><Plus size={15} /> New Goal</button>}
    >
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Active goals" value={active.length} color="tiffany" icon={<Target size={16} />} />
        <StatCard label="Completed" value={completed.length} color="gold" icon={<Trophy size={16} />} />
        <StatCard label="Avg progress" value={`${avgProgress}%`} color={avgProgress >= 50 ? "tiffany" : "gold"} icon={<Flag size={16} />} />
      </div>

      <div className="flex gap-2 mb-4">
        {(["active", "all", "completed", "paused"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition-all ${filter === f ? "bg-tiffany-500/10 text-tiffany-400 border border-tiffany-500/20" : "text-gray-500 hover:text-gray-300"}`}>
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Trophy size={40} />} title="No goals here" sub="Set a goal and break it into milestones to make it real" />
      ) : (
        <div className="space-y-3">
          {filtered.map(g => {
            const isExp = expanded === g.id;
            const doneMs = g.milestones.filter(m => m.completed).length;
            return (
              <div key={g.id} className="card">
                <div className="flex items-start gap-4 cursor-pointer" onClick={() => setExpanded(isExp ? null : g.id)}>
                  <div className="w-10 h-10 rounded-xl bg-tiffany-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Trophy size={18} className="text-tiffany-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-serif font-semibold text-white text-base">{g.title}</span>
                      <span className={`badge text-[10px] ${STATUS_COLORS[g.status]}`}>{g.status}</span>
                      <span className="badge bg-bg-elevated text-gray-500 text-[10px]">{g.category}</span>
                    </div>
                    {g.description && <p className="text-xs text-gray-500 mb-2 line-clamp-1">{g.description}</p>}
                    <div className="flex items-center gap-3">
                      <ProgressBar value={g.progress} className="flex-1" color={g.progress >= 100 ? "green" : "tiffany"} />
                      <span className="text-xs font-mono text-tiffany-400 w-9 text-right">{g.progress}%</span>
                    </div>
                    {g.milestones.length > 0 && (
                      <div className="text-xs text-gray-600 mt-1">{doneMs}/{g.milestones.length} milestones</div>
                    )}
                    {g.deadline && <div className="text-xs text-gray-600 mt-0.5 flex items-center gap-1"><Flag size={10} /> By {g.deadline}</div>}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <button onClick={() => startEdit(g)} className="btn-ghost p-1.5"><Edit2 size={13} /></button>
                    <button onClick={() => deleteGoal(g.id)} className="btn-ghost p-1.5 hover:text-red-400"><Trash2 size={13} /></button>
                    {isExp ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
                  </div>
                </div>

                {isExp && (
                  <div className="mt-4 pt-4 border-t border-bg-border space-y-4">
                    {/* Progress slider */}
                    <div>
                      <label className="label">Progress ({g.progress}%)</label>
                      <input type="range" min="0" max="100" value={g.progress}
                        onChange={e => updateGoal(g.id, { progress: +e.target.value })}
                        className="!border-0 !bg-transparent !p-0 accent-tiffany-500" />
                    </div>
                    {/* Status */}
                    <div>
                      <label className="label">Status</label>
                      <div className="flex gap-2">
                        {(["active", "completed", "paused"] as const).map(s => (
                          <button key={s} onClick={() => updateGoal(g.id, { status: s })}
                            className={`text-xs px-3 py-1.5 rounded-lg capitalize transition-all ${g.status === s ? STATUS_COLORS[s] + " border border-current" : "text-gray-500 hover:text-gray-300"}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Milestones */}
                    {g.milestones.length > 0 && (
                      <div>
                        <label className="label">Milestones</label>
                        <div className="space-y-2">
                          {g.milestones.map(m => (
                            <div key={m.id} className="flex items-center gap-2.5 cursor-pointer" onClick={() => toggleMilestone(g.id, m.id)}>
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${m.completed ? "border-tiffany-500 bg-tiffany-500" : "border-gray-600"}`}>
                                {m.completed && <CheckCircle2 size={10} className="text-gray-900" />}
                              </div>
                              <span className={`text-sm ${m.completed ? "line-through text-gray-600" : "text-gray-300"}`}>{m.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={open} onClose={() => { setOpen(false); setEditId(null); }} title={editId ? "Edit Goal" : "New Goal"}>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <FormField label="Goal title" required><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Become a profitable trader" /></FormField>
          <FormField label="Description"><textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What does success look like?" /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Category">
              <Select value={form.category} onChange={v => setForm({ ...form, category: v })} options={CATEGORIES.goals.map(c => ({ value: c, label: c }))} />
            </FormField>
            <FormField label="Deadline">
              <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
            </FormField>
          </div>
          <FormField label={`Initial progress: ${form.progress}%`}>
            <input type="range" min="0" max="100" value={form.progress} onChange={e => setForm({ ...form, progress: +e.target.value })} className="!border-0 !bg-transparent !p-0 accent-tiffany-500" />
          </FormField>
          <div>
            <label className="label">Milestones</label>
            <div className="space-y-2">
              {form.milestones.map(m => (
                <div key={m.id} className="flex gap-2">
                  <input value={m.title} onChange={e => updateMilestone(m.id, e.target.value)} placeholder="Milestone..." className="flex-1" />
                  <button onClick={() => removeMilestone(m.id)} className="btn-ghost p-1.5 hover:text-red-400 flex-shrink-0"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
            <button onClick={addMilestone} className="btn-ghost text-xs mt-2 flex items-center gap-1"><Plus size={12} /> Add milestone</button>
          </div>
          <div className="flex gap-2"><button onClick={save} className="btn-primary flex-1">{editId ? "Update" : "Add Goal"}</button><button onClick={() => { setOpen(false); setEditId(null); }} className="btn-secondary">Cancel</button></div>
        </div>
      </Modal>
    </PageLayout>
  );
}
