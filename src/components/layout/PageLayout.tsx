"use client";
import Sidebar from "./Sidebar";

export default function PageLayout({ children, title, subtitle, actions }: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="ml-56 flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-40 bg-bg-primary/80 backdrop-blur-md border-b border-bg-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-xl font-semibold text-white">{title}</h1>
              {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        </header>
        {/* Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
