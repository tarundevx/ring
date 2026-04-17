import { GoogleSignIn } from "@/components/GoogleSignIn";
import Link from "next/link";
import { Mic } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#090909] text-white flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-ringaccent/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center max-w-2xl text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-zinc-400 mb-4 scale-in">
          <div className="w-1.5 h-1.5 rounded-full bg-ringaccent animate-pulse" />
          Beta access now live
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-ringaccent rounded-2xl shadow-[0_0_40px_rgba(var(--ring-accent-rgb),0.3)]">
              <Mic className="w-10 h-10 text-black" />
            </div>
          </div>
          <h1 className="text-7xl font-black tracking-tighter sm:text-8xl bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
            Ring
          </h1>
          <p className="text-xl text-zinc-400 font-medium leading-relaxed max-w-md mx-auto">
            Your voice-first neural agent. <br />
            Capturing context, managing workflows.
          </p>
        </div>

        <div className="flex flex-col items-center gap-6 pt-8">
          <GoogleSignIn />
          
          <div className="flex items-center gap-2 text-zinc-500 text-sm">
            <span>or</span>
            <Link href="/dashboard" className="text-zinc-300 hover:text-white underline underline-offset-4">
              explore dashboard demo
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Decoration */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
        <span>Google Calendar</span>
        <div className="w-1 h-1 rounded-full bg-zinc-800" />
        <span>Gmail</span>
        <div className="w-1 h-1 rounded-full bg-zinc-800" />
        <span>Workflow</span>
      </div>
    </div>
  );
}

