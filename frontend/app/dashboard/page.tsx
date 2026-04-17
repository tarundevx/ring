export const dynamic = "force-dynamic";
import { ConversationCard } from "@/components/ConversationCard";
import { listConversations, listReminders, listTasks } from "@/lib/api";
import { MOCK_USER_ID } from "@/lib/user";

export default async function DashboardPage() {
  let conversations: any[] = [];
  let tasks: any[] = [];
  let reminders: any[] = [];

  try {
    [conversations, tasks, reminders] = await Promise.all([
      listConversations(MOCK_USER_ID),
      listTasks(MOCK_USER_ID),
      listReminders(MOCK_USER_ID)
    ]);
  } catch (err) {
    console.error("Dashboard data load failed:", err);
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-12">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="text-zinc-500 text-sm">Welcome back. Here's what's happening today.</p>
      </header>

      <div className="grid gap-8">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Recent conversations</h2>
          </div>
          
          {conversations.length === 0 ? (
            <div className="h-40 border-2 border-dashed border-white/5 rounded-3xl flex items-center justify-center text-zinc-600 italic">
              No recent conversations or failed to load.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {conversations.slice(0, 4).map((c) => (
                <ConversationCard key={c.id} conversation={c} />
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="group p-8 bg-ringcard border border-ringborder/50 rounded-[32px] hover:bg-white/5 transition-all duration-300">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Active tasks</h3>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-bold text-white leading-none">
                {tasks.filter((t) => t.status !== "done").length}
              </span>
              <span className="text-sm font-medium text-zinc-500 mb-1">To be completed</span>
            </div>
          </div>

          <div className="group p-8 bg-ringcard border border-ringborder/50 rounded-[32px] hover:bg-white/5 transition-all duration-300">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Upcoming reminders</h3>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-bold text-white leading-none">
                {reminders.filter((r) => r.status === "pending").length}
              </span>
              <span className="text-sm font-medium text-zinc-500 mb-1">Scheduled</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

