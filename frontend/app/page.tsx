import { GoogleSignIn } from "@/components/GoogleSignIn";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#090909] text-white flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Motion Graphics Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-ringaccent/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-900/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Animated Grid/Mesh */}
        <div 
          className="absolute inset-0 opacity-[0.15]" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(16,185,129,0.3) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)'
          }} 
        />
      </div>
      
      <div className="relative z-10 flex flex-col items-center max-w-2xl text-center space-y-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-zinc-400 mb-4 scale-in backdrop-blur-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-ringaccent animate-pulse" />
          Neural Engine V1.0
        </div>
        
        <div className="space-y-6">
          <div className="relative group">
            <h1 className="text-6xl font-black tracking-tighter md:text-9xl bg-gradient-to-b from-white via-white to-white/20 bg-clip-text text-transparent animate-heading-glow">
              Ring AI
            </h1>
            {/* Circular Orbit Animation */}
            <div className="absolute inset-0 -m-8 border border-white/5 rounded-full animate-spin-slow pointer-events-none" />
            <div className="absolute inset-0 -m-16 border border-white/[0.02] rounded-full animate-spin-slower pointer-events-none" />
          </div>
          
          <p className="text-lg md:text-2xl text-zinc-400 font-medium leading-relaxed max-w-md mx-auto scale-in">
            A high-fidelity digital soulmate. <br />
            Capturing context, automating life.
          </p>
        </div>

        <div className="flex flex-col items-center gap-8 pt-4 w-full max-w-sm scale-in">
          <GoogleSignIn />
          
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <span>or</span>
              <Link href="/dashboard" className="text-zinc-300 hover:text-white underline underline-offset-4 transition-colors">
                explore dashboard demo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Legal Links */}
      <div className="absolute bottom-10 left-0 right-0 z-10 flex flex-col items-center gap-4">
        <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
          <Link href="/privacy" className="hover:text-zinc-400 transition-colors">Privacy Policy</Link>
          <div className="w-1 h-1 rounded-full bg-zinc-800" />
          <Link href="/terms" className="hover:text-zinc-400 transition-colors">Terms of Service</Link>
        </div>
        <p className="text-[9px] text-zinc-700 font-bold uppercase tracking-[0.3em]">
          Powered by Neural Synapse
        </p>
      </div>
    </div>
  );
}

