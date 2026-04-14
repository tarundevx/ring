import Link from "next/link";

import { ConversationCard } from "@/components/ConversationCard";
import { listConversations } from "@/lib/api";
import { MOCK_USER_ID } from "@/lib/user";

export default async function ConversationsPage() {
  const conversations = await listConversations(MOCK_USER_ID);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Conversations</h1>
      {conversations.map((conversation) => (
        <Link key={conversation.id} href={`/conversations/${conversation.id}`} className="block">
          <ConversationCard conversation={conversation} />
        </Link>
      ))}
    </div>
  );
}

