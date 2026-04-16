export const dynamic = "force-dynamic";
import { MemoryGraph } from "@/components/MemoryGraph";
import { getMemoryProfile, listTasks } from "@/lib/api";
import { MOCK_USER_ID } from "@/lib/user";
import { Database, Lightbulb, UserRound, GraduationCap, Flame, ArrowRight } from "lucide-react";

export default async function MemoryPage() {
  const [memory, tasks] = await Promise.all([
    getMemoryProfile(MOCK_USER_ID),
    listTasks(MOCK_USER_ID)
  ]);

  const facts = memory.profile?.facts || [];
  const preferences = memory.profile?.preferences || [];
  const topics = memory.profile?.recurring_topics || [];
  const people = memory.profile?.people || [];

  return (
    <div className="flex-1 overflow-y-auto h-full bg-[#111111]">
      <div className="max-w-6xl mx-auto p-8 space-y-10 pb-20">
        
        {/* Header Section */}
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ringaccent/10 w-fit">
             <Database className="w-4 h-4 text-ringaccent" />
             <span className="text-xs font-bold uppercase tracking-widest text-ringaccent">Neural Database</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white mt-4">Memory & Profile</h1>
          <p className="text-zinc-400 max-w-2xl text-lg leading-relaxed">
            Ring autonomously extracts and organizes your core context over time. This graph visualizes the facts, people, projects, and tasks it currently understands about you.
          </p>
        </div>

        {/* Visual Graph Section */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-ringaccent/20 to-emerald-500/20 rounded-[50px] blur-2xl opacity-50 pointer-events-none" />
          <MemoryGraph profile={memory.profile ?? {}} tasks={tasks} />
        </div>

        {/* Context Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          
          {/* Card 1: Facts */}
          <div className="bg-[#191919] border border-ringborder rounded-3xl p-8 hover:border-ringaccent/50 transition-colors group">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                  <UserRound className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">Personal Core</h2>
              </div>
              <span className="text-sm font-medium text-zinc-500">{facts.length} items</span>
            </div>
            
            {facts.length > 0 ? (
              <ul className="space-y-4">
                {facts.map((fact: string, i: number) => (
                  <li key={i} className="flex gap-4 group/item">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0 opacity-50 group-hover/item:opacity-100 transition-opacity" />
                    <span className="text-[15px] text-zinc-300 leading-relaxed">{fact}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center justify-center p-8 border border-dashed border-zinc-800 rounded-xl">
                 <p className="text-sm text-zinc-500 italic">No personal facts extracted yet.</p>
              </div>
            )}
          </div>

          {/* Card 2: Preferences */}
          <div className="bg-[#191919] border border-ringborder rounded-3xl p-8 hover:border-ringaccent/50 transition-colors group">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-ringaccent/10 rounded-2xl text-ringaccent">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">Preferences & Habits</h2>
              </div>
              <span className="text-sm font-medium text-zinc-500">{preferences.length} items</span>
            </div>
            
            {preferences.length > 0 ? (
              <ul className="space-y-4">
                {preferences.map((pref: string, i: number) => (
                  <li key={i} className="flex gap-4 group/item">
                    <div className="w-1.5 h-1.5 rounded-full bg-ringaccent mt-2 shrink-0 opacity-50 group-hover/item:opacity-100 transition-opacity" />
                    <span className="text-[15px] text-zinc-300 leading-relaxed">{pref}</span>
                  </li>
                ))}
              </ul>
            ) : (
               <div className="flex items-center justify-center p-8 border border-dashed border-zinc-800 rounded-xl">
                 <p className="text-sm text-zinc-500 italic">No preferences extracted yet.</p>
              </div>
            )}
          </div>
          
          {/* Card 3: Recurring Topics */}
          <div className="bg-[#191919] border border-ringborder rounded-3xl p-8 hover:border-orange-500/50 transition-colors group">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500">
                  <Flame className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">Recurring Topics</h2>
              </div>
              <span className="text-sm font-medium text-zinc-500">{topics.length} topics</span>
            </div>
            
            {topics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {topics.map((topic: string, i: number) => (
                  <span key={i} className="px-4 py-2 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 text-sm font-medium rounded-xl border border-white/5 transition-colors cursor-default">
                    {topic}
                  </span>
                ))}
              </div>
            ) : (
               <div className="flex items-center justify-center p-8 border border-dashed border-zinc-800 rounded-xl">
                 <p className="text-sm text-zinc-500 italic">No recurring topics observed.</p>
              </div>
            )}
          </div>

          {/* Card 4: Entities / People */}
          <div className="bg-[#191919] border border-ringborder rounded-3xl p-8 hover:border-pink-500/50 transition-colors group">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-pink-500/10 rounded-2xl text-pink-500">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">Key Relationships</h2>
              </div>
              <span className="text-sm font-medium text-zinc-500">{people.length} entities</span>
            </div>
            
            {people.length > 0 ? (
               <div className="flex flex-wrap gap-2">
                {people.map((person: string, i: number) => (
                  <span key={i} className="px-4 py-2 bg-pink-500/5 text-pink-300 text-sm font-medium rounded-xl border border-pink-500/20 cursor-default">
                    {person}
                  </span>
                ))}
              </div>
            ) : (
               <div className="flex items-center justify-center p-8 border border-dashed border-zinc-800 rounded-xl">
                 <p className="text-sm text-zinc-500 italic">No entities or people mapped.</p>
              </div>
            )}
          </div>

        </div>
        
        {/* Footer/Hint */}
        <div className="flex items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-ringcard to-[#111111] border border-ringborder">
          <div>
            <h3 className="font-bold text-white">Need to update your memory?</h3>
            <p className="text-sm text-zinc-400 mt-1">Just mention details during a voice conversation, and Ring will map them.</p>
          </div>
          <ArrowRight className="w-5 h-5 text-zinc-600" />
        </div>

      </div>
    </div>
  );
}
