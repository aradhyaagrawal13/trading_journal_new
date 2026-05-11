"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/store";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Target, BookOpen, Dumbbell,
  Brain, TrendingUp, BookMarked, Trophy, BarChart3,
  Settings, Zap, ChevronRight
} from "lucide-react";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/", module: null },
  { id: "habits", label: "Habits", icon: Target, href: "/habits", module: "habits" },
  { id: "journal", label: "Journal", icon: BookOpen, href: "/journal", module: "journal" },
  { id: "health", label: "Health & Gym", icon: Dumbbell, href: "/health", module: "health" },
  { id: "deepwork", label: "Deep Work", icon: Zap, href: "/deepwork", module: "deepwork" },
  { id: "learning", label: "Learning", icon: Brain, href: "/learning", module: "learning" },
  { id: "trading", label: "Trading", icon: TrendingUp, href: "/trading", module: "trading" },
  { id: "knowledge", label: "Knowledge", icon: BookMarked, href: "/knowledge", module: "knowledge" },
  { id: "goals", label: "Goals", icon: Trophy, href: "/goals", module: "goals" },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "/analytics", module: "analytics" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { settings } = useStore();

  const visible = NAV.filter(n => !n.module || settings.modules[n.module as keyof typeof settings.modules]);

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 bg-bg-secondary border-r border-bg-border flex flex-col z-50">
      {/* Logo */}
      <div className="p-5 border-b border-bg-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-tiffany-500 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-900">OS</span>
          </div>
          <div>
            <div className="font-serif font-semibold text-white text-sm leading-none">Personal OS</div>
            <div className="text-[10px] text-gray-500 mt-0.5 font-mono">v1.0 · {settings.username}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {visible.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link key={item.id} href={item.href}>
              <div className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 group",
                active
                  ? "bg-tiffany-500/10 text-tiffany-400 border border-tiffany-500/20"
                  : "text-gray-500 hover:text-gray-300 hover:bg-bg-elevated"
              )}>
                <Icon size={15} className={active ? "text-tiffany-400" : "text-gray-600 group-hover:text-gray-400"} />
                <span className="flex-1 font-medium">{item.label}</span>
                {active && <ChevronRight size={12} className="text-tiffany-500" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-bg-border">
        <Link href="/settings">
          <div className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all",
            pathname === "/settings"
              ? "bg-tiffany-500/10 text-tiffany-400"
              : "text-gray-500 hover:text-gray-300 hover:bg-bg-elevated"
          )}>
            <Settings size={15} />
            <span className="font-medium">Settings</span>
          </div>
        </Link>
        <div className="mt-3 px-3">
          <div className="text-[10px] text-gray-600 font-mono">All data stored locally</div>
        </div>
      </div>
    </aside>
  );
}
