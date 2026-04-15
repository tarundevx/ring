export const dynamic = "force-dynamic";
import { MemoryGraph } from "@/components/MemoryGraph";
import { getMemoryProfile, listTasks } from "@/lib/api";
import { MOCK_USER_ID } from "@/lib/user";

export default async function MemoryPage() {
  const [memory, tasks] = await Promise.all([
    getMemoryProfile(MOCK_USER_ID),
    listTasks(MOCK_USER_ID)
  ]);

  return (
    <div className="p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Memory Profile</h1>
        <p className="text-zinc-400">Your evolving context graph and stored identity.</p>
      </div>
      
      <div className="grid gap-6">
        <MemoryGraph profile={memory.profile ?? {}} tasks={tasks} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-ringcard border border-ringborder/50 p-6">
          <h2 className="text-lg font-semibold mb-4 text-zinc-200">Personal Facts</h2>
          <ul className="space-y-2">
            {(memory.profile?.facts || []).map((fact: string, i: number) => (
              <li key={i} className="text-sm text-zinc-400 flex gap-2">
                <span className="text-ringaccent">•</span> {fact}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-ringcard border border-ringborder/50 p-6">
          <h2 className="text-lg font-semibold mb-4 text-zinc-200">Core Preferences</h2>
          <ul className="space-y-2">
            {(memory.profile?.preferences || []).map((pref: string, i: number) => (
              <li key={i} className="text-sm text-zinc-400 flex gap-2">
                <span className="text-green-500">•</span> {pref}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
