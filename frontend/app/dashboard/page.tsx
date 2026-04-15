export const dynamic = "force-dynamic";
import { ConversationCard } from "@/components/ConversationCard";
import { listConversations, listReminders, listTasks } from "@/lib/api";
import { MOCK_USER_ID } from "@/lib/user";

export default async function DashboardPage() {
  const [conversations, tasks, reminders] = await Promise.all([
    listConversations(MOCK_USER_ID),
    listTasks(MOCK_USER_ID),
    listReminders(MOCK_USER_ID)
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <section>
        <h2 className="mb-3 text-lg font-semibold">Recent conversations</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {conversations.slice(0, 4).map((c) => (
            <ConversationCard key={c.id} conversation={c} />
          ))}
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-ringcard p-4">
          <h3 className="mb-2 font-semibold">Active tasks</h3>
          <p className="text-3xl">{tasks.filter((t) => t.status !== "done").length}</p>
        </div>
        <div className="rounded-xl bg-ringcard p-4">
          <h3 className="mb-2 font-semibold">Upcoming reminders</h3>
          <p className="text-3xl">{reminders.filter((r) => r.status === "pending").length}</p>
        </div>
      </section>
    </div>
  );
}

