"use client";
import { useState } from "react";
import { useStore } from "@/store";
import PageLayout from "@/components/layout/PageLayout";
import { Modal, EmptyState, FormField, TagInput, Select } from "@/components/ui";
import { CATEGORIES } from "@/lib/utils";
import { Plus, BookMarked, Search, Pin, ExternalLink, Trash2, Edit2, Star } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  Trading: "#0ABAB5", Finance: "#D4AF37", AI: "#818cf8",
  Tech: "#34d399", Books: "#fb923c", Videos: "#fb7185", Tools: "#a78bfa", Other: "#6b7280",
};

export default function KnowledgePage() {
  const { knowledgeItems, addKnowledgeItem, updateKnowledgeItem, deleteKnowledgeItem, toggleKnowledgePin } = useStore();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [form, setForm] = useState({ title: "", url: "", content: "", category: "Trading", tags: [] as string[], pinned: false });

  const save = () => {
    if (!form.title) return;
    if (editId) { updateKnowledgeItem(editId, form); setEditId(null); }
    else addKnowledgeItem(form);
    setOpen(false);
    setForm({ title: "", url: "", content: "", category: "Trading", tags: [], pinned: false });
  };

  const startEdit = (k: any) => {
    setForm({ title: k.title, url: k.url || "", content: k.content || "", category: k.category, tags: k.tags, pinned: k.pinned });
    setEditId(k.id);
    setOpen(true);
  };

  const cats = ["All", ...CATEGORIES.knowledge];
  const filtered = knowledgeItems
    .filter(k => catFilter === "All" || k.category === catFilter)
    .filter(k =>
      k.title.toLowerCase().includes(search.toLowerCase()) ||
      k.content?.toLowerCase().includes(search.toLowerCase()) ||
      k.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const pinned = knowledgeItems.filter(k => k.pinned);

  return (
    <PageLayout
      title="Knowledge Hub"
      subtitle="Save, organize, and access everything that matters"
      actions={<button onClick={() => { setForm({ title: "", url: "", content: "", category: "Trading", tags: [], pinned: false }); setEditId(null); setOpen(true); }} className="btn-primary flex items-center gap-1.5"><Plus size={15} /> Add Item</button>}
    >
      {/* Pinned */}
      {pinned.length > 0 && (
        <div className="mb-6">
          <h3 className="font-serif text-sm font-semibold text-gold-400 flex items-center gap-2 mb-3"><Star size={14} /> Pinned</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pinned.map(k => (
              <div key={k.id} className="card border-gold-500/20 card-hover group relative">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="badge text-[10px]" style={{ background: `${CATEGORY_COLORS[k.category]}20`, color: CATEGORY_COLORS[k.category] }}>{k.category}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => toggleKnowledgePin(k.id)} className="btn-ghost p-1 text-gold-400"><Pin size={11} /></button>
                    <button onClick={() => startEdit(k)} className="btn-ghost p-1"><Edit2 size={11} /></button>
                    <button onClick={() => deleteKnowledgeItem(k.id)} className="btn-ghost p-1 hover:text-red-400"><Trash2 size={11} /></button>
                  </div>
                </div>
                <div className="text-sm font-semibold text-white mb-1">{k.title}</div>
                {k.content && <div className="text-xs text-gray-500 line-clamp-2 mb-2">{k.content}</div>}
                {k.url && (
                  <a href={k.url} target="_blank" rel="noopener noreferrer" className="text-xs text-tiffany-400 flex items-center gap-1 hover:underline">
                    <ExternalLink size={10} /> Open link
                  </a>
                )}
                {k.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {k.tags.map(t => <span key={t} className="badge bg-tiffany-500/10 text-tiffany-400 text-[10px]">{t}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & filter */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..." className="!pl-9" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {cats.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${catFilter === c ? "bg-tiffany-500/10 text-tiffany-400 border border-tiffany-500/20" : "text-gray-500 hover:text-gray-300"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<BookMarked size={40} />} title="Nothing here yet" sub="Save links, notes, and resources to build your knowledge base" />
      ) : (
        <div className="space-y-2">
          {filtered.map(k => (
            <div key={k.id} className="card card-hover flex items-start gap-4 group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: `${CATEGORY_COLORS[k.category] || "#6b7280"}20` }}>
                <BookMarked size={14} style={{ color: CATEGORY_COLORS[k.category] || "#6b7280" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-sm font-semibold text-white">{k.title}</span>
                  {k.pinned && <Pin size={10} className="text-gold-400" />}
                  <span className="badge text-[10px]" style={{ background: `${CATEGORY_COLORS[k.category]}20`, color: CATEGORY_COLORS[k.category] }}>{k.category}</span>
                </div>
                {k.content && <p className="text-xs text-gray-500 line-clamp-1 mb-1">{k.content}</p>}
                <div className="flex items-center gap-3 flex-wrap">
                  {k.url && <a href={k.url} target="_blank" rel="noopener noreferrer" className="text-xs text-tiffany-400 flex items-center gap-1 hover:underline" onClick={e => e.stopPropagation()}><ExternalLink size={10} /> Open link</a>}
                  {k.tags.map(t => <span key={t} className="badge bg-bg-elevated text-gray-500 text-[10px]">{t}</span>)}
                  <span className="text-xs text-gray-700 font-mono">{k.createdAt?.slice(0, 10)}</span>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button onClick={() => toggleKnowledgePin(k.id)} className={`btn-ghost p-1.5 ${k.pinned ? "text-gold-400" : ""}`}><Pin size={12} /></button>
                <button onClick={() => startEdit(k)} className="btn-ghost p-1.5"><Edit2 size={12} /></button>
                <button onClick={() => deleteKnowledgeItem(k.id)} className="btn-ghost p-1.5 hover:text-red-400"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => { setOpen(false); setEditId(null); }} title={editId ? "Edit Item" : "Add to Knowledge Hub"}>
        <div className="space-y-4">
          <FormField label="Title" required><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. VWAP Strategy Guide" /></FormField>
          <FormField label="URL"><input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..." /></FormField>
          <FormField label="Category">
            <Select value={form.category} onChange={v => setForm({ ...form, category: v })} options={CATEGORIES.knowledge.map(c => ({ value: c, label: c }))} />
          </FormField>
          <FormField label="Notes"><textarea rows={3} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="What's important about this? Key takeaways..." /></FormField>
          <FormField label="Tags"><TagInput tags={form.tags} onChange={t => setForm({ ...form, tags: t })} /></FormField>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="pin-check" checked={form.pinned} onChange={e => setForm({ ...form, pinned: e.target.checked })} className="!w-auto" />
            <label htmlFor="pin-check" className="text-sm text-gray-400 cursor-pointer">Pin to top</label>
          </div>
          <div className="flex gap-2"><button onClick={save} className="btn-primary flex-1">{editId ? "Update" : "Save"}</button><button onClick={() => { setOpen(false); setEditId(null); }} className="btn-secondary">Cancel</button></div>
        </div>
      </Modal>
    </PageLayout>
  );
}
