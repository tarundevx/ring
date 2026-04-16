"use client";

import { useEffect, useState } from "react";
import { Mic, Calendar, ChevronRight } from "lucide-react";
import { RingVoiceButton } from "@/components/RingVoiceButton";
import { listConversations } from "@/lib/api";
import { MOCK_USER_ID } from "@/lib/user";
import type { Conversation } from "@/lib/types";

export default function JournalPage() {
  const [entries, setEntries] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const data = await listConversations(MOCK_USER_ID);
        setEntries(data);
        
        // Calculate Streak
        if (data.length > 0) {
          const dates = data.map(e => new Date(e.created_at).toDateString());
          const uniqueDates = Array.from(new Set(dates));
          let currentStreak = 0;
          let checkDate = new Date();
          
          while (uniqueDates.includes(checkDate.toDateString())) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          }
          setStreak(currentStreak);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      <header className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100 font-serif">Daily Journal</h1>
          <p className="text-zinc-400">Reflect on your day, maintain your streak, and grow with Ring.</p>
        </div>
        
        <div className="flex items-center gap-1.5 bg-zinc-900 border border-white/5 px-3 py-1.5 rounded-full">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Streak</span>
          <span className="font-bold text-sm text-zinc-100">{streak} Days</span>
        </div>
      </header>

      {/* Voice Journaling Section */}
      <div className="relative group overflow-hidden rounded-3xl bg-ringcard border border-ringborder/50 p-12 flex flex-col items-center text-center space-y-6">
        <div className="absolute inset-0 bg-gradient-to-b from-ringaccent/5 to-transparent pointer-events-none" />
        

        
        <div className="space-y-3 relative">
          <h2 className="text-2xl font-bold text-zinc-100">Ready to talk about your day?</h2>
          <p className="text-zinc-400 max-w-md mx-auto leading-relaxed">
            Speaking your thoughts helps in processing emotions and identifying patterns. Your AI soulmate is listening.
          </p>
        </div>

        <div className="pt-4 scale-75">
          <RingVoiceButton />
        </div>
      </div>

      {/* Actual Entries */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-200 uppercase tracking-widest text-[11px]">Recent Entries</h3>
        </div>

        {loading ? (
          <div className="h-32 flex items-center justify-center text-zinc-600">Loading your memories...</div>
        ) : entries.length === 0 ? (
          <div className="h-48 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center space-y-2 text-zinc-600">

            <p className="text-sm">No journal entries yet. Start by speaking!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {entries.slice(0, 5).map((entry) => (
              <div key={entry.id} className="bg-ringcard/50 border border-ringborder/30 rounded-2xl p-6 hover:bg-ringcard transition-all cursor-pointer group">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-800/50 border border-white/5 flex flex-col items-center justify-center">
                      <span className="text-xs font-bold text-zinc-400">{new Date(entry.created_at).getDate()}</span>
                      <span className="text-[10px] text-zinc-600 uppercase font-bold">{new Date(entry.created_at).toLocaleDateString(undefined, { month: 'short' })}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-zinc-200">
                        {entry.summary || "Daily Reflection Entry"}
                      </h4>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                        {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {entry.duration_seconds || 45}s voice
                      </p>
                    </div>
                  </div>
                  <Calendar className="w-4 h-4 text-zinc-700 group-hover:text-ringaccent transition-colors" />
                </div>
                <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed group-hover:text-zinc-300 transition-colors">
                  {entry.transcript}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
