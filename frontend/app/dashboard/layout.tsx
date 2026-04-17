"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MessageSquare, Mic, RotateCcw, Box, CheckSquare, Brain, LogOut, Menu, X } from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getLinkClass = (href: string) => {
    const isActive = pathname === href;
    const baseClass = "flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all duration-200 rounded-xl";
    const activeClass = "bg-white/10 text-zinc-100 shadow-[0_0_15px_rgba(255,255,255,0.05)]";
    const inactiveClass = "text-zinc-500 hover:text-zinc-100 hover:bg-white/5";
    
    return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
  };

  const logout = () => {
    // In a real app, clear session/cookies. Here we just redirect.
    router.push("/");
  };

  const navLinks = [
    { href: "/dashboard", icon: MessageSquare, label: "Conversations" },
    { href: "/dashboard/record", icon: Mic, label: "Record" },
    { href: "/dashboard/journal", icon: RotateCcw, label: "Journal" },
  ];

  const featureLinks = [
    { href: "/dashboard/apps", icon: Box, label: "My Apps" },
    { href: "/dashboard/tasks", icon: CheckSquare, label: "Tasks" },
    { href: "/dashboard/memory", icon: Brain, label: "Memories" },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 pl-6 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <span>ring</span>
          <span className="text-[10px] bg-ringaccent/20 text-ringaccent px-1.5 py-0.5 rounded uppercase font-semibold">Beta</span>
        </div>
        <button className="md:hidden p-2 text-zinc-500" onClick={() => setIsMobileMenuOpen(false)}>
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5 mt-8">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href as any} className={getLinkClass(link.href)} onClick={() => setIsMobileMenuOpen(false)}>
            <link.icon className="w-4 h-4" />
            {link.label}
          </Link>
        ))}
        
        <div className="mt-8 mb-2 px-3 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Features</div>
        
        {featureLinks.map((link) => (
          <Link key={link.href} href={link.href as any} className={getLinkClass(link.href)} onClick={() => setIsMobileMenuOpen(false)}>
            <link.icon className="w-4 h-4" />
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-ringborder">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-zinc-500 hover:text-red-400 hover:bg-red-400/5 transition-all duration-200 rounded-xl"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-ringbg text-zinc-100 overflow-hidden relative">
      {/* Mobile Header */}
      <header className="md:hidden absolute top-0 left-0 right-0 h-16 border-b border-ringborder bg-ringcard/50 backdrop-blur-md z-30 flex items-center justify-between px-6">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <span>ring</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-zinc-100">
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 max-w-[260px] flex-shrink-0 flex-col border-r border-ringborder bg-ringcard">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-72 bg-ringcard border-r border-ringborder z-50 md:hidden animate-in slide-in-from-left duration-300">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative h-full overflow-hidden pt-16 md:pt-0">
        {children}
      </main>
    </div>
  );
}
