import type { Conversation } from "@/lib/types";

export function ConversationCard({ conversation }: { conversation: Conversation }) {
  return (
    <article className="rounded-xl bg-ringcard p-4">
      <h3 className="text-sm text-zinc-300">{new Date(conversation.created_at).toLocaleString()}</h3>
      <p className="mt-2 text-zinc-100">{conversation.summary || conversation.transcript.slice(0, 180)}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {(conversation.tags || []).map((tag) => (
          <span key={tag} className="rounded bg-zinc-800 px-2 py-1 text-xs">
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}

