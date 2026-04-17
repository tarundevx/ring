export const dynamic = "force-dynamic";
import Link from "next/link";

import { ConversationCard } from "@/components/ConversationCard";
import { listConversations } from "@/lib/api";
import { MOCK_USER_ID } from "@/lib/user";

export default async function ConversationsPage() {
  let conversations: any[] = [];
  try {
    conversations = await listConversations(MOCK_USER_ID);
  } catch (err) {
    console.error("Failed to load conversations:", err);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Conversations</h1>
      {conversations.length === 0 ? (
        <p className="text-muted-foreground">No conversations found or failed to load.</p>
      ) : (
        conversations.map((conversation) => (
          <Link key={conversation.id} href={`/conversations/${conversation.id}` as any} className="block">
            <ConversationCard conversation={conversation} />
          </Link>
        ))
      )}
    </div>
  );
}

