"use client";
import { useStore } from "@/store";
import PageLayout from "@/components/layout/PageLayout";
import { Settings, User, Palette, LayoutGrid, Download, Trash2, Shield } from "lucide-react";
import type { ModuleId } from "@/types";

const ALL_MODULES: { id: ModuleId; name: string; desc: string }[] = [
  { id: "habits", name: "Habit Tracker", desc: "Daily/weekly habits with streak tracking" },
  { id: "journal", name: "Journal", desc: "Mood tracking and personal entries" },
  { id: "health", name: "Health & Gym", desc: "Workout logs and body stats" },
  { id: "deepwork", name: "Deep Work", desc: "Pomodoro timer and focus sessions" },
  { id: "learning", name: "Learning Tracker", desc: "Topics, resources, and study time" },
  { id: "trading", name: "Trading Journal", desc: "Trade logs, P&L, and strategy tracking" },
  { id: "knowledge", name: "Knowledge Hub", desc: "Links, notes, and resources" },
  { id: "goals", name: "Goals", desc: "Goal setting with milestone tracking" },
  { id: "analytics", name: "Analytics", desc: "Unified performance dashboard" },
];

export default function SettingsPage() {
  const { settings, updateSettings, toggleModule } = useStore();

  const exportData = () => {
    const data = localStorage.getItem("personal-os-store");
    if (!data) return;
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `personal-os-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const clearData = () => {
    if (confirm("This will delete ALL your data permanently. Are you sure?")) {
      localStorage.removeItem("personal-os-store");
      window.location.reload();
    }
  };

  return (
    <PageLayout title="Settings" subtitle="Customize your Personal OS">
      <div className="max-w-2xl space-y-6">

        {/* Profile */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <User size={15} className="text-tiffany-400" />
            <h3 className="font-serif font-semibold text-white text-base">Profile</h3>
          </div>
          <div>
            <label className="label">Your name</label>
            <input
              value={settings.username}
              onChange={e => updateSettings({ username: e.target.value })}
              placeholder="Enter your name"
              className="max-w-xs"
            />
            <p className="text-xs text-gray-600 mt-1.5">Shown in the dashboard greeting and sidebar</p>
          </div>
        </div>

        {/* Theme */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Palette size={15} className="text-tiffany-400" />
            <h3 className="font-serif font-semibold text-white text-base">Theme</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="label">Density</label>
              <div className="flex gap-2">
                {(["compact", "comfortable", "spacious"] as const).map(d => (
                  <button key={d} onClick={() => updateSettings({ theme: { ...settings.theme, density: d } })}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition-all ${settings.theme.density === d ? "bg-tiffany-500/10 text-tiffany-400 border border-tiffany-500/20" : "text-gray-500 hover:text-gray-300 border border-transparent"}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Accent color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={settings.theme.accentColor}
                    onChange={e => updateSettings({ theme: { ...settings.theme, accentColor: e.target.value } })}
                    className="!w-10 !h-8 !p-0.5 cursor-pointer rounded" />
                  <span className="text-xs font-mono text-gray-400">{settings.theme.accentColor}</span>
                </div>
              </div>
              <div>
                <label className="label">Gold color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={settings.theme.goldColor}
                    onChange={e => updateSettings({ theme: { ...settings.theme, goldColor: e.target.value } })}
                    className="!w-10 !h-8 !p-0.5 cursor-pointer rounded" />
                  <span className="text-xs font-mono text-gray-400">{settings.theme.goldColor}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modules */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <LayoutGrid size={15} className="text-tiffany-400" />
            <h3 className="font-serif font-semibold text-white text-base">Modules</h3>
          </div>
          <p className="text-xs text-gray-500 mb-4">Toggle modules on/off. Disabled modules are hidden from the sidebar.</p>
          <div className="space-y-2">
            {ALL_MODULES.map(m => {
              const enabled = settings.modules[m.id];
              return (
                <div key={m.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-bg-elevated transition-colors">
                  <div>
                    <div className="text-sm font-medium text-white">{m.name}</div>
                    <div className="text-xs text-gray-500">{m.desc}</div>
                  </div>
                  <button onClick={() => toggleModule(m.id)}
                    className={`relative w-10 h-5 rounded-full transition-all duration-200 flex-shrink-0 ${enabled ? "bg-tiffany-500" : "bg-bg-elevated border border-bg-border"}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200 ${enabled ? "left-5.5" : "left-0.5"}`}
                      style={{ left: enabled ? "calc(100% - 18px)" : "2px" }} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Data */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={15} className="text-tiffany-400" />
            <h3 className="font-serif font-semibold text-white text-base">Data & privacy</h3>
          </div>
          <p className="text-xs text-gray-500 mb-4">All your data is stored locally in your browser. Nothing is sent to any server.</p>
          <div className="flex gap-3 flex-wrap">
            <button onClick={exportData} className="btn-secondary flex items-center gap-2 text-xs">
              <Download size={13} /> Export backup (JSON)
            </button>
            <button onClick={clearData} className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all font-medium">
              <Trash2 size={13} /> Clear all data
            </button>
          </div>
        </div>

        {/* About */}
        <div className="card border-dashed border-bg-border/50">
          <div className="text-xs text-gray-600 space-y-1">
            <div className="font-mono text-gray-500 text-sm mb-2">Personal OS · v1.0</div>
            <div>Stack: Next.js 14 · TypeScript · Tailwind CSS · Zustand · Recharts</div>
            <div>Storage: Browser localStorage (private, offline-first)</div>
            <div>Deploy: Vercel (free tier)</div>
          </div>
        </div>

      </div>
    </PageLayout>
  );
}
