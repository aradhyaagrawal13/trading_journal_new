"use client";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useState } from "react";

// Modal
export function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-bg-card border border-bg-border rounded-2xl w-full max-w-lg shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-bg-border">
          <h2 className="font-serif text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
            <X size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// StatCard
export function StatCard({ label, value, sub, color = "tiffany", icon }: {
  label: string; value: string | number; sub?: string; color?: "tiffany" | "gold" | "green" | "red"; icon?: React.ReactNode;
}) {
  const colors = {
    tiffany: "text-tiffany-400",
    gold: "text-gold-400",
    green: "text-green-400",
    red: "text-red-400",
  };
  return (
    <div className="metric-card card-hover">
      <div className="flex items-start justify-between">
        <span className="metric-label">{label}</span>
        {icon && <div className="text-gray-600">{icon}</div>}
      </div>
      <div className={cn("metric-val", colors[color])}>{value}</div>
      {sub && <div className="text-xs text-gray-600">{sub}</div>}
    </div>
  );
}

// TagInput
export function TagInput({ tags, onChange, placeholder = "Add tag..." }: {
  tags: string[]; onChange: (t: string[]) => void; placeholder?: string;
}) {
  const [val, setVal] = useState("");
  const add = () => {
    const t = val.trim();
    if (t && !tags.includes(t)) { onChange([...tags, t]); setVal(""); }
  };
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map(t => (
          <span key={t} className="badge bg-tiffany-500/10 text-tiffany-400 border border-tiffany-500/20 flex items-center gap-1">
            {t}
            <button onClick={() => onChange(tags.filter(x => x !== t))} className="hover:text-red-400 transition-colors">
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
      <input
        value={val} onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
        placeholder={placeholder}
        className="!py-1.5 !text-xs"
      />
    </div>
  );
}

// EmptyState
export function EmptyState({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-gray-700 mb-3">{icon}</div>
      <p className="text-gray-400 font-medium text-sm">{title}</p>
      {sub && <p className="text-gray-600 text-xs mt-1">{sub}</p>}
    </div>
  );
}

// ProgressBar
export function ProgressBar({ value, max = 100, color = "tiffany", className }: {
  value: number; max?: number; color?: "tiffany" | "gold" | "green"; className?: string;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const colors = { tiffany: "bg-tiffany-500", gold: "bg-gold-500", green: "bg-green-500" };
  return (
    <div className={cn("h-1.5 bg-bg-elevated rounded-full overflow-hidden", className)}>
      <div className={cn("h-full rounded-full transition-all duration-500", colors[color])} style={{ width: `${pct}%` }} />
    </div>
  );
}

// MoodBadge
export function MoodBadge({ mood }: { mood: 1 | 2 | 3 | 4 | 5 }) {
  const labels = ["", "Awful", "Bad", "Okay", "Good", "Great"];
  const colors = ["", "bg-red-500/10 text-red-400", "bg-orange-500/10 text-orange-400", "bg-yellow-500/10 text-yellow-400", "bg-green-500/10 text-green-400", "bg-tiffany-500/10 text-tiffany-400"];
  return <span className={cn("badge", colors[mood])}>{labels[mood]}</span>;
}

// FormField
export function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="label">{label}{required && <span className="text-tiffany-500 ml-0.5">*</span>}</label>
      {children}
    </div>
  );
}

// Select
export function Select({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; placeholder?: string;
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
