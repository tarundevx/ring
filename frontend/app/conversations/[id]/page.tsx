import { getConversation } from "@/lib/api";
import { MOCK_USER_ID } from "@/lib/user";

export default async function ConversationDetailPage({ params }: { params: { id: string } }) {
  const detail = await getConversation(MOCK_USER_ID, params.id);
  const conversation = detail.conversation;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="space-y-4 md:col-span-2">
      <h1 className="text-2xl font-bold">Conversation detail</h1>
      <article className="rounded-xl bg-ringcard p-4">
        <p className="mb-2 text-sm text-zinc-400">{new Date(conversation.created_at).toLocaleString()}</p>
        <pre className="whitespace-pre-wrap text-sm">{conversation.transcript}</pre>
      </article>
      </div>
      <aside className="space-y-4">
        <div className="rounded-xl bg-ringcard p-4">
          <h2 className="mb-3 text-sm font-semibold">Extracted tasks</h2>
          <div className="space-y-2 text-sm">
            {(detail.extracted_tasks || []).map((task: any) => (
              <div key={task.id} className="rounded bg-zinc-800 p-2">
                <p>{task.title}</p>
                <p className="text-xs text-zinc-400">{task.status}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-ringcard p-4">
          <h2 className="mb-3 text-sm font-semibold">Extracted reminders</h2>
          <div className="space-y-2 text-sm">
            {(detail.extracted_reminders || []).map((reminder: any) => (
              <div key={reminder.id} className="rounded bg-zinc-800 p-2">
                <p>{reminder.title}</p>
                <p className="text-xs text-zinc-400">{reminder.status}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

