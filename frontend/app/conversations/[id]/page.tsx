import { getConversation } from "@/lib/api";
import { MOCK_USER_ID } from "@/lib/user";

export default async function ConversationDetailPage({ params }: { params: { id: string } }) {
  let detail: any = null;
  try {
    detail = await getConversation(MOCK_USER_ID, params.id);
  } catch (err) {
    console.error("Failed to load conversation detail:", err);
  }

  if (!detail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
        <h2 className="text-xl font-bold">Failed to load conversation</h2>
        <p className="text-zinc-400">The conversation could not be found or there was an error loading it.</p>
        <a href="/conversations" className="text-ringaccent hover:underline">Back to conversations</a>
      </div>
    );
  }

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

