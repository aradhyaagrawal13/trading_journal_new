"use client";
import { useState } from "react";
import { useStore } from "@/store";
import PageLayout from "@/components/layout/PageLayout";
import { Modal, StatCard, EmptyState, FormField, TagInput, MoodBadge } from "@/components/ui";
import { formatDate, moodColor } from "@/lib/utils";
import { Plus, BookOpen, Search, Trash2, Edit2, Smile } from "lucide-react";

const MOODS = [
  { val: 1, label: "Awful", emoji: "😞" },
  { val: 2, label: "Bad", emoji: "😕" },
  { val: 3, label: "Okay", emoji: "😐" },
  { val: 4, label: "Good", emoji: "😊" },
  { val: 5, label: "Great", emoji: "😄" },
];

export default function JournalPage() {
  const { journalEntries, addJournalEntry, updateJournalEntry, deleteJournalEntry } = useStore();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), title: "", content: "", mood: 3 as 1|2|3|4|5, tags: [] as string[] });

  const save = () => {
    if (!form.title || !form.content) return;
    if (editId) { updateJournalEntry(editId, form); setEditId(null); }
    else addJournalEntry(form);
    setOpen(false);
    setForm({ date: new Date().toISOString().slice(0, 10), title: "", content: "", mood: 3, tags: [] });
  };

  const startEdit = (e: any) => {
    setForm({ date: e.date, title: e.title, content: e.content, mood: e.mood, tags: e.tags });
    setEditId(e.id);
    setOpen(true);
  };

  const filtered = journalEntries.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.content.toLowerCase().includes(search.toLowerCase()) ||
    e.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const avgMood = journalEntries.length
    ? (journalEntries.reduce((s, e) => s + e.mood, 0) / journalEntries.length).toFixed(1)
    : "—";

  return (
    <PageLayout
      title="Journal"
      subtitle="Reflect. Process. Grow."
      actions={
        <button onClick={() => { setForm({ date: new Date().toISOString().slice(0, 10), title: "", content: "", mood: 3, tags: [] }); setEditId(null); setOpen(true); }} className="btn-primary flex items-center gap-1.5">
          <Plus size={15} /> New Entry
        </button>
      }
    >
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Total entries" value={journalEntries.length} color="tiffany" icon={<BookOpen size={16} />} />
        <StatCard label="Avg mood" value={avgMood + "/5"} color="gold" icon={<Smile size={16} />} />
        <StatCard label="This month" value={journalEntries.filter(e => e.date.startsWith(new Date().toISOString().slice(0, 7))).length} color="tiffany" />
      </div>

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search entries..." className="!pl-9" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<BookOpen size={40} />} title="No entries yet" sub="Start journaling to track your thoughts and mood" />
      ) : (
        <div className="space-y-3">
          {filtered.map(e => (
            <div key={e.id} className="card card-hover group cursor-pointer" onClick={() => startEdit(e)}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500 font-mono">{e.date}</span>
                    <MoodBadge mood={e.mood} />
                    {e.tags.map(t => <span key={t} className="badge bg-tiffany-500/10 text-tiffany-400">{t}</span>)}
                  </div>
                  <div className="font-serif font-semibold text-white text-base mb-1">{e.title}</div>
                  <div className="text-sm text-gray-500 line-clamp-2">{e.content}</div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" onClick={ev => ev.stopPropagation()}>
                  <button onClick={() => startEdit(e)} className="btn-ghost p-1.5"><Edit2 size={13} /></button>
                  <button onClick={() => deleteJournalEntry(e.id)} className="btn-ghost p-1.5 hover:text-red-400"><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => { setOpen(false); setEditId(null); }} title={editId ? "Edit Entry" : "New Journal Entry"}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Date" required>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </FormField>
            <FormField label="Mood">
              <div className="flex gap-1.5 mt-1">
                {MOODS.map(m => (
                  <button key={m.val} onClick={() => setForm({ ...form, mood: m.val as any })}
                    title={m.label}
                    className={`text-lg w-8 h-8 rounded-lg transition-all ${form.mood === m.val ? "bg-tiffany-500/20 ring-1 ring-tiffany-500 scale-110" : "hover:bg-bg-elevated"}`}>
                    {m.emoji}
                  </button>
                ))}
              </div>
            </FormField>
          </div>
          <FormField label="Title" required>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="What's on your mind?" />
          </FormField>
          <FormField label="Content" required>
            <textarea rows={6} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Write freely..." />
          </FormField>
          <FormField label="Tags">
            <TagInput tags={form.tags} onChange={t => setForm({ ...form, tags: t })} />
          </FormField>
          <div className="flex gap-2 pt-1">
            <button onClick={save} className="btn-primary flex-1">{editId ? "Update" : "Save Entry"}</button>
            <button onClick={() => { setOpen(false); setEditId(null); }} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
}
