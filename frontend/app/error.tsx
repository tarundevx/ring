"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Layout/Page Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 p-8 text-center animate-in fade-in zoom-in duration-500">
      <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
        <AlertTriangle className="w-10 h-10 text-red-500" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-white font-serif">Something went wrong</h2>
        <p className="text-zinc-400 max-w-md mx-auto leading-relaxed">
          {error.message || "An unexpected error occurred. Please try refreshing the page or contact support if the problem persists."}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-6 py-2.5 bg-ringaccent hover:bg-ringaccenthover text-white rounded-full font-medium transition shadow-lg shadow-ringaccent/20"
        >
          <RotateCcw className="w-4 h-4" />
          Try again
        </button>
        
        <button
          onClick={() => window.location.href = '/'}
          className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-full font-medium transition"
        >
          Go Home
        </button>
      </div>

      {error.digest && (
        <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mt-8">
          Error ID: {error.digest}
        </p>
      )}
    </div>
  );
}
