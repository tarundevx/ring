"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Mic, RotateCcw, Box, CheckSquare, Brain, MessageSquareDot } from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const getLinkClass = (href: string) => {
    const isActive = pathname === href;
    const baseClass = "flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all duration-200 rounded-xl";
    const activeClass = "bg-white/10 text-zinc-100 shadow-[0_0_15px_rgba(255,255,255,0.05)]";
    const inactiveClass = "text-zinc-500 hover:text-zinc-100 hover:bg-white/5";
    
    return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
  };

  return (
    <div className="flex h-screen bg-ringbg text-zinc-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 max-w-[260px] flex-shrink-0 flex flex-col border-r border-ringborder bg-ringcard">
        <div className="p-4 pl-6 flex items-center pr-4">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <span>ring</span>
            <span className="text-[10px] bg-ringaccent/20 text-ringaccent px-1.5 py-0.5 rounded uppercase font-semibold">Beta</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5 mt-8">
          <Link href="/dashboard" className={getLinkClass("/dashboard")}>
            <MessageSquare className="w-4 h-4" />
            Conversations
          </Link>
          <Link href="/dashboard/record" className={getLinkClass("/dashboard/record")}>
            <Mic className="w-4 h-4" />
            Record
          </Link>
          <Link href="/dashboard/journal" className={getLinkClass("/dashboard/journal")}>
            <RotateCcw className="w-4 h-4" />
            Journal
          </Link>
          
          <div className="pt-4" />

          <div className="mt-8 mb-2 px-3 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Features</div>
          
          <Link href="/dashboard/apps" className={getLinkClass("/dashboard/apps")}>
            <Box className="w-4 h-4" />
            My Apps
          </Link>
          <Link href="/dashboard/tasks" className={getLinkClass("/dashboard/tasks")}>
            <CheckSquare className="w-4 h-4" />
            Tasks
          </Link>
          <Link href="/dashboard/memory" className={getLinkClass("/dashboard/memory")}>
            <Brain className="w-4 h-4" />
            Memories
          </Link>
        </nav>


      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative h-full overflow-hidden">
        {children}
      </main>
    </div>
  );
}
