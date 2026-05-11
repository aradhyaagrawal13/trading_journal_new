"use client";
import { useState } from "react";
import { useStore } from "@/store";
import PageLayout from "@/components/layout/PageLayout";
import { Modal, StatCard, EmptyState, FormField, TagInput, Select } from "@/components/ui";
import { calcWinRate, calcTotalPnL, formatDate } from "@/lib/utils";
import { Plus, TrendingUp, TrendingDown, Target, DollarSign, BarChart2, Trash2, Edit2, CheckCircle, Clock } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";

const STRATEGIES = ["ORB", "VWAP Reclaim", "Momentum Breakout", "Pullback", "Gap & Go", "Reversal", "Scalp", "Other"];

const empty = {
  date: new Date().toISOString().slice(0, 10),
  asset: "", direction: "long" as const, entry: 0, exit: undefined as number | undefined,
  quantity: 1, strategy: "ORB", status: "open" as const,
  pnl: undefined as number | undefined, riskReward: undefined as number | undefined,
  notes: "", tags: [] as string[],
  stopLoss: undefined as number | undefined, target: undefined as number | undefined,
};

export default function TradingPage() {
  const { trades, addTrade, updateTrade, deleteTrade } = useStore();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [filter, setFilter] = useState<"all" | "open" | "closed">("all");

  const winRate = calcWinRate(trades);
  const totalPnL = calcTotalPnL(trades);
  const closedTrades = trades.filter(t => t.status === "closed");
  const avgRR = closedTrades.reduce((s, t) => s + (t.riskReward ?? 0), 0) / (closedTrades.length || 1);

  const save = () => {
    if (!form.asset || !form.entry) return;
    const pnl = form.exit && form.status === "closed"
      ? (form.direction === "long" ? form.exit - form.entry : form.entry - form.exit) * form.quantity
      : undefined;
    if (editId) {
      updateTrade(editId, { ...form, pnl });
      setEditId(null);
    } else {
      addTrade({ ...form, pnl });
    }
    setOpen(false);
    setForm({ ...empty });
  };

  const startEdit = (t: any) => {
    setForm({ ...empty, ...t });
    setEditId(t.id);
    setOpen(true);
  };

  const filtered = filter === "all" ? trades : trades.filter(t => t.status === filter);

  // Charts
  const stratData = STRATEGIES.map(s => ({
    name: s,
    trades: trades.filter(t => t.strategy === s).length,
    wins: trades.filter(t => t.strategy === s && (t.pnl ?? 0) > 0).length,
  })).filter(s => s.trades > 0);

  const pnlByDay = [...new Set(closedTrades.map(t => t.date))].slice(-14).map(d => ({
    day: d.slice(5),
    pnl: Math.round(closedTrades.filter(t => t.date === d).reduce((s, t) => s + (t.pnl ?? 0), 0)),
  }));

  return (
    <PageLayout
      title="Trading Journal"
      subtitle="Track every trade. Review. Improve."
      actions={
        <button onClick={() => { setForm({ ...empty }); setEditId(null); setOpen(true); }} className="btn-primary flex items-center gap-1.5">
          <Plus size={15} /> Log Trade
        </button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Win rate" value={`${winRate}%`} sub={`${closedTrades.length} closed trades`} color={winRate >= 50 ? "tiffany" : "red"} />
        <StatCard label="Total P&L" value={`₹${Math.round(totalPnL)}`} sub="all closed trades" color={totalPnL >= 0 ? "green" : "red"} icon={<DollarSign size={16} />} />
        <StatCard label="Avg R:R" value={avgRR.toFixed(2)} sub="risk:reward ratio" color="gold" icon={<Target size={16} />} />
        <StatCard label="Open trades" value={trades.filter(t => t.status === "open").length} sub="currently active" color="tiffany" icon={<Clock size={16} />} />
      </div>

      {/* Charts */}
      {closedTrades.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="card">
            <h3 className="font-serif text-sm font-semibold text-white mb-3">Daily P&L</h3>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={pnlByDay} barSize={16}>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: any) => [`₹${v}`, "P&L"]} contentStyle={{ background: "#1a2234", border: "1px solid #1e2d3d", borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="pnl" radius={[3, 3, 0, 0]}
                  fill="#0ABAB5"
                  label={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <h3 className="font-serif text-sm font-semibold text-white mb-3">Trades by strategy</h3>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={stratData} layout="vertical" barSize={12}>
                <XAxis type="number" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} width={90} />
                <Tooltip contentStyle={{ background: "#1a2234", border: "1px solid #1e2d3d", borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="wins" fill="#0ABAB5" radius={[0, 3, 3, 0]} name="Wins" />
                <Bar dataKey="trades" fill="#1e2d3d" radius={[0, 3, 3, 0]} name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {(["all", "open", "closed"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition-all ${filter === f ? "bg-tiffany-500/10 text-tiffany-400 border border-tiffany-500/20" : "text-gray-500 hover:text-gray-300"}`}>
            {f} {f === "all" ? `(${trades.length})` : f === "open" ? `(${trades.filter(t => t.status === "open").length})` : `(${closedTrades.length})`}
          </button>
        ))}
      </div>

      {/* Trades table */}
      {filtered.length === 0 ? (
        <EmptyState icon={<TrendingUp size={40} />} title="No trades yet" sub="Log your first trade to start tracking performance" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-bg-border">
                {["Date", "Asset", "Dir.", "Strategy", "Entry", "Exit", "Qty", "P&L", "R:R", "Status", ""].map(h => (
                  <th key={h} className="text-left text-gray-500 font-medium py-2 px-2 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} className="border-b border-bg-border hover:bg-bg-elevated/50 transition-colors group">
                  <td className="py-2.5 px-2 text-gray-400 whitespace-nowrap">{t.date}</td>
                  <td className="py-2.5 px-2 text-white font-medium">{t.asset}</td>
                  <td className="py-2.5 px-2">
                    <span className={`badge ${t.direction === "long" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                      {t.direction === "long" ? <TrendingUp size={10} className="inline mr-1" /> : <TrendingDown size={10} className="inline mr-1" />}
                      {t.direction}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-gray-400">{t.strategy}</td>
                  <td className="py-2.5 px-2 font-mono text-gray-300">₹{t.entry}</td>
                  <td className="py-2.5 px-2 font-mono text-gray-300">{t.exit ? `₹${t.exit}` : "—"}</td>
                  <td className="py-2.5 px-2 text-gray-400">{t.quantity}</td>
                  <td className="py-2.5 px-2 font-mono font-medium">
                    {t.pnl !== undefined ? (
                      <span className={t.pnl >= 0 ? "text-green-400" : "text-red-400"}>
                        {t.pnl >= 0 ? "+" : ""}₹{Math.round(t.pnl)}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="py-2.5 px-2 text-gray-400">{t.riskReward?.toFixed(1) ?? "—"}</td>
                  <td className="py-2.5 px-2">
                    <span className={`badge ${t.status === "open" ? "bg-gold-500/10 text-gold-400" : "bg-gray-500/10 text-gray-400"}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(t)} className="btn-ghost p-1"><Edit2 size={12} /></button>
                      <button onClick={() => deleteTrade(t.id)} className="btn-ghost p-1 hover:text-red-400"><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal open={open} onClose={() => { setOpen(false); setEditId(null); }} title={editId ? "Edit Trade" : "Log Trade"}>
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Date" required>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </FormField>
            <FormField label="Asset" required>
              <input value={form.asset} onChange={e => setForm({ ...form, asset: e.target.value })} placeholder="e.g. RELIANCE" />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Direction">
              <Select value={form.direction} onChange={v => setForm({ ...form, direction: v as any })}
                options={[{ value: "long", label: "Long (Buy)" }, { value: "short", label: "Short (Sell)" }]} />
            </FormField>
            <FormField label="Strategy">
              <Select value={form.strategy} onChange={v => setForm({ ...form, strategy: v })}
                options={STRATEGIES.map(s => ({ value: s, label: s }))} />
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Entry ₹" required>
              <input type="number" value={form.entry || ""} onChange={e => setForm({ ...form, entry: +e.target.value })} placeholder="0" />
            </FormField>
            <FormField label="Stop Loss ₹">
              <input type="number" value={form.stopLoss || ""} onChange={e => setForm({ ...form, stopLoss: +e.target.value })} placeholder="0" />
            </FormField>
            <FormField label="Target ₹">
              <input type="number" value={form.target || ""} onChange={e => setForm({ ...form, target: +e.target.value })} placeholder="0" />
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Exit ₹">
              <input type="number" value={form.exit || ""} onChange={e => setForm({ ...form, exit: +e.target.value })} placeholder="0" />
            </FormField>
            <FormField label="Quantity">
              <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: +e.target.value })} placeholder="1" />
            </FormField>
            <FormField label="R:R">
              <input type="number" step="0.1" value={form.riskReward || ""} onChange={e => setForm({ ...form, riskReward: +e.target.value })} placeholder="0.0" />
            </FormField>
          </div>
          <FormField label="Status">
            <Select value={form.status} onChange={v => setForm({ ...form, status: v as any })}
              options={[{ value: "open", label: "Open" }, { value: "closed", label: "Closed" }]} />
          </FormField>
          <FormField label="Tags">
            <TagInput tags={form.tags} onChange={t => setForm({ ...form, tags: t })} />
          </FormField>
          <FormField label="Notes">
            <textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="What was your reasoning? What happened?" />
          </FormField>
          <div className="flex gap-2 pt-2">
            <button onClick={save} className="btn-primary flex-1">{editId ? "Update" : "Log Trade"}</button>
            <button onClick={() => { setOpen(false); setEditId(null); }} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
}
